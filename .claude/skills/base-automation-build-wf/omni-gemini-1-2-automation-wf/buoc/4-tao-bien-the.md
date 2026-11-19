# Bước 4 – Tạo 3–5 biến thể workflow

Mỗi trend (= 1 task Lark) xuất **1 canvas project chứa 3–5 biến thể** (mỗi biến thể là 1 hàng trên canvas):
- **V1 – BẢN GỐC**: giống video gốc nhất (timeline, máy quay, payoff), nối `@Video 1` đầy đủ.
- **V2…V5 – BẢN SÁNG TẠO**: giữ "điểm hút" (hook – nhịp lặp – payoff, xem bước 1.3) nhưng đổi hình thức theo **1 lăng kính chính** / biến thể.

## 4.1 Lăng kính sáng tạo (học từ hypit-ai/hypit "Transforming a reference")
> *Preserve the role, then recreate the form* – giữ vai trò của từng yếu tố, tái tạo hình thức cho hợp chủ thể/sản phẩm mới.

| Mã | Lăng kính | Giữ nguyên | Thay đổi | Khối @Video 1 (khi 3–5 ảnh) |
|---|---|---|---|---|
| **L1** | Đổi bối cảnh | Cơ chế + nhịp + máy quay | Địa điểm, ánh sáng (ga tàu → cửa kính boutique, thang máy kính…) | Rút gọn: "chỉ bám nhịp & máy" |
| **L2** | Đổi cơ chế chuyển cảnh | Nhịp lặp + số look + payoff | Vật che/động tác (cửa tàu → rèm phòng thử đồ, gương xoay, xoay 360°) | Rút gọn + nêu rõ cơ chế mới, cấm chép cơ chế cũ |
| **L3** | Đổi chủ thể → sản phẩm ecommerce | Cơ chế + nhịp | Người mẫu → túi/giày/mỹ phẩm xuất hiện mỗi lần mở (mẫu D) | Rút gọn |
| **L4** | Đổi phong cách/tông | Cấu trúc cảnh | Art direction (film 90s, Y2K, luxury đen-vàng, mùa lễ/Tết/Noel) | Rút gọn |
| **L5** | Đổi định dạng/CTA | Hook + cơ chế | Thời lượng 6–8s cho Ads, thêm khung CTA/giá cuối, tiêu đề thương hiệu | Rút gọn (cắt nhịp theo thời lượng mới) |

> Rule Gemini Omni 1.2 áp dụng cho MỌI biến thể: **3–5 ảnh → luôn nối @Video 1** (V1 dùng khối đầy đủ, V2+ dùng khối rút gọn chỉ bám nhịp/máy và ghi rõ phần được đổi). 6–7 ảnh → không nối.

Chọn lăng kính hợp ngành hàng của trend (Thời trang → L1/L2/L4; Mỹ phẩm, trang sức, F&B → L3/L5). Không ghép quá 2 lăng kính vào 1 biến thể.

## 4.2 Treatment cho mỗi biến thể (ghi vào outbox trước khi dựng)
```
### V2 – <tên ngắn>  (lăng kính L1)
- Ý tưởng 1 câu:
- Giữ: hook … | nhịp … | payoff …
- Đổi: …
- Mẫu canvas: A7 / A4 / B / C / D   • Số ảnh input: …   • @Video 1: có/không (lý do)
- Vì sao hợp người dùng không biết AI: …
```

## 4.3 Dựng – TẤT CẢ BIẾN THỂ TRÊN 1 CANVAS (1 task = 1 project)
1. Dựng V1 hoàn chỉnh trên canvas project (bước 2): input, character sheet / sản phẩm sạch nền, video gốc, Extract Audio, Edit, Render.
2. Nhãn mỗi hàng: node Text `lbl-v1`, `lbl-v2`… (xem mục 7 – dùng `tools/label_project.mjs`), không dùng stickyNote.
3. Mỗi biến thể Vn là **một hàng mới** bên dưới (cách hàng trước ≥1.700px theo Y), **dùng chung** input, node chuẩn hoá ảnh, `ref-trend-video`, Extract Audio:
   - (nếu cần) prop riêng: `create_canvas_node prop-logo-vn` (CinGen) nối từ input logo.
   - `create_canvas_node video-vn` (Gemini Omni, prompt Vn, settings như V1).
   - Nối ảnh vào `video-vn` **đúng thứ tự @Image** (connect lần lượt), rồi `ref-trend-video [video] → video-vn [video]`.
   - `create_canvas_node edit-vn` (type `edit-video-generator`, model Edit Video `ceb3e3cf63201ceae0bcebea`) ← `video-vn [output→video]` + Extract Audio `[audio→audio]`. Node này là **OUTPUT Vn** (không tạo được Render mới qua MCP).
4. Đổi tiêu đề node V1: "V1 · … – Video", "V1 · Ghép + nhạc gốc", "V1 · Rendered Video (OUTPUT)".
5. App: output mặc định = Render V1; sau `/so-sanh-video`, nếu Vn thắng → `configure_canvas_app` lại với `final_output_node_id: edit-vn`.
6. **Luôn xếp bố cục sau khi dựng xong**: `node tools/layout_project.mjs <canvas_id>` → lưới cố định: Cột 0 đầu vào (ảnh mặt/sản phẩm trên cùng, video gốc cuối cột) · Cột 1 chuẩn hoá + Âm thanh gốc · Cột 2 prop từng biến thể · Cột 3 video V1/V2/V3 (nhãn ngay trên) · Cột 4 ghép nhạc · Cột 5 render + thumbnail · node thừa dồn về bãi đỗ bên trái. Không tự đặt toạ độ tay khi tạo node (sẽ bị xếp lại).
7. **Nhãn bằng node Text (textInput), KHÔNG dùng stickyNote** – chạy TRƯỚC bước 6:
   `node tools/label_project.mjs <canvas_id> "<tên V1>" "<tên V2>" "<tên V3>"` → tạo `lbl-input` ① ĐẦU VÀO · `lbl-norm` ② CHUẨN HOÁ · `lbl-prop` ③ VẬT IN LOGO (nếu có) · `lbl-v1..n` · `lbl-out` ⑤ OUTPUT · `lbl-park` 🗑 CHỜ XOÁ.
   Bảng kiểu chữ chuẩn (Text style trên web):
   | Nhãn | Background | Font | Size |
   |---|---|---|---|
   | V1 | Yellow | Sans | Heading · 32px |
   | V2 / V3 / V4 / V5 | Blue / Purple / Orange / Red | Sans | Heading · 32px |
   | ① ĐẦU VÀO, ② CHUẨN HOÁ, ③ PROP | Green | Sans | Large · 20px |
   | ⑤ OUTPUT | Red | Sans | Large · 20px |
   | 🗑 CHỜ XOÁ | Gray | Sans | Large · 20px |
   Lựa chọn có trên cinai: Background None/Yellow/Purple/Blue/Green/Orange/Red/Gray · Font Default/Sans/Serif/Mono/Rounded/Display · Size Auto/12/14/16/20/24/32/48px.
   ⚠️ MCP **chưa lưu được Text style** (khoá nội bộ không công khai; `settings` gửi qua MCP không hiển thị) → kiểu chữ phải đặt trên web (nhân viên hoặc trình duyệt tự động: chọn node → biểu tượng bảng màu → Background/Font/Size). Đã ghi nhận: **Background giữ sau khi tải lại, Font/Size có thể bị reset về Default/Auto** (lỗi phía cinai) → nội dung nhãn viết IN HOA, ngắn, có số thứ tự/emoji để vẫn dễ đọc khi cỡ chữ Auto.
- Đổi nhịp (L5, khác số look) → biến thể đó không nối Extract Audio, ghi chú chọn nhạc khác.

Ví dụ đã dựng (1 canvas/project): `[L062] Bắn ná rụng sản phẩm · Slingshot Product Drop` `6afdfa6828e845ece800009f` (21 node) · `[L077] Biến hình cửa tàu điện ngầm · Subway Door Outfit Change` `6afdfaa0b6b76278f10000a1` (22 node).

## 4.4 Outbox
`outbox/<trend_id>.md` có 1 link project + bảng biến thể:
| Biến thể | Lăng kính | Node output trên canvas | Ảnh input | @Video 1 |
|---|---|---|---|---|
và Treatment của từng biến thể. Nhân viên Run cả 3–5 hàng trên cùng canvas, chọn bản tốt nhất → đặt làm output App → Make app.

## 4.5 hypit-ai/hypit áp dụng được gì
| Áp dụng | Không áp dụng trực tiếp |
|---|---|
| Phương pháp đọc video gốc (đọc toàn bộ → soi chi tiết → mô hình hoá "điểm hút") | Engine render SVML/Chromium, WhisperX của hypit – khác stack cinai canvas |
| Brief → Treatment → Clones (1 cấu trúc, nhiều biến thể) | Gọi model qua HypiHub (tốn phí riêng) |
| Lăng kính biến đổi: chủ thể, sản phẩm, kịch bản/CTA, nền tảng/thời lượng, phong cách | Chạy 100 biến thể tự động (cinai giới hạn 500 request/ngày, cần người duyệt chi phí) |
| Video gốc là *bằng chứng*, chỉ dùng làm input sinh khi cần giữ chuyển động (= rule @Video 1) | |
Repo: https://github.com/hypit-ai/hypit (Apache-2.0 có điều kiện) – tham khảo phương pháp, không cài vào project.
