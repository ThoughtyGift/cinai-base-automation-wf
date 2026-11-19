---
description: HỌC LẠI – báo cáo thắng/thua và hành động đề xuất
argument-hint: [7d|30d] [channel_id]
---

Khoảng thời gian / kênh: `$ARGUMENTS` (mặc định `7d`, tất cả kênh).

Giao cho subagent **analyst**:
1. Đọc Posts + Metrics, gắn nhãn winner/loser/pending theo ngưỡng trong agent.
2. Báo cáo: tổng quan → top 3 thắng (vì sao) → top 3 thua (giả thuyết) → hành động đề xuất.
3. Append bài học vào `docs/learnings.md`.
4. Kết thúc bằng danh sách quyết định cần tôi chốt (scale / kill / thử lại).
