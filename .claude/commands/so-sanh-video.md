---
description: So sánh video output của từng biến thể (V1, V2, V3…) trên canvas project với video trend gốc (sau khi đã Run trên web)
argument-hint: <trend_id>   (VD L062)
---

Đầu vào: `$ARGUMENTS`

1. Đọc `inbox/<trend_id>.md` → `canvas_id`. Lấy node output từng biến thể trên canvas: V1 = node Render (tiêu đề chứa "V1 · Rendered Video"), Vn = `edit-vn`.
2. Mỗi biến thể: `node tools/compare_output.mjs <trend_id> <canvas_id> <node_output>` → mở `output/<trend_id>/compare/<node_output>/side_by_side.jpg`, chấm theo checklist bước 6.1 skill `omni-gemini-1-2-automation-wf`. Node chưa có output mới → ghi "chưa Run".
3. Báo bảng: `biến thể | giống gốc (V1) / đạt Treatment (V2+) | lỗi chính | đề xuất sửa prompt | nên chọn làm output App?`.
4. Nếu người dùng đồng ý chọn biến thể thắng → `configure_canvas_app` với `final_output_node_id` = node output của biến thể đó. Không tự sửa khi chưa được đồng ý; không chạy node.
