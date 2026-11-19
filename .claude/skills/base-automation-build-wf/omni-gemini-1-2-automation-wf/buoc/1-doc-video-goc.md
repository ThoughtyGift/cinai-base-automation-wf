# Bước 1 – Đọc media gốc (video hoặc ảnh)

## 1.0 Nhận diện loại media (luôn chạy trước)
```
node tools/trend_media.mjs <trend_id> <link>
```
→ `output/<trend_id>/media.json`: `loai_media` = **video** (đi tiếp 1.1) | **anh** (sang [2b-wf-anh.md](2b-wf-anh.md)) | **can_tai_tay** (link cần đăng nhập/không công khai – VD Xiaohongshu, một số TikTok: ghi outbox "CẦN TẢI TAY" kèm hướng dẫn, KHÔNG vượt đăng nhập). Nhân viên đã tự lưu `goc.mp4` / `anh_goc_*.jpg` vào `output/<trend_id>/` → công cụ dùng file đó.

## 1.1 Tải và trích khung hình video
```
node tools/trend_video.mjs <trend_id> <link_video_goc>
```
Kết quả trong `output/<trend_id>/`:
- `goc.mp4`, `goc.info.json` – video + metadata (tác giả, caption, like, ngày đăng)
- `analysis.json` – thời lượng, kích thước, fps
- `frames_goc/contact_2fps.jpg` – lưới khung hình, **ô thứ k (đếm từ 0, trái→phải, trên→dưới) = giây k×0,5**
- `frames_goc/f_XXX.jpg` – từng khung 0,5s để soi chi tiết

**Mở xem `contact_2fps.jpg`** và lập timeline thật (mốc giây). Form của nhân viên chỉ là gợi ý; mâu thuẫn → theo video và ghi chú lại.

## 1.2 Rút 6 yếu tố
1. **Chủ thể**: người mẫu / sản phẩm / cả hai.
2. **Cơ chế chuyển cảnh (TRICK)**: cửa đóng-mở, xoay 360°, vật che (quạt, áo, tay), nhảy/trượt, whoosh, match-cut, biến hình theo beat…
3. **Số biến thể N** (số outfit / sản phẩm) → số ảnh input.
4. **Máy quay**: cố định / đẩy vào (push-in) / đi theo; cỡ cảnh.
5. **Bối cảnh & ánh sáng & tông màu**.
6. **Âm thanh**: nhạc, SFX (ding, whoosh), lời thoại.

## 1.3 Xác định "điểm hút" (học từ hypit – *preserve the role*)
Trả lời 3 câu, ghi vào outbox:
- **Vì sao người xem dừng lại?** (hook 0–2s: tàu vào ga, cửa sắp mở…)
- **Cái gì lặp lại tạo nhịp "satisfying"?** (mỗi lần cửa mở là một look mới)
- **Payoff cuối là gì?** (bước ra khỏi toa + chữ NEW COLLECTION)

Các biến thể ở bước 4 phải **giữ vai trò** của 3 thứ này dù thay hình thức.

## 1.4 Ví dụ đã làm – TR-20261119-01 (IG @neuro_lab_dieva, 12,5s)
| Mốc | Nội dung thật |
|---|---|
| 0–2,5s | Sân ga vắng, tàu bạc sọc đỏ trượt vào, dừng |
| 2,5–4,5s | Cửa mở – look 1, máy push-in |
| 4,5–5s | Cửa đóng |
| 5–6s / 6,5–8s | Look 2 / Look 3 (mỗi lần cửa đóng là đổi đồ) |
| 8,5–10s | Look 4 bước ra khỏi toa |
| 10–12,5s | Tàu rời ga + chữ "NEW COLLECTION" |
→ 4 look, máy push-in mỗi lần cửa mở, tông đỏ, payoff = bước ra + tiêu đề.
