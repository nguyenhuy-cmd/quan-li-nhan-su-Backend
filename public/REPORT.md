# BÁO CÁO ASSIGNMENT: HỆ THỐNG QUẢN LÝ NHÂN SỰ (HRM PRO)
**Môn học:** WD1113 - Web UI Programming  
**Giảng viên:** Cường Nguyễn Đình  
**Công nghệ sử dụng:** HTML5, CSS3, JavaScript Thuần (Vanilla ES6+ Modules, Closures, Higher-Order Functions, Async/Await, RegExp, LocalStorage).  

---

## 1. Giới thiệu Tổng quan Dự án
Dự án **HRM Pro** là ứng dụng Quản lý Nhân sự hoàn chỉnh được xây dựng hoàn toàn bằng **JavaScript thuần (Vanilla JS)** mà không phụ thuộc vào bất kỳ thư viện hay framework bên thứ ba nào (như React, Vue, Angular hay jQuery). 

Ứng dụng đáp ứng đầy đủ kiến trúc mô-đun hóa (ES6 Modules) với cấu trúc phân tách rõ ràng giữa giao diện, logic xử lý dữ liệu và lưu trữ bền vững trên trình duyệt (`localStorage`).

---

## 2. Danh sách và Cách Triển Khai 12 Module Bắt Buộc

| STT | Tên Module | Tệp tin (.js) | Cách Triển Khai & Tính Năng Nổi Bật |
| :-- | :--- | :--- | :--- |
| **1** | **Module Xác thực (AuthModule)** | `modules/authModule.js` | Quản lý đăng nhập/đăng ký người dùng. Sử dụng **Closure** (`createSecurityManager`) để đóng gói thuật toán băm mật khẩu và tạo token phiên (`session`). Mô phỏng kiểm tra bất đồng bộ bằng `async/await`. |
| **2** | **Module Cơ sở dữ liệu (EmployeeDbModule)** | `modules/employeeDbModule.js` | Tầng truy xuất dữ liệu nhân viên từ `localStorage`. Tự động khởi tạo dữ liệu mẫu phong phú. Sử dụng các **Higher-Order Functions** (`filter`, `sort`, `reduce`, `some`, `find`) để lọc, đếm nhân sự và sắp xếp. |
| **3** | **Module Thêm Nhân viên (AddEmployeeModule)** | `modules/addEmployeeModule.js` | Tạo Form DOM động, tự động sinh mã nhân viên kế tiếp (`NV00x`). Tự động gợi ý mức lương chuẩn khi chọn chức danh. Validation đầu vào thời gian thực (Regex Email, Họ tên, Lương > 0). |
| **4** | **Module Sửa Nhân viên (EditEmployeeModule)** | `modules/editEmployeeModule.js` | Tìm kiếm nhân sự và nạp sẵn dữ liệu vào form. Ứng dụng **Closure** (`createEditSession`) để lưu trạng thái gốc, phát hiện thay đổi (`hasChanged`) và khôi phục khi cần. Có hộp thoại xác nhận trước khi lưu. |
| **5** | **Module Xóa Nhân viên (DeleteEmployeeModule)** | `modules/deleteEmployeeModule.js` | Tra cứu nhân viên, hiển thị thẻ preview tóm tắt thông tin nhân sự. Tích hợp hộp thoại xác nhận `window.confirm` theo yêu cầu đề bài để xóa an toàn. |
| **6** | **Module Tìm kiếm Nhân viên (SearchEmployeeModule)** | `modules/searchEmployeeModule.js` | Bộ lọc tìm kiếm nâng cao: Tìm theo Tên/Mã/Email bằng **Biểu thức chính quy (RegExp)** không phân biệt hoa thường; kết hợp lọc theo Phòng ban, Vị trí và Khoảng lương (Min - Max). Hỗ trợ sắp xếp đa tiêu chí. |
| **7** | **Module Quản lý Phòng ban (DepartmentModule)** | `modules/departmentModule.js` | Thêm, sửa, xóa phòng ban cơ cấu tổ chức. Kiểm tra ràng buộc an toàn (không cho xóa phòng ban đang có nhân viên phụ thuộc). Lưu vào `localStorage('hrm_departments')`. |
| **8** | **Module Quản lý Vị trí (PositionModule)** | `modules/positionModule.js` | Quản lý danh mục chức danh công việc và mức lương cơ sở chuẩn. Cung cấp dữ liệu dropdown đồng bộ cho module Thêm/Sửa nhân viên. |
| **9** | **Module Quản lý Lương (SalaryModule)** | `modules/salaryModule.js` | Tính lương thực lĩnh: `netSalary = baseSalary + bonus - deduction`. Sử dụng `map()` để lập bảng chi trả và `reduce()` để tính tổng quỹ lương, lương bình quân, max/min. Xuất phiếu lương cá nhân (Payslip). |
| **10** | **Module Chấm công (AttendanceModule)** | `modules/attendanceModule.js` | Ghi nhận Check-in/Check-out hàng ngày. Sử dụng **đối tượng Date** và phép tính thời gian để tự động tính tổng giờ làm việc (`workHours`) và xác định trạng thái đúng giờ/đi muộn. |
| **11** | **Module Nghỉ phép (LeaveModule)** | `modules/leaveModule.js` | Quản lý hạn mức phép năm mặc định 20 ngày/năm. Tự động tính khoảng thời gian nghỉ giữa 2 ngày. Xử lý quy trình xét duyệt (Approve/Reject) và trừ dần vào quỹ phép cá nhân. |
| **12** | **Module Đánh giá Hiệu suất (PerformanceModule)** | `modules/performanceModule.js` | Đánh giá KPI thang điểm 1-5 sao. Tính điểm trung bình bằng `reduce()`. Sắp xếp và vinh danh danh sách **Top Performers** (Nhân viên xuất sắc nhất) bằng `sort()`. |

---

## 3. Các Kỹ Thuật JavaScript Nâng Cao Được Ứng Dụng

1. **ES6+ Syntax**: Arrow functions, template literals, destructuring, spread/rest operators, modules (`import`/`export`), classes.
2. **Closure Pattern**:
   - Trong `authModule.js`: Đóng gói thuật toán sinh hash mật khẩu và token bảo mật không bị can thiệp từ bên ngoài.
   - Trong `editEmployeeModule.js`: Đóng gói `originalEmployee` và trạng thái `dirty-check` trong phiên chỉnh sửa.
3. **Higher-Order Functions (HOF)**:
   - `filter`: Lọc tìm kiếm nhân viên, lọc đơn nghỉ phép theo trạng thái, lọc chấm công theo ngày.
   - `map`: Lập báo cáo bảng lương chi tiết, biến đổi danh sách thành định dạng hiển thị.
   - `reduce`: Tính tổng quỹ lương toàn doanh nghiệp, tính lương trung bình, tính điểm KPI trung bình, đếm số nhân sự theo từng phòng ban.
   - `sort`: Xếp hạng bảng lương, sắp xếp nhân viên tiêu biểu (Top Performers).
4. **Bất đồng bộ với Async/Await**:
   - Sử dụng `async/await` kết hợp `Promise` để mô phỏng độ trễ I/O thực tế khi truy xuất và lưu dữ liệu vào `localStorage`.
5. **Biểu thức chính quy (RegExp)**:
   - Sử dụng `new RegExp(keyword, 'i')` trong tìm kiếm nhân viên nâng cao để hỗ trợ tìm kiếm linh hoạt trên nhiều trường dữ liệu.

---

## 4. Thách Thức Gặp Phải và Giải Pháp Khắc Phục

- **Thách thức 1: Quản lý tính toàn vẹn dữ liệu giữa các module độc lập**
  - *Giải pháp:* Thiết lập `app.js` đóng vai trò Controller trung tâm điều phối dependency injection; `EmployeeDbModule`, `DepartmentModule`, `PositionModule` cung cấp các hàm kiểm tra ràng buộc trước khi thực hiện thao tác xóa.
- **Thách thức 2: Trải nghiệm người dùng mượt mà theo chuẩn Single Page Application (SPA)**
  - *Giải pháp:* Xây dựng cơ chế Client-side Routing trong `app.js` gắn với Sidebar Menu, render nội dung động vào `#module-container` mà không làm tải lại trang (no reload).
- **Thách thức 3: Tránh lỗi rò rỉ dữ liệu hoặc xung đột mã nhân viên**
  - *Giải pháp:* Viết hàm `generateNextCode()` tự động quét các số hiệu hiện có trong hệ thống và sinh mã tự tăng dạng `NV001`, `NV002`,...

---

## 5. Hướng Dẫn Kiểm Thử & Chạy Ứng Dụng

1. **Mở dự án:**
   - Sử dụng Live Server trên Visual Studio Code (hoặc bất kỳ local HTTP server nào) mở tệp [index.html](file:///d:/quan-li-nhan-su-2/index.html).
2. **Tài khoản đăng nhập mẫu:**
   - **Tài khoản Admin:** `admin` | **Mật khẩu:** `admin123`
   - **Tài khoản HR:** `hr_manager` | **Mật khẩu:** `hr123456`
   - Hoặc nhấp vào tab **Đăng ký mới** để tạo tài khoản tùy ý.
3. **Kiểm tra các trường hợp Edge Cases:**
   - Nhập chuỗi rỗng vào form thêm nhân viên &rarr; Hệ thống chặn submit và báo lỗi.
   - Nhập trùng email hoặc trùng mã nhân viên &rarr; Hệ thống thông báo cảnh báo chi tiết.
   - Xóa phòng ban có nhân sự trực thuộc &rarr; Hệ thống ngăn chặn việc xóa.
   - Xin nghỉ phép vượt quá 20 ngày &rarr; Hệ thống cảnh báo vượt hạn mức phép năm.
