#!/usr/bin/env node
/**
 * Xếp lại bố cục canvas project theo lưới cố định (đọc từ trái → phải, mỗi biến thể 1 hàng).
 *   node tools/layout_project.mjs <canvas_id>
 *
 *  Cột 0  ĐẦU VÀO App (ảnh người dùng)      + VIDEO GỐC ở cuối cột
 *  Cột 1  CHUẨN HOÁ (character sheet / sản phẩm sạch nền) + Âm thanh gốc + Thumbnail
 *  Cột 2  PROP riêng từng biến thể (nếu có, VD "Trái dừa in logo")
 *  Cột 3  VIDEO / ẢNH từng biến thể (nhãn V1/V2/V3 đặt ngay trên)
 *  Cột 4  GHÉP + nhạc gốc
 *  Cột 5  RENDER (output V1)
 *  Bãi đỗ (dưới cùng bên trái): node "(KHÔNG DÙNG…)", "Intro frame" cũ – chờ xoá trên web
 * Hàng: V1 y=0, V2 y=ROW, V3 y=2·ROW… (nhận biết biến thể qua tiền tố tiêu đề "V2 ·", id "-v2").
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const canvas = process.argv[2];
if (!canvas) { console.error('Usage: node tools/layout_project.mjs <canvas_id>'); process.exit(1); }
const call = (tool, args) => {
  const f = path.join(root, 'output', 'tmp', `layout_${process.pid}.json`);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(args));
  return JSON.parse(execFileSync('node', [path.join(root, 'tools', 'cinai.mjs'), tool, '@' + f], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
};

const COL = [0, 700, 1400, 2100, 2800, 3500];
const ROW = 1150;          // card 9:16 cao ~533 + nhãn 32px + khoảng hở giữa 2 nhóm biến thể
const INPUT_GAP = 680;     // khoảng cách các ảnh input trong cột 0
const st = call('get_canvas_state', { canvas_id: canvas });
const det = [];
for (let i = 0; i < st.nodes.length; i += 20) det.push(...call('get_canvas_node_details', { canvas_id: canvas, node_ids: st.nodes.slice(i, i + 20).map((n) => n.id) }).nodes); // MCP: tối đa 25 node/lần
const byId = Object.fromEntries(det.map((n) => [n.id, n]));

const variantOf = (n) => { const m = (n.title || '').match(/^V(\d+)\s*·/) || n.id.match(/-v(\d+)$/i); return m ? +m[1] : 1; };
const isParked = (n) => /KHÔNG DÙNG/i.test(n.title || '') || /^Intro frame$/i.test(n.title || '') || /PROBE/i.test(n.title || '') || n.type === 'labelNote' || n.type === 'stickyNote';
const LABEL_POS = { 'lbl-input': [0, -260], 'lbl-norm': [1, -260], 'lbl-prop': [2, -260], 'lbl-out': [5, -260] };
const isAudio = (n) => n.type === 'dynamicModel' && /Extract Audio|Âm thanh/i.test(`${n.model_name} ${n.title}`);
const isRender = (n) => n.type === 'dynamicModel' && /Render/i.test(`${n.model_name} ${n.title}`);
const fromInput = (n) => (n.incoming_edges || []).some((e) => byId[e.source]?.type === 'imageInput');
const feedsVideo = (n) => (n.outgoing_edges || []).some((e) => byId[e.target]?.type === 'video-generator');

const place = {}; const put = (id, x, y) => { place[id] = { x, y }; };
let inY = 0, parkY = 0, c1Extra = 0;
const variants = new Set();

// Cột 0: input (giữ thứ tự @Image theo node video V1 nếu có)
const v1Video = det.find((n) => n.type === 'video-generator' && variantOf(n) === 1);
const order = v1Video ? v1Video.incoming_edges.map((e) => e.source) : [];
const inputs = det.filter((n) => n.type === 'imageInput' && !isParked(n))
  .sort((a, b) => ((order.indexOf(a.id) + 1 || 99) - (order.indexOf(b.id) + 1 || 99)) || (a.position.y - b.position.y));
// ảnh khuôn mặt / sản phẩm (nguồn của node chuẩn hoá dùng chung) lên đầu
const isNormalizer = (n) => n.type === 'image-generator' && fromInput(n) && feedsVideo(n) && !/thumbnail/i.test(`${n.id} ${n.title}`) && !/^V\d\s*·/.test(n.title || '') && !/^prop/i.test(n.id);
const primary = new Set(det.filter(isNormalizer).flatMap((n) => n.incoming_edges.map((e) => e.source)));
inputs.sort((a, b) => (+!primary.has(a.id)) - (+!primary.has(b.id)));
for (const n of inputs) { put(n.id, COL[0], inY); inY += INPUT_GAP; }
for (const n of det.filter((x) => x.type === 'videoInput')) { put(n.id, COL[0], inY + 100); inY += INPUT_GAP; }

for (const n of det) {
  if (place[n.id]) continue;
  const v = variantOf(n); variants.add(v); const y = (v - 1) * ROW;
  if (isParked(n)) { put(n.id, COL[0] - 900, parkY); parkY += INPUT_GAP; continue; }
  if (n.id === 'lbl-park') { put(n.id, COL[0] - 900, -260); continue; }
  if (LABEL_POS[n.id]) { put(n.id, COL[LABEL_POS[n.id][0]], LABEL_POS[n.id][1]); continue; }
  if (/^lbl-v(\d+)$/.test(n.id)) { const k = +n.id.match(/^lbl-v(\d+)$/)[1]; put(n.id, COL[3], (k - 1) * ROW - 260); continue; }
  if (n.type === 'labelNote' || n.type === 'stickyNote') { put(n.id, COL[3], y - 170); continue; }
  if (isAudio(n)) { put(n.id, COL[1], 1100); continue; }
  if (isRender(n)) { put(n.id, COL[5], y); continue; }
  if (n.type === 'edit-video-generator') { put(n.id, COL[4], y); continue; }
  if (n.id === 'intro-clip') { put(n.id, COL[2], 2000 + ROW * Math.max(0, (variants.size || 3) - 2)); continue; }
  if (n.type === 'video-generator') { put(n.id, COL[3], y); continue; }
  if (n.type === 'image-generator') {
    if (/thumbnail/i.test(`${n.id} ${n.title}`)) { put(n.id, COL[1], 2000); continue; }   // khu dùng chung, không lấn sang nhóm biến thể
    if (/^V\d\s*·/.test(n.title || '') || /-v\d+$/i.test(n.id) || /^prop/i.test(n.id)) { put(n.id, COL[2], y); continue; }   // prop riêng biến thể
    if (fromInput(n) && feedsVideo(n)) { put(n.id, COL[1], c1Extra); c1Extra += 0; continue; }                               // chuẩn hoá dùng chung
    put(n.id, COL[2], y); continue;
  }
  put(n.id, COL[5], y + 1200);
}
// prop V1 (id "prop-logo" không có hậu tố) → cột 2 hàng 1
if (byId['prop-logo']) put('prop-logo', COL[2], 0);

let moved = 0;
for (const [id, p] of Object.entries(place)) {
  const cur = byId[id].position;
  if (Math.abs(cur.x - p.x) < 1 && Math.abs(cur.y - p.y) < 1) continue;
  call('update_canvas_node', { canvas_id: canvas, node_id: id, x: p.x, y: p.y });
  moved++;
}
console.log(JSON.stringify({ canvas, nodes: det.length, moved, variants: [...variants].sort(), layout: Object.fromEntries(Object.entries(place).map(([id, p]) => [`${(byId[id].title || id).slice(0, 40)}`, `${p.x},${p.y}`])) }, null, 2));
