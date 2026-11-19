# Socalmedia — Automation sản xuất nội dung Social Media

Hệ thống tự động hoá quy trình **ADVIRA 5 chặng**: TÌM → DỰNG → SẢN XUẤT → PHỦ → HỌC LẠI.
Sản xuất media qua **cinai.tv MCP**, dữ liệu trung tâm trên **Lark Bitable (Content Hub)**, điều phối bằng **n8n** + worker Agent SDK, duyệt qua **Telegram**.

## 1. Nguyên tắc vận hành
- Con người chỉ quyết định ở **3 cổng**: (1) duyệt ý tưởng/sản phẩm, (2) duyệt video, (3) tăng/tắt (scale/kill).
- Máy làm phần tay chân. Không tự vượt qua cổng duyệt.
- Mọi asset/bài đăng phải truy vết được: `idea_id → brief_id → job_id → post_id`.

## 2. 🚨 Cô lập thực nghiệm & bảo vệ production (NON-NEGOTIABLE)
- KHÔNG sửa file/dịch vụ dùng chung đang chạy thật (`/opt/flow-agent/*`, `/opt/flow-chrome-launch.sh`, `/opt/openclaw-router/router.mjs`, Nginx chung…).
- KHÔNG gắn cờ thử nghiệm vào account/Page trong pool live.
- Mọi thử nghiệm chạy với `PIPELINE_ENV=test`: worker riêng, port riêng, profile riêng, **account/Page test riêng**, Bitable test riêng.
- Chỉ ghép vào luồng chính khi test đạt 100% **và user xác nhận**.
- Hook `.claude/hooks/guard-prod.js` chặn tự động; danh sách tài nguyên bảo vệ ở `.claude/hooks/protected-resources.json`.

## 3. Bản đồ chặng → thành phần
| Chặng | Agent | Command | Skill |
|---|---|---|---|
| TÌM | `trend-scout` | `/trend` | `win-scoring` |
| DỰNG | `brand-strategist` | `/brief` | `channel-style-pack`, `viral-script` |
| SẢN XUẤT | `video-producer`, `qc-reviewer` | `/make-video` | `viral-script`, `character-lock` |
| PHỦ | `publisher` | `/schedule` | `anti-spam-posting` |
| HỌC LẠI | `analyst` | `/report`, `/scale` | `win-scoring` |
| **TREND → cinai WF (3–5 biến thể)** | `omni-wf-builder` | `/lam-task-lark`, `/tao-wf-trend`, `/so-sanh-video` | `base-automation-build-wf/omni-gemini-1-2-automation-wf` |

**Luồng tự động từ Lark** (hướng dẫn: `HUONG_DAN_NHAN_VIEN.md`): `/lam-task-lark <tat-ca | 62 | 60-70 | nv:"Tên" | loai:Ecomer>` → agent đọc task CHƯA HOÀN THÀNH trong Lark → mỗi task: mở link mẫu → 1 canvas `[L<số>] <keyword VN> · <keyword EN> – <nhân viên>` chứa V1–V3 + `intro-clip` + `lbl-*` + `build_edit_json.mjs` → **Auto-Approve chạy liền mạch (không hỏi duyệt lại từng task/node, trừ khi user đặt trần ngân sách)** → `Title design (0 cr)` → `Publish WF (Share Template)` lấy 2 link (`Link Template WF` + `Link Project`, chưa Publish App) → ghi `outbox/L<số>.md` + `outbox/auto_results.csv` (+ Lark `🟡 Đã xong chưa duyệt` nếu bật `LARK_WRITE=1`) → chụp ảnh `canvas_done.png` + Checklist tiến độ → chuyển tiếp task sau.
Luồng form tay: điền `inbox/TR-*.md` (mẫu `inbox/_TEMPLATE.md`) → `/tao-wf-trend <id>`.
CLI dự phòng cho cinai MCP: `node tools/cinai.mjs <tool> @args.json` (khi chạy auto đặt `ALLOW_SPEND=1` theo rule System Prompt đã duyệt sẵn).

### Rule cố định khi dựng workflow cinai từ video trend
- **1 task Lark = 1 project = 1 canvas** chứa V1–V3 (dùng chung input, video gốc, audio gốc); tên `[L<số>] <keyword VN> · <keyword EN> – <nhân viên>`; số task = số thứ tự dòng (#) trong view Chung; làm lần lượt, lỗi task nào ghi lại rồi làm tiếp.
- **Lark là dữ liệu thật**: chỉ đọc; ghi ngược (`LARK_WRITE=1 node tools/lark_tasks.mjs update …`) chỉ khi được duyệt.
- Link mẫu có thể là **video hoặc ảnh** → `node tools/trend_media.mjs <id> <link>`; ảnh → workflow ảnh (skill bước 2b); không tải được → báo "cần tải tay", không vượt đăng nhập.
- Luôn đọc video gốc thật: `node tools/trend_video.mjs <trend_id> <url>` (yt-dlp + ffmpeg) trước khi viết prompt.
- Luôn đặt video gốc lên canvas (`ref-trend-video`) và **trích audio gốc (Extract Audio) để ghép** ở bước Edit/Render; thời lượng video khớp video gốc.
- **Gemini Omni 1.2 Flash**: tối đa 1 video + 7 ảnh. Task ít input (**3–5 ảnh**) → **bắt buộc nối video gốc làm tham chiếu** (handle `video`) + khối prompt `@Video 1` (bám nhịp/máy quay, không chép người/đồ/chữ). 6–7 ảnh → không nối video.
- Sau khi chạy trên web: `node tools/compare_output.mjs <trend_id> <canvas_id>` để so output với video gốc trước khi publish App.

## 4. Data model (Lark Bitable – Content Hub)
Chi tiết: [docs/data-model.md](docs/data-model.md). Các bảng: `Ideas`, `Channels`, `Briefs`, `Jobs`, `Posts`, `Metrics`.
Chỉ chuyển trạng thái theo state machine đã định nghĩa, không nhảy cóc.

## 5. MCP servers (`.mcp.json`)
- `cinai` – sản xuất ảnh/video/nhân vật (tool: `mcp__cinai__*`)
- `lark` – Bitable, IM (tool: `mcp__lark__*`)
- `n8n` – build/validate workflow (tool: `mcp__n8n__*`)
- `firecrawl` – quét web/trend (tool: `mcp__firecrawl__*`)
Secrets lấy từ biến môi trường (xem `.env.example`). KHÔNG bao giờ ghi key vào file commit.

## 6. Quy ước
- **Mã hoá file: luôn UTF-8.** Trên Windows PowerShell 5 KHÔNG dùng `Get-Content -Raw`/`Set-Content` không kèm encoding (mặc định Windows-1252 → hỏng tiếng Việt). Dùng `[IO.File]::ReadAllText(p,[Text.Encoding]::UTF8)` / `[IO.File]::WriteAllText(p,t,[Text.UTF8Encoding]::new($false))`, hoặc công cụ Edit/Write của agent.
- Ngôn ngữ trao đổi: tiếng Việt. Nội dung đăng: theo ngôn ngữ thị trường của kênh.
- Output trung gian (script, shot list, caption) lưu dạng JSON có schema trong `docs/schemas/`.
- Log job cinai tự ghi vào `logs/cinai-jobs.jsonl` (hook `log-jobs.js`).
- Trước khi báo "xong": kiểm tra trạng thái Bitable đã cập nhật + có preview gửi Telegram.

## 7. Lệnh nhanh
- `/trend <niche> [market]` – quét & chấm điểm ý tưởng
- `/brief <idea_id> <channel_id>` – tạo Content Brief
- `/make-video <brief_id>` – sản xuất video qua cinai
- `/schedule <job_id> [channels]` – xếp lịch đăng (sau khi duyệt)
- `/report [7d|30d]` – báo cáo thắng/thua
- `/scale <post_id>` – nhân bản nội dung thắng
