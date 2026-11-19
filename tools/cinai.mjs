#!/usr/bin/env node
/**
 * cinai MCP CLI cho project (dùng khi chạy ngoài Claude Code hoặc khi MCP chưa nạp).
 *   node tools/cinai.mjs <tool> '<json>'      | node tools/cinai.mjs <tool> @file.json
 * Đọc CINAI_MCP_URL / CINAI_API_KEY từ .env. Không bao giờ in key.
 * Tool tốn credit / phá huỷ bị chặn trừ khi ALLOW_SPEND=1 (chỉ đặt khi người dùng đã duyệt).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = Object.fromEntries(
  fs.readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
);
const SPEND = ['generate', 'run_canvas_node', 'start_task', 'delete_canvas_nodes'];
const [tool, raw = '{}'] = process.argv.slice(2);
if (!tool) { console.error('Usage: node tools/cinai.mjs <tool> <json|@file>'); process.exit(1); }
if (SPEND.includes(tool) && process.env.ALLOW_SPEND !== '1') {
  console.error(`BLOCKED: "${tool}" tốn credit hoặc xoá dữ liệu. Cần người duyệt rồi đặt ALLOW_SPEND=1.`);
  process.exit(2);
}
const args = JSON.parse(raw.startsWith('@') ? fs.readFileSync(raw.slice(1), 'utf8') : raw);

const keys = (env.CINAI_API_KEYS || env.CINAI_API_KEY || '').split(',').map((k) => k.trim()).filter(Boolean);
if (keys.length === 0) { console.error('Missing CINAI_API_KEY or CINAI_API_KEYS in .env'); process.exit(1); }
const idxFile = path.join(root, 'output', 'tmp', 'cinai_key_idx.txt');
let keyIdx = 0;
try { keyIdx = (parseInt(fs.readFileSync(idxFile, 'utf8'), 10) + 1) % keys.length; } catch {}
try { fs.mkdirSync(path.dirname(idxFile), { recursive: true }); fs.writeFileSync(idxFile, String(keyIdx)); } catch {}

let sid = null;
async function rpc(method, params, id) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', Authorization: `Bearer ${keys[keyIdx]}` };
  if (sid) headers['Mcp-Session-Id'] = sid;
  const body = id === undefined ? { jsonrpc: '2.0', method, params } : { jsonrpc: '2.0', id, method, params };
  const r = await fetch(env.CINAI_MCP_URL, { method: 'POST', headers, body: JSON.stringify(body) });
  sid = r.headers.get('mcp-session-id') || sid;
  const t = await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${t.slice(0, 300)}`);
  if (!t) return null;
  const m = t.match(/^data: (.*)$/m);
  return JSON.parse(m ? m[1] : t);
}
async function initSession() {
  sid = null;
  await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'socalmedia-cli', version: '1' } }, 1);
  await rpc('notifications/initialized', {});
}
await initSession();
// cinai giới hạn 60 lần gọi/phút/key → xoay vòng CINAI_API_KEYS nếu có nhiều key, hoặc tự chờ theo "Retry in N s"
let res, text = '';
for (let attempt = 0; attempt < Math.max(6, keys.length * 2); attempt++) {
  res = await rpc('tools/call', { name: tool, arguments: args }, 2 + attempt);
  text = (res?.result?.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n');
  const m = text.match(/^Rate limit.*?Retry in (\d+)\s*s/i);
  if (!m) break;
  if (keys.length > 1) {
    keyIdx = (keyIdx + 1) % keys.length;
    console.error(`[cinai] rate limit – xoay sang key #${keyIdx + 1}/${keys.length}`);
    await initSession();
    continue;
  }
  const wait = (+m[1] + 1) * 1000;
  console.error(`[cinai] rate limit – chờ ${wait / 1000}s rồi thử lại (${attempt + 1}/6)`);
  await new Promise((r) => setTimeout(r, wait));
}
console.log(text || JSON.stringify(res?.error || res));
if (res?.result?.isError || res?.error) process.exit(3);
