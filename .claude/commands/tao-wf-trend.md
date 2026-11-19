---
description: Tạo 3–5 workflow cinai (1 bản giống gốc + bản sáng tạo) từ form trend trong inbox/
argument-hint: <trend_id | all> [so_bien_the=3] [ghi chú lăng kính]
---

Đầu vào: `$ARGUMENTS`

- `all` → xử lý mọi `inbox/TR-*.md` chưa có `trang_thai: da_dung_canvas`.
- `<trend_id>` → xử lý `inbox/<trend_id>.md`. Số thứ 2 (3–5) là số biến thể; phần chữ còn lại là yêu cầu thêm (VD "thêm bản Tết", "bản sản phẩm túi xách").

Giao cho subagent **omni-wf-builder** (skill `omni-gemini-1-2-automation-wf`). Không chạy node tốn credit.

Kết thúc: in bảng `biến thể | lăng kính | mẫu | số ảnh | @Video 1 | link workflow` và nhắc nhân viên: kéo `output/<trend_id>/goc.mp4` vào node VIDEO GỐC THAM CHIẾU trên từng canvas → upload ảnh test → Run → `/so-sanh-video <trend_id>`.
