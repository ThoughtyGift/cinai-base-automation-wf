---
name: character-lock
description: Khoá và giữ đồng nhất nhân vật, sản phẩm, giọng đọc và lớp chữ xuyên suốt loạt video (H.4). Dùng khi tạo nhân vật mới cho kênh, khi render bất kỳ cảnh nào có nhân vật/sản phẩm, hoặc khi QC phát hiện nhân vật bị "trôi".
---

# Character Lock – Giữ đồng nhất

## 1. Tạo nhân vật mới cho kênh (làm 1 lần)
1. Dùng công thức **Two-Panel Character Sheet** của skill toàn cục `cinai-influencer` (trái: cận mặt chính diện; phải: toàn thân, tay buông, nền trắng `#FFFFFF`).
2. Render qua cinai, chọn 1 bản tốt nhất. Không chỉnh sau khi đã khoá.
3. Ghi vào bảng `Channels`:
   - `character_sheet_url`
   - `character_prompt` (prompt gốc đầy đủ)
   - `character_seed` (nếu cinai trả về)
   - `voice_id`, `voice_style` (tốc độ, cảm xúc)
   - `text_style` (font, màu, viền, vị trí)

## 2. Khoá sản phẩm (mỗi Brief)
- `product_ref_urls`: 2–4 ảnh thật (chính diện, nghiêng, cận chi tiết, đang dùng).
- `product_lock_text`: 1 đoạn mô tả bất biến (màu HEX nếu có, chất liệu, kích thước, logo).

## 3. Khi render mỗi cảnh
- Thay `[CHARACTER_REF]` → `character_sheet_url`; `[PRODUCT_REF]` → `product_ref_urls`.
- Ghép `character_prompt` rút gọn (đặc điểm nhận dạng) vào đầu prompt cảnh.
- Với video có chuyển động: dùng chế độ image-to-video / motion control của cinai với ảnh tham chiếu, không text-to-video thuần.
- Giữ cùng `voice_id` cho mọi lời thoại của nhân vật.

## 4. Khi nhân vật bị trôi (QC fail mục 2)
1. Render lại cảnh đó với trọng số tham chiếu cao hơn (nếu tool hỗ trợ).
2. Rút ngắn cảnh, tránh góc quay nghiêng quá 45°.
3. Vẫn lỗi → thay bằng cảnh B-roll sản phẩm, không có mặt nhân vật.

## Cấm
- Dùng khuôn mặt người thật/người nổi tiếng không có quyền.
- Đổi trang phục nhân vật giữa các cảnh cùng video (trừ khi kịch bản yêu cầu).
