# Bước 2b – Trend là ẢNH (1 ảnh hoặc carousel) → workflow ảnh

Khi `tools/trend_media.mjs` trả `loai_media: anh`: media gốc ở `output/<trend_id>/anh_goc_*.jpg`, xem `contact_anh.jpg`.

## 2b.1 Đọc ảnh gốc
Rút: **bố cục** (góc máy, cỡ cảnh, vị trí chủ thể), **ý tưởng/điểm hút** (siêu thực, phóng to, ghép đồ hoạ, chữ lớn…), **ánh sáng & màu**, **chủ thể** (người / sản phẩm), **số ảnh** trong carousel và mạch kể giữa các ảnh.

## 2b.2 Dựng canvas (compose_canvas_workflow – chỉ dùng loại node được phép, không cần dynamicModel)
```
[ref-trend-image-1..n] imageInput  (ảnh gốc – upload_file → url, KHÔNG expose)
[in-subject]  imageInput "Ảnh khuôn mặt của bạn…" hoặc "Ảnh sản phẩm của bạn…"
[in-extra]    imageInput tuỳ chọn (logo / bộ đồ) – chỉ khi trend cần
        │
        ├─→ V1 · image-generator "Giống ảnh gốc"      (@Image 1 = ảnh gốc, @Image 2 = chủ thể…)
        ├─→ V2 · image-generator "Sáng tạo – lăng kính …"
        └─→ V3 · image-generator "Sáng tạo – lăng kính …"
  (carousel n ảnh → mỗi biến thể có n node, đặt cùng hàng)
  [tuỳ chọn] V1-anim · video-generator (Gemini Omni, 5–6s) biến ảnh V1 thành clip chuyển động nhẹ
```
- Model ảnh: **Nano banana 2.1** (`6accb50113fc762ec7000d15`, chạy trên web theo gói, nhiều ảnh tham chiếu) cho V1; **CinGen 1.0 pro image** (`6accb03d9190eb157b000ca3`, chạy được qua MCP 6 credit) làm dự phòng. Settings: `{aspect_ratio: <như ảnh gốc, thường 4:5 hoặc 9:16>, resolution: "1K"}`.
- Ảnh gốc lên canvas: `upload_file {filename, mime_type, data_base64}` → url → `create_canvas_node {type:"imageInput", url}`.
- Bố cục: cột input x=100, cột V1/V2/V3 x=750 / hàng cách 800px; nhãn `stickyNote` cho từng biến thể.

## 2b.3 Prompt ảnh (5 khối)
```
# <TÊN TREND>
THAM CHIẾU: @Image 1 là ảnh trend gốc – bám bố cục, góc máy, cỡ cảnh, ánh sáng, bảng màu, ý tưởng thị giác. KHÔNG chép người, sản phẩm, logo, chữ trong @Image 1.
CHỦ THỂ: người/sản phẩm lấy từ @Image 2 – giữ nguyên khuôn mặt / hình dạng, nhãn, chữ, màu của sản phẩm.
CẢNH: mô tả cụ thể cảnh mới (V1 = như gốc; V2/V3 = theo lăng kính).
HẠN CHẾ: không thêm chữ/logo khác, không biến dạng sản phẩm, không thêm người.
```

## 2b.4 App
- Expose: chỉ `in-subject` (+ `in-extra` nếu có). Output: node V1 (ảnh). Mô tả 3 bước như bước 5.
- Carousel: output là ảnh đầu tiên của V1; ghi chú trong outbox các ảnh còn lại.
