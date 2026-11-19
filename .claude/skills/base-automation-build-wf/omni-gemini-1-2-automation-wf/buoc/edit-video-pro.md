# Edit Video Pro (CinAI Editly / Shotstack JSON)

Node `edit-video-generator` trên CinAI sử dụng JSON timeline chuẩn **Shotstack / Editly**.

## 1. Lỗi mặc định cần tránh khi mở Editor trên web
Khi node `edit-video-generator` có `tracks: []`, bấm **Open Editor** sẽ tự xếp mọi đầu vào nối tiếp nhau trên **1 track duy nhất**:
- Tự chèn clip `text: " "` dài 1 giây → **màn hình đen 1s đầu**.
- Xếp `audio` nối tiếp trước `video` → **5–12s đầu chỉ có tiếng, không hình**.
- Không đặt `fit: "cover"` → video `720×1280` bị co nhỏ ở góc trên trái khung `1080×1920`.

## 2. Quy chuẩn 2-Track (hoặc 3-Track) Chuyên Nghiệp
Luôn chạy script tự động dựng JSON chuẩn ngay sau khi `intro-clip`, `video-v1..v3` và `Extract Audio` đã xong:
```bash
node tools/build_edit_json.mjs <canvas_id>          # cập nhật tất cả node edit-video-generator
node tools/build_edit_json.mjs <canvas_id> --dry-run
```

Cấu trúc chuẩn 9:16 (`1080×1920`):
```json
{
  "output": { "format": "mp4", "size": { "width": 1080, "height": 1920 } },
  "timeline": {
    "background": "#000000",
    "tracks": [
      {
        "clips": [
          {
            "asset": { "type": "video", "src": "<intro_url>", "volume": 1 },
            "start": 0,
            "length": 3,
            "fit": "cover"
          },
          {
            "asset": { "type": "video", "src": "<main_video_url>", "volume": 0 },
            "start": 3,
            "length": 7.04,
            "fit": "cover"
          }
        ]
      },
      {
        "clips": [
          {
            "asset": { "type": "audio", "src": "<audio_url>", "volume": 1, "effect": "fadeOut" },
            "start": 3,
            "length": 5.95
          }
        ]
      }
    ]
  }
}
```

## 3. Kỹ thuật Edit nâng cao (Shotstack Schema)
- **Độ mượt chuyển cảnh (`transition`):** Thêm `"transition": { "in": "fade", "out": "fade" }` và cho clip sau bắt đầu sớm hơn `0.25s` nếu muốn cross-dissolve (lưu ý: cần cân đối với nhịp beat của audio gốc).
- **Âm thanh sạch (`volume` & `effect`):** Luôn đặt `"volume": 0` ở video chính nếu đã ghép nhạc gốc ở Track 1 để tránh lẫn tạp âm AI; dùng `"effect": "fadeOut"` ở track audio để kết không bị cắt gắt.
- **Safe-zone 9:16 (TikTok / Reels / Shorts):**
  - Chữ tiêu đề / Creative Intro đặt ở **25%–32% từ mép trên** (tránh 15% trên cùng và 22% dưới cùng nơi UI nền tảng che mất chữ).
  - Nếu ghép thêm Track Overlay (Track 0 trên cùng) để đặt watermark/CTA, đặt track hình ở Track 1 và track audio ở Track 2 (Shotstack render từ trên xuống dưới).
- **Đồng bộ trình duyệt trước khi bấm Export:** Sau khi chạy `tools/build_edit_json.mjs`, **Reload (F5)** tab CinAI trước khi mở **Open Editor** → kiểm tra **View JSON** & preview phủ kín 9:16 (`Canvas width: 100%`, `50%/50%`, `Fit: Cover`) rồi mới bấm **Export**.

## 4. Hệ sinh thái Skill & Repo tham khảo để mở rộng
- **`shotstack/json-examples` & `@shotstack/shotstack-studio`** (GitHub): Thư viện mẫu JSON timeline + Studio SDK đúng chuẩn schema của CinAI `edit-video-generator` (hỗ trợ multi-track, transition, luma matte, HTML/title overlay, audio ducking).
- **`ffmpeg-dev/skills`** (GitHub): Skill FFmpeg/FFprobe cho agent xử lý cắt ghép chính xác theo frame, đo loudness (`loudnorm`), trích xuất contact sheet & so sánh side-by-side (`tools/compare_output.mjs`).
- **`@json-render/remotion`** (GitHub): Khi cần render motion graphics / kinetic typography / lower-third phức tạp bằng React/Remotion từ JSON schema trước khi đưa vào timeline.
- **Plugin Marketplace `invideo`** (`antigravity-plugins-partners/plugin/invideo`): Nếu muốn nối agent trực tiếp vào trình dựng timeline AI bên ngoài CinAI.
