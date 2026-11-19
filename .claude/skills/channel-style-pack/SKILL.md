---
name: channel-style-pack
description: Định nghĩa và áp dụng "bộ phong cách" của một kênh (H.8) – bản chất, giọng điệu, màu sắc, nhịp dựng, âm nhạc, cảnh dấu ấn. Dùng khi tạo kênh mới, viết brief/kịch bản/caption cho một kênh, hoặc khi cần tạo phong cách riêng từ bộ có sẵn.
---

# Channel Style Pack

Mỗi kênh có **một** style pack, lưu trong `Channels.style_pack` (JSON) và bản đọc được ở `docs/channels/<channel_id>.md`.

## Mẫu style pack
```json
{
  "channel_id": "CH-001",
  "essence": "Mẹ bỉm thông thái – mẹo gia đình tiết kiệm, ấm áp, hài nhẹ",
  "audience": "Phụ nữ 25–40, US, có con nhỏ",
  "market_language": "en-US",
  "tone": ["ấm áp", "thật thà", "hài tự giễu"],
  "taboo": ["giật tít sợ hãi", "chê đối thủ đích danh"],
  "visual": {
    "palette": ["#F5E6D3", "#E07A5F", "#3D405B"],
    "lighting": "natural window light, warm",
    "camera": "handheld POV, close-ups",
    "aspect": "9:16"
  },
  "editing": { "avg_shot_s": 1.8, "breath_shot_every": 4, "transitions": "hard cut" },
  "audio": { "music": "lofi acoustic, low volume", "voice_id": "<cinai_voice_id>" },
  "signature_moment": "Cuối video nhân vật nháy mắt với camera + tiếng 'ding'",
  "text_style": { "font": "Bold sans", "color": "#FFFFFF", "stroke": "#000000", "position": "upper-middle" },
  "golden_hours_local": ["07:00", "12:00", "20:00"],
  "max_posts_per_day": 2
}
```

## Cách áp dụng
- **Brief**: góc nội dung phải khớp `essence` + `audience`, tránh `taboo`.
- **Kịch bản**: dùng `editing`, `signature_moment` cho cảnh dấu ấn.
- **Prompt cinai**: chèn `visual.lighting`, `visual.camera`, palette.
- **Caption**: theo `tone` và `market_language`.

## Tạo phong cách riêng từ bộ có sẵn (không mất chất)
1. Giữ nguyên `essence`, `audience`, `taboo` (phần "bản chất").
2. Chỉ thay tối đa 2 trong các nhóm: `visual`, `editing`, `audio`, `signature_moment` (phần "dấu ấn").
3. Thử trên 3 video ở **kênh test**, so số liệu với bản gốc trước khi áp cho kênh thật.
