---
description: TÌM – quét trend và chấm điểm ý tưởng WIN cho một ngách/thị trường
argument-hint: <niche> [market=US]
---

Giao cho subagent **trend-scout** với đầu vào: `$ARGUMENTS`
(nếu thiếu market thì mặc định `US`).

Yêu cầu:
1. Quét tối thiểu 3 nguồn khác nhau, gom 10–30 ứng viên có bằng chứng.
2. Chấm điểm theo skill `win-scoring`, ghi vào bảng `Ideas` (status `scored`) trên Bitable của môi trường hiện tại (`PIPELINE_ENV`).
3. Trả về bảng top ứng viên và hỏi tôi chọn idea nào để duyệt (`approved`).

Không tự duyệt ý tưởng.
