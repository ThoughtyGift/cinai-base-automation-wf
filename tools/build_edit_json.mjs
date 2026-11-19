#!/usr/bin/env node
/**
 * Build Shotstack-compatible 2-track 9:16 (1080x1920) edit_json for all edit-video-generator nodes on a canvas.
 * Fixes CinAI's default 1-track sequential auto-layout (empty text + audio + intro + video).
 *
 * Usage:
 *   node tools/build_edit_json.mjs <canvas_id> [node_id...]
 *   node tools/build_edit_json.mjs <canvas_id> --dry-run
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const positional = argv.filter((a) => !a.startsWith('--'));
const [canvasId, ...targetIds] = positional;

if (!canvasId) {
  console.error('Usage: node tools/build_edit_json.mjs <canvas_id> [node_id...] [--dry-run]');
  process.exit(1);
}

const call = (tool, args) => {
  const f = path.join(root, 'output', 'tmp', `editjson_${process.pid}.json`);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(args));
  return JSON.parse(
    execFileSync('node', [path.join(root, 'tools', 'cinai.mjs'), tool, '@' + f], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    })
  );
};

const probeDuration = (url, fallback) => {
  if (!url) return fallback;
  try {
    const out = execFileSync(
      'ffprobe',
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', url],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 10000 }
    ).trim();
    const d = parseFloat(out);
    return Number.isFinite(d) && d > 0 ? Math.round(d * 100) / 100 : fallback;
  } catch {
    return fallback;
  }
};

const st = call('get_canvas_state', { canvas_id: canvasId });
const det = [];
for (let i = 0; i < st.nodes.length; i += 20) {
  det.push(...call('get_canvas_node_details', { canvas_id: canvasId, node_ids: st.nodes.slice(i, i + 20).map((n) => n.id) }).nodes);
}
const byId = Object.fromEntries(det.map((n) => [n.id, n]));
const edits = det.filter(
  (n) => n.type === 'edit-video-generator' && (targetIds.length === 0 || targetIds.includes(n.id))
);

if (edits.length === 0) {
  console.error('No matching edit-video-generator nodes found.');
  process.exit(2);
}

const results = [];
for (const editNode of edits) {
  const inc = editNode.incoming_edges || [];
  const videoSources = inc.filter((e) => e.target_handle === 'video').map((e) => byId[e.source]).filter(Boolean);
  const audioSources = inc.filter((e) => e.target_handle === 'audio').map((e) => byId[e.source]).filter(Boolean);

  const introNode = videoSources.find((n) => n.id === 'intro-clip' || /intro/i.test(n.title || ''));
  const mainNode = videoSources.find((n) => n.id !== introNode?.id);
  const audioNode = audioSources[0];

  const introUrl = introNode?.output_url || introNode?.data?.output_url || '';
  const mainUrl = mainNode?.output_url || mainNode?.data?.output_url || '';
  const audioUrl = audioNode?.output_url || audioNode?.data?.output_url || '';

  const introDurRaw = parseFloat(String(introNode?.settings?.duration || '3').replace('s', '')) || 3;
  const mainDurFallback = parseFloat(String(mainNode?.settings?.duration || '7').replace('s', '')) || 7;

  const introLen = introUrl ? probeDuration(introUrl, introDurRaw) : 0;
  const mainLen = mainUrl ? probeDuration(mainUrl, mainDurFallback) : mainDurFallback;
  const mainStart = introUrl ? Math.round(introLen * 100) / 100 : 0;
  const audioLen = audioUrl ? Math.min(probeDuration(audioUrl, mainLen), mainLen) : 0;

  const videoClips = [];
  if (introUrl) {
    videoClips.push({
      asset: { type: 'video', src: introUrl, volume: 1 },
      start: 0,
      length: Math.round(introLen * 100) / 100,
      fit: 'cover'
    });
  }
  if (mainUrl) {
    videoClips.push({
      asset: { type: 'video', src: mainUrl, volume: audioUrl ? 0 : 1 },
      start: mainStart,
      length: Math.round(mainLen * 100) / 100,
      fit: 'cover'
    });
  }

  const tracks = [{ clips: videoClips }];
  if (audioUrl) {
    tracks.push({
      clips: [
        {
          asset: { type: 'audio', src: audioUrl, volume: 1, effect: 'fadeOut' },
          start: mainStart,
          length: Math.round(audioLen * 100) / 100
        }
      ]
    });
  }

  const editJson = {
    output: { format: 'mp4', size: { width: 1080, height: 1920 } },
    timeline: { background: '#000000', tracks }
  };

  if (!dryRun && mainUrl) {
    call('update_canvas_node', {
      canvas_id: canvasId,
      node_id: editNode.id,
      settings: { resolution: '1080p', format: 'mp4', render_mode: 'final', duration_minutes: 1, edit_json: editJson },
      edit_json: editJson
    });
  }

  results.push({
    node_id: editNode.id,
    ready: Boolean(mainUrl),
    missing: [
      !introUrl && introNode ? 'intro-clip' : null,
      !mainUrl ? (mainNode?.id || 'main-video') : null,
      !audioUrl && audioNode ? audioNode.id : null
    ].filter(Boolean),
    total_duration_s: Math.round((mainStart + (mainUrl ? mainLen : 0)) * 100) / 100,
    edit_json: editJson
  });
}

console.log(JSON.stringify({ canvas_id: canvasId, dry_run: dryRun, edits: results }, null, 2));
