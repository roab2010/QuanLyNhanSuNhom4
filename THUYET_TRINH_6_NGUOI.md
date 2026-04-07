# PHÂN CHIA THUYẾT TRÌNH 6 NGƯỜI

Tài liệu này dùng để chia bài thuyết trình cho 6 thành viên trong nhóm.

Cách chia:

- 3 người phụ trách Frontend
- 3 người phụ trách Backend
- Mỗi người phụ trách 1 chức năng rõ ràng
- Khi thuyết trình phải nói theo luồng chạy thực tế, không chỉ đọc tên file code

Mục tiêu:

- Mỗi người có phần riêng
- Không bị trùng ý
- Có thể học nhanh trước lúc thuyết trình
- Có thể demo trực tiếp theo luồng của hệ thống

---

## 1. PHÂN CHIA TỔNG QUAN

### Frontend

- Người 1: Đăng nhập và đăng ký
- Người 2: Dashboard, danh sách nhân viên và tìm kiếm
- Người 3: Thêm, sửa, xóa nhân viên ở giao diện

### Backend

- Người 4: API đăng ký và đăng nhập
- Người 5: API lấy phòng ban, lấy danh sách nhân viên và tìm kiếm
- Người 6: API thêm, sửa, xóa nhân viên

---

## 2. THỨ TỰ THUYẾT TRÌNH ĐỀ XUẤT

Nên đi theo thứ tự này:

1. Người 1 nói phần đăng nhập / đăng ký ở frontend
2. Người 4 nói phần xác thực ở backend
3. Người 2 nói phần dashboard và tìm kiếm ở frontend
4. Người 5 nói phần lấy dữ liệu và tìm kiếm ở backend
5. Người 3 nói phần thêm, sửa, xóa ở frontend
6. Người 6 nói phần thêm, sửa, xóa ở backend

Lý do:

- Trình bày theo đúng luồng người dùng
- Người nghe dễ hiểu hơn
- Frontend và backend có thể nối ý với nhau

---

## 3. KỊCH BẢN DEMO TOÀN NHÓM

Đây là luồng demo nên dùng khi thuyết trình:

1. Mở trang đăng nhập
2. Chuyển sang đăng ký
3. Giới thiệu form đăng ký
4. Đăng nhập vào hệ thống
5. Vào dashboard
6. Tìm kiếm một nhân viên
7. Thêm một nhân viên mới
8. Sửa thông tin nhân viên đó
9. Xóa nhân viên vừa thêm

Ưu điểm của luồng này:

- Chạm được tất cả chức năng chính
- Dễ chia lời cho từng người
- Có tính liên kết giữa frontend và backend

---

## 4. PHẦN CHI TIẾT TỪNG NGƯỜI

## NGƯỜI 1 - FRONTEND - ĐĂNG NHẬP VÀ ĐĂNG KÝ

### Chức năng phụ trách

- Giao diện đăng nhập
- Giao diện đăng ký
- Chuyển đổi giữa hai giao diện
- Nhận dữ liệu người dùng nhập

### File code liên quan

- `frontend/src/App.jsx`

### Những ý chính cần nói

1. Giao diện mặc định của hệ thống là màn hình đăng nhập
2. Nếu chưa có tài khoản thì người dùng có thể chuyển sang đăng ký
3. Frontend dùng các state:
   - `isLoginMode`
   - `authForm`
   - `currentUser`
4. `isLoginMode` quyết định đang hiển thị đăng nhập hay đăng ký
5. `authForm` lưu dữ liệu người dùng nhập vào
6. Khi submit, frontend gọi hàm `handleAuthSubmit()`

### Nói rõ luồng chạy

"Khi người dùng nhập tên đăng nhập, mật khẩu và họ tên, frontend sẽ lưu dữ liệu đó vào state `authForm`. Sau khi người dùng bấm nút đăng nhập hoặc đăng ký, hàm `handleAuthSubmit()` sẽ chạy để gửi dữ liệu lên backend."

### Câu nói mẫu

"Phần đầu tiên của nhóm em là giao diện đăng nhập và đăng ký. Ở đây, hệ thống dùng state `isLoginMode` để chuyển đổi giữa hai chế độ. Dữ liệu người dùng nhập vào được lưu trong `authForm`. Khi submit form, frontend gọi hàm `handleAuthSubmit` để gửi dữ liệu sang backend xử lý."

### Demo nên làm

- Mở giao diện login
- Bấm sang đăng ký
- Chỉ rõ ô `Họ và tên` chỉ xuất hiện khi đăng ký
- Giải thích vì sao giao diện đổi

---

## NGƯỜI 2 - FRONTEND - DASHBOARD, DANH SÁCH VÀ TÌM KIẾM NHÂN VIÊN

### Chức năng phụ trách

- Giao diện dashboard
- Hiển thị danh sách nhân viên
- Ô tìm kiếm nhân viên

### File code liên quan

- `frontend/src/App.jsx`

### Những ý chính cần nói

1. Sau khi đăng nhập thành công, giao diện chuyển sang dashboard
2. Frontend lưu danh sách nhân viên trong state `employees`
3. Từ khóa tìm kiếm được lưu trong `searchQuery`
4. `useEffect` sẽ tự động gọi API khi `searchQuery` thay đổi
5. Bảng nhân viên lấy dữ liệu từ backend

### Nói rõ luồng chạy

"Khi dashboard được mở, frontend gọi API để lấy danh sách nhân viên. Dữ liệu trả về được lưu vào state `employees` và hiển thị thành bảng. Khi người dùng gõ vào ô tìm kiếm, state `searchQuery` thay đổi và `useEffect` sẽ gọi lại API để cập nhật bảng."

### Demo nên làm

- Vào dashboard
- Chỉ bảng nhân viên
- Gõ một từ khóa vào ô tìm kiếm
- Chỉ ra danh sách thay đổi

---

## NGƯỜI 3 - FRONTEND - THÊM, SỬA, XÓA NHÂN VIÊN

### Chức năng phụ trách

- Form thêm nhân viên
- Form sửa nhân viên
- Xóa nhân viên

### File code liên quan

- `frontend/src/App.jsx`

### Những ý chính cần nói

1. Dữ liệu form được lưu trong state `empForm`
2. Nếu `editId = null` thì đang thêm mới
3. Nếu `editId` có giá trị thì đang sửa
4. `handleEmpSubmit()` quyết định gọi API `POST` hay `PUT`
5. `handleEdit(emp)` dùng để đổ dữ liệu lên form
6. `handleDelete(id)` dùng để xóa

### Nói rõ luồng chạy

"Khi người dùng nhập dữ liệu vào form, frontend lưu vào `empForm`. Nếu người dùng bấm sửa trên bảng thì hàm `handleEdit` sẽ lấy dữ liệu của nhân viên đó đổ lại lên form và gán `editId`. Lúc submit, `handleEmpSubmit` sẽ kiểm tra `editId` để biết đang thêm mới hay cập nhật. Nếu người dùng bấm xóa thì `handleDelete` sẽ gửi yêu cầu xóa lên backend."

### Demo nên làm

- Thêm một nhân viên mới
- Bấm sửa một nhân viên
- Đổi lại thông tin
- Bấm xóa một nhân viên

---

## NGƯỜI 4 - BACKEND - API ĐĂNG KÝ VÀ ĐĂNG NHẬP

### Chức năng phụ trách

- `POST /api/register`
- `POST /api/login`

### File code liên quan

- `backend/server.js`

### Những ý chính cần nói

1. Backend dùng `Express` để xây dựng API
2. Route đăng ký nhận dữ liệu từ frontend qua `req.body`
3. Route đăng ký thêm tài khoản vào bảng `users`
4. Route đăng nhập kiểm tra tài khoản trong database
5. Nếu đúng thì trả user về frontend
6. Nếu sai thì trả lỗi để frontend hiển thị thông báo

### Nói rõ luồng chạy

"Khi frontend gửi dữ liệu đăng ký hoặc đăng nhập, backend sẽ nhận qua `req.body`. Với đăng ký, backend thêm user mới vào bảng `users`. Với đăng nhập, backend truy vấn bảng `users` để kiểm tra username và password. Nếu thành công thì backend trả thông tin user cho frontend."

### Demo nên làm

- Mở route `/api/register`
- Mở route `/api/login`
- Chỉ `req.body`
- Chỉ `db.query(...)`

---

## NGƯỜI 5 - BACKEND - API LẤY PHÒNG BAN, DANH SÁCH NHÂN VIÊN VÀ TÌM KIẾM

### Chức năng phụ trách

- `GET /api/departments`
- `GET /api/employees`

### File code liên quan

- `backend/server.js`

### Những ý chính cần nói

1. Route `/api/departments` trả danh sách phòng ban
2. Route `/api/employees` trả danh sách nhân viên
3. API nhân viên có hỗ trợ tìm kiếm
4. Backend lấy từ khóa từ `req.query.search`
5. Backend dùng câu lệnh `LIKE`
6. Backend `JOIN` với bảng `departments` để lấy tên phòng ban

### Nói rõ luồng chạy

"Sau khi đăng nhập, frontend cần dữ liệu để hiển thị dashboard. Backend cung cấp API lấy phòng ban để frontend đổ vào ô chọn. Đồng thời backend cũng cung cấp API lấy danh sách nhân viên. API này nhận thêm từ khóa tìm kiếm và dùng câu lệnh SQL có `LIKE` để lọc dữ liệu theo tên hoặc mã nhân viên."

### Demo nên làm

- Chỉ route phòng ban
- Chỉ route nhân viên
- Chỉ biến `search`
- Chỉ đoạn SQL `JOIN`

---

## NGƯỜI 6 - BACKEND - API THÊM, SỬA, XÓA NHÂN VIÊN

### Chức năng phụ trách

- `POST /api/employees`
- `PUT /api/employees/:id`
- `DELETE /api/employees/:id`

### File code liên quan

- `backend/server.js`

### Những ý chính cần nói

1. Backend nhận dữ liệu nhân viên từ frontend
2. Nếu là thêm mới thì dùng `INSERT`
3. Nếu là cập nhật thì dùng `UPDATE`
4. Nếu là xóa thì dùng `DELETE`
5. Backend bắt lỗi trùng mã nhân viên
6. Sau khi backend xử lý xong, frontend tải lại danh sách

### Nói rõ luồng chạy

"Khi frontend gửi dữ liệu nhân viên, backend nhận dữ liệu qua `req.body`. Nếu người dùng đang thêm mới thì backend dùng API `POST` để chèn dữ liệu vào bảng `employees`. Nếu đang sửa thì backend lấy `id` từ `req.params` và dùng `UPDATE`. Nếu xóa thì backend dùng `DELETE`. Sau khi hoàn tất, frontend sẽ gọi lại API danh sách để cập nhật bảng."

### Demo nên làm

- Chỉ API POST employees
- Chỉ API PUT employees/:id
- Chỉ API DELETE employees/:id
- Chỉ `req.params.id`

---

## 5. PHẦN MỞ ĐẦU CHUNG

Người đại diện nhóm có thể nói:

"Nhóm em xây dựng hệ thống quản lý nhân sự gồm hai phần là frontend và backend. Frontend được phát triển bằng React, Vite và Tailwind CSS để xây dựng giao diện. Backend được phát triển bằng Node.js, Express và kết nối cơ sở dữ liệu TiDB Cloud để xử lý dữ liệu. Bài thuyết trình của nhóm em sẽ đi theo đúng luồng sử dụng thực tế của người dùng, từ đăng nhập đến quản lý nhân viên."

---

## 6. PHẦN KẾT THÚC CHUNG

Người cuối có thể nói:

"Tóm lại, hệ thống của nhóm em đã hoàn thành các chức năng chính gồm đăng ký, đăng nhập, hiển thị danh sách nhân viên, tìm kiếm, thêm, sửa và xóa nhân viên. Nhóm em tách riêng frontend và backend để thuận tiện cho phát triển, kiểm thử và mở rộng về sau."

---

## 7. THỜI GIAN ĐỀ XUẤT

- Nếu nhóm có 12 đến 15 phút: mỗi người khoảng 2 phút
- Nếu nhóm có 18 đến 20 phút: mỗi người khoảng 2.5 đến 3 phút

---

## 8. CÁCH HỌC NHANH

Mỗi thành viên nên:

1. Đọc phần của mình trong file này
2. Mở đúng file code liên quan
3. Tập nói theo ý, không đọc nguyên văn
4. Thực hành demo đúng chức năng mình phụ trách

---

## 9. CÂU HỎI CÓ THỂ BỊ HỎI

### "Frontend và backend kết nối với nhau như thế nào?"

Trả lời:
"Frontend dùng `fetch` để gọi các API như `/api/login`, `/api/employees`, `/api/departments`."

### "Dữ liệu được lưu ở đâu?"

Trả lời:
"Dữ liệu được lưu trong TiDB Cloud. Backend dùng `mysql2` để kết nối và truy vấn."

### "Tìm kiếm xử lý ở đâu?"

Trả lời:
"Frontend gửi từ khóa lên backend, backend lọc dữ liệu và trả kết quả về."

### "Tại sao lại tách frontend và backend?"

Trả lời:
"Để giao diện và xử lý dữ liệu tách biệt, dễ phát triển và dễ bảo trì."

---

## 10. GỢI Ý THUYẾT TRÌNH THEO DEMO THỰC TẾ

Nếu nhóm muốn trình bày mượt hơn, nên vừa nói vừa demo theo trình tự:

### Giai đoạn 1: Mở hệ thống

- Người 1 nói giao diện xác thực
- Người 4 nối tiếp bằng API xác thực

### Giai đoạn 2: Sau khi đăng nhập

- Người 2 nói dashboard và danh sách
- Người 5 nối tiếp bằng API lấy dữ liệu

### Giai đoạn 3: Thao tác nhân viên

- Người 3 demo thêm, sửa, xóa
- Người 6 giải thích API CRUD tương ứng

Đây là cách trình bày tốt nhất vì:

- không bị rời rạc
- người nghe dễ theo dõi
- thể hiện được frontend và backend phối hợp với nhau
