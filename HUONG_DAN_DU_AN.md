# HƯỚNG DẪN DỰ ÁN QUẢN LÝ NHÂN SỰ NHÓM 4

## 1. Tổng quan dự án

Đây là một hệ thống quản lý nhân sự cơ bản, được xây dựng theo mô hình tách riêng:

- `frontend/`: giao diện người dùng
- `backend/`: API xử lý dữ liệu và kết nối cơ sở dữ liệu

Mục tiêu của dự án là hỗ trợ các chức năng chính:

- Đăng ký tài khoản
- Đăng nhập hệ thống
- Hiển thị danh sách nhân viên
- Tìm kiếm nhân viên theo tên hoặc mã
- Thêm nhân viên mới
- Sửa thông tin nhân viên
- Xóa nhân viên

Về mặt công nghệ:

- Frontend dùng `React`, `Vite`, `Tailwind CSS`
- Backend dùng `Node.js`, `Express`, `mysql2`
- Cơ sở dữ liệu đang kết nối tới `TiDB Cloud`

---

## 2. Cấu trúc thư mục chính

### Thư mục `backend/`

- `server.js`: file trung tâm của backend, chứa toàn bộ API
- `package.json`: khai báo thư viện và script chạy backend

### Thư mục `frontend/`

- `src/main.jsx`: điểm bắt đầu của React app
- `src/App.jsx`: file giao diện và logic chính
- `src/index.css`: nạp Tailwind CSS và CSS nền
- `index.html`: file HTML gốc để mount React
- `vite.config.js`: cấu hình Vite
- `tailwind.config.js`: cấu hình Tailwind
- `.env.example`: file mẫu để cấu hình URL backend

### Các file tài liệu

- `HUONG_DAN_DU_AN.md`: tài liệu tổng quan dự án
- `GIAI_THICH_TUNG_HAM.md`: tài liệu giải thích chi tiết từng hàm
- `THUYET_TRINH_6_NGUOI.md`: tài liệu chia phần thuyết trình cho 6 người

---

## 3. Luồng chạy tổng thể của hệ thống

Đây là phần quan trọng nhất khi học và khi thuyết trình.

### Bước 1: Người dùng mở frontend

Khi người dùng truy cập vào trang web:

1. Trình duyệt tải file `frontend/index.html`
2. File này nạp `frontend/src/main.jsx`
3. `main.jsx` render component `App`
4. `App.jsx` kiểm tra người dùng đã đăng nhập chưa

Nếu chưa đăng nhập:

- hiển thị màn hình đăng nhập / đăng ký

Nếu đã đăng nhập:

- hiển thị dashboard quản lý nhân sự

### Bước 2: Người dùng đăng nhập hoặc đăng ký

Người dùng nhập:

- tên đăng nhập
- mật khẩu
- họ tên nếu là đăng ký

Khi bấm submit:

1. Frontend gọi hàm `handleAuthSubmit()`
2. Hàm này gửi request lên backend
3. Backend kiểm tra dữ liệu trong bảng `users`
4. Nếu thành công:
   - frontend lưu `currentUser`
   - giao diện chuyển sang dashboard

### Bước 3: Dashboard tải dữ liệu

Sau khi đăng nhập thành công:

1. Frontend gọi API lấy danh sách phòng ban
2. Frontend gọi API lấy danh sách nhân viên
3. Dữ liệu trả về được lưu vào state
4. Bảng nhân viên được render ra màn hình

### Bước 4: Người dùng thao tác trên nhân viên

Người dùng có thể:

- tìm kiếm
- thêm mới
- sửa
- xóa

Mỗi thao tác trên giao diện sẽ gọi API tương ứng bên backend.

Backend xử lý xong sẽ trả dữ liệu về.
Frontend sau đó tải lại danh sách nhân viên để bảng luôn đồng bộ.

---

## 4. Luồng chạy chi tiết giữa frontend và backend

## 4.1 Luồng đăng nhập

### Ở frontend

1. Người dùng nhập tài khoản và mật khẩu
2. Dữ liệu được lưu vào `authForm`
3. Khi submit, `handleAuthSubmit()` chạy
4. Frontend gọi:

```text
POST /api/login
```

### Ở backend

1. Route `/api/login` nhận dữ liệu từ `req.body`
2. Kiểm tra `username` và `password` trong bảng `users`
3. Nếu đúng:
   - trả về thông tin user
4. Nếu sai:
   - trả về lỗi `401`

### Kết quả

Frontend nhận được user và gọi:

```text
setCurrentUser(data.user)
```

Ngay sau đó giao diện chuyển sang dashboard.

## 4.2 Luồng lấy danh sách phòng ban

### Frontend

Sau khi đăng nhập:

1. `useEffect` theo dõi `currentUser`
2. Nếu có user, frontend gọi:

```text
GET /api/departments
```

### Backend

1. Route `/api/departments` chạy câu lệnh:

```sql
SELECT * FROM departments
```

2. Trả về mảng phòng ban

### Kết quả

Frontend lưu vào state `departments`.
Danh sách này được đưa vào ô chọn phòng ban trong form nhân viên.

## 4.3 Luồng lấy danh sách nhân viên

### Frontend

1. `useEffect` theo dõi `currentUser` và `searchQuery`
2. Mỗi lần đăng nhập hoặc đổi từ khóa tìm kiếm, frontend gọi:

```text
GET /api/employees?search=...
```

### Backend

1. Nhận từ khóa tìm kiếm từ `req.query.search`
2. Truy vấn bảng `employees`
3. `JOIN` với bảng `departments`
4. Trả về danh sách nhân viên

### Kết quả

Frontend gọi:

```text
setEmployees(data)
```

Sau đó bảng nhân viên được cập nhật ngay trên giao diện.

## 4.4 Luồng thêm nhân viên

### Frontend

1. Người dùng nhập thông tin vào form
2. Dữ liệu lưu trong `empForm`
3. Khi bấm submit, `handleEmpSubmit()` chạy
4. Vì `editId = null`, frontend dùng:

```text
POST /api/employees
```

### Backend

1. Nhận toàn bộ thông tin nhân viên từ `req.body`
2. Thực hiện `INSERT` vào bảng `employees`
3. Nếu trùng mã nhân viên:
   - trả lỗi

### Kết quả

Frontend:

- reset form
- gọi lại `fetchEmployees()`
- hiển thị danh sách mới

## 4.5 Luồng sửa nhân viên

### Frontend

1. Người dùng bấm nút sửa
2. Hàm `handleEdit(emp)` đưa dữ liệu lên form
3. `editId` được gán bằng `id` nhân viên
4. Khi submit lại form:
   - frontend gọi:

```text
PUT /api/employees/:id
```

### Backend

1. Lấy `id` từ `req.params`
2. Lấy dữ liệu mới từ `req.body`
3. Chạy câu lệnh `UPDATE`

### Kết quả

Frontend:

- đưa form về chế độ thêm mới
- tải lại danh sách nhân viên

## 4.6 Luồng xóa nhân viên

### Frontend

1. Người dùng bấm nút xóa
2. Hệ thống hiện hộp xác nhận
3. Nếu đồng ý, frontend gọi:

```text
DELETE /api/employees/:id
```

### Backend

1. Nhận `id` từ URL
2. Chạy câu lệnh `DELETE`

### Kết quả

Frontend gọi lại `fetchEmployees()` để cập nhật bảng.

---

## 5. Các API của backend

- `POST /api/register`: tạo tài khoản mới
- `POST /api/login`: đăng nhập
- `GET /api/departments`: lấy danh sách phòng ban
- `GET /api/employees?search=...`: lấy và tìm kiếm danh sách nhân viên
- `POST /api/employees`: thêm nhân viên
- `PUT /api/employees/:id`: cập nhật nhân viên
- `DELETE /api/employees/:id`: xóa nhân viên

---

## 6. Các state quan trọng trong frontend

- `currentUser`: biết người dùng đã đăng nhập hay chưa
- `isLoginMode`: biết đang ở đăng nhập hay đăng ký
- `authForm`: lưu dữ liệu form xác thực
- `employees`: lưu danh sách nhân viên
- `departments`: lưu danh sách phòng ban
- `searchQuery`: lưu từ khóa tìm kiếm
- `empForm`: lưu dữ liệu form nhân viên
- `editId`: phân biệt thêm mới và sửa

---

## 7. Cách chạy dự án

## 7.1 Chạy backend

Mở PowerShell trong thư mục [backend](D:/hung/QuanLyNhanSuNhom4/backend) và chạy:

```powershell
npm install
npm start
```

Backend mặc định chạy tại:

```text
http://localhost:3000
```

## 7.2 Chạy frontend

Mở PowerShell khác trong thư mục [frontend](D:/hung/QuanLyNhanSuNhom4/frontend) và chạy:

```powershell
npm install
npm run dev
```

Frontend thường chạy tại:

```text
http://localhost:5173
```

## 7.3 Cấu hình frontend gọi backend local

Tạo file `.env` trong thư mục `frontend/` với nội dung:

```env
VITE_API_URL=http://localhost:3000
```

Có thể tham khảo file [frontend/.env.example](D:/hung/QuanLyNhanSuNhom4/frontend/.env.example)

---

## 8. Gợi ý demo khi thuyết trình

Nếu cần demo trực tiếp, nên làm theo đúng luồng này:

1. Mở giao diện đăng nhập
2. Chuyển sang đăng ký
3. Đăng ký hoặc đăng nhập
4. Vào dashboard
5. Tìm kiếm một nhân viên
6. Thêm một nhân viên mới
7. Sửa nhân viên đó
8. Xóa nhân viên đó

Đây là luồng demo tốt nhất vì nó bao phủ:

- xác thực
- tải dữ liệu
- tìm kiếm
- CRUD nhân viên

---

## 9. Các điểm kỹ thuật cần lưu ý

- Frontend hiện tại lưu trạng thái đăng nhập trong state, chưa dùng `localStorage`
- Mật khẩu hiện đang kiểm tra trực tiếp trong database, chưa mã hóa
- Backend đang đặt thông tin kết nối database trực tiếp trong code
- Toàn bộ logic frontend đang tập trung nhiều ở `App.jsx`

---

## 10. Kết luận

Dự án này phù hợp để học mô hình frontend/backend, cách gọi API và CRUD cơ bản. Khi thuyết trình, nên trình bày theo luồng người dùng thực tế thay vì chỉ đọc từng file code.
