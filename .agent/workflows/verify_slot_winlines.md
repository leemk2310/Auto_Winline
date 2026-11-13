---
description: Tự động chạy kiểm thử Winline và xuất video MP4 cho Game Slot từ URL và danh sách Winline được cung cấp
---

# Workflow: Verify Slot Winlines & Auto Record MP4

Workflow này hướng dẫn Agent tự động tiếp nhận URL game và danh sách Winline từ prompt của người dùng, thực thi bộ kiểm thử tự động, quay video MP4 và xuất báo cáo mà người dùng không cần mở terminal PowerShell.

## Cú Pháp Prompt Của Người Dùng (User Prompt)

Người dùng chỉ cần gửi prompt theo định dạng ngắn gọn sau:

```text
Chạy kiểm tra winline cho game sau:
URL: <URL_GAME>
Winlines:
Line 01: [10, 11, 12, 10, 11, 2, 2, 2, 2, 2, 12, 10, 11, 12, 10]
Line 02: [3, 3, 3, 3, 3, 10, 11, 12, 10, 11, 12, 10, 11, 12, 10]
...
```

---

## Các Bước Agent Thực Hiện Tự Động:

1. **Phân tích Prompt & Lưu Dữ Liệu:**
   - Trích xuất URL game từ prompt.
   - Trích xuất danh sách ma trận Winline từ prompt.
   - Lưu danh sách Winline vào file: `d:\antigravity-testing-kit-main\winline_automation\test-data\active_winlines.txt`.

2. **Kích Hoạt Runner:**
   - Chạy lệnh nền thông qua `run_command`:
     ```powershell
     Set-Location -Path "d:\antigravity-testing-kit-main\winline_automation"
     node bin/runner.js -u "<URL>" -d "test-data/active_winlines.txt" --delay 10
     ```

3. **Ghi Hình & Xử Lý Evidence:**
   - Playwright mở trình duyệt giao diện thật (viewport `1440x900`).
   - Tự động nạp ma trận vào Cheat Menu, quay cuộn và dừng 10s cho mỗi line.
   - Tự động ghi và chuyển đổi video sang định dạng **MP4 (H.264)** lưu vào:
     `winline_automation/evidence/<game_id>/videos/TC_LINE_XX.mp4`
   - Chụp ảnh màn hình lưu vào:
     `winline_automation/evidence/<game_id>/screenshots/TC_LINE_XX.png`

4. **Báo Cáo Kết Quả Cho Người Dùng:**
   - Xuất bảng tổng hợp kết quả (PASS / FAIL) cho từng Winline.
   - Đính kèm đường dẫn trực tiếp (clickable file link) đến các video MP4 và ảnh chụp màn hình tương ứng.

