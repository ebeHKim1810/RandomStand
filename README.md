# Exam Seating Planner

Ứng dụng web hỗ trợ giảng viên, giáo viên và cán bộ khảo thí tự động tạo và tinh chỉnh sơ đồ chỗ ngồi phòng thi thông minh, cân bằng mã đề thi và ngăn ngừa gian lận thi cử.

---

## Overview

**Exam Seating Planner** giải quyết bài toán phức tạp trong công tác tổ chức thi cử: sắp xếp sinh viên/học sinh ngẫu nhiên vào các phòng thi theo số hàng và số cột định trước, đồng thời phân bổ các mã đề thi (từ 2 đến 10 mã đề) sao cho **không có hai thí sinh ngồi cạnh nhau (ngang hoặc dọc) có cùng mã đề thi**.

Hệ thống còn tích hợp cơ chế hoán đổi kéo-thả (Drag & Drop), hoàn tác (Undo/Reset), thống kê phân bổ đề thi thời gian thực, bảng kiểm thử thuật toán tự động và xuất báo cáo PDF khổ A4 Landscape / ảnh PNG độ nét cao (2x Retina) hoạt động 100% offline.

---

## Features

- **Nhập liệu & Phân tích danh sách sinh viên**:
  - Nhập danh sách Mã số sinh viên (MSSV) phân cách linh hoạt bằng dấu phẩy, chấm phẩy, tab, dấu cách hoặc xuống dòng.
  - Tự động phát hiện và cảnh báo mã sinh viên trùng lặp (Duplicate Detection).
  - Tự sinh danh sách sinh viên mẫu nhanh chóng với 1 cú click.

- **Thuật toán sắp xếp chỗ ngồi & Cân bằng mã đề (Constraint-Based Grid Solver)**:
  - Xáo trộn ngẫu nhiên sinh viên theo thuật toán Fisher-Yates (không phụ thuộc vào thứ tự danh sách điểm danh).
  - Đảm bảo 100% không trùng mã đề giữa các thí sinh kề nhau theo chiều ngang (trái/phải) và chiều dọc (trên/dưới).
  - Cân bằng số lượng bài thi giữa các mã đề: chênh lệch tối đa $\le 1$ bài giữa bất kỳ hai mã đề nào ($|Count_i - Count_j| \le 1$).
  - Hỗ trợ tùy chỉnh từ 2 đến 10 mã đề (A, B, C, D, ...).
  - Hỗ trợ tùy chỉnh số chỗ ngồi mỗi hàng (2 đến 10 cột) và linh hoạt số lượng hàng.

- **Tinh chỉnh thủ công bằng Kéo - Thả (Drag & Drop)**:
  - Hỗ trợ kéo thả trực tiếp giữa hai vị trí ghế để hoán đổi chỗ ngồi và mã đề.
  - Hỗ trợ chế độ bấm chọn hai ghế (Click-to-Swap) dành cho màn hình cảm ứng hoặc thao tác chuột nhanh.
  - Cảnh báo trực quan ngay lập tức nếu vị trí mới vi phạm ràng buộc (hiện viền đỏ, nhấp nháy vị trí xung đột).
  - Ngăn xếp lịch sử hoàn tác (Undo) và khôi phục về trạng thái tạo ban đầu (Reset).

- **Kiểm định xung đột thời gian thực (Real-time Validator)**:
  - Thống kê chi tiết số xung đột ngang (Horizontal Conflicts), số xung đột dọc (Vertical Conflicts).
  - Biểu đồ và bảng đếm số lượng phân bổ của từng mã đề thi.
  - Trạng thái kiểm định toàn vẹn danh sách sinh viên (Completeness & Balance check).

- **Bảng kiểm thử thuật toán (Algorithm Test Suite Modal)**:
  - Chạy thử 6 kịch bản tiêu chuẩn kiểm tra độ chính xác và hiệu năng thuật toán:
    1. 20 sinh viên, 3 mã đề (4 cột)
    2. 40 sinh viên, 3 mã đề (4 cột)
    3. 100 sinh viên, 3 mã đề (4 cột)
    4. 100 sinh viên, 2 mã đề (4 cột)
    5. 37 sinh viên, 3 mã đề (hàng cuối không đủ ghế)
    6. 200 sinh viên, 5 mã đề (phòng thi lớn)
  - Đo lường thời gian xử lý (ms) và hỗ trợ tải trực tiếp kết quả kiểm thử vào phòng thi.

- **Tùy biến bảng màu thân thiện (Colorblind-Conscious Palette)**:
  - 10 bộ màu mặc định đạt chuẩn tương phản cao, hỗ trợ người khiếm thị màu (Okabe-Ito / Paul Tol).
  - Cho phép chọn màu tùy ý qua Color Picker với thuật toán tự động tính toán sắc độ nền, viền và chữ để đảm bảo dễ đọc khi in ấn.

- **Xuất báo cáo & In ấn chuyên nghiệp**:
  - Xuất file **PDF chuẩn khổ giấy A4 Landscape** nhiều trang với độ phân giải cao bằng bộ tạo PDF Canvas thuần (không cần server, hoạt động offline).
  - Xuất ảnh **PNG độ phân giải cao (2x Retina)**.
  - Hỗ trợ in trực tiếp từ trình duyệt (`Ctrl + P`) với stylesheet tối ưu tự động ẩn các thanh công cụ (`@media print`).

- **Lưu trữ dữ liệu cục bộ (LocalStorage Persistence)**:
  - Tự động ghi nhớ cấu hình phòng thi, thông tin môn thi, mã lớp, danh sách sinh viên và bảng màu tùy biến khi tải lại trang (`F5`).

---

## Requirements

- **Node.js**: Phiên bản 18.0.0 trở lên (khuyên dùng Node.js 20 hoặc 22+).
- **npm**: Phiên bản 9.0.0 trở lên.
- Hệ điều hành: Windows, macOS hoặc Linux.

---

## Installation

Cài đặt các gói phụ thuộc của dự án:

```bash
npm install
```

---

## Development

Khởi chạy môi trường phát triển (Development Server):

```bash
npm run dev
```

Sau khi chạy lệnh, truy cập vào đường dẫn hiển thị trên terminal (mặc định: `http://localhost:5173`).

> **Mẹo trên Windows**: Bạn cũng có thể nhấp đúp trực tiếp vào tệp `start.bat` trong thư mục gốc để khởi động nhanh server.

---

## Automated Testing

Chạy bộ kiểm thử tự động thuật toán phân bổ và phát hiện xung đột:

```bash
npm test
```

Kiểm tra cú pháp và kiểu TypeScript:

```bash
npm run lint
```

---

## Production Build

Đóng gói ứng dụng cho môi trường sản xuất:

```bash
npm run build
```

Các tệp tĩnh được tối ưu hóa sẽ nằm trong thư mục `dist/`.

---

## Preview

Xem trước bản đóng gói sản xuất trên môi trường cục bộ:

```bash
npm run preview
```

Mở trình duyệt tại `http://localhost:4173`.

---

## GitHub

Để tải mã nguồn dự án lên GitHub:

1. **Khởi tạo và commit các tệp** (nếu chưa thực hiện):
   ```powershell
   git add .
   git commit -m "feat: initial commit for Exam Seating Planner"
   ```

2. **Tạo kho lưu trữ (repository) mới trên GitHub**:
   - Truy cập [GitHub - New Repository](https://github.com/new).
   - Đặt tên repository (ví dụ: `exam-seating-planner`).
   - Chọn chế độ **Public** hoặc **Private** (không tích chọn *Initialize this repository with a README* vì dự án đã có sẵn).

3. **Liên kết và đẩy mã nguồn lên GitHub**:
   ```powershell
   git remote add origin https://github.com/<USERNAME>/<REPO_NAME>.git
   git branch -M main
   git push -u origin main
   ```
   *(Thay `<USERNAME>` và `<REPO_NAME>` bằng tên tài khoản và tên repository thực tế của bạn)*.

---

## Vercel Deployment

Ứng dụng là một Single Page Application (SPA) xây dựng bằng Vite, tương thích hoàn hảo với nền tảng Vercel.

### Cách 1: Triển khai qua Vercel Dashboard (Khuyên dùng)

1. Đẩy mã nguồn lên GitHub theo hướng dẫn ở phần trên.
2. Truy cập [Vercel Dashboard](https://vercel.com/dashboard) và bấm **Add New...** -> **Project**.
3. Chọn kho lưu trữ GitHub vừa đẩy lên và bấm **Import**.
4. Cấu hình tự động được nhận diện:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Bấm **Deploy**. Sau khoảng 30 - 60 giây, ứng dụng sẽ được cấp đường dẫn HTTPS công khai dạng `https://<ten-du-an>.vercel.app`.

### Cách 2: Triển khai trực tiếp qua Vercel CLI

Nếu bạn đã cài đặt Vercel CLI trên máy tính:

```powershell
# Cài đặt vercel CLI nếu chưa có
npm install -g vercel

# Đăng nhập và triển khai
vercel
```

Làm theo hướng dẫn trên màn hình và chọn triển khai production với:
```powershell
vercel --prod
```

---

## License

Dự án phát hành dưới giấy phép mã nguồn mở MIT.

#   R a n d o m S t a n d  
 