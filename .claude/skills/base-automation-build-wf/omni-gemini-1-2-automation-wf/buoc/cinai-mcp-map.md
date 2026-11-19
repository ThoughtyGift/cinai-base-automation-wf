# Bản đồ 32 Tool CinAI MCP & Ranh giới Web-Only

> Đã rà soát toàn bộ 32 tool trong `docs/cinai-tools.json`.

## 1. Nhóm Tool dùng trực tiếp trong quy trình WF
| Nhóm | Tool MCP | Vai trò trong quy trình |
|---|---|---|
| **Kiểm tra & Báo giá** | `whoami`, `list_models`, `get_model`, `estimate_cost` | Kiểm tra số dư credit; dùng `estimate_cost` báo giá chính xác từng node trước khi xin duyệt |
| **Tạo & Dựng Canvas** | `list_canvases`, `create_canvas` (`clone_from_id`), `compose_canvas_workflow` | Clone mẫu sẵn có (A7/A4/B/C/D) để giữ node `dynamicModel` (Extract Audio) |
| **Chỉnh Node & Dây** | `get_canvas_state`, `get_canvas_node_details`, `create_canvas_node`, `update_canvas_node`, `connect_canvas_nodes`, `disconnect_canvas_nodes`, `delete_canvas_nodes`, `organize_canvas_layout` | Cập nhật prompt, `settings` (`camera_movement: "fixed"`, `edit_json`), nối/ngắt `@Image n` & `@Video 1` |
| **Đồng bộ Tab Web** | `open_canvas` | **Quan trọng:** Gọi `open_canvas {canvas_id}` sau khi sửa qua MCP để **gửi tín hiệu làm mới tab trình duyệt đang mở**, tránh web ghi đè state cũ |
| **Upload & Chạy Job** | `upload_file` *(chỉ ảnh ≤10MB)*, `run_canvas_node`, `generate`, `get_job` | Upload ảnh test bằng `upload_file`; chạy node bằng `run_canvas_batch.mjs` (tối đa 4 job song song) |
| **Đóng gói App** | `configure_canvas_app` | Cấu hình `exposed_input_node_ids` (chỉ `imageInput`) và `final_output_node_id` |

## 2. Nhóm Tool bổ trợ khác (không dùng trong luồng chính nhưng có sẵn)
- **CinAI /Agent (`5`):** `start_task`, `get_task`, `list_tasks`, `answer_question`, `cancel_task` — giao brief cho Agent tích hợp của `cinai.tv` nếu cần.
- **Skill có sẵn (`2`):** `list_skills`, `get_skill`.
- **3D World (`4`):** `list_3d_worlds`, `create_3d_world`, `open_3d_world`, `update_3d_scene`.

## 3. 5 Thao tác KHÔNG có trong MCP (bắt buộc làm trên Web / Browser Subagent)
1. **Upload video `.mp4` gốc** vào node `ref-trend-video` (`upload_file` chỉ nhận ảnh).
2. **Chạy node web-only (`0` credit / Unlimited):** `GPT image 2.5 (img2img)`, `Extract Audio (dynamicModel)`, và `Creative Intro → Title design (0 / image)`.
3. **Bấm Export/Render node `edit-video-generator`** (Editly Render — MCP chỉ sửa được `edit_json`, không trigger render được).
4. **Tô màu Group & chỉnh font/cỡ chữ node Text (`lbl-*`).**
5. **Bấm nút `Publish WF` (Share Template ở góc trên phải)** hoặc **`Make App → Publish App`** (`/jujutsu/...`).
