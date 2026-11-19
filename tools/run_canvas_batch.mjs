#!/usr/bin/env node
/**
 * Batch runner for CinAI canvas nodes with pre-flight checks, max 4 concurrent jobs,
 * automatic camera_movement fix, rate-limit handling, and run_log.json persistence.
 *
 * Usage:
 *   node tools/run_canvas_batch.mjs <canvas_id> <node_id...> [--dry-run] [--fix-camera]
 *   IDEM_SUFFIX=v2 node tools/run_canvas_batch.mjs <canvas_id> <node_id...>
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const fixCamera = argv.includes('--fix-camera');
const positional = argv.filter((a) => !a.startsWith('--'));
const [canvasId, ...nodeIds] = positional;

if (!canvasId || nodeIds.length === 0) {
  console.error('Usage: node tools/run_canvas_batch.mjs <canvas_id> <node_id...> [--dry-run] [--fix-camera]');
  process.exit(1);
}

const idemSuffix = process.env.IDEM_SUFFIX || 'v1';
const logPath = path.join(root, 'output', 'run_log.json');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const call = (tool, args, spend = false) => {
  const f = path.join(root, 'output', 'tmp', `batch_${process.pid}.json`);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(args));
  const env = spend ? { ...process.env, ALLOW_SPEND: '1' } : process.env;
  return JSON.parse(
    execFileSync('node', [path.join(root, 'tools', 'cinai.mjs'), tool, '@' + f], {
      encoding: 'utf8',
      env,
      stdio: ['ignore', 'pipe', 'pipe']
    })
  );
};

// Pre-flight inspection
const details = call('get_canvas_node_details', { canvas_id: canvasId, node_ids: nodeIds }).nodes || [];
const byId = Object.fromEntries(details.map((n) => [n.id, n]));

let estTotal = 0;
for (const nid of nodeIds) {
  const n = byId[nid];
  if (!n) {
    console.error(`MISSING node: ${nid}`);
    continue;
  }
  const s = n.settings || n.data?.settings || {};
  if (n.type === 'video-generator' && s.camera_movement === '') {
    if (fixCamera && !dryRun) {
      call('update_canvas_node', { canvas_id: canvasId, node_id: nid, settings: { camera_movement: 'fixed' } });
      console.log(`fixed camera_movement=fixed on ${nid}`);
    } else {
      console.warn(`WARN ${nid}: camera_movement is empty string (pass --fix-camera to auto-fix)`);
    }
  }
  if (dryRun) {
    let est = '?';
    if (n.model_id) {
      try {
        const ec = call('estimate_cost', { model_id: n.model_id, settings: s });
        est = ec.credits ?? ec.estimated_credits ?? '?';
        if (typeof est === 'number') estTotal += est;
      } catch {
        // ignore estimate failure
      }
    }
    console.log(`DRY-RUN ${nid} (${n.type}) est=${est}cr title=${n.title || n.data?.title || ''}`);
  }
}

if (dryRun) {
  console.log(`DRY-RUN total estimated credits: ${estTotal}`);
  process.exit(0);
}

const active = new Map();
const queue = [...nodeIds];
const results = [];

while (queue.length > 0 || active.size > 0) {
  while (queue.length > 0 && active.size < 4) {
    const nid = queue.shift();
    const key = `socal-run-${canvasId.slice(-6)}-${nid}-${idemSuffix}`;
    try {
      const r = call('run_canvas_node', { canvas_id: canvasId, node_id: nid, idempotency_key: key }, true);
      const jid = r.job_id || r.id;
      estTotal += r.estimated_credits || 0;
      console.log(`start ${nid} ${jid} (est ${r.estimated_credits || 0} cr)`);
      active.set(nid, jid);
    } catch (err) {
      console.log(`NOT STARTED ${nid} -> ${err.message.split('\n')[0]}`);
      results.push({ canvas_id: canvasId, node_id: nid, status: 'not_started', error: err.message });
    }
  }

  if (active.size === 0) break;
  await sleep(8000);

  for (const [nid, jid] of [...active.entries()]) {
    try {
      const j = call('get_job', { job_id: jid });
      if (j.status === 'done' || j.status === 'completed') {
        const out = j.outputs?.[0]?.url || j.output_url || '';
        console.log(`done ${nid} ${j.credits_charged || 0} ${out}`);
        results.push({ canvas_id: canvasId, node_id: nid, job_id: jid, status: 'done', credits: j.credits_charged || 0, output_url: out });
        active.delete(nid);
      } else if (j.status === 'failed' || j.status === 'error') {
        console.log(`FAILED ${nid} ${j.error || 'unknown'}`);
        results.push({ canvas_id: canvasId, node_id: nid, job_id: jid, status: 'failed', error: j.error });
        active.delete(nid);
      }
    } catch {
      // retry next poll
    }
  }
}

const existing = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath, 'utf8')) : [];
const merged = Array.isArray(existing) ? [...existing, ...results] : results;
fs.mkdirSync(path.dirname(logPath), { recursive: true });
fs.writeFileSync(logPath, JSON.stringify(merged, null, 2));
const charged = results.reduce((s, r) => s + (r.credits || 0), 0);
console.log(`credits this run ${charged}`);
