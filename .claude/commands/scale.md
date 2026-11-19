---
description: Nhân bản một nội dung thắng – thêm biến thể, thêm kênh, thêm thị trường
argument-hint: <post_id> [hook|channel|market]
---

Đầu vào: `$ARGUMENTS`

1. Xác nhận post được analyst gắn nhãn `winner`. Nếu không → dừng, giải thích.
2. Phân tích công thức thắng (hook, góc, nhân vật, nhịp, giờ đăng).
3. Đề xuất kế hoạch nhân bản theo M.2:
   - `hook`: giữ thân video, thay 3 hook mới.
   - `channel`: đăng biến thể lên kênh khác (khác caption, khác thumbnail).
   - `market`: dịch/lồng tiếng + đổi text overlay cho thị trường mới.
4. Hỏi tôi chốt kế hoạch → tạo Briefs mới (liên kết `parent_post_id`) → chạy `/make-video` cho từng brief.

Giới hạn: tối đa 5 biến thể mỗi lượt scale để kiểm soát chi phí.
