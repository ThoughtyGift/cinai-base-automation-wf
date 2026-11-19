#!/usr/bin/env node
/**
 * (1) Sửa khung xuất của mọi node Ghép/Render về 9:16 (1080×1920), xoá timeline cũ kế thừa khi clone.
 * (2) Thêm "Creative Intro" làm bằng MCP (thay tính năng Creative Intro trên toolbar – không có tool MCP):
 *     Thumbnail (ảnh bìa) → intro-clip (Gemini Omni 1.2 Flash, 3s, 9:16, chữ tiêu đề động) → nối vào mọi node Ghép (V1..Vn)
 *   node tools/fix_edit_intro.mjs <canvas_id> "<TIÊU ĐỀ INTRO>" [thời_lượng=3s]
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [canvas, title = 'NEW COLLECTION', dur = '3s'] = process.argv.slice(2);
if (!canvas) { console.error('Usage: node tools/fix_edit_intro.mjs <canvas_id> "<TIÊU ĐỀ>" [3s]'); process.exit(1); }
const call = (tool, args) => {
  const f = path.join(root, 'output', 'tmp', `fix_${process.pid}.json`);
  fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(args));
  return JSON.parse(execFileSync('node', [path.join(root, 'tools', 'cinai.mjs'), tool, '@' + f], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
};
const EDIT_JSON_916 = { output: { format: 'mp4', size: { width: 1080, height: 1920 } }, timeline: { background: '#000000', tracks: [] } };
const SETTINGS = { resolution: '1080p', format: 'mp4', render_mode: 'final', duration_minutes: 1, edit_json: EDIT_JSON_916 };

const st = call('get_canvas_state', { canvas_id: canvas });
const det = [];
for (let i = 0; i < st.nodes.length; i += 20) det.push(...call('get_canvas_node_details', { canvas_id: canvas, node_ids: st.nodes.slice(i, i + 20).map((n) => n.id) }).nodes);
const edits = det.filter((n) => n.type === 'edit-video-generator');
const renders = det.filter((n) => n.type === 'dynamicModel' && /Render/i.test(`${n.model_name} ${n.title}`));

// (1) khung 9:16 + xoá timeline cũ
for (const n of [...edits, ...renders]) {
  call('update_canvas_node', { canvas_id: canvas, node_id: n.id, settings: SETTINGS, edit_json: EDIT_JSON_916 });
}

// (2) Creative Intro
const thumb = det.find((n) => /thumbnail/i.test(`${n.id} ${n.title}`));
if (!thumb) { console.error('Không thấy node Thumbnail – tạo thumbnail trước (skill bước 2.5).'); process.exit(2); }
const prompt = `# CREATIVE INTRO – "${title}"
**THIẾT LẬP**: ${dur.replace('s', '')} giây, 9:16 dọc, 30 FPS, intro tiêu đề động mở đầu video quảng cáo.
**HÌNH NỀN**: dùng chính @Image 1 (ảnh bìa của video) làm khung hình, giữ nguyên chủ thể, bố cục, ánh sáng; máy đẩy vào rất chậm, ánh sáng quét nhẹ qua khung hình.
**CHỮ TIÊU ĐỀ**: dòng chữ "${title}" xuất hiện trong vùng an toàn 25%–32% từ mép trên khung hình (cách mép trên ít nhất 18% để không bị cắt chữ) – chữ in hoa, font serif/sans cao cấp, màu trắng có bóng mờ, hiệu ứng từng ký tự trượt lên + mờ dần vào (kinetic typography), giữ 1 nhịp rồi thu nhỏ nhẹ.
**KẾT**: giây cuối chữ mờ dần, khung hình trở lại sạch để nối liền mạch vào cảnh đầu tiên của video chính.
**ÂM THANH**: tiếng "whoosh" nhẹ khi chữ xuất hiện, không lời thoại.
**HẠN CHẾ**: chữ đúng chính tả "${title}", không chạm mép trên, không thêm chữ/logo khác, không biến dạng chủ thể, không thêm người.`;
const exists = det.some((n) => n.id === 'intro-clip');
const args = { canvas_id: canvas, title: `INTRO · Creative Intro "${title}" (${dur})`, model_id: '6aee81f743f8ddf4b6000558', settings: { aspect_ratio: '9:16', duration: dur, resolution: '720p', camera_movement: 'fixed' }, prompt };
if (exists) call('update_canvas_node', { ...args, node_id: 'intro-clip' });
else call('create_canvas_node', { ...args, node_id: 'intro-clip', type: 'video-generator', connect_from_node_id: thumb.id, source_handle: 'output', target_handle: 'image', x: 0, y: 0 });
const introNow = call('get_canvas_node_details', { canvas_id: canvas, node_ids: ['intro-clip'] }).nodes[0];
const linked = new Set(introNow.outgoing_edges.map((e) => e.target));
for (const e of edits) if (!linked.has(e.id)) call('connect_canvas_nodes', { canvas_id: canvas, source_node_id: 'intro-clip', target_node_id: e.id, source_handle: 'output', target_handle: 'video' });
// intro phải là clip ĐẦU TIÊN trong timeline → nối lại video chính sau intro
for (const e of call('get_canvas_node_details', { canvas_id: canvas, node_ids: edits.map((x) => x.id) }).nodes) {
  const vids = e.incoming_edges.filter((x) => x.target_handle === 'video').map((x) => x.source);
  if (vids[0] === 'intro-clip') continue;
  for (const s of vids.filter((s) => s !== 'intro-clip')) {
    call('disconnect_canvas_nodes', { canvas_id: canvas, source_node_id: s, target_node_id: e.id });
    call('connect_canvas_nodes', { canvas_id: canvas, source_node_id: s, target_node_id: e.id, source_handle: 'output', target_handle: 'video' });
  }
}

const chk = call('get_canvas_node_details', { canvas_id: canvas, node_ids: edits.map((e) => e.id) }).nodes;
console.log(JSON.stringify({ canvas, fixed_916: [...edits, ...renders].map((n) => n.id), intro_from: thumb.id, edits: chk.map((n) => ({ id: n.id, size: n.settings?.edit_json?.output?.size, resolution: n.settings?.resolution, video_inputs: n.incoming_edges.filter((x) => x.target_handle === 'video').map((x) => x.source) })) }, null, 2));
