---
name: viral-script
description: Viết hoặc duyệt kịch bản video ngắn bán hàng/nội dung 15–60s theo cấu trúc hook ≤2s, vấn đề, bước ngoặt, cảnh dấu ấn, CTA. Dùng khi viết kịch bản, shot list, prompt từng cảnh cho cinai, hoặc khi QC kịch bản.
---

# Viral Script – Kịch bản video ngắn có hồn

Dựa trên giáo trình ADVIRA (B.6 "vì sao người ta dừng lại xem" và H.7 "kịch bản có hồn").

## Cấu trúc chuẩn (video 20–30s)
| Nhịp | Thời gian | Mục đích | Ghi chú |
|---|---|---|---|
| 1. HOOK | 0–2s | Dừng ngón tay lướt | Hình ảnh bất thường / câu hỏi chạm nỗi đau / kết quả trước |
| 2. VẤN ĐỀ | 2–6s | "Đây là tôi" | Dùng nguyên văn nỗi đau khách từ Idea |
| 3. BƯỚC NGOẶT | 6–10s | Đổi trạng thái cảm xúc | Sản phẩm/giải pháp xuất hiện bất ngờ |
| 4. CHỨNG MINH | 10–20s | Tin được | Demo thật, cận cảnh, trước/sau |
| 5. CẢNH DẤU ẤN | 1 cảnh | Thứ người xem nhớ & share | Khoảnh khắc lạ/đẹp/hài riêng của kênh |
| 6. CTA | 2–4s cuối | Hành động | Một CTA duy nhất, rõ |

**Nhịp thở**: không cắt cảnh liên tục; cứ 3–4 cảnh nhanh thì có 1 cảnh giữ lâu hơn (1.5–2.5s).

## Output bắt buộc (JSON theo `docs/schemas/script.schema.json`)
```json
{
  "brief_id": "BR-001",
  "duration_s": 24,
  "aspect": "9:16",
  "language": "en-US",
  "scenes": [
    {
      "idx": 1, "beat": "hook", "duration_s": 2,
      "visual_prompt": "Close-up, [CHARACTER_REF] gasps at cracked phone screen, handheld, natural light",
      "camera": "push-in fast",
      "voiceover": "Stop dropping your phone like this.",
      "text_overlay": "POV: 3rd broken screen this year",
      "refs": ["character_sheet", "product_lock"]
    }
  ],
  "cta": "Link in bio – 40% off today"
}
```

## Quy tắc prompt cho cinai
- Luôn có token tham chiếu `[CHARACTER_REF]`, `[PRODUCT_REF]` → producer thay bằng ảnh đã khoá (skill `character-lock`).
- Mô tả: chủ thể → hành động → bối cảnh → ánh sáng → máy quay. 1 hành động chính / cảnh.
- Text overlay ≤ 7 từ, không đặt ở 15% dưới cùng (vùng UI nền tảng).

## Checklist tự duyệt
- [ ] Hook hiểu được khi tắt tiếng?
- [ ] Sản phẩm xuất hiện trước giây 10?
- [ ] Có đúng 1 cảnh dấu ấn?
- [ ] Chỉ 1 CTA?
- [ ] Không claim sai sự thật?

Thư viện hook mẫu: [references/hook-library.md](references/hook-library.md)
