---
name: anti-spam-posting
description: Quy tắc đăng bài an toàn để tài khoản/Page sống lâu, không bị coi là spam (I.2, C.5, M.6). Dùng khi xếp lịch đăng, đăng nhiều kênh cùng một nội dung, phủ nhiều Page, hoặc cấu hình workflow n8n đăng bài.
---

# Anti-Spam Posting

## Giới hạn mặc định mỗi kênh
| Nền tảng | Bài/ngày (kênh mới < 30 ngày) | Bài/ngày (kênh ổn định) | Giãn cách tối thiểu |
|---|---|---|---|
| TikTok | 1–2 | 2–4 | 3 giờ |
| FB Page / Reels | 1–2 | 2–3 | 4 giờ |
| Instagram Reels | 1 | 1–2 | 6 giờ |
| YouTube Shorts | 1 | 1–3 | 4 giờ |

Ưu tiên `style_pack.max_posts_per_day` nếu nhỏ hơn.

## Đăng một nội dung lên nhiều kênh
- **Không** đăng file giống hệt bit-by-bit: đổi hook 2s đầu, text overlay, nhạc nền hoặc crop/tốc độ nhẹ.
- Caption viết lại hoàn toàn, hashtag khác nhau.
- Lệch giờ ≥ 2 giờ giữa các kênh cùng thương hiệu.

## Phủ nhiều Page (M.6)
- Mỗi Page có vai trò riêng (chính, ngách, thị trường, review) và style pack riêng.
- Không dùng chung 1 nhân vật cho mọi Page trừ Page thương hiệu chính.
- Tăng tần suất dần: tuần 1 = 50% giới hạn, tuần 2 = 75%, tuần 3 = 100%.

## Hành vi tài khoản (C.5)
- Mỗi account/Page: 1 proxy đúng nước, 1 profile trình duyệt riêng, không đổi IP liên tục.
- Không đăng ngay sau khi tạo/đăng nhập mới; "nuôi" 3–7 ngày.
- Gặp checkpoint → dừng toàn bộ lịch của account đó, báo người xử lý, không retry tự động.

## Kiểm tra trước khi xếp lịch
- [ ] Không vượt giới hạn ngày & giãn cách.
- [ ] Nội dung đã biến đổi so với bản trên kênh khác.
- [ ] Kênh đúng môi trường (`is_test` khớp `PIPELINE_ENV`).
