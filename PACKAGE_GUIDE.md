# 🎰 HƯỚNG DẪN SỬ DỤNG GÓI PACKAGE TỰ ĐỘNG HÓA KIỂM THỬ WINLINES CHO MỌI GAME SLOT

Gói package **`slot-winline-automation-toolkit`** được thiết kế để bạn có thể chạy kiểm thử Winline và ghi video MP4 cho bất kỳ game slot nào bằng **2 hình thức**:
1. **Chạy bằng PROMPT trực tiếp trong chat (Không cần mở terminal/powershell - Tiện lợi nhất)**.
2. **Chạy bằng lệnh PowerShell / CMD (Dành cho chạy offline / CI)**.

---

## 🎯 CÁCH 1: CHẠY BẰNG PROMPT TRỰC TIẾP TRONG CHAT (KHUYÊN DÙNG)

Bạn **không cần mở PowerShell**, không cần nhớ câu lệnh terminal. Chỉ cần copy mẫu Prompt ngắn gọn bên dưới, thay URL và Winline của bạn rồi gửi vào ô chat:

### 📝 Mẫu Prompt Ngắn Gọn:

```text
Chạy kiểm tra winline cho game sau:
URL: <DÁN_LINK_GAME_TẠI_ĐÂY>
Winlines:
Line 01: [10, 11, 12, 10, 11, 2, 2, 2, 2, 2, 12, 10, 11, 12, 10]
Line 02: [3, 3, 3, 3, 3, 10, 11, 12, 10, 11, 12, 10, 11, 12, 10]
Line 03: [10, 11, 12, 10, 11, 12, 10, 11, 12, 10, 4, 4, 4, 4, 4]
```

### ⚡ Hoặc Dùng Lệnh Workflow / Slash Command:
```text
/verify_slot_winlines
URL: <DÁN_LINK_GAME_TẠI_ĐÂY>
Winlines:
Line 01: [10, 11, 12, 10, 11, 2, 2, 2, 2, 2, 12, 10, 11, 12, 10]
Line 02: [3, 3, 3, 3, 3, 10, 11, 12, 10, 11, 12, 10, 11, 12, 10]
```

### 🤖 Khi nhận Prompt, AI Agent sẽ tự động:
1. Tự động đọc và lưu ma trận vào file kiểm thử.
2. Mở game với viewport `1440x900` trên trình duyệt thật (headed mode).
3. Inject ma trận, quay cuộn và dừng 10s cho bạn quan sát UI.
4. Ghi hình từng test case và chuyển đổi sang file **MP4**.
5. Báo cáo kết quả và gửi link tải video MP4 trực tiếp ngay trong chat!

---

## 💻 CÁCH 2: CHẠY BẰNG POWERSHELL / TERMINAL (DÀNH CHO CHẠY OFFLINE)

Nếu bạn muốn tự chạy độc lập trên máy từ cửa sổ PowerShell:

```powershell
cd d:\antigravity-testing-kit-main\winline_automation
.\run-winline.ps1 -Url "<URL_GAME_MỚI>" -Data "<ĐƯỜNG_DẪN_FILE_WINLINE>"
```

**Ví dụ:**
```powershell
# Chạy với file văn bản copy-paste:
.\run-winline.ps1 -Url "https://neo-v2-play-staging.1kk6s8yq.com/slot/release/v1.1.3g-cheat/?game=n53989&cheat=1" -Data "test-data/templates/winlines_template.txt"

# Chạy với thời gian dừng 5 giây và chỉ test Line 01:
.\run-winline.ps1 -Url "https://.../?game=n53989&cheat=1" -Data "my_new_lines.txt" -Delay 5 -Filter "TC_LINE_01"
```

---

## 📋 Danh Sách Tham Số Terminal Khi Cần Tùy Biến

| Tham Số | Rút Gọn | Mặc Định | Mô Tả |
| :--- | :--- | :--- | :--- |
| `--url` | `-u` | *(URL mặc định)* | URL của slot game (tự động thêm `&cheat=1` nếu thiếu). |
| `--data` | `-d` | `test-data/winlines.json` | Đường dẫn file Winline (chấp nhận file `.txt` copy-paste hoặc file `.json`). |
| `--delay` | | `10` | Thời gian dừng quan sát UI sau khi quay (giây). |
| `--viewport` | | `1440x900` | Kích thước màn hình trình duyệt (Width x Height). |
| `--filter` | `-g` | *(Tất cả)* | Lọc riêng test case cần chạy (ví dụ: `-g "TC_LINE_01"`). |
| `--headless` | | `false` | Thêm cờ này nếu muốn chạy ẩn không mở cửa sổ trình duyệt. |
| `--out` | `-o` | `evidence/<game_id>` | Thư mục tùy chỉnh để lưu video MP4 và ảnh chụp. |

---

## 📂 Thư Mục Bằng Chứng (Evidence) Tự Động Phân Loại Theo Game

Toàn bộ video và ảnh sẽ được lưu tự động theo mã game trích xuất từ URL:
- **Video MP4 từng test case:** `evidence/<mã_game>/videos/TC_LINE_XX.mp4`
- **Ảnh chụp màn hình đường thắng:** `evidence/<mã_game>/screenshots/TC_LINE_XX.png`
