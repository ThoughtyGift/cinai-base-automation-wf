#!/usr/bin/env node
/**
 * Tự nhận diện và tải media gốc của trend: VIDEO hoặc ẢNH (1 ảnh / carousel).
 *   node tools/trend_media.mjs <trend_id> <link>
 * - Video  → gọi tools/trend_video.mjs (goc.mp4 + contact sheet + analysis.json)
 * - Ảnh    → output/<trend_id>/anh_goc_1.jpg, anh_goc_2.jpg… + contact_anh.jpg
 * - Không tải được (cần đăng nhập, link hỏng) → loai_media = can_tai_tay: nhân viên tự lưu file vào output/<trend_id>/
 *   (goc.mp4 cho video, anh_goc_1.jpg… cho ảnh) rồi chạy lại lệnh này. KHÔNG vượt đăng nhập / captcha.
 * Ghi kết quả: output/<trend_id>/media.json
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [id, url] = process.argv.slice(2);
if (!id || !url) { console.error('Usage: node tools/trend_media.mjs <trend_id> <link>'); process.exit(1); }
const out = path.join(root, 'output', id);
fs.mkdirSync(out, { recursive: true });
const sh = (cmd, args, opt = {}) => execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 128e6, stdio: ['ignore', 'pipe', 'pipe'], ...opt });
const save = (o) => { fs.writeFileSync(path.join(out, 'media.json'), JSON.stringify({ trend_id: id, url, ...o }, null, 2)); console.log(JSON.stringify({ trend_id: id, url, ...o }, null, 2)); };
const localImgs = () => fs.readdirSync(out).filter((f) => /^anh_goc_\d+\.(jpe?g|png|webp)$/i.test(f)).sort();
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';

async function download(u, f) { const r = await fetch(u, { headers: { 'User-Agent': UA } }); if (!r.ok) throw new Error(`HTTP ${r.status}`); fs.writeFileSync(f, Buffer.from(await r.arrayBuffer())); }
function contactImages() {
  const imgs = localImgs(); if (!imgs.length) return;
  const args = ['-v', 'error', '-y']; imgs.forEach((f) => args.push('-i', path.join(out, f)));
  const scale = imgs.map((_, i) => `[${i}:v]scale=300:530:force_original_aspect_ratio=decrease,pad=300:540:(ow-iw)/2:(oh-ih)/2[v${i}]`).join(';');
  args.push('-filter_complex', `${scale};${imgs.map((_, i) => `[v${i}]`).join('')}hstack=inputs=${imgs.length}`, path.join(out, 'contact_anh.jpg'));
  if (imgs.length === 1) { fs.copyFileSync(path.join(out, imgs[0]), path.join(out, 'contact_anh.jpg')); return; }
  try { sh('ffmpeg', args); } catch { /* bỏ qua */ }
}
const asVideo = () => { const r = sh('node', [path.join(root, 'tools', 'trend_video.mjs'), id, url]); const a = JSON.parse(fs.readFileSync(path.join(out, 'analysis.json'), 'utf8')); save({ loai_media: 'video', file: 'goc.mp4', duration_s: a.duration_s, info: a.info }); return r; };

// 0) Nhân viên đã tự lưu file
if (fs.existsSync(path.join(out, 'goc.mp4'))) { asVideo(); process.exit(0); }
if (localImgs().length) { contactImages(); save({ loai_media: 'anh', files: localImgs(), nguon: 'file nhân viên lưu' }); process.exit(0); }

// 1) yt-dlp
let meta = null;
try { meta = JSON.parse(sh('yt-dlp', ['-J', '--no-warnings', url])); } catch (e) { meta = null; }
if (meta) {
  const entries = meta.entries?.length ? meta.entries : [meta];
  const hasVideo = entries.some((e) => (e.vcodec && e.vcodec !== 'none') || (e.formats || []).some((f) => f.vcodec && f.vcodec !== 'none'));
  if (hasVideo) { asVideo(); process.exit(0); }
  const imgUrls = entries.map((e) => e.url || e.thumbnail).filter(Boolean);
  if (imgUrls.length) {
    for (let i = 0; i < imgUrls.length; i++) await download(imgUrls[i], path.join(out, `anh_goc_${i + 1}.jpg`));
    contactImages(); save({ loai_media: 'anh', files: localImgs(), nguon: 'yt-dlp', info: { uploader: meta.uploader, description: (meta.description || '').slice(0, 400) } }); process.exit(0);
  }
}

// 2) Thẻ og:video / og:image công khai của trang (không đăng nhập)
try {
  const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'vi,en;q=0.8' }, redirect: 'follow' });
  const html = await r.text();
  if (/\/login|accounts\/login|passport/i.test(r.url)) throw new Error('cần đăng nhập');
  const pick = (p) => [...html.matchAll(new RegExp(`<meta[^>]+property=["']${p}["'][^>]+content=["']([^"']+)["']`, 'gi'))].map((m) => m[1].replace(/&amp;/g, '&'));
  const vids = pick('og:video(?::url|:secure_url)?'); const imgs = pick('og:image');
  if (vids.length) { await download(vids[0], path.join(out, 'goc.mp4')); asVideo(); process.exit(0); }
  if (imgs.length) { for (let i = 0; i < imgs.length; i++) await download(imgs[i], path.join(out, `anh_goc_${i + 1}.jpg`)); contactImages(); save({ loai_media: 'anh', files: localImgs(), nguon: 'og:image (có thể chỉ là ảnh đại diện – kiểm tra lại)' }); process.exit(0); }
  throw new Error('không thấy media công khai');
} catch (e) {
  save({ loai_media: 'can_tai_tay', ly_do: String(e.message || e), huong_dan: `Mở link trên điện thoại/trình duyệt đã đăng nhập, tải media về và lưu vào output/${id}/ (video: goc.mp4 | ảnh: anh_goc_1.jpg, anh_goc_2.jpg…), rồi chạy lại: node tools/trend_media.mjs ${id} <link>` });
  process.exit(4);
}
