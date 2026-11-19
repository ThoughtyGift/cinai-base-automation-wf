# Bước 2 – Chọn mẫu & dựng workflow (cinai MCP, miễn phí)

## 2.1 Chọn mẫu
| Điều kiện | Mẫu | Canvas gốc |
|---|---|---|
| 1 nhân vật, máy gần cố định, đổi **4–6 outfit** qua 1 vật che/cơ chế lặp | **A7** | Thời trang thang máy / Outfit Tết |
| 1 nhân vật, **2–3 outfit**, bối cảnh đời sống | **A4** | Thời trang coffe |
| Mỗi look cần ảnh keyframe riêng có nền/hiệu ứng, xoay 360° | **B** | Biến hình pantone |
| Giữ y nguyên chuyển động video gốc, chỉ thay đồ/người/sản phẩm | **C** | Korean fashion style |
| Chủ thể là **sản phẩm** (F&B, mỹ phẩm, trang sức, nội thất) | **D** – dựng mới (2.6) | – |

ID canvas/node/slot: [../mau-tham-khao/template-registry.json](../mau-tham-khao/template-registry.json).

## 2.2 Clone & sửa
1. `create_canvas {title: "[TREND] <tên> – <V1|V2…> – <nhân viên>", description: <link gốc + mẫu + biến thể>, clone_from_id: <source_canvas>}`
2. `get_canvas_state` → đủ node/edge như registry.
3. `update_canvas_node` node video: `prompt`, `title`, `settings` (aspect, duration, resolution).
4. Đổi tiêu đề imageInput bằng lời thường (bước 5). Slot thừa → `disconnect_canvas_nodes` khỏi node video + đặt tiêu đề "(KHÔNG DÙNG – có thể xoá)".
5. Ghi output cũ vào `output/<trend_id>/stale_outputs.json` (canvas clone mang theo ảnh/video của mẫu; MCP không xoá được `output_url`).

## 2.3 Video gốc + audio gốc (bắt buộc)
1. `create_canvas_node {type:"videoInput", node_id:"ref-trend-video", title:"VIDEO GỐC THAM CHIẾU – không expose ra App", x:-700, y:200}`.
   MCP không upload được video → nhân viên kéo `output/<trend_id>/goc.mp4` vào node trên web (hoặc trình duyệt tự động: stage file vào `browser_sandbox/uploads/`, `setInputFiles` vào node `ref-trend-video`, người dùng bấm **Allow** quyền upload). Upload xong → đọc `output_url` của node (`get_canvas_node_details`) và lưu vào frontmatter `link_file_video_goc_tren_cinai` để dùng lại.
2. `ref-trend-video [video] → Extract Audio [input]` → `Extract Audio [audio] → edit-video-generator [audio]` ⇒ ghép nhạc gốc lên video AI.
3. Thời lượng video = thời lượng gốc làm tròn lên (12,5s → `13s`), timeline prompt khớp mốc giây ở bước 1.

## 2.4 RULE Gemini Omni 1.2 Flash (`6aee81f743f8ddf4b6000558`)
- Nhận text + **tối đa 7 ảnh + tối đa 1 video**; 3–15s (từng giây); 9:16/16:9; 720p/360p; ~160 credit/lần qua MCP.
- **3–5 ảnh → BẮT BUỘC nối `ref-trend-video [video] → video-generator [video]`** + khối prompt `@Video 1` (bước 3).
- **6–7 ảnh → KHÔNG nối video**, mô tả nhịp/máy quay kỹ bằng chữ.
- Kiểm tra thứ tự @Image: `get_canvas_node_details` → `incoming_edges` (ảnh theo thứ tự, video tính riêng là @Video 1).
- **Quy tắc node chuẩn hoá `GPT image 2.5` (0 cr, web-only):** Luôn **giữ node `GPT image 2.5` nối sẵn cho App người dùng cuối** (khi họ upload ảnh chụp điện thoại lộn xộn). Còn khi **chạy test nội bộ bằng ảnh đã sạch nền sẵn** (như ảnh CinGen), có thể nối thẳng từ `imageInput` để `run_canvas_batch.mjs` chạy tức thì mà không bị kẹt chờ bấm trên web.

## 2.4b Bảng chọn Model Video thông minh theo thời lượng (đã kiểm chứng `list_models` / `get_model`)
Agent tự chọn model phù hợp với thời lượng video trend gốc (làm tròn lên):

| Thời lượng video gốc | Model ưu tiên | `model_id` | Lưu ý `settings` bắt buộc | Đầu vào hỗ trợ |
|---|---|---|---|---|
| **1s – 15s** | **Gemini Omni 1.2 Flash** | `6aee81f743f8ddf4b6000558` | `duration: "3s".."15s"` *(chuỗi có `s`)*, `aspect_ratio: "9:16"`, `resolution: "720p"`, `camera_movement: "fixed"` | `image` (≤7), `video` (≤1) |
| **15s – 20s** | **Kling Video 4.0 Flash** | `6aec52f46a6a4ba04c000d0e` | `duration: 3..20` *(số nguyên)*, `aspect_ratio: "9:16"`, `resolution: "720p"` | `image`, `video`, `tag` |
| **20s – 30s** | **Kling Video 4.0** | `6ae19390b4048380670006cf` | `duration: 3..30` *(số nguyên)*, `aspect_ratio: "9:16"`, `resolution: "720p"/"1080p"` | `image`, `video`, `audio`, `tag` |
| **20s – 30s** *(thay thế)* | **Seedance 2.5 Flash** | `6af9143e395c1837d7000a73` | `duration: 4..30` *(số nguyên)*, **`ratio: "9:16"`** *(không dùng `aspect_ratio`)*, `resolution: "720p"` | `image`, `video`, `audio`, `tag` |
| **Option bổ sung** | **Minimax H3** *(khi user chọn hoặc thay thế)* | *(tra `list_models query:"Minimax"`)* | Hiện tại `cinai.tv` chưa mở `Minimax H3` trong 29 model video; khi nào CinAI thêm mới, Agent tự tra `get_model` để áp dụng | Kiểm tra `get_model` trước khi chạy |

> **Mẹo báo giá:** Luôn gọi `estimate_cost {model_id, settings}` (hoặc `tools/run_canvas_batch.mjs --dry-run`) sau khi gán model để biết chính xác credit theo từng thời lượng.

## 2.5 Thumbnail + CREATIVE INTRO BẮT BUỘC BẰNG MCP (`intro-clip`)
1. **Thumbnail**: `create_canvas_node {type:"image-generator", node_id:"thumbnail", model_id:"6accb03d9190eb157b000ca3" (CinGen 1.0 pro image), settings:{aspect_ratio:"9:16"}}` ← character sheet/sản phẩm sạch nền + bộ đồ 1/prop. Prompt: khoảnh khắc đẹp nhất của trend, chừa **25%–32% phía trên** cho tiêu đề, không chữ.
2. **Creative Intro bằng MCP (bắt buộc cho mọi project):** chạy `node tools/fix_edit_intro.mjs <canvas_id> "<TIÊU ĐỀ>" [3s]` → tự tạo node **`intro-clip`** (Gemini Omni 1.2 Flash, 3s, 9:16, `camera_movement: "fixed"`, safe-zone chữ 25%–32% từ mép trên) từ Thumbnail và nối vào **mọi node Ghép** ở vị trí dây video đầu tiên.
   - Tiêu đề = keyword ngắn tiếng Anh in hoa của trend (VD `"NEW COLLECTION"`, `"SURPRISE DROP"`).
   - `intro-clip` chỉ có 1 ảnh, KHÔNG phải tái hiện trend → **ngoại lệ** của rule "3–5 ảnh phải nối @Video 1".
   - **Chi phí thực tế:** **`80` credit/lần** (rẻ hơn một nửa so với `Text animation` `160` credit trên web) – chạy 1 lần dùng chung cho cả V1–V3.
3. Node "Intro frame" cũ (ảnh do Creative Intro trên web tạo, kế thừa khi clone) → dồn về CHỜ XOÁ.

## 2.5b Edit Video / Render phải xuất 9:16 (2-Track Pro)
- Node `edit-video-generator` tạo mới qua MCP **không có `edit_json`** → Edit Video mặc định **16:9**. Nếu mở Editor khi `tracks: []`, web sẽ tự xếp `text` rỗng + `audio` + `intro` + `video` nối tiếp trên 1 track.
- **Quy trình chuẩn:**
  1. Khi dựng canvas: `tools/fix_edit_intro.mjs` đặt sẵn khung `1080×1920` (`tracks: []`).
  2. Sau khi `intro-clip`, `video-v1..v3` và `Extract Audio` chạy xong: **BẮT BUỘC chạy `node tools/build_edit_json.mjs <canvas_id>`** để dựng JSON 2-track chuẩn (`Track 0`: `intro` 0–3s + `video` từ 3s `fit: "cover"`, `volume: 0`; `Track 1`: `audio` `start: 3`, `effect: "fadeOut"`).
  3. **Reload (F5)** tab web CinAI → mở **Open Editor** kiểm tra preview phủ kín 9:16 rồi bấm **Export**.

## 2.6 Mẫu D – sản phẩm
⚠️ MCP **không tạo được node `dynamicModel`** (Extract Audio, Editly Render) bằng `compose_canvas_workflow`/`create_canvas_node` → KHÔNG dựng mẫu D từ canvas trắng. **Clone "Fork: Thời trang coffe" (`6afddc8153b739002b0002bd`)** rồi biến đổi:
```
imageInput(1) "Ảnh sản phẩm"  → GPT image 2.5 "Sản phẩm sạch nền" ─┐
imageInput(2) "Logo"          → [mới] CinGen "Prop in logo" ───────┼→ video (Gemini Omni, @Image 1 = sản phẩm, @Image 2 = prop)
[mới] ref-trend-video ──video──────────────────────────────────────┘ (@Video 1)  + → Extract Audio → Edit → Render
2 imageInput còn lại → disconnect + "(KHÔNG DÙNG)"     [mới] Thumbnail ← sản phẩm sạch + prop
```
Ví dụ đã dựng: TR-20261119-02 "Bắn cây dừa, rụng sản phẩm" (V1 `6afdf8bf56fe3557ce000091`).
Nếu `compose_canvas_workflow` lỗi giữa chừng sẽ để lại **canvas rỗng** – MCP không xoá canvas, ghi vào outbox để nhân viên xoá trên web.

## 2.8 Giới hạn tốc độ
cinai MCP: **60 lần gọi/phút/key** (lỗi "Rate limit… Retry in N s"). `tools/cinai.mjs` tự chờ và thử lại; khi dùng tool `mcp__cinai__*` trực tiếp thì gom thao tác, tránh vòng lặp gọi dồn. Mỗi canvas biến thể tốn ~15–20 lần gọi.

## 2.7 Handle đã kiểm chứng
| Nối | source → target |
|---|---|
| imageInput → generator | `image` → `image` (GPT image 2.5: `image_urls`) |
| generator → generator/video | `output` → `image` |
| videoInput → Gemini Omni | `video` → `video` |
| videoInput → Kling edit | `video` → `reference_video` |
| videoInput → Extract Audio | `video` → `input` |
| Extract Audio → Edit | `audio` → `audio` |
| video → Edit / Edit → Render | `output` → `video` |

CẤM: `run_canvas_node`, `generate`, `start_task`, `delete_canvas_nodes` khi chưa có người duyệt; sửa canvas gốc trong registry.
