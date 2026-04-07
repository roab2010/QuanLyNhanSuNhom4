# GIAI THICH TUNG HAM TRONG PROJECT

Tai lieu nay di sau hon file `HUONG_DAN_DU_AN.md`.
Muc tieu cua file nay la giai thich tung ham trong project:

- Ham nam o file nao
- Ham duoc goi khi nao
- Ham nhan du lieu gi
- Ham xu ly gi ben trong
- Ham thay doi state nao
- Ham anh huong den giao dien hay API nhu the nao

---

## 1. FRONTEND

Frontend nam chu yeu trong file `frontend/src/main.jsx` va `frontend/src/App.jsx`.

### 1.1 File `frontend/src/main.jsx`

Day la diem vao cua frontend.

#### `createRoot(document.getElementById('root')).render(...)`

Vai tro:
- Day la lenh khoi dong React app.
- No tim the `<div id="root"></div>` trong `index.html`.
- Sau do render component `App` vao trong the do.

No nhan gi:
- `document.getElementById('root')`: phan tu HTML goc.
- `<App />`: component chinh cua project.

No lam gi:
1. Tao root React moi.
2. Boc `App` trong `StrictMode`.
3. Render ra man hinh.

Tai sao can:
- Neu khong co lenh nay, frontend se khong hien gi ca.

#### `<StrictMode>`

Vai tro:
- Giup React canh bao mot so van de trong luc phat trien.

No lam gi:
- Khong anh huong truc tiep giao dien cho nguoi dung cuoi.
- Chu yeu giup lap trinh vien phat hien code co nguy co van de.

---

### 1.2 File `frontend/src/App.jsx`

Day la file quan trong nhat cua frontend.
Gan nhu toan bo luong giao dien va thao tac nghiep vu deu o day.

---

## 2. CAC HANG SO VA HAM NGOAI COMPONENT

### `API_URL`

Vi tri:
- Nam o dau file `App.jsx`

Vai tro:
- Xac dinh frontend se goi backend nao.

Gia tri:
- Uu tien `import.meta.env.VITE_API_URL`
- Neu khong co thi dung backend deploy san:
  `https://quanlynhansunhom4.onrender.com`

Tac dung:
- Moi lenh `fetch(...)` deu ghep URL nay vao truoc endpoint.

Vi du:
- `/api/login`
- `/api/employees`
- `/api/departments`

Neu thay doi:
- Frontend se goi sang backend khac.

### `createEmptyEmpForm(defaultDeptId = '')`

Loai:
- Ham helper

Vai tro:
- Tao ra object mac dinh cho form nhan vien.
- Duoc dung khi:
  - khoi tao state ban dau
  - reset form sau khi them thanh cong
  - reset form sau khi huy sua

Tham so:
- `defaultDeptId`: id phong ban mac dinh

Tra ve:
- Mot object co cau truc:
  - `ma_nv`
  - `full_name`
  - `phone`
  - `gender`
  - `dept_id`
  - `position`
  - `base_salary`
  - `status`

Tai sao tach thanh ham rieng:
- Tranh lap lai object nhieu lan.
- De sua cau truc form o mot noi duy nhat.

---

## 3. COMPONENT CHINH `App()`

`App()` la component lon nhat cua project.
Nhiem vu cua no:

- Quan ly dang nhap / dang ky
- Quan ly state giao dien
- Goi API backend
- Render giao dien dang nhap
- Render dashboard nhan su
- Xu ly them / sua / xoa / tim kiem nhan vien

---

## 4. CAC STATE TRONG `App()`

### `currentUser`

Khai bao:
- `const [currentUser, setCurrentUser] = useState(null);`

Vai tro:
- Xac dinh nguoi dung da dang nhap chua.

Gia tri:
- `null`: chua dang nhap
- object user: da dang nhap

Anh huong:
- Neu `currentUser` la `null` thi hien form dang nhap.
- Neu `currentUser` co gia tri thi hien dashboard.

### `isLoginMode`

Vai tro:
- Chuyen doi giua:
  - dang nhap
  - dang ky

Gia tri:
- `true`: dang nhap
- `false`: dang ky

Anh huong:
- Thay doi endpoint duoc goi trong `handleAuthSubmit`
- Thay doi text tren giao dien
- Thay doi co hien truong `fullname` hay khong

### `authForm`

Vai tro:
- Luu du lieu nguoi dung dang nhap vao form xac thuc.

Cau truc:
- `username`
- `password`
- `fullname`

Luu y:
- `fullname` chi co y nghia khi dang ky.

### `employees`

Vai tro:
- Luu danh sach nhan vien hien trong bang.

Cap nhat khi nao:
- Sau khi dang nhap
- Khi tim kiem
- Sau khi them
- Sau khi sua
- Sau khi xoa

### `departments`

Vai tro:
- Luu danh sach phong ban.

Dung de:
- Do du lieu vao o `select` trong form nhan vien.

### `searchQuery`

Vai tro:
- Luu chuoi tim kiem nguoi dung nhap.

Anh huong:
- Moi khi no thay doi, `useEffect` se tai lai danh sach nhan vien.

### `empForm`

Vai tro:
- Luu du lieu hien tai cua form them/sua nhan vien.

Dung cho:
- Them moi nhan vien
- Sua nhan vien

### `editId`

Vai tro:
- Biet form dang o che do nao:
  - `null`: them moi
  - co gia tri: dang sua nhan vien co `id` tuong ung

Anh huong:
- Chon `POST` hay `PUT`
- Doi text tren nut submit
- Hien/An nut `Huy`

---

## 5. CAC `useEffect` TRONG `App()`

### `useEffect(..., [currentUser])`

Vai tro:
- Tai danh sach phong ban sau khi dang nhap.

No duoc goi khi nao:
- Khi `currentUser` thay doi.

Luong chay:
1. Kiem tra neu `currentUser` rong thi `return`.
2. Goi `fetch(${API_URL}/api/departments)`.
3. Backend tra ve danh sach phong ban.
4. `setDepartments(data)` de luu vao state.
5. Neu form nhan vien chua co `dept_id`, gan phong ban dau tien vao.

Tai sao can:
- Form them nhan vien can danh sach phong ban de nguoi dung chon.

### `useEffect(..., [currentUser, searchQuery])`

Vai tro:
- Tai danh sach nhan vien.

No duoc goi khi nao:
- Sau khi dang nhap
- Moi khi tu khoa tim kiem thay doi

Luong chay:
1. Kiem tra `currentUser`.
2. Goi API:
   `GET /api/employees?search=...`
3. Backend tra danh sach nhan vien.
4. `setEmployees(data)` cap nhat bang du lieu.

Tai sao can:
- Dam bao bang nhan vien luon dong bo voi tu khoa tim kiem.

---

## 6. CAC HAM XU LY TRONG `App()`

### `fetchEmployees()`

Loai:
- Ham helper ben trong component

Vai tro:
- Tai lai danh sach nhan vien.

No duoc dung o dau:
- Sau khi them nhan vien
- Sau khi sua nhan vien
- Sau khi xoa nhan vien

Tai sao khong goi truc tiep `useEffect`:
- `useEffect` chi tu chay khi dependency doi.
- Sau thao tac CRUD, minh can mot ham chu dong goi lai API.

Luong chay:
1. Lay `searchQuery` hien tai.
2. Goi API `/api/employees?search=...`
3. Nhan ket qua JSON.
4. `setEmployees(data)`

### `handleAuthSubmit(event)`

Loai:
- Ham xu ly submit form xac thuc

Vai tro:
- Dung chung cho:
  - dang nhap
  - dang ky

Tham so:
- `event`: su kien submit form

Luong chay:
1. Goi `event.preventDefault()` de ngan reload trang.
2. Xac dinh endpoint:
   - dang nhap -> `/api/login`
   - dang ky -> `/api/register`
3. Goi `fetch(...)` voi method `POST`.
4. Gui `authForm` len backend duoi dang JSON.
5. Cho backend tra ket qua.
6. Neu loi:
   - hien `alert(...)`
7. Neu thanh cong va dang nhap:
   - `setCurrentUser(data.user)`
8. Neu thanh cong va dang ky:
   - hien thong bao
   - `setIsLoginMode(true)` de chuyen ve form dang nhap

State bi anh huong:
- `currentUser`
- `isLoginMode`

Anh huong giao dien:
- Dang nhap thanh cong -> tu man hinh login chuyen sang dashboard
- Dang ky thanh cong -> o lai man hinh xac thuc nhung doi ve mode dang nhap

### `handleLogout()`

Vai tro:
- Dang xuat nguoi dung hien tai.

Luong chay:
1. `setCurrentUser(null)`
2. Reset `authForm`

Anh huong:
- Giao dien quay lai man hinh dang nhap.

Luu y:
- Project hien tai khong co token hay localStorage.
- Vi vay dang xuat chi la reset state tren frontend.

### `handleEmpSubmit(event)`

Loai:
- Ham xu ly submit form nhan vien

Vai tro:
- Them moi hoac cap nhat nhan vien.

Tham so:
- `event`: su kien submit form

Luong chay tong quat:
1. Ngan form reload trang.
2. Kiem tra `editId`.
3. Neu `editId` co gia tri:
   - method = `PUT`
   - URL = `/api/employees/:id`
4. Neu `editId` rong:
   - method = `POST`
   - URL = `/api/employees`
5. Gui `empForm` len backend.
6. Neu `base_salary` rong thi thay bang `0`.
7. Doc ket qua tra ve.
8. Neu backend bao loi:
   - hien alert
9. Neu thanh cong:
   - `setEditId(null)`
   - reset `empForm`
   - goi `fetchEmployees()`
   - alert thong bao thanh cong

State bi anh huong:
- `editId`
- `empForm`
- `employees` thong qua `fetchEmployees`

Day la ham trung tam cua chuc nang CRUD.

### `handleDelete(id)`

Vai tro:
- Xoa nhan vien theo `id`.

Tham so:
- `id`: id cua nhan vien can xoa

Luong chay:
1. Hien `window.confirm(...)`
2. Neu nguoi dung khong dong y -> dung
3. Neu dong y -> goi `DELETE /api/employees/:id`
4. Sau khi xoa xong -> `fetchEmployees()`

Anh huong:
- Bang nhan vien duoc tai lai va dong vua xoa bien mat.

### `handleEdit(emp)`

Vai tro:
- Dua du lieu cua nhan vien can sua len form.

Tham so:
- `emp`: object nhan vien duoc chon tu bang

Luong chay:
1. `setEmpForm(...)` bang du lieu cua nhan vien
2. `setEditId(emp.id)`

Anh huong:
- Form ben trai duoc do day du lieu cu.
- Nut submit doi thanh "Luu Thay Doi".
- Nut `Huy` hien ra.

### `formatMoney(amount)`

Vai tro:
- Hien luong theo dinh dang tien te Viet Nam.

Tham so:
- `amount`: so tien can hien thi

Tra ve:
- Chuoi da dinh dang, vi du:
  - `15000000` -> `15.000.000 VND` tuy theo trinh duyet

No khong thay doi state.
No chi dung de hien thi dep hon trong giao dien.

---

## 7. CAC HAM NGAM TRONG JSX

Ngoai cac ham named o tren, trong JSX con co nhieu ham ngan duoc viet truc tiep.

### `onChange={(event) => setAuthForm(...)}`

Vai tro:
- Cap nhat state moi khi nguoi dung go vao input.

Co o:
- username
- password
- fullname

### `onChange={(event) => setEmpForm(...)}`

Vai tro:
- Cap nhat du lieu form nhan vien ngay khi nguoi dung nhap.

Vi du:
- ma nhan vien -> viet hoa
- phone -> loai bo ky tu khong phai so
- status -> cap nhat gia tri option

### `onClick={() => setIsLoginMode(!isLoginMode)}`

Vai tro:
- Chuyen doi qua lai giua form dang nhap va dang ky.

### `onClick={() => handleEdit(emp)}`

Vai tro:
- Goi ham sua cho dung dong nhan vien duoc bam.

### `onClick={() => handleDelete(emp.id)}`

Vai tro:
- Goi ham xoa cho dung nhan vien duoc bam.

---

## 8. LOGIC RENDER CUA `App()`

### Khoi `if (!currentUser) { ... }`

Vai tro:
- Render giao dien dang nhap/dang ky.

Y nghia:
- Day la render co dieu kien.
- Neu chua dang nhap thi khong cho vao dashboard.

Ben trong co:
- tieu de
- form xac thuc
- nut chuyen che do login/register

### Khoi `return (...)` cuoi file

Vai tro:
- Render dashboard sau khi da dang nhap.

Ben trong gom:
- sidebar
- thong tin user
- o tim kiem
- form them/sua
- bang nhan vien

---

## 9. BACKEND - FILE `backend/server.js`

Backend dung Express va mysql2.

Vai tro tong:
- Nhan request tu frontend
- Truy van database
- Tra JSON cho frontend

---

## 10. CAC PHAN KHOI TAO BACKEND

### `express = require('express')`

Vai tro:
- Nap thu vien Express.

### `mysql = require('mysql2')`

Vai tro:
- Nap thu vien ket noi database MySQL/TiDB.

### `cors = require('cors')`

Vai tro:
- Cho phep frontend goi API khac domain/port.

### `const app = express()`

Vai tro:
- Tao doi tuong server Express.

Tat ca route API se gan vao `app`.

### `app.use(cors())`

Vai tro:
- Bat CORS cho backend.

Neu khong co:
- Frontend co the bi chan khi goi API tu browser.

### `app.use(express.json())`

Vai tro:
- Cho phep backend doc `req.body` dang JSON.

Neu khong co:
- `req.body` se khong co du lieu tu frontend gui len.

### `const PORT = process.env.PORT || 3000`

Vai tro:
- Xac dinh cong chay backend.

Uu tien:
- bien moi truong `PORT`
- neu khong co thi dung `3000`

### `const db = mysql.createConnection({...})`

Vai tro:
- Tao ket noi den database.

Thong tin gom:
- host
- port
- user
- password
- database
- ssl

No khong phai route.
No la nen tang de tat ca API truy van database.

---

## 11. CAC API HAM BEN BACKEND

### `app.post('/api/register', (req, res) => { ... })`

Loai:
- Route dang ky

Vai tro:
- Tao tai khoan moi trong bang `users`.

Du lieu nhan:
- `req.body.username`
- `req.body.password`
- `req.body.fullname`

Luong chay:
1. Tach `username`, `password`, `fullname` tu `req.body`
2. Chay cau lenh SQL `INSERT INTO users ...`
3. Neu loi trung username:
   - tra HTTP 400
4. Neu loi khac:
   - tra HTTP 500
5. Neu thanh cong:
   - tra JSON message

Frontend nao goi ham nay:
- `handleAuthSubmit()` khi `isLoginMode = false`

### `app.post('/api/login', (req, res) => { ... })`

Loai:
- Route dang nhap

Vai tro:
- Kiem tra tai khoan va mat khau.

Du lieu nhan:
- `username`
- `password`

Luong chay:
1. Lay `username`, `password` tu body
2. Truy van:
   `SELECT * FROM users WHERE username = ? AND password = ?`
3. Neu loi truy van -> HTTP 500
4. Neu khong tim thay user -> HTTP 401
5. Neu thanh cong -> tra ve `user`

Frontend nao goi:
- `handleAuthSubmit()` khi `isLoginMode = true`

Luu y:
- Mat khau hien tai dang so sanh truc tiep, chua ma hoa.

### `app.get('/api/departments', (req, res) => { ... })`

Loai:
- Route lay phong ban

Vai tro:
- Lay toan bo danh sach phong ban.

Luong chay:
1. Chay `SELECT * FROM departments`
2. Neu loi -> HTTP 500
3. Neu thanh cong -> tra mang phong ban

Frontend nao goi:
- `useEffect([currentUser])`

Muc dich:
- Do du lieu vao select phong ban trong form nhan vien.

### `app.get('/api/employees', (req, res) => { ... })`

Loai:
- Route lay nhan vien

Vai tro:
- Lay danh sach nhan vien
- Ho tro tim kiem theo ten hoac ma nhan vien
- Join them ten phong ban

Du lieu nhan:
- `req.query.search`

Luong chay:
1. Lay `search` tu query string
2. Neu rong thi dung chuoi rong
3. Tao cau SQL join `employees` va `departments`
4. Dung `LIKE` de tim kiem
5. Sap xep `ORDER BY e.id DESC`
6. Tra ve ket qua JSON

Frontend nao goi:
- `useEffect([currentUser, searchQuery])`
- `fetchEmployees()`

Tai sao route nay quan trong:
- Day la nguon du lieu chinh cho bang nhan vien.

### `app.post('/api/employees', (req, res) => { ... })`

Loai:
- Route them nhan vien

Vai tro:
- Chen nhan vien moi vao bang `employees`.

Du lieu nhan:
- `ma_nv`
- `full_name`
- `phone`
- `gender`
- `dept_id`
- `position`
- `base_salary`
- `status`

Luong chay:
1. Tach du lieu tu `req.body`
2. Chay cau `INSERT`
3. Neu trung `ma_nv` -> HTTP 400
4. Neu loi khac -> HTTP 500
5. Neu thanh cong -> tra message JSON

Frontend nao goi:
- `handleEmpSubmit()` khi `editId = null`

### `app.put('/api/employees/:id', (req, res) => { ... })`

Loai:
- Route cap nhat nhan vien

Vai tro:
- Sua thong tin nhan vien da ton tai.

Du lieu nhan:
- `req.params.id`
- toan bo du lieu form trong `req.body`

Luong chay:
1. Lay `id` tu URL
2. Lay du lieu nhan vien moi tu body
3. Chay cau `UPDATE ... WHERE id = ?`
4. Neu trung `ma_nv` -> HTTP 400
5. Neu loi khac -> HTTP 500
6. Neu thanh cong -> tra message JSON

Frontend nao goi:
- `handleEmpSubmit()` khi `editId` co gia tri

### `app.delete('/api/employees/:id', (req, res) => { ... })`

Loai:
- Route xoa nhan vien

Vai tro:
- Xoa nhan vien theo id.

Du lieu nhan:
- `req.params.id`

Luong chay:
1. Chay `DELETE FROM employees WHERE id = ?`
2. Neu loi -> HTTP 500
3. Neu thanh cong -> tra message JSON

Frontend nao goi:
- `handleDelete(id)`

### `app.listen(PORT, () => { ... })`

Vai tro:
- Khoi dong backend.

Neu khong co dong nay:
- Server se khong lang nghe request.

No duoc goi khi nao:
- Khi chay lenh:
  `npm start`
  hoac
  `node server.js`

---

## 12. MOT THAO TAC SE DI QUA NHUNG HAM NAO

### Truong hop 1: Dang nhap

Luot chay:
1. Nguoi dung nhap input
2. `setAuthForm(...)`
3. Bam submit
4. `handleAuthSubmit(event)`
5. Frontend goi `POST /api/login`
6. Backend chay route `app.post('/api/login', ...)`
7. Backend tra user
8. Frontend `setCurrentUser(data.user)`
9. `useEffect([currentUser])` chay -> tai phong ban
10. `useEffect([currentUser, searchQuery])` chay -> tai nhan vien
11. Dashboard hien ra

### Truong hop 2: Tim kiem nhan vien

Luot chay:
1. Nguoi dung go o tim kiem
2. `setSearchQuery(...)`
3. `searchQuery` doi
4. `useEffect([currentUser, searchQuery])` chay
5. Frontend goi `GET /api/employees?search=...`
6. Backend chay route `app.get('/api/employees', ...)`
7. Backend tra danh sach da loc
8. Frontend `setEmployees(data)`
9. Bang cap nhat

### Truong hop 3: Them nhan vien

Luot chay:
1. Nguoi dung nhap form
2. Nhieu `onChange` cap nhat `empForm`
3. Bam submit
4. `handleEmpSubmit(event)`
5. Vi `editId = null` nen goi `POST /api/employees`
6. Backend chay route `app.post('/api/employees', ...)`
7. Backend chen database
8. Frontend reset form
9. Frontend goi `fetchEmployees()`
10. Bang hien du lieu moi

### Truong hop 4: Sua nhan vien

Luot chay:
1. Bam nut `Edit`
2. `handleEdit(emp)`
3. `setEmpForm(...)`
4. `setEditId(emp.id)`
5. Form doi sang che do sua
6. Bam submit
7. `handleEmpSubmit(event)`
8. Vi `editId` co gia tri nen goi `PUT /api/employees/:id`
9. Backend chay route `app.put('/api/employees/:id', ...)`
10. Backend cap nhat database
11. Frontend reset ve che do them moi
12. Frontend `fetchEmployees()`

### Truong hop 5: Xoa nhan vien

Luot chay:
1. Bam nut `Delete`
2. `handleDelete(id)`
3. Xac nhan popup
4. Frontend goi `DELETE /api/employees/:id`
5. Backend chay route `app.delete('/api/employees/:id', ...)`
6. Backend xoa ban ghi
7. Frontend goi `fetchEmployees()`
8. Bang mat dong da xoa

---

## 13. NHUNG DIEM NEN NHIN KHI HOC CODE

Neu ban dang hoc project nay, hay doc theo thu tu sau:

1. `frontend/index.html`
2. `frontend/src/main.jsx`
3. `frontend/src/App.jsx`
4. `backend/server.js`
5. `HUONG_DAN_DU_AN.md`
6. File nay

Cach doc de hieu nhanh:

1. Doc ten state truoc
2. Doc 2 `useEffect`
3. Doc `handleAuthSubmit`
4. Doc `handleEmpSubmit`
5. Doc `handleEdit`
6. Doc `handleDelete`
7. Quay lai xem JSX da goi cac ham do o dau

---

## 14. TOM TAT COT LOI

Neu phai tom tat ngan gon nhat thi:

- `main.jsx` khoi dong React
- `App.jsx` quan ly giao dien va goi API
- `server.js` nhan request va thao tac database
- `useEffect` dung de tai du lieu
- `handleAuthSubmit` dung cho dang nhap/dang ky
- `handleEmpSubmit` dung cho them/sua nhan vien
- `handleDelete` dung de xoa
- `handleEdit` dung de nap du lieu len form
- `fetchEmployees` dung de tai lai bang sau CRUD

---

## 15. GOI Y HOC TIEP

Neu ban muon hieu sau hon nua, buoc tiep theo nen lam la:

1. Tach `App.jsx` thanh nhieu component nho
2. Tach cac lenh `fetch` ra file `api.js`
3. Them `try/catch` day du hon cho cac `useEffect`
4. Them `localStorage` de giu trang thai dang nhap
5. Them ma hoa mat khau o backend

