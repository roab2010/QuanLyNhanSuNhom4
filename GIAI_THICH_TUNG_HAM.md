# GIẢI THÍCH TỪNG HÀM TRONG PROJECT

Tài liệu này đi sâu hơn file `HUONG_DAN_DU_AN.md`.

Mục tiêu:

- Giải thích từng hàm chính trong project
- Nói rõ hàm nằm ở đâu
- Hàm được gọi khi nào
- Hàm nhận dữ liệu gì
- Hàm xử lý gì
- Hàm làm thay đổi state hoặc dữ liệu như thế nào
- Hàm đó ảnh hưởng tới giao diện hoặc backend ra sao

---

## 1. FRONTEND

Frontend nằm chủ yếu trong:

- `frontend/src/main.jsx`
- `frontend/src/App.jsx`

---

## 2. FILE `frontend/src/main.jsx`

### `createRoot(document.getElementById('root')).render(...)`

### Vai trò

Đây là lệnh dùng để render toàn bộ React app vào HTML.

### Nó làm gì

1. Tìm phần tử có id là `root` trong `index.html`
2. Tạo một React root
3. Render component `App`

### Vì sao cần

Nếu không có đoạn này thì ứng dụng React sẽ không xuất hiện trên trình duyệt.

### `<StrictMode>`

`StrictMode` được dùng để hỗ trợ quá trình phát triển:

- cảnh báo một số vấn đề tiềm ẩn
- giúp phát hiện code chưa tối ưu

---

## 3. FILE `frontend/src/App.jsx`

Đây là file trung tâm của frontend.
File này xử lý gần như toàn bộ:

- đăng nhập
- đăng ký
- dashboard
- danh sách nhân viên
- tìm kiếm
- thêm
- sửa
- xóa

---

## 4. HẰNG SỐ VÀ HÀM NGOÀI COMPONENT

### `API_URL`

### Vai trò

Xác định địa chỉ backend mà frontend sẽ gọi tới.

### Cách hoạt động

- Nếu có biến môi trường `VITE_API_URL` thì dùng biến đó
- Nếu không có thì dùng URL backend deploy sẵn

### `createEmptyEmpForm(defaultDeptId = '')`

### Vai trò

Tạo object mặc định cho form nhân viên.

### Dùng khi nào

- khởi tạo `empForm`
- reset form sau khi thêm
- reset form khi hủy sửa

### Đầu ra

Object gồm:

- `ma_nv`
- `full_name`
- `phone`
- `gender`
- `dept_id`
- `position`
- `base_salary`
- `status`

---

## 5. CÁC STATE TRONG COMPONENT `App()`

### `currentUser`

Biết người dùng đã đăng nhập hay chưa.

### `isLoginMode`

Biết đang hiển thị:

- đăng nhập
- hay đăng ký

### `authForm`

Lưu dữ liệu form xác thực.

### `employees`

Lưu danh sách nhân viên.

### `departments`

Lưu danh sách phòng ban.

### `searchQuery`

Lưu chuỗi tìm kiếm.

### `empForm`

Lưu dữ liệu form thêm / sửa nhân viên.

### `editId`

Nếu `null` là thêm mới, nếu có giá trị là sửa.

---

## 6. CÁC `useEffect` TRONG `App()`

## `useEffect(..., [currentUser])`

### Vai trò

Tự động tải danh sách phòng ban sau khi đăng nhập.

### Luồng chạy

1. Kiểm tra `currentUser`
2. Nếu chưa đăng nhập thì dừng
3. Nếu đã đăng nhập thì gọi:

```text
GET /api/departments
```

4. Lấy dữ liệu trả về
5. Lưu vào `departments`
6. Nếu form chưa có phòng ban mặc định thì gán phòng ban đầu tiên

## `useEffect(..., [currentUser, searchQuery])`

### Vai trò

Tự động tải danh sách nhân viên.

### Luồng chạy

1. Kiểm tra `currentUser`
2. Nếu đã đăng nhập thì gọi API:

```text
GET /api/employees?search=...
```

3. Dữ liệu trả về được lưu vào `employees`

### Khi nào chạy

- sau khi đăng nhập
- khi người dùng thay đổi từ khóa tìm kiếm

---

## 7. CÁC HÀM XỬ LÝ TRONG FRONTEND

## `fetchEmployees()`

### Vai trò

Tải lại danh sách nhân viên.

### Dùng khi nào

- sau khi thêm
- sau khi sửa
- sau khi xóa

### Luồng chạy

1. Lấy `searchQuery`
2. Gọi `/api/employees`
3. Nhận JSON
4. Cập nhật `employees`

## `handleAuthSubmit(event)`

### Vai trò

Xử lý submit form xác thực.

### Luồng chạy

1. Chặn reload trang
2. Kiểm tra `isLoginMode`
3. Nếu đăng nhập thì gọi `/api/login`
4. Nếu đăng ký thì gọi `/api/register`
5. Gửi `authForm` lên backend
6. Nếu lỗi thì báo
7. Nếu đăng nhập thành công thì cập nhật `currentUser`
8. Nếu đăng ký thành công thì chuyển về đăng nhập

### State bị ảnh hưởng

- `currentUser`
- `isLoginMode`

## `handleLogout()`

### Vai trò

Đăng xuất người dùng hiện tại.

### Luồng chạy

1. `setCurrentUser(null)`
2. reset `authForm`

## `handleEmpSubmit(event)`

### Vai trò

Xử lý submit form nhân viên cho cả thêm mới và sửa.

### Luồng chạy

1. Chặn reload form
2. Kiểm tra `editId`
3. Nếu có `editId` thì dùng `PUT`
4. Nếu không có `editId` thì dùng `POST`
5. Gửi `empForm`
6. Nếu thành công:
   - reset form
   - xóa `editId`
   - gọi `fetchEmployees()`

## `handleDelete(id)`

### Vai trò

Xóa một nhân viên theo `id`.

### Luồng chạy

1. Hỏi xác nhận
2. Nếu đồng ý thì gọi `DELETE`
3. Sau đó tải lại danh sách

## `handleEdit(emp)`

### Vai trò

Đưa dữ liệu của một nhân viên từ bảng lên form để sửa.

### Luồng chạy

1. Đưa dữ liệu vào `empForm`
2. Gán `editId = emp.id`

## `formatMoney(amount)`

### Vai trò

Định dạng lương theo chuẩn tiền tệ Việt Nam.

---

## 8. LOGIC RENDER TRONG `App()`

## Khối `if (!currentUser) { ... }`

### Vai trò

Hiển thị giao diện đăng nhập / đăng ký.

## Khối `return (...)` cuối cùng

### Vai trò

Hiển thị dashboard quản lý nhân sự.

### Bao gồm

- sidebar
- thông tin người dùng
- ô tìm kiếm
- form thêm sửa
- bảng nhân viên

---

## 9. BACKEND - FILE `backend/server.js`

Backend dùng:

- `Express`
- `mysql2`
- `cors`

---

## 10. PHẦN KHỞI TẠO BACKEND

### `const app = express()`

Tạo ứng dụng Express.

### `app.use(cors())`

Cho phép frontend gọi API.

### `app.use(express.json())`

Cho phép đọc JSON từ `req.body`.

### `const PORT = process.env.PORT || 3000`

Xác định cổng chạy server.

### `const db = mysql.createConnection(...)`

Tạo kết nối tới TiDB Cloud.

---

## 11. CÁC ROUTE API TRONG BACKEND

## `app.post('/api/register', ...)`

### Vai trò

Đăng ký tài khoản mới.

### Luồng xử lý

1. Lấy `username`, `password`, `fullname`
2. Chạy `INSERT INTO users`
3. Nếu trùng username thì trả lỗi
4. Nếu thành công thì trả message

## `app.post('/api/login', ...)`

### Vai trò

Kiểm tra tài khoản và mật khẩu khi đăng nhập.

### Luồng xử lý

1. Lấy dữ liệu từ body
2. Truy vấn bảng `users`
3. Nếu không có kết quả thì trả `401`
4. Nếu thành công thì trả user

## `app.get('/api/departments', ...)`

### Vai trò

Trả về danh sách phòng ban.

### Luồng xử lý

1. Chạy `SELECT * FROM departments`
2. Trả JSON

## `app.get('/api/employees', ...)`

### Vai trò

Lấy danh sách nhân viên và hỗ trợ tìm kiếm.

### Luồng xử lý

1. Lấy `search` từ query
2. `JOIN` bảng `employees` với `departments`
3. Dùng `LIKE` để tìm theo tên hoặc mã
4. Trả kết quả

## `app.post('/api/employees', ...)`

### Vai trò

Thêm nhân viên mới.

### Luồng xử lý

1. Lấy dữ liệu từ body
2. Chạy `INSERT`
3. Nếu trùng mã nhân viên thì trả lỗi
4. Nếu thành công thì trả message

## `app.put('/api/employees/:id', ...)`

### Vai trò

Cập nhật thông tin nhân viên theo `id`.

### Luồng xử lý

1. Lấy `id` từ URL
2. Lấy dữ liệu mới từ body
3. Chạy `UPDATE`
4. Trả kết quả

## `app.delete('/api/employees/:id', ...)`

### Vai trò

Xóa nhân viên theo `id`.

### Luồng xử lý

1. Lấy `id`
2. Chạy `DELETE`
3. Trả message thành công

## `app.listen(PORT, ...)`

### Vai trò

Khởi động backend để lắng nghe request.

---

## 12. GIẢI THÍCH THEO LUỒNG DEMO THỰC TẾ

## Demo 1: Đăng nhập

### Luồng hàm

1. Người dùng gõ input
2. `setAuthForm(...)`
3. Submit form
4. `handleAuthSubmit()`
5. Backend chạy `/api/login`
6. Trả user
7. `setCurrentUser(...)`
8. `useEffect` tải phòng ban
9. `useEffect` tải danh sách nhân viên

## Demo 2: Tìm kiếm nhân viên

### Luồng hàm

1. Gõ vào ô tìm kiếm
2. `setSearchQuery(...)`
3. `useEffect` chạy lại
4. Frontend gọi `/api/employees?search=...`
5. Backend lọc dữ liệu
6. Frontend cập nhật `employees`

## Demo 3: Thêm nhân viên

### Luồng hàm

1. Nhập form
2. `setEmpForm(...)`
3. Submit
4. `handleEmpSubmit()`
5. Vì `editId = null` nên dùng `POST`
6. Backend thêm bản ghi mới
7. Frontend gọi `fetchEmployees()`

## Demo 4: Sửa nhân viên

### Luồng hàm

1. Bấm nút sửa
2. `handleEdit(emp)`
3. `editId` được gán
4. Submit lại form
5. `handleEmpSubmit()`
6. Lúc này dùng `PUT`
7. Backend cập nhật bản ghi
8. Frontend tải lại bảng

## Demo 5: Xóa nhân viên

### Luồng hàm

1. Bấm nút xóa
2. `handleDelete(id)`
3. Xác nhận
4. Gọi `DELETE`
5. Backend xóa
6. Frontend gọi `fetchEmployees()`

---

## 13. Kết luận

Nếu học project này, nên học theo:

1. state nào điều khiển giao diện
2. hàm nào xử lý thao tác
3. API nào được gọi
4. dữ liệu trả về cập nhật state nào

Đó là cách hiểu đúng luồng chạy của cả hệ thống.
