#!/usr/bin/env node
/**
 * Đọc task CHƯA HOÀN THÀNH từ Lark Base "Quản lý Timeline Trend APP ECOMER" → tạo form inbox/L<số>.md cho từng task.
 *
 *   node tools/lark_tasks.mjs list   <bộ chọn>      # chỉ liệt kê, không tạo gì
 *   node tools/lark_tasks.mjs inbox  <bộ chọn>      # tạo/cập nhật form inbox/L<số>.md cho các task được chọn
 *   node tools/lark_tasks.mjs update <số> link=<url> [trang_thai=done]   # GHI NGƯỢC Lark – chỉ khi người dùng đã duyệt (cần LARK_WRITE=1)
 *
 * Bộ chọn (ghép được nhiều điều kiện, cách nhau bởi dấu cách):
 *   tat-ca | all          mọi task chưa hoàn thành
 *   62 | 60-70 | 62,77    theo SỐ THỨ TỰ dòng trong view "Chung" (cột # trên Lark)
 *   nv:"Tun Tun"          theo nhân viên        loai:Ecomer    theo phân loại
 *   top:5                 lấy 5 task đầu         kem-xong       gồm cả task đã có link cinai (mặc định bỏ qua)
 *
 * Nguồn dữ liệu (tự chọn):
 *   1) Lark OpenAPI – cần LARK_APP_ID, LARK_APP_SECRET trong .env (app được thêm vào Base, quyền bitable đọc/ghi).
 *   2) CSV dự phòng – xuất view "Chung" ra CSV, lưu inbox/lark_export.csv (số thứ tự = thứ tự dòng trong file).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = Object.fromEntries(fs.readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/)
  .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
  .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]));
const CFG = {
  domain: env.LARK_DOMAIN || 'https://open.larksuite.com',
  app_token: env.LARK_TREND_APP_TOKEN || 'XkGtbLSZtaR5ODs2VMdjXh3xpZf',
  table_id: env.LARK_TREND_TABLE_ID || 'tbl0Dqd4G06mG49K',
  view_id: env.LARK_TREND_VIEW_ID || 'vewbBH9TDi',
  csv: path.join(root, 'inbox', 'lark_export.csv'),
};
const F = { trend: 'Trend', demo: 'Tệp đính kèm / Demo', cinai: 'Link trên cinai', fb: 'Facebook', loai: 'Phân loại Trend', uu_tien: 'Mức độ ưu tiên', ngay: 'Ngày', nv: 'Nhân viên', tt: 'Trạng thái hoàn thành', deadline: 'Hạn chót (Deadline)', ig: 'Instagram', tiktok: 'Tiktok' };
const DONE = ['✅ Đã hoàn thành', '✅ Đã duyệt', '🟡 Đã xong chưa duyệt', '⏸️ Tạm hoãn'];

// ---------- chuẩn hoá giá trị field Lark ----------
const val = (v) => {
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if (Array.isArray(v)) return v.map((x) => (typeof x === 'object' ? (x.name || x.text || x.link || x.en_name || '') : x)).filter(Boolean).join(', ');
  if (typeof v === 'object') return v.link || v.text || v.name || '';
  return String(v);
};
const date = (v) => (typeof v === 'number' ? new Date(v).toISOString().slice(0, 10) : val(v).replace(/\//g, '-'));

// ---------- nguồn 1: Lark OpenAPI ----------
async function larkToken() {
  const r = await fetch(`${CFG.domain}/open-apis/auth/v3/tenant_access_token/internal`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ app_id: env.LARK_APP_ID, app_secret: env.LARK_APP_SECRET }) });
  const j = await r.json();
  if (!j.tenant_access_token) throw new Error(`Lark auth lỗi: ${j.msg || JSON.stringify(j)}`);
  return j.tenant_access_token;
}
async function fromApi() {
  const tok = await larkToken();
  const rows = []; let page = '';
  do {
    const u = `${CFG.domain}/open-apis/bitable/v1/apps/${CFG.app_token}/tables/${CFG.table_id}/records?view_id=${CFG.view_id}&page_size=500${page ? `&page_token=${page}` : ''}`;
    const j = await (await fetch(u, { headers: { Authorization: `Bearer ${tok}` } })).json();
    if (j.code !== 0) throw new Error(`Lark list lỗi: ${j.msg}`);
    for (const it of j.data.items || []) rows.push({ record_id: it.record_id, f: it.fields });
    page = j.data.has_more ? j.data.page_token : '';
  } while (page);
  return rows.map((r, i) => ({ so: i + 1, record_id: r.record_id, ...Object.fromEntries(Object.entries(F).map(([k, name]) => [k, k === 'ngay' || k === 'deadline' ? date(r.f[name]) : val(r.f[name])])) }));
}

// ---------- nguồn 2: CSV ----------
function parseCsv(txt) {
  const out = []; let row = [], cell = '', q = false;
  for (let i = 0; i < txt.length; i++) {
    const ch = txt[i];
    if (q) { if (ch === '"' && txt[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') q = false; else cell += ch; }
    else if (ch === '"') q = true; else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && txt[i + 1] === '\n') i++; row.push(cell); out.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); out.push(row); }
  // GIỮ dòng trống ở giữa (Lark vẫn đánh số), chỉ bỏ dòng trống ở cuối file
  while (out.length && !out[out.length - 1].some((c) => c.trim())) out.pop();
  return out;
}
function fromCsv() {
  const [head, ...data] = parseCsv(fs.readFileSync(CFG.csv, 'utf8').replace(/^\uFEFF/, ''));
  const idx = Object.fromEntries(Object.entries(F).map(([k, name]) => [k, head.findIndex((h) => h.trim() === name)]));
  return data.map((r, i) => ({ so: i + 1, record_id: '', ...Object.fromEntries(Object.entries(idx).map(([k, j]) => [k, j >= 0 ? (r[j] || '').trim() : ''])) }));
}

async function load() {
  if (env.LARK_APP_ID && env.LARK_APP_SECRET) return { src: 'lark-api', rows: await fromApi() };
  if (fs.existsSync(CFG.csv)) return { src: 'csv', rows: fromCsv() };
  throw new Error('Chưa có nguồn Lark: điền LARK_APP_ID/LARK_APP_SECRET vào .env, hoặc xuất view "Chung" ra CSV lưu thành inbox/lark_export.csv');
}

// ---------- bộ chọn ----------
function select(rows, argv) {
  const s = argv.join(' ');
  const nums = new Set();
  for (const m of s.matchAll(/(?:^|\s)(\d+)(?:-(\d+))?(?=\s|,|$)|,(\d+)/g)) {
    if (m[3]) nums.add(+m[3]); else if (m[2]) for (let k = +m[1]; k <= +m[2]; k++) nums.add(k); else nums.add(+m[1]);
  }
  const nv = s.match(/nv:"([^"]+)"|nv:(\S+)/); const loai = s.match(/loai:"([^"]+)"|loai:(\S+)/); const top = s.match(/top:(\d+)/);
  const all = /\b(tat-ca|all)\b/.test(s) || (!nums.size && !nv && !loai && !top);
  let r = rows.filter((x) => !DONE.includes(x.tt) && x.demo);
  if (!/kem-xong/.test(s)) r = r.filter((x) => !x.cinai);
  if (nums.size) r = r.filter((x) => nums.has(x.so));
  if (nv) r = r.filter((x) => x.nv.toLowerCase().includes((nv[1] || nv[2]).toLowerCase()));
  if (loai) r = r.filter((x) => x.loai.toLowerCase().includes((loai[1] || loai[2]).toLowerCase()));
  if (top) r = r.slice(0, +top[1]);
  return { all, rows: r };
}

const pad = (n) => String(n).padStart(3, '0');
const platform = (u) => (/instagram/.test(u) ? 'Instagram' : /tiktok/.test(u) ? 'TikTok' : /xhslink|xiaohongshu|rednote/.test(u) ? 'Xiaohongshu' : /facebook|fb\./.test(u) ? 'Facebook' : /youtu/.test(u) ? 'YouTube' : 'Khác');
function form(t) {
  const id = `L${pad(t.so)}`;
  return `---
trend_id: ${id}
lark_so_dong: ${t.so}
lark_record_id: "${t.record_id}"
ten_trend: "${(t.trend || '').replace(/"/g, "'")}"          # trống → agent tự đặt theo keyword sau khi xem media
keyword_trend: ""                  # agent điền: keyword ngắn VN · EN (dùng đặt tên project)
nhan_vien: "${t.nv}"
ngay_tim: ${t.ngay || ''}
phan_loai: "${t.loai}"
uu_tien: "${t.uu_tien}"
link_video_goc: "${t.demo}"        # có thể là video HOẶC ảnh/carousel
nen_tang_goc: ${platform(t.demo)}
loai_media: ""                     # agent điền: video | anh | can_tai_tay
so_bien_the_wf: 3
trang_thai: cho_xu_ly
---

## Nguồn
Lark "Timeline Trend" – dòng #${t.so} – trạng thái: ${t.tt || '(trống)'} – deadline: ${t.deadline || '(trống)'}.

## Ghi chú nhân viên (tuỳ chọn – agent tự xem media gốc)
`;
}

const [cmd = 'list', ...rest] = process.argv.slice(2);
const { src, rows } = await load();
if (cmd === 'update') {
  if (env.LARK_WRITE !== '1' && process.env.LARK_WRITE !== '1') { console.error('BLOCKED: ghi ngược Lark là thao tác trên dữ liệu thật – cần người dùng duyệt rồi đặt LARK_WRITE=1.'); process.exit(2); }
  if (src !== 'lark-api') { console.error('Ghi ngược cần Lark OpenAPI (LARK_APP_ID/SECRET).'); process.exit(2); }
  const so = +rest[0]; const kv = Object.fromEntries(rest.slice(1).map((x) => [x.split('=')[0], x.split('=').slice(1).join('=')]));
  const t = rows.find((x) => x.so === so); if (!t) { console.error(`Không thấy dòng #${so}`); process.exit(1); }
  const fields = {};
  if (kv.link) fields[F.cinai] = { link: kv.link, text: kv.link };
  const statusMap = {
    chua_lam: '⏳ Chưa làm',
    cho_duyet: '🟡 Đã xong chưa duyệt',
    xong_chua_duyet: '🟡 Đã xong chưa duyệt',
    da_duyet: '✅ Đã duyệt',
    done: '✅ Đã hoàn thành',
    dang: 'đang hoàn thiện'
  };
  if (kv.trang_thai) fields[F.tt] = statusMap[kv.trang_thai] || kv.trang_thai;
  const tok = await larkToken();
  const j = await (await fetch(`${CFG.domain}/open-apis/bitable/v1/apps/${CFG.app_token}/tables/${CFG.table_id}/records/${t.record_id}`, { method: 'PUT', headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields }) })).json();
  console.log(j.code === 0 ? `Đã cập nhật Lark dòng #${so}` : `Lỗi: ${j.msg}`);
  process.exit(j.code === 0 ? 0 : 3);
}
const { rows: picked } = select(rows, rest);
const list = picked.map((t) => ({ trend_id: `L${pad(t.so)}`, so: t.so, trend: t.trend || '(trống)', nhan_vien: t.nv, phan_loai: t.loai, trang_thai: t.tt || '(trống)', link: t.demo, nen_tang: platform(t.demo) }));
if (cmd === 'inbox') {
  for (const t of picked) {
    const f = path.join(root, 'inbox', `L${pad(t.so)}.md`);
    if (fs.existsSync(f) && /trang_thai:\s*da_dung_canvas/.test(fs.readFileSync(f, 'utf8'))) continue; // không ghi đè task đã làm
    fs.writeFileSync(f, form(t));
  }
}
console.log(JSON.stringify({ nguon: src, tong_dong: rows.length, so_task_chon: list.length, tasks: list }, null, 2));
