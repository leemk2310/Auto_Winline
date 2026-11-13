# 🎰 UNIVERSAL SLOT WINLINE AUTOMATION TOOLKIT

Gói công cụ tự động hóa kiểm thử và quay video **MP4** cho các đường cược (Winlines/Paylines) của mọi Game Slot trên nền tảng Cocos Web Engine.

---

## 🎯 CÁCH 1: CHẠY BẰNG PROMPT TRỰC TIẾP TRONG CHAT (KHÔNG CẦN POWERSHELL)

Chỉ cần copy mẫu Prompt ngắn gọn bên dưới và gửi trực tiếp trong ô chat:

```text
Chạy kiểm tra winline cho game sau:
URL: <DÁN_LINK_GAME_TẠI_ĐÂY>
Winlines:
Line 01: [10, 11, 12, 10, 11, 2, 2, 2, 2, 2, 12, 10, 11, 12, 10]
Line 02: [3, 3, 3, 3, 3, 10, 11, 12, 10, 11, 12, 10, 11, 12, 10]
...
```

Hoặc dùng lệnh slash command:
```text
/verify_slot_winlines
URL: <LINK_GAME>
Winlines:
...
```

---

## 💻 CÁCH 2: CHẠY BẰNG POWERSHELL (OFFLINE RUNNER)

```powershell
cd d:\antigravity-testing-kit-main\winline_automation
.\run-winline.ps1 -Url "<URL_GAME_MỚI>" -Data "<ĐƯỜNG_DẪN_FILE_WINLINE>"
```

---

## 🌟 Tính Năng Chính

- **Tái sử dụng 100%:** Chạy được với bất kỳ mã game slot nào mà không cần sửa code hay build lại.
- **Tự động nhận diện dữ liệu Winline:** Nhận cả file `.json` và file text thô `.txt` copy-paste trực tiếp (`Line 01: [10, 11, ...]`).
- **Tự động phân vùng Evidence:** Trích xuất Game ID từ URL để tạo thư mục riêng `evidence/<game_id>/videos/` và `evidence/<game_id>/screenshots/`.
- **Quay Video MP4 độc lập cho từng TC:** Chuyển đổi tự động từ WebM sang MP4 (H.264) chất lượng cao.
- **Tùy chỉnh thời gian dừng quan sát:** Tham số `--delay` (mặc định 10s).
- **Mở giao diện thật (Headed):** Viewport chuẩn `1440x900`.

---

## 📖 Tài Liệu Chi Tiết

Xem hướng dẫn chi tiết và các ví dụ nâng cao tại: [PACKAGE_GUIDE.md](file:///d:/antigravity-testing-kit-main/winline_automation/PACKAGE_GUIDE.md)
