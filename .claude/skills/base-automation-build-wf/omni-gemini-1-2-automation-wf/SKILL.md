---
name: omni-gemini-1-2-automation-wf
description: "Omni Gemini 1.2 Automation WF" – tự động đọc task chưa hoàn thành trên Lark "Quản lý Timeline Trend APP ECOMER", mở link mẫu (video HOẶC ảnh), rồi dựng 1 project canvas cinai.tv cho mỗi task (V1 giống gốc + 2–4 biến thể sáng tạo trên cùng canvas), đóng gói App cho người không biết AI chỉ cần upload ảnh. Dùng khi nhân viên gõ /lam-task-lark, /tao-wf-trend, /so-sanh-video, hoặc yêu cầu "làm toàn bộ task chưa hoàn thành", "làm task 60 đến 70", đọc/phân tích video hay ảnh trend, viết prompt Gemini Omni 1.2 Flash, dựng/clone canvas qua cinai MCP, ghép audio gốc, so sánh output.
---

# Omni Gemini 1.2 Automation WF

Đọc đúng file của bước đang làm.

| Bước | File | Việc chính | Công cụ |
|---|---|---|---|
| 0 | [buoc/0-lay-task-lark.md](buoc/0-lay-task-lark.md) | Đọc task Lark theo bộ chọn (tất cả / 60-70 / nhân viên…), chạy lần lượt, đặt tên project theo keyword | `tools/lark_tasks.mjs` |
| 1 | [buoc/1-doc-video-goc.md](buoc/1-doc-video-goc.md) | Nhận diện media (video/ảnh), đọc video thật, 6 yếu tố, điểm hút | `tools/trend_media.mjs`, `tools/trend_video.mjs` |
| 2 | [buoc/2-chon-mau-dung-wf.md](buoc/2-chon-mau-dung-wf.md) | Video: chọn mẫu A7/A4/B/C/D, clone, video + audio gốc, rule Gemini | cinai MCP |
| 2b | [buoc/2b-wf-anh.md](buoc/2b-wf-anh.md) | Trend là ẢNH / carousel → workflow ảnh | cinai MCP |
| 3 | [buoc/3-viet-prompt-video.md](buoc/3-viet-prompt-video.md) | Prompt 7 khối + `@Video 1` | – |
| 4 | [buoc/4-tao-bien-the.md](buoc/4-tao-bien-the.md) | V1 giống gốc + V2..V5 sáng tạo **trên cùng 1 canvas** | cinai MCP |
| 5 | [buoc/5-dong-goi-app.md](buoc/5-dong-goi-app.md) | App cho người không biết AI: chỉ upload ảnh | `configure_canvas_app` |
| 5b | [buoc/edit-video-pro.md](buoc/edit-video-pro.md) | Dựng timeline 2-track Shotstack 9:16 chuẩn pro, safe-zone, audio fade | `tools/build_edit_json.mjs` |
| 5c | [buoc/cinai-mcp-map.md](buoc/cinai-mcp-map.md) | Bản đồ 32 tool CinAI MCP, `open_canvas` đồng bộ web, `estimate_cost` & 5 việc web-only | `docs/cinai-tools.json` |
| 6 | [buoc/6-kiem-tra-so-sanh.md](buoc/6-kiem-tra-so-sanh.md) | So output với gốc, checklist, báo cáo, ghi ngược Lark (khi được duyệt) | `tools/compare_output.mjs`, `tools/run_canvas_batch.mjs` |

Tham khảo: [mau-tham-khao/](mau-tham-khao/) – `template-registry.json` + prompt gốc từ workflow đã hoàn thành.

## Luồng tổng (tự động – hỗ trợ chạy lô 100 WF/ngày)
```
"làm task 60–70" / "chạy auto 100 task" → B0 lark_tasks list/inbox → lặp từng task L<số> (KHÔNG dừng hỏi từng bước):
   trend_media → video: B1→B2→B3→B4→B5 | ảnh: B2b→B4→B5 | cần tải tay: ghi log, sang task sau
   → 1 task / 1 keyword = 1 project "[L<số>] <keyword VN> · <keyword EN> – <nhân viên>" chứa V1–V3 + intro-clip (MCP 3s, fix_edit_intro.mjs) + lbl-* & layout (label_project.mjs, layout_project.mjs) + Edit 9:16 (build_edit_json.mjs)
   → Title Design Thumbnail (0 cr) → Browser subagent gom 4 nhóm màu & chỉnh cỡ chữ lbl-* → bấm nút Publish WF góc trên phải (Share Template, đủ Tiêu đề + Mô tả + Thumbnail)
   → KHÔNG tự Publish App (để User duyệt xong mới quyết định Make App → Publish App hay không)
   → Tự điền 2 link (1. Link Share Template WF, 2. Link Project) vào outbox/L<số>.md + outbox/auto_results.csv (+ Lark trạng thái "🟡 Đã xong chưa duyệt" nếu bật LARK_WRITE=1)
   → Chụp màn hình canvas đã dựng (`output/L<số>/canvas_done.png`) + in màn hình Checklist (số task đang làm + tiến độ `i/N` + thời gian) → làm tiếp task sau!
→ Cuối đợt: outbox/_BAO_CAO_<ngày>.md → User duyệt sau; cần sửa chỉ gõ: "Sửa L<số>: <yêu cầu>"
```

## 13 RULE KHÔNG ĐƯỢC QUÊN
1. **1 task Lark / 1 keyword = 1 project = 1 canvas**; V1/V2/V3 nằm chung canvas, dùng chung input, video gốc, audio gốc. Tên: `[L<số>] <keyword VN> · <keyword EN> – <nhân viên>`. Luôn chạy `tools/label_project.mjs` + `tools/layout_project.mjs` (tạo đủ `lbl-*` ghi chú và xếp đúng hàng biến thể, không dùng `organize_canvas_layout`).
2. **Số task = số thứ tự (#) dòng trong view Chung**. Làm lần lượt; lỗi 1 task thì ghi lại vào `outbox/auto_results.csv` và làm tiếp task sau (không dừng cả đợt).
3. **Luôn mở media gốc thật** (video hoặc ảnh) trước khi viết prompt; không vượt đăng nhập/captcha – không tải được thì báo "cần tải tay" và sang task kế tiếp.
4. **Auto-Approve chạy liền mạch (System Prompt cố định – không hỏi lại duyệt credit):**
   - Mặc định **được phép chạy liền mạch** (`run_canvas_batch.mjs` + Export Edit + `Title design` + `Publish WF Share Template`) qua từng task trong lô mà **KHÔNG dừng hỏi duyệt lại từng task hay từng node**, trừ khi user chủ động đặt trần ngân sách cụ thể trong prompt (hoặc chỉ yêu cầu chạy `0` credit / `--dry-run`).
   - Vẫn **KHÔNG tự bấm Publish App** (`/jujutsu/...` – để User vào duyệt sau mới quyết định) và **KHÔNG tự xoá canvas/node đang chạy ổn định**.
5. **Lark là dữ liệu thật**: mặc định ghi kết quả tự động ra `outbox/auto_results.csv` & `outbox/L<số>.md`; ghi ngược trực tiếp lên Lark (`LARK_WRITE=1`) khi user bật duyệt cho đợt đó.
6. **Video gốc lên canvas + Extract Audio → Edit** để ghép nhạc gốc; duration = gốc làm tròn lên.
7. **Chọn model theo thời lượng video gốc** (`buoc/2-chon-mau-dung-wf.md` mục 2.4b): **1–15s** → `Gemini Omni 1.2 Flash` (`6aee81f743f8ddf4b6000558`, ≤7 ảnh + ≤1 video; 3–5 ảnh bắt buộc nối `@Video 1`); **15–20s** → `Kling Video 4.0 Flash` (`6aec52f46a6a4ba04c000d0e`); **20–30s** → `Kling Video 4.0` (`6ae19390b4048380670006cf`) hoặc `Seedance 2.5 Flash` (`6af9143e395c1837d7000a73`, dùng `ratio`); option **Minimax H3** tra `list_models` khi CinAI hỗ trợ.
8. **@Image n = thứ tự dây nối**; ảnh thừa phải `disconnect_canvas_nodes`.
9. **App chỉ expose ảnh**, tiêu đề lời thường, mô tả 3 bước; output mặc định = V1, đổi sang biến thể thắng sau khi so sánh.
10. **Edit/Render luôn 1080×1920** + **Creative Intro bằng node `intro-clip`** (`tools/fix_edit_intro.mjs`, safe-zone chữ 25%–32% từ mép trên) – không có tool MCP cho nút Creative Intro.
11. **MCP không tạo được node `dynamicModel`** (Extract Audio/Render) → mẫu video luôn clone canvas có sẵn; giới hạn 60 lần gọi/phút, tối đa 4 job chạy song song (`tools/run_canvas_batch.mjs --fix-camera`).
12. **Đồng bộ MCP ↔ Web (chống ghi đè state cũ):** `GPT image 2.5 (img2img)`, `Extract Audio`, `Title design`, Export `edit-video-generator`, tô màu Group & Publish WF chỉ làm được trên web. Sau mỗi lần sửa qua MCP, gọi `open_canvas {canvas_id}` và **Reload (F5)** tab trình duyệt trước khi bấm Run/Save/Export trên web.
13. **Timeline Editly Pro 2-Track:** Sau khi `intro-clip`, `video-v1..v3` và `Extract Audio` xong, luôn chạy `tools/build_edit_json.mjs <canvas_id>` (Track 0: `intro` 0–3s + `video` từ 3s `fit: "cover"`, `volume: 0`; Track 1: `audio` `start: 3`, `effect: "fadeOut"`; xoá clip `text` rỗng) trước khi Export trên web.
