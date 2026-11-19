---
description: SẢN XUẤT – sản xuất video từ Brief qua cinai.tv, QC, gửi preview duyệt
argument-hint: <brief_id> [variants=1]
---

Đầu vào: `$ARGUMENTS`

1. Xác nhận `Briefs.status = ready` và đang ở `PIPELINE_ENV` đúng (mặc định `test`).
2. Giao cho subagent **video-producer**:
   - Viết kịch bản theo skill `viral-script`, khoá nhân vật theo `character-lock`.
   - Render **1 biến thể thử trước**; chỉ render thêm khi biến thể đầu qua QC.
3. Sau mỗi job `done` → subagent **qc-reviewer** kiểm định.
4. Job `qc_pass` → gửi preview vào chat Telegram duyệt (qua n8n workflow `approval-telegram` hoặc `mcp__lark__im_v1_message_create` nếu dùng Lark) kèm nút: Duyệt / Làm lại / Huỷ.
5. Báo lại bảng: `job_id | biến thể | QC | link preview | lỗi (nếu có)`.
