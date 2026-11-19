# Bước 0 – Lấy task từ Lark và chạy tự động hàng loạt

Nguồn mặc định: Lark Base **"Quản lý Timeline Trend APP ECOMER"** – bảng `Timeline Trend` (`tbl0Dqd4G06mG49K`), view **Chung** (`vewbBH9TDi`).
**Mỗi dòng = 1 task = 1 project = 1 canvas** (V1, V2, V3… nằm chung trên canvas đó).

## 0.0 Nếu nhân viên / team CHƯA có Lark Base (T1 học form → B1 cài Drive hoặc Lark Base)
Khi nhân viên chưa được cấp quyền vào Base công ty hoặc dùng cho team mới:
1. **T1 – Học đúng Form Base chuẩn (12 cột, mẫu lưu tại `inbox/lark_template.csv`):**
   - `Trend` | `Tệp đính kèm / Demo` *(link video/ảnh gốc)* | `Link trên cinai` | `Facebook` | `Phân loại Trend` *(VD: Ecomer)* | `Mức độ ưu tiên` | `Ngày` | `Nhân viên` | `Trạng thái hoàn thành` *(xong = `✅ Đã hoàn thành` hoặc `⏸️ Tạm hoãn`)* | `Hạn chót (Deadline)` | `Instagram` | `Tiktok`.
2. **B1 – Chọn 1 trong 2 nền tảng để Agent tự tạo lại Form Base giống hệt:**
   - **Phương án A – Google Drive / Google Sheets (dùng skill `gdrive`):** Agent upload `inbox/lark_template.csv` lên Google Drive của nhân viên (chuyển thành Google Sheet để nhập liệu online) và hướng dẫn xuất CSV về `inbox/lark_export.csv` khi chạy `tools/lark_tasks.mjs`.
   - **Phương án B – Lark Base mới (dùng Lark OpenAPI):** Nhân viên tạo Custom App trên Lark Developer và điền `LARK_APP_ID`, `LARK_APP_SECRET` vào `.env` (hoặc import trực tiếp `inbox/lark_template.csv` vào Lark Base mới). Agent tự tạo bảng 12 cột chuẩn qua API `POST /open-apis/bitable/v1/apps` và ghi `LARK_TREND_APP_TOKEN`, `LARK_TREND_TABLE_ID`, `LARK_TREND_VIEW_ID` mới vào `.env`.

## 0.1 Hiểu câu lệnh của nhân viên → bộ chọn
| Nhân viên viết | Bộ chọn cho `tools/lark_tasks.mjs` |
|---|---|
| "làm toàn bộ task chưa hoàn thành" | `tat-ca` |
| "làm task 62" / "task số 62" | `62` |
| "làm task 60 đến 70" / "từ 60 tới 70" | `60-70` |
| "làm task 62, 77, 91" | `62,77,91` |
| "làm task của Tun Tun" | `nv:"Tun Tun"` |
| "làm các task Ecomer" | `loai:Ecomer` |
| "làm 5 task đầu" | `top:5` |
| "làm lại task 62 dù đã có link" | `62 kem-xong` |
Ghép được: "task Ecomer của Khánh Hoà, 3 cái đầu" → `loai:Ecomer nv:"Khánh Hoà" top:3`.
**Số task = số thứ tự dòng (#) trong view Chung** – đúng con số nhân viên nhìn thấy trên Lark.

## 0.2 Điều kiện một task được làm
- `Trạng thái hoàn thành` ≠ "✅ Đã hoàn thành" và ≠ "⏸️ Tạm hoãn".
- Có link ở cột **Tệp đính kèm / Demo**.
- Cột **Link trên cinai** còn trống (trừ khi có `kem-xong`).
Task bị loại → liệt kê lý do trong báo cáo, không tự làm.

## 0.3 Quy trình tự động cho MỖI task (lần lượt, không song song)
```
node tools/lark_tasks.mjs list  <bộ chọn>     → in danh sách, báo nhân viên: "Sẽ làm N task: #62, #77…" (không cần hỏi lại nếu lệnh đã rõ)
node tools/lark_tasks.mjs inbox <bộ chọn>     → tạo inbox/L<số>.md cho từng task
Với từng task L<số>:
  1. node tools/trend_media.mjs L<số> <link>  → loai_media = video | anh | can_tai_tay
  2. video → Bước 1 → 2 → 3 → 4 → 5 (skill chính)        anh → Bước 2b (WF ảnh) → 4 → 5
     can_tai_tay → ghi outbox "CẦN TẢI TAY" + hướng dẫn, chuyển task kế tiếp
  3. Đặt KEYWORD + tên project (0.4), dựng 1 canvas chứa V1–V3
  4. outbox/L<số>.md + cập nhật frontmatter inbox (trang_thai: da_dung_canvas, canvas_id, link)
Cuối đợt: outbox/_BAO_CAO_<ngày>.md – bảng: # | trend | nhân viên | loại media | mẫu | link project | trạng thái | việc cần làm
```
- Lỗi ở 1 task → ghi lỗi, **làm tiếp task sau** (không dừng cả đợt).
- Giới hạn cinai 60 lần gọi/phút/key: `tools/cinai.mjs` hỗ trợ **`CINAI_API_KEYS=key1,key2,key3`** trong `.env` để tự động xoay vòng key khi chạy lô 20–100 WF.
- **Dự phòng đọc Checklist Lark trực tiếp trên Browser (khi `.env` chưa có `LARK_APP_ID` / `inbox/lark_export.csv`):** Dùng **Browser Subagent** mở tab Lark Base view `Chung` đọc trực tiếp danh sách `# | Trend | Tệp đính kèm / Demo | Nhân viên | Trạng thái` (chọn các dòng có `Link trên cinai` trống & chưa hoàn thành), hoặc bấm `⋯ → Export → CSV` lưu về `inbox/lark_export.csv` để chạy `lark_tasks.mjs` bình thường.

## 0.5 Chế độ Auto-Pipeline (10–100 WF/lô – Không dừng hỏi lại)
Khi user ra lệnh chạy hàng loạt (VD: `/lam-task-lark tat-ca --auto`, *"Chạy auto 50 task, ngân sách X credit, không hỏi lại"*):
1. **Duyệt credit 1 lần cho cả lô (`auto-duyet`):** Nếu user đã duyệt sẵn tổng ngân sách lô (hoặc bật `AUTO_SPEND=1`), Agent tự chạy luôn `run_canvas_batch.mjs` + Export Edit cho từng task, tự cộng dồn `credits_charged` trong `output/run_log.json`, **KHÔNG dừng hỏi duyệt lại từng task**. Chỉ dừng nếu chạm trần ngân sách lô.
2. **Với mỗi task `L<số>` (`1 task / 1 keyword = 1 project`):**
   - Dựng canvas V1–V3 + `fix_edit_intro.mjs` + `label_project.mjs` + `layout_project.mjs` + `configure_canvas_app` + `open_canvas`.
   - Nếu có mặt người dùng bấm **Allow** upload `goc.mp4` (hoặc ảnh đã upload qua `upload_file`): chạy luôn `GPT image 2.5` + `Extract Audio` (0 cr) → (nếu đã duyệt ngân sách) chạy `run_canvas_batch.mjs` → `build_edit_json.mjs` → Export → `Title design (0 cr)`. Nếu hộp thoại `browser_upload` timeout 60s không có người bấm Allow → ghi chú `chờ upload goc.mp4` vào `outbox/auto_results.csv` và **chuyển task tiếp theo ngay** (không treo cả lô 100 WF).
   - Bấm nút **Publish WF (Share Template)** ở góc trên phải (đủ Tiêu đề + Mô tả + Thumbnail) lấy **Link Share Template WF** (0 cr). **KHÔNG tự Publish App**.
3. **Tự động điền đủ 2 link** ngay sau mỗi task vào `outbox/L<số>.md` và **`outbox/auto_results.csv`** (`# | Keyword / Trend | Nhân viên | 1. Link Share Template WF | 2. Link Project | Trạng thái | Ghi chú`), đồng thời cập nhật Lark sang **`🟡 Đã xong chưa duyệt`** nếu bật `LARK_WRITE=1`.
4. **Chụp màn hình + Checklist tiến độ sau mỗi WF:** Lưu `output/L<số>/canvas_done.png` và in bảng tiến độ `i/N (%)` + thời gian rồi **chuyển thẳng sang task tiếp theo**.
4. Cuối đợt, user mở `outbox/_BAO_CAO_<ngày>.md` hoặc `outbox/auto_results.csv` để **duyệt sau** (xong mới quyết định Publish App hay gõ `"Sửa L<số>: ..."`).

## 0.4 Đặt tên project theo keyword trend
`[L<số 3 chữ số>] <Keyword tiếng Việt> · <Keyword English> – <Nhân viên>`
- Keyword = **cơ chế + chủ thể** của trend, 3–6 từ, đặt SAU khi xem media gốc (tên trên Lark có thể sai/trống).
- VD: `[L062] Bắn ná rụng sản phẩm · Slingshot Product Drop – Tun Tun`, `[L077] Biến hình cửa tàu điện ngầm · Subway Door Outfit Change – Khánh Hoà`.
- `trend_id` = `L<số>` (VD `L062`) – dùng cho inbox/outbox/output.
- Nhiều dòng Lark trùng cùng 1 video (VD #44 và #77) → làm 1 project cho dòng nhỏ nhất, ghi chú dòng trùng trong outbox.

## 0.5 Ghi ngược Lark (dữ liệu THẬT – cần duyệt)
Chỉ khi nhân viên/quản lý đồng ý rõ ràng:
```
LARK_WRITE=1 node tools/lark_tasks.mjs update 62 link=https://cinai.tv/jujutsu/... trang_thai=done
```
Mặc định agent chỉ ĐỌC Lark. Link workflow (chưa publish) có thể ghi với `trang_thai=dang` nếu được duyệt; link /jujutsu sau khi Make app → `trang_thai=done`.

## 0.6 Nguồn dữ liệu Lark
1. **Lark OpenAPI** (khuyến nghị): `.env` có `LARK_APP_ID`, `LARK_APP_SECRET` của Lark custom app đã được thêm vào Base (quyền `bitable:app` đọc/ghi).
2. **CSV dự phòng**: trên Lark → view Chung → ⋯ → Export → CSV, lưu `inbox/lark_export.csv` (không ghi ngược được).
