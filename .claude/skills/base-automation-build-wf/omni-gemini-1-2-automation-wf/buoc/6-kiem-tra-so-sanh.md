# Bước 6 – Kiểm tra, so sánh, bàn giao

## 6.0 Chạy batch & dựng JSON Editly chuẩn 2-track (khi đã được duyệt credit)
```bash
node tools/run_canvas_batch.mjs <canvas_id> <node_id...> --fix-camera   # tự điền camera_movement=fixed, tối đa 4 luồng
node tools/build_edit_json.mjs <canvas_id>                               # dựng JSON 2-track 1080x1920 (fit: cover, audio start=3s, fadeOut)
```
→ Sau khi `build_edit_json.mjs` chạy xong, **Reload (F5)** tab CinAI trước khi mở Editor và bấm **Export** (xem chi tiết tại [edit-video-pro.md](edit-video-pro.md)).

## 6.1 So sánh output với video gốc (sau khi nhân viên Run trên web)
```
node tools/compare_output.mjs <trend_id> <canvas_id>          # tự lấy output render/video mới qua MCP (bỏ qua stale)
node tools/compare_output.mjs <trend_id> --file <output.mp4>
```
→ `output/<trend_id>/compare/side_by_side.jpg` (trên = gốc, dưới = output, mỗi ô 0,5s). Mở ảnh, chấm:
- [ ] Hook mở đầu giống? • [ ] Số look & thứ tự đúng? • [ ] Cơ chế chuyển cảnh đúng?
- [ ] Máy quay/nhịp giống? • [ ] Danh tính giữ được? • [ ] Trang phục khớp ảnh input?
- [ ] Payoff/tiêu đề cuối? • [ ] Lỗi AI (tay, mặt, vải, chữ)? • [ ] Nhạc gốc khớp chuyển cảnh?
Lỗi → sửa prompt (bước 3) → nhân viên Run lại. V1 phải đạt "giống gốc"; V2+ chấm theo Treatment.

## 6.2 Checklist bàn giao (outbox/<trend_id>.md)
- [ ] 3–5 canvas (V1 giống gốc + biến thể sáng tạo), mỗi canvas đủ node/edge, không lỗi model.
- [ ] Node `ref-trend-video` + Extract Audio → Edit; duration = gốc làm tròn lên.
- [ ] Gemini Omni: 3–5 ảnh có @Video 1; 6–7 ảnh không; @Image khớp `incoming_edges`.
- [ ] App chỉ expose ảnh, tiêu đề lời thường, mô tả 3 bước, output = video cuối.
- [ ] `stale_outputs.json` đã ghi; Thumbnail node đã thêm.
- [ ] Outbox: bảng biến thể + link, Treatment, ảnh cần upload theo thứ tự, việc nhân viên làm trên web, ước tính credit, mục "Cần bổ sung".
