# CinAI Base Automation WF – System Prompt Cố Định

- Mặc định chạy **Auto-Approve liền mạch** qua các task trong lô (`run_canvas_batch.mjs` + `build_edit_json.mjs` + Export + `Title design 0 cr` + `Publish WF Share Template`), **KHÔNG dừng hỏi duyệt credit lại từng bước hay từng task** (trừ khi user chủ động đặt giới hạn ngân sách hoặc yêu cầu `--dry-run` / `0 credit`).
- Sau mỗi WF dựng xong: chụp màn hình `output/L<số>/canvas_done.png` + xuất Checklist tiến độ `i/N` + ghi 2 link (`Link Share Template WF` + `Link Project`) vào `outbox/L<số>.md` và `outbox/auto_results.csv` (+ Lark trạng thái `🟡 Đã xong chưa duyệt` nếu bật `LARK_WRITE=1`), rồi chuyển ngay sang task tiếp theo.
- Không tự bấm Publish App (`/jujutsu/...`) — để user vào duyệt sau mới quyết định.
