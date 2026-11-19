---
name: win-scoring
description: Chấm điểm sản phẩm/ý tưởng/video theo tín hiệu WIN thật (B.4, E.4) trên thang 100. Dùng khi trend-scout chọn ứng viên, khi duyệt Ideas, hoặc khi analyst so sánh nội dung thắng.
---

# WIN Scoring – Phân biệt "đang bán thật" với "trông có vẻ hay"

## Thang điểm (tổng 100)
| Tiêu chí | Tối đa | Cách chấm |
|---|---|---|
| **Đà tăng** (view/ngày, tốc độ tăng 72h) | 20 | Tăng nhanh & đều = 20; một đợt rồi tắt = 5 |
| **Tiền thật đang đổ** (quảng cáo chạy ≥7 ngày, nhiều biến thể, nhiều advertiser) | 20 | ≥3 advertiser, ≥14 ngày = 20 |
| **Nỗi đau rõ** (comment hỏi mua, kể vấn đề) | 15 | Có ≥5 comment nguyên văn hỏi mua/than vấn đề |
| **Wow có thể quay** (demo trực quan trong 3s) | 15 | Trước/sau rõ, hiệu ứng nhìn thấy được |
| **Biên lợi nhuận** (giá bán ≥ 3× giá vốn + ship) | 10 | Tính theo B.5; thiếu dữ liệu = 3 |
| **Độ bão hoà** (ít đối thủ hơn = cao hơn) | 10 | Đã tràn ngập mọi kênh = 2 |
| **Hợp kênh/thị trường** | 10 | Khớp `style_pack.audience` |

## Điểm trừ
- Rủi ro bản quyền/thương hiệu: **-30** (thường loại luôn).
- Vi phạm chính sách nền tảng (y tế, tài chính, người lớn…): **loại**.
- Số liệu "chưa xác minh": -5 mỗi tiêu chí.

## Phân loại
- **≥75** – WIN mạnh, đề xuất duyệt ngay.
- **60–74** – Đáng thử, làm 1 video test.
- **<60** – Bỏ qua.

## Output mỗi ứng viên
```json
{ "idea_id": "ID-001", "score": 78, "breakdown": { "momentum": 18, "spend": 16, "pain": 12, "wow": 13, "margin": 7, "saturation": 6, "fit": 9 },
  "penalties": [], "evidence": ["https://..."], "verdict": "WIN mạnh" }
```
