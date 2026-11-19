# Bước 3 – Viết prompt video (Gemini Omni 1.2 Flash)

## 3.1 Khung 7 khối (+ khối video tham chiếu)
```
# <TÊN TREND IN HOA>
**THIẾT LẬP VIDEO** – thời lượng (= setting), 9:16, FPS, phong cách, địa điểm, vị trí máy.
## VIDEO THAM CHIẾU (@Video 1)        ← chỉ khi đã nối video gốc (3–5 ảnh)
## ĐỘ NHẤT QUÁN VỀ NHÂN VẬT – @Image 1 xuyên suốt; giữ mặt, tóc, da, tỉ lệ.
## MÁY QUAY & NHỊP DỰNG – cỡ cảnh, push-in/cố định, cấm lia/rung/cắt góc nếu gốc không có.
## DÒNG THỜI GIAN & HÀNH ĐỘNG – mỗi cảnh có mốc giây khớp video gốc:
### CẢNH 0 — HOOK (0–2,5s) … ### CẢNH 1 — LOOK 01 (…) mặc @Image 2 … ### CHUYỂN CẢNH 1 (…) <cơ chế che>
### CẢNH KẾT — PAYOFF (…)
## CHẤT LƯỢNG HÌNH ẢNH & ÂM THANH – photoreal; "chỉ đổi đồ khi <vật che> che kín"; âm thanh khớp @Video 1, nhạc gốc ghép ở bước dựng.
## CÁC HẠN CHẾ NGHIÊM NGẶT – không đổi danh tính, không tự chế đồ, không thêm người, không chữ/logo ngoài tiêu đề cho phép.
```

## 3.2 Khối video tham chiếu (copy nguyên, sửa phần in nghiêng)
```
## VIDEO THAM CHIẾU (@Video 1)
@Video 1 là video trend gốc. Bám sát @Video 1 về: nhịp và thời điểm chuyển cảnh, chuyển động máy, cỡ cảnh và các cú đẩy máy, ánh sáng và bố cục.
KHÔNG sao chép người mẫu, khuôn mặt hay trang phục trong @Video 1 – nhân vật lấy từ @Image 1, trang phục/sản phẩm lấy từ @Image 2–n. Không giữ chữ, logo hay watermark của @Video 1.
```
Biến thể sáng tạo dùng bản rút gọn: *"Chỉ bám @Video 1 về nhịp thời gian và chuyển động máy; bối cảnh, phong cách theo mô tả bên dưới."*

## 3.3 Quy tắc
- @Image n đúng thứ tự dây nối; @Image 1 = character sheet (mẫu A/C) hoặc ảnh sản phẩm sạch nền (mẫu D).
- Mỗi cảnh = 1 hành động + 1 tư thế; chuyển cảnh 0,5–0,7s; tổng = setting duration.
- **Prompt tổng quát cho mọi ảnh người dùng**: viết "bộ trang phục trong @Image n", không tả màu/kiểu đồ của video gốc.
- Không nhắc tên người thật, thương hiệu, tài khoản của video gốc.
- Prompt mẫu: [A-thang máy](../mau-tham-khao/prompt-A-thang-may.md) · [A-coffee](../mau-tham-khao/prompt-A-coffee-lookbook.md) · [B-pantone](../mau-tham-khao/prompt-B-pantone-spin.md) · [C-replace](../mau-tham-khao/prompt-C-replace-video.md) · [character sheet](../mau-tham-khao/prompt-character-sheet.md).
- Ví dụ hoàn chỉnh có `@Video 1`: `output/TR-20261119-01/prompt_video_final.md`.
