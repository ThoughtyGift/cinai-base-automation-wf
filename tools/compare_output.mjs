#!/usr/bin/env node
/**
 * So sánh video gốc với video output trên canvas cinai.
 *   node tools/compare_output.mjs <trend_id> <canvas_id> [node_id]
 *   node tools/compare_output.mjs <trend_id> --file <duong_dan_video_output.mp4>
 * - Lấy output_url của node (mặc định: node render, nếu chưa có thì node video) qua tools/cinai.mjs (miễn phí).
 * - Tải về output/<trend_id>/output.mp4, tạo lưới so sánh 2 hàng (trên = gốc, dưới = output) mỗi 0,5s.
 * Kết quả: output/<trend_id>/compare/side_by_side.jpg, compare.json
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [trendId, a2, a3] = process.argv.slice(2);
if (!trendId || !a2) { console.error('Usage: node tools/compare_output.mjs <trend_id> <canvas_id> [node_id] | --file <mp4>'); process.exit(1); }
const out = path.join(root, 'output', trendId);
const cmpDir = path.join(out, 'compare', a2 === '--file' ? 'file' : (a3 || 'auto').replace(/[^\w.-]/g, '_'));
fs.mkdirSync(cmpDir, { recursive: true });
const run = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 64e6, stdio: ['ignore', 'pipe', 'pipe'] });
const cinai = (tool, args) => {
  const f = path.join(root, 'output', 'tmp', 'cmp_args.json');
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(args));
  return JSON.parse(run('node', [path.join(root, 'tools', 'cinai.mjs'), tool, '@' + f]));
};

const goc = path.join(out, 'goc.mp4');
if (!fs.existsSync(goc)) { console.error('Chưa có video gốc. Chạy trước: node tools/trend_video.mjs <trend_id> <url>'); process.exit(1); }

let outVideo = path.join(cmpDir, 'output.mp4');
let source;
if (a2 === '--file') {
  outVideo = path.resolve(a3); source = outVideo;
} else {
  const st = cinai('get_canvas_state', { canvas_id: a2 });
  const pick = a3 ? [a3] : [
    ...st.nodes.filter((n) => /Render/i.test(n.model_name || '') || /render/i.test(n.id)).map((n) => n.id),
    ...st.nodes.filter((n) => n.type === 'video-generator').map((n) => n.id),
  ];
  const det = cinai('get_canvas_node_details', { canvas_id: a2, node_ids: pick });
  const staleFile = path.join(out, 'stale_outputs.json');
  const stale = fs.existsSync(staleFile) ? Object.values(JSON.parse(fs.readFileSync(staleFile, 'utf8')).stale || {}) : [];
  const node = pick.map((id) => det.nodes.find((n) => n.id === id)).find((n) => n && n.output_url && !stale.includes(n.output_url));
  if (!node) { console.error(`Chưa có video output MỚI trên canvas (đã bỏ qua output cũ kế thừa khi clone; node kiểm tra: ${pick.join(', ')}). Hãy chạy workflow trên web trước.`); process.exit(2); }
  source = `${node.id} -> ${node.output_url}`;
  const r = await fetch(node.output_url);
  if (!r.ok) throw new Error(`Tải output lỗi HTTP ${r.status}`);
  fs.writeFileSync(outVideo, Buffer.from(await r.arrayBuffer()));
}

const dur = (f) => +(+JSON.parse(run('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_format', f])).format.duration).toFixed(2);
const dG = dur(goc), dO = dur(outVideo);
const n = Math.ceil(Math.max(dG, dO) * 2);
const cols = Math.min(n, 16);
const rowsEach = Math.ceil(n / cols);
const tileOf = (f, name) => {
  const p = path.join(cmpDir, name);
  run('ffmpeg', ['-v', 'error', '-y', '-i', f, '-vf', `fps=2,scale=150:266:force_original_aspect_ratio=decrease,pad=150:266:(ow-iw)/2:(oh-ih)/2,tile=${cols}x${rowsEach}`, '-frames:v', '1', p]);
  return p;
};
const tG = tileOf(goc, 'row_goc.jpg');
const tO = tileOf(outVideo, 'row_output.jpg');
run('ffmpeg', ['-v', 'error', '-y', '-i', tG, '-i', tO, '-filter_complex', 'vstack=inputs=2', path.join(cmpDir, 'side_by_side.jpg')]);

const res = { trend_id: trendId, source, duration_goc_s: dG, duration_output_s: dO, grid: { cols, rows_each: rowsEach, step_s: 0.5 },
  files: { side_by_side: path.relative(out, path.join(cmpDir, 'side_by_side.jpg')).replace(/\\/g, '/') },
  how_to_read: `Nửa trên = video gốc, nửa dưới = output; mỗi ô cách nhau 0,5s, ${cols} ô/hàng.`,
  checklist: ['Mở đầu giống?', 'Số look & thứ tự đúng?', 'Cơ chế chuyển cảnh đúng?', 'Máy quay/nhịp dựng giống?', 'Danh tính nhân vật giữ được?', 'Trang phục khớp ảnh input?', 'Kết thúc/tiêu đề giống?', 'Lỗi AI (tay, mặt, vải, chữ)?'] };
fs.writeFileSync(path.join(cmpDir, 'compare.json'), JSON.stringify(res, null, 2));
console.log(JSON.stringify(res, null, 2));
