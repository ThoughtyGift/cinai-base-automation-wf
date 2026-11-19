#!/usr/bin/env node
/**
 * Tạo bộ NHÃN rõ ràng (node Text = textInput) cho canvas project, thay cho stickyNote chữ nhỏ.
 *   node tools/label_project.mjs <canvas_id> "<tên V1>" "<tên V2>" "<tên V3>" [...]
 * Nhãn: lbl-input (① ĐẦU VÀO), lbl-norm (② CHUẨN HOÁ), lbl-prop (③ PROP, nếu có), lbl-v1..n (biến thể), lbl-out (⑤ OUTPUT), lbl-park (🗑 CHỜ XOÁ).
 * Màu nền chuẩn (đặt trên web – MCP chưa lưu được style): V1 Yellow · V2 Blue · V3 Purple · V4 Orange · V5 Red · ĐẦU VÀO Green · OUTPUT Red · CHỜ XOÁ Gray.
 * Font: Sans · Size: Heading 32px (nhãn biến thể) / Large 20px (nhãn khu vực). Sau khi tạo, chạy tools/layout_project.mjs để đặt đúng vị trí.
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [canvas, ...names] = process.argv.slice(2);
if (!canvas || !names.length) { console.error('Usage: node tools/label_project.mjs <canvas_id> "<V1>" "<V2>" ...'); process.exit(1); }
const call = (tool, args) => {
  const f = path.join(root, 'output', 'tmp', `label_${process.pid}.json`);
  fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(args));
  return JSON.parse(execFileSync('node', [path.join(root, 'tools', 'cinai.mjs'), tool, '@' + f], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
};
const st = call('get_canvas_state', { canvas_id: canvas });
const have = new Set(st.nodes.map((n) => n.id));
const hasProp = st.nodes.some((n) => /^prop/i.test(n.id));
const COLOR = ['Yellow', 'Blue', 'Purple', 'Orange', 'Red'];
const labels = [
  { id: 'lbl-input', title: '① ĐẦU VÀO', text: '① ĐẦU VÀO\nUpload ảnh của bạn tại đây\n(video gốc ở cuối cột – không đưa vào App)', color: 'Green', size: 'Large 20px' },
  { id: 'lbl-norm', title: '② CHUẨN HOÁ', text: '② CHUẨN HOÁ ẢNH + NHẠC GỐC\nRun trước các node video', color: 'Green', size: 'Large 20px' },
  ...(hasProp ? [{ id: 'lbl-prop', title: '③ PROP', text: '③ VẬT IN LOGO\nMỗi biến thể 1 node', color: 'Green', size: 'Large 20px' }] : []),
  ...names.map((nm, i) => ({ id: `lbl-v${i + 1}`, title: `V${i + 1} · ${nm}`, text: `V${i + 1} · ${nm.toUpperCase()}\n${i === 0 ? 'Bản giống video gốc' : 'Bản sáng tạo'} → output: ${i === 0 ? 'V1 · Rendered Video' : `V${i + 1} · Ghép + nhạc gốc`}`, color: COLOR[i] || 'Gray', size: 'Heading 32px' })),
  { id: 'lbl-out', title: '⑤ OUTPUT', text: '⑤ OUTPUT\nV1 Render = output App (đổi sang biến thể thắng sau khi so sánh)', color: 'Red', size: 'Large 20px' },
  { id: 'lbl-park', title: '🗑 CHỜ XOÁ', text: '🗑 CHỜ XOÁ\nNode thừa / nhãn cũ – xoá trên web', color: 'Gray', size: 'Large 20px' },
];
const made = [];
for (const L of labels) {
  const args = { canvas_id: canvas, title: L.title, prompt: L.text, settings: { label_style: { background: L.color, font: 'Sans', size: L.size } } };
  if (have.has(L.id)) call('update_canvas_node', { ...args, node_id: L.id });
  else call('create_canvas_node', { ...args, type: 'textInput', node_id: L.id, x: 0, y: 0 });
  made.push({ id: L.id, background: L.color, font: 'Sans', size: L.size });
}
console.log(JSON.stringify({ canvas, labels: made }, null, 2));
