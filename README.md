# Socalmedia

Pipeline tự động sản xuất nội dung social media theo quy trình ADVIRA (TÌM → DỰNG → SẢN XUẤT → PHỦ → HỌC LẠI), chạy trên Claude Code + cinai.tv MCP + Lark Bitable + n8n.

## Cấu trúc
```
CLAUDE.md                  # bộ nhớ dự án (Claude đọc mỗi phiên)
.mcp.json                  # cinai, lark, n8n, firecrawl
.env.example               # biến môi trường (copy thành .env)
.claude/
  settings.json            # permissions + hooks
  agents/                  # trend-scout, brand-strategist, video-producer, qc-reviewer, publisher, analyst
  commands/                # /trend /brief /make-video /schedule /report /scale
  skills/                  # viral-script, character-lock, channel-style-pack, win-scoring, anti-spam-posting
  hooks/                   # guard-prod.js (chặn đụng production), log-jobs.js
docs/
  data-model.md            # schema Bitable
  schemas/                 # JSON schema brief, script
  learnings.md             # bài học tích luỹ
```

## Bắt đầu
1. `copy .env.example .env` và điền key (mặc định `PIPELINE_ENV=test`).
2. Điền `CINAI_MCP_URL` thật vào `.env`.
3. Tạo base Bitable `Content Hub [TEST]` theo `docs/data-model.md`; thêm 1 kênh test (`is_test=true`).
4. Bổ sung ID account/Page/Bitable live vào `.claude/hooks/protected-resources.json`.
5. Mở Claude Code tại thư mục này → `/mcp` kiểm tra kết nối → chạy thử `/trend <niche> US`.

## Quy tắc vàng
Mọi thử nghiệm chạy trên worker + account test riêng. Chỉ chuyển `PIPELINE_ENV=production` khi test đạt 100% và đã được xác nhận.
