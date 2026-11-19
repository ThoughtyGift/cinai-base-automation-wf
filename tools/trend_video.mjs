#!/usr/bin/env node
/**
 * Phân tích video trend gốc cho agent "đọc" được video.
 *   node tools/trend_video.mjs <trend_id> <link_video_goc>
 * Kết quả trong output/<trend_id>/:
 *   goc.mp4, goc.info.json      – video + metadata (tác giả, caption, like…)
 *   frames_goc/contact_2fps.jpg – lưới khung hình mỗi 0,5s (đọc từ trái→phải, trên→dưới)
 *   frames_goc/f_XXX.jpg        – từng khung hình 0,5s (để xem chi tiết)
 *   analysis.json               – thời lượng, kích thước, fps, số khung, thời điểm đổi cảnh
 * Cần: yt-dlp, ffmpeg, ffprobe trong PATH. Chỉ dùng video công khai, làm tham chiếu nội bộ.
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [trendId, url] = process.argv.slice(2);
if (!trendId || !url) { console.error('Usage: node tools/trend_video.mjs <trend_id> <url>'); process.exit(1); }
const out = path.join(root, 'output', trendId);
const fr = path.join(out, 'frames_goc');
fs.mkdirSync(fr, { recursive: true });
const run = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 64e6, stdio: ['ignore', 'pipe', 'pipe'] });

const video = path.join(out, 'goc.mp4');
if (!fs.existsSync(video)) {
  run('yt-dlp', ['--no-playlist', '-f', 'mp4/best', '--merge-output-format', 'mp4', '--write-info-json', '-o', path.join(out, 'goc.%(ext)s'), url]);
}
const probe = JSON.parse(run('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', video]));
const vs = probe.streams.find((s) => s.codec_type === 'video');
const duration = +(+probe.format.duration).toFixed(2);

// khung hình mỗi 0,5s
for (const f of fs.readdirSync(fr)) fs.unlinkSync(path.join(fr, f));
run('ffmpeg', ['-v', 'error', '-y', '-i', video, '-vf', 'fps=2,scale=360:-1', path.join(fr, 'f_%03d.jpg')]);
const frames = fs.readdirSync(fr).filter((f) => f.startsWith('f_')).length;
const cols = Math.min(13, frames);
const rows = Math.ceil(frames / cols);
run('ffmpeg', ['-v', 'error', '-y', '-i', video, '-vf', `fps=2,scale=160:-1,tile=${cols}x${rows}`, '-frames:v', '1', path.join(fr, 'contact_2fps.jpg')]);

// thời điểm đổi cảnh (scene change)
let scenes = [];
try {
  const log = execFileSync('ffmpeg', ['-hide_banner', '-i', video, '-vf', "select='gt(scene,0.2)',showinfo", '-f', 'null', '-'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  scenes = [...log.matchAll(/pts_time:([\d.]+)/g)].map((m) => +(+m[1]).toFixed(2));
} catch (e) {
  scenes = [...String(e.stderr || '').matchAll(/pts_time:([\d.]+)/g)].map((m) => +(+m[1]).toFixed(2));
}

let info = {};
const ij = path.join(out, 'goc.info.json');
if (fs.existsSync(ij)) {
  const i = JSON.parse(fs.readFileSync(ij, 'utf8'));
  info = { uploader: i.uploader, channel: i.channel, upload_date: i.upload_date, like_count: i.like_count, view_count: i.view_count, comment_count: i.comment_count, description: (i.description || '').slice(0, 500) };
}
const analysis = { trend_id: trendId, url, duration_s: duration, width: vs.width, height: vs.height, fps: vs.r_frame_rate, frames_every_0_5s: frames, scene_changes_s: scenes, info,
  how_to_read: 'contact_2fps.jpg: ô thứ k (đếm từ 0, trái→phải, trên→dưới) = giây k*0.5. Xem f_XXX.jpg để soi chi tiết (f_001 = 0.0s).' };
fs.writeFileSync(path.join(out, 'analysis.json'), JSON.stringify(analysis, null, 2));
console.log(JSON.stringify(analysis, null, 2));
