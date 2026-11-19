# Bước 5 – Đóng gói App cho người KHÔNG biết AI

Người dùng cuối chỉ: **upload ảnh → bấm chạy → tải video**.

1. **Input chỉ là ảnh** (`imageInput`), tối đa 7, càng ít càng tốt. KHÔNG expose prompt, setting, model, video gốc.
2. **Tiêu đề input bằng lời thường + yêu cầu ảnh**: "Ảnh khuôn mặt của bạn (chụp thẳng, rõ mặt, đủ sáng)", "Bộ đồ số 1 (ảnh quần áo hoặc ảnh người mặc)", "Ảnh sản phẩm (chụp rõ, ít vật thừa)". Không ghi "@Image".
3. **Chuẩn hoá ảnh bằng node trung gian**: người → character sheet (GPT image 2.5); quần áo/sản phẩm → ảnh sạch nền (CinGen 1.0 pro image / Nano banana).
4. **Tài nguyên cố định đóng gói sẵn**: video gốc, audio gốc, nền, logo mẫu – không expose. Node thừa ("Intro frame", slot KHÔNG DÙNG) xoá trên web trước khi publish.
5. **Output duy nhất** = video cuối (render/ghép) 9:16 có nhạc.
6. **Mô tả App 3 bước**: "1) Tải lên … 2) Tải lên … 3) Bấm Tạo – nhận video Xs …".
7. `configure_canvas_app {canvas_id, app_name, app_description, exposed_input_node_ids:[chỉ imageInput], final_output_node_id: render | video}`.
7b. **Tạo Title Design Thumbnail (`0` credit – đã kiểm chứng thực tế trên web L062, dùng cho Publish WF & đăng Reels/TikTok):**
   - Chọn node video kết quả thắng trên canvas (VD: `render-...`) → bấm **`Creative Intro New`** trên thanh công cụ nổi phía trên node.
   - Trong hộp thoại **`Start your intro from this moment`**: kéo **`Frame position`** sang frame sạch chưa có chữ lớn ở đoạn video chính (hoặc chọn `Upload an image instead`) → nhập **`Film title`** (ngắn gọn, đúng chính tả) → bấm **`Start designing`**.
   - Trên tab **`T Title design`**: kiểm tra nút ghi **`Design title ⚡ 0 / image · Free on your plan`** → chọn Style (`Smart match` hoặc `Minimal premium`) → bấm **`Design title`** (mất ~40s, **`0` credit / Unlimited**).
   - Xong sẽ có 3 nút: **`Download`** (tải về đăng Reels/TikTok/Shorts), **`Show on canvas`** (sinh 2 node `imageInput-...` + `dynamicModel-... Title design` nối sẵn trên canvas để làm ảnh bìa khi bấm **Publish WF**).
   - ⚠️ **Lưu ý:** Không bấm sang tab `Text animation` (`Animate title ⚡ 160 / clip`) nếu đã tạo `intro-clip` bằng MCP.
8. **Publish WF (Share Template góc trên phải, 0 credit) vs Publish App (User tự duyệt mới quyết định):**
   - **Trong chế độ Auto (chưa cần user duyệt từng bước):** KHÔNG tự bấm *Make App → Publish App*. Thay vào đó, bấm nút **Publish WF / Share Template** ở **góc trên phải màn hình WorkflowEditor**, điền đầy đủ 3 mục:
     - **Tiêu đề (`Title`)**: ngắn gọn, dễ hiểu bằng lời thường (1 task / 1 keyword = 1 project).
     - **Mô tả (`Description`)**: đúng công thức 3 bước (`1) Tải lên ... 2) Tải lên ... 3) Bấm Tạo ...`).
     - **Thumbnail (`Ảnh bìa`)**: chọn ảnh **Title Design** vừa tạo ở bước 7b (tỉ lệ 9:16), không để trống.
   - Lưu **2 link** bắt buộc vào `outbox/auto_results.csv` và `outbox/L<số>.md`:
     1. **`link_template_wf`**: Link Share Template WF (từ nút Publish WF góc trên phải).
     2. **`link_project`**: Link Project (`https://cinai.tv/WorkflowEditor?id=...`).
   - Nếu bật ghi Lark (`LARK_WRITE=1`): gọi `node tools/lark_tasks.mjs update <số> link=<link_template_wf> trang_thai=cho_duyet` để đặt trạng thái **`🟡 Đã xong chưa duyệt`**.
   - **Sau khi User tự vào duyệt lại:** Nếu đạt, User tự bấm **Make App → Publish App** (ra link `https://cinai.tv/jujutsu/<slug>`) nếu muốn đóng gói thành App, rồi đổi trạng thái Lark sang **`✅ Đã duyệt`**.
9. **3 trạng thái chuẩn trên Lark Base:**
   - `⏳ Chưa làm` (`chua_lam`) → task mới chờ xử lý.
   - `🟡 Đã xong chưa duyệt` (`cho_duyet`) → Agent đã dựng WF + Publish xong + điền link, chờ user kiểm tra.
   - `✅ Đã duyệt` (`da_duyet`) / `✅ Đã hoàn thành` (`done`) → User đã duyệt đạt.

Lưu 2 link: `link_workflow` (WorkflowEditor – để sửa) và `link_app_jujutsu` (để dùng/đăng).
