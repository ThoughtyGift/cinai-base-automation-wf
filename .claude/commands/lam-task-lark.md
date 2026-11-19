---
description: Tự động làm các task CHƯA HOÀN THÀNH trên Lark (tất cả / theo số dòng / theo nhân viên / theo phân loại) – mỗi task ra 1 project canvas cinai có V1–V3
argument-hint: <tat-ca | 62 | 60-70 | 62,77 | nv:"Tên" | loai:Ecomer | top:5> [so_bien_the=3] [ghi chú]
---

Yêu cầu của nhân viên: `$ARGUMENTS`

Làm theo skill `omni-gemini-1-2-automation-wf`, **bắt đầu từ `buoc/0-lay-task-lark.md`**:

1. Dịch yêu cầu thành bộ chọn (bảng 0.1). Ví dụ: "toàn bộ" → `tat-ca`; "60 đến 70" → `60-70`; "task của Tun Tun" → `nv:"Tun Tun"`.
2. `node tools/lark_tasks.mjs list <bộ chọn>` → in danh sách task sẽ làm (số dòng, tên trend, nhân viên, link) và task bị loại kèm lý do.
3. `node tools/lark_tasks.mjs inbox <bộ chọn>` → tạo `inbox/L<số>.md`.
4. Lần lượt từng task: giao subagent **omni-wf-builder** với `trend_id = L<số>` (media video hoặc ảnh, 1 canvas/project, V1 + biến thể, App). Lỗi → ghi lại, làm task tiếp theo.
5. Cuối đợt: tạo `outbox/_BAO_CAO_<YYYYMMDD-HHmm>.md` và in bảng: `# | trend | nhân viên | media | mẫu | project | trạng thái | việc nhân viên cần làm`.
6. KHÔNG ghi ngược Lark, KHÔNG chạy node, KHÔNG publish – chỉ đề xuất; ghi Lark chỉ khi người dùng duyệt (`LARK_WRITE=1 node tools/lark_tasks.mjs update <số> link=… trang_thai=…`).
