---
description: PHỦ – xếp lịch đăng cho video đã duyệt lên các kênh
argument-hint: <job_id> [channel_ids, cách nhau bởi dấu phẩy]
---

Đầu vào: `$ARGUMENTS`

1. Kiểm tra: `Jobs.qc_status = qc_pass` và đã được tôi duyệt. Thiếu điều kiện nào → dừng và báo.
2. Nếu `PIPELINE_ENV=test`: chỉ chấp nhận kênh có `is_test=true`. Kênh live → từ chối.
3. Giao cho subagent **publisher**: caption theo nền tảng, áp `anti-spam-posting`, chọn giờ vàng, tạo `Posts` và xếp lịch qua n8n.
4. Trả về lịch đăng (giờ địa phương + giờ Việt Nam).
