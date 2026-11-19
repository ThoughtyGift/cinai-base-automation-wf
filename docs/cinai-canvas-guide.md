# Dựng Canvas Workflow trên cinai.tv bằng MCP

## Quy trình 6 bước
| # | Tool | Tốn credit | Việc |
|---|---|---|---|
| 1 | `list_models` / `get_model` | Không | Chọn `model_id` + `settings` cho từng node |
| 2 | `create_canvas` (hoặc `clone_from_id`) | Không | Tạo canvas trống / nhân bản canvas mẫu của kênh |
| 3 | `compose_canvas_workflow {nodes, edges}` | Không | Dựng toàn bộ đồ thị 1 lần (tối đa 120 node, 250 edge) |
| 4 | `organize_canvas_layout` / `update_canvas_node` | Không | Sắp xếp, sửa prompt theo brief |
| 5 | `estimate_cost` → **duyệt** → `run_canvas_node` → `get_job` | **Có** | Chạy từng node theo thứ tự cột |
| 6 | `configure_canvas_app` | Không | Biến canvas thành App (user tự bấm "Make app" trên web) |

## Định dạng node
```json
{ "id": "clip-01", "type": "video-generator", "title": "...", "model_id": "<id>",
  "prompt": "...", "settings": {"aspect_ratio": "9:16", "duration": 10}, "x": 660, "y": 120 }
```
Type hợp lệ: `imageInput, videoInput, audioInput, textPrompt, stickyNote, image-generator, video-generator, audio-generator, text-generator, edit-video-generator, voice-clone, threeDComposition, threed-generator, storyboardGrid, storyboardCharacter, styleNode, runwayGroup`.
`url` chỉ dùng cho node `*Input` (link https công khai, lấy từ `upload_file`).

**Bố cục:** card 9:16 cao ~533px (+ thanh tiêu đề) → đặt các node cùng cột cách nhau **≥ 700px theo Y**, các cột cách nhau **≥ 600px theo X**. `organize_canvas_layout` (dag) chỉ giãn ~420px → bị chồng lấn với node 9:16, nên tự đặt `x`, `y`.

## Định dạng edge (handle thực tế đọc từ canvas có sẵn)
| Từ | Tới | source_handle | target_handle |
|---|---|---|---|
| image-generator / imageInput | video-generator, image-generator | `output` | `image` |
| video-generator | edit-video-generator | `output` | `video` |

## ⚠️ Giới hạn model qua MCP (đã kiểm chứng bằng `estimate_cost`)
| Model | ID | Giá | Qua MCP/API |
|---|---|---|---|
| Nano Banana Pro (ảnh) | `6a30e3ff28a4c37398000066` | 16 cr | ❌ Chỉ chạy trên web (Unlimited trong gói) |
| CinGen Video 1.1 (video 5–30s) | `6ad5a0269e62038d33000123` | 20 cr | ❌ Chỉ chạy trên web (Unlimited trong gói) |
| Edit Video (ghép) | `ceb3e3cf63201ceae0bcebea` | 10 cr | ✅ Chạy được, tốn credit |

→ **Chiến lược lai (khuyến nghị):** MCP dựng/sửa canvas (miễn phí) → người dùng mở web bấm **Run** các node Unlimited (miễn phí theo gói) → MCP đọc kết quả (`get_canvas_node_details`) để đưa sang QC/đăng bài.
→ Muốn chạy 100% tự động qua MCP: chọn model có `available: true` trong `estimate_cost` (tốn credit).

## Canvas mẫu của project
- `[SOCALMEDIA TEST] Template Video SP 9:16 - 20s` – id `6afdc28fb2cb222b1d000101`
- https://cinai.tv/WorkflowEditor?id=6afdc28fb2cb222b1d000101
- Cột 1: `ref-character`, `ref-product` → Cột 2: `clip-01`, `clip-02` → Cột 3: `final-20s`
- Tái dùng cho video mới: `create_canvas {clone_from_id: "6afdc28fb2cb222b1d000101"}` rồi `update_canvas_node` thay `[PRODUCT]`, `[PAIN POINT]`.
