---
description: DỰNG – tạo Content Brief từ một ý tưởng đã duyệt cho một kênh
argument-hint: <idea_id> <channel_id>
---

Đầu vào: `$ARGUMENTS`

1. Xác nhận `Ideas.status = approved`. Nếu chưa → dừng, báo tôi duyệt trước.
2. Giao cho subagent **brand-strategist** tạo Brief (3 góc × 2 hook) theo `docs/schemas/brief.schema.json`.
3. Ghi `Briefs` status `ready`, trả về `brief_id` + tóm tắt 3 góc và đề xuất góc nên làm trước.
