# HUONG DAN DU AN QUAN LY NHAN SU NHOM 4

## 1. Tong quan cau truc

Du an duoc chia thanh 2 phan chinh:

- `backend/`: API Node.js + Express ket noi den co so du lieu TiDB Cloud.
- `frontend/`: giao dien React + Vite + Tailwind de quan ly nhan su.

Nhung file quan trong nhat:

- `backend/server.js`: diem vao cua backend, khai bao ket noi database va toan bo API.
- `backend/package.json`: dinh nghia thu vien va script chay backend.
- `frontend/src/main.jsx`: diem vao cua frontend, render `App` vao `#root`.
- `frontend/src/App.jsx`: file giao dien va xu ly chinh cua project.
- `frontend/src/index.css`: nap Tailwind va style nen tong the.
- `frontend/index.html`: trang HTML goc de Vite mount ung dung.
- `frontend/.env.example`: mau bien moi truong de frontend goi backend local.

## 2. Luong chay tong the

### 2.1 Luc khoi dong frontend

1. Trinh duyet mo `frontend/index.html`.
2. File nay nap `frontend/src/main.jsx`.
3. `main.jsx` render component `App`.
4. `App.jsx` kiem tra `currentUser`.
5. Neu `currentUser = null`, man hinh dang nhap/dang ky se hien ra.
6. Neu `currentUser` co gia tri, dashboard quan ly nhan su se hien ra.

### 2.2 Luc dang nhap / dang ky

1. Nguoi dung nhap thong tin vao form.
2. `handleAuthSubmit()` duoc goi khi bam nut submit.
3. Frontend goi:
   - `POST /api/login` neu dang o che do dang nhap
   - `POST /api/register` neu dang o che do dang ky
4. Backend trong `server.js` nhan request, truy van bang `users`.
5. Neu thanh cong:
   - dang nhap: backend tra user, frontend luu vao `currentUser`
   - dang ky: frontend thong bao thanh cong va quay ve che do dang nhap

### 2.3 Sau khi dang nhap

Khi `currentUser` thay doi:

1. `useEffect` thu nhat goi `fetchDepartments()`.
2. `fetchDepartments()` goi `GET /api/departments`.
3. Danh sach phong ban duoc luu vao state `departments`.
4. Neu form nhan vien chua co phong ban mac dinh thi lay phong ban dau tien.

Dong thoi:

1. `useEffect` thu hai goi `fetchEmployees()`.
2. `fetchEmployees()` goi `GET /api/employees?search=...`.
3. Backend join bang `employees` voi `departments`.
4. Frontend luu ket qua vao state `employees`.
5. Bang nhan vien tren giao dien duoc render lai.

### 2.4 Tim kiem nhan vien

1. Nguoi dung nhap vao o tim kiem.
2. `searchQuery` thay doi.
3. `useEffect` theo doi `searchQuery` duoc chay lai.
4. Frontend goi lai `fetchEmployees()`.
5. Backend loc theo `full_name` hoac `ma_nv`.

### 2.5 Them nhan vien moi

1. Nguoi dung nhap form ben trai.
2. `handleEmpSubmit()` duoc goi.
3. Neu `editId = null`, frontend goi `POST /api/employees`.
4. Backend chen du lieu vao bang `employees`.
5. Neu thanh cong, frontend:
   - reset form
   - goi lai `fetchEmployees()`
   - hien alert thong bao

### 2.6 Sua nhan vien

1. Nguoi dung bam nut `Edit` o dong nhan vien.
2. `handleEdit(emp)` dua du lieu len form.
3. `editId` duoc gan bang `id` cua nhan vien.
4. Khi submit, frontend goi `PUT /api/employees/:id`.
5. Backend cap nhat ban ghi tuong ung.
6. Frontend tai lai danh sach va dua form ve che do them moi.

### 2.7 Xoa nhan vien

1. Nguoi dung bam nut `Delete`.
2. `handleDelete(id)` hien hop xac nhan.
3. Neu dong y, frontend goi `DELETE /api/employees/:id`.
4. Backend xoa ban ghi trong database.
5. Frontend tai lai danh sach nhan vien.

## 3. Cac API backend

- `POST /api/register`: tao tai khoan moi.
- `POST /api/login`: dang nhap.
- `GET /api/departments`: lay danh sach phong ban.
- `GET /api/employees?search=...`: lay va tim kiem nhan vien.
- `POST /api/employees`: them nhan vien.
- `PUT /api/employees/:id`: cap nhat nhan vien.
- `DELETE /api/employees/:id`: xoa nhan vien.

## 4. Cac state quan trong trong frontend

- `currentUser`: xac dinh da dang nhap hay chua.
- `isLoginMode`: chuyen doi giua form dang nhap va dang ky.
- `authForm`: du lieu cua form xac thuc.
- `employees`: danh sach nhan vien hien tren bang.
- `departments`: danh sach phong ban cho o select.
- `searchQuery`: tu khoa tim kiem.
- `empForm`: du lieu form them/sua nhan vien.
- `editId`: neu co gia tri thi dang sua, neu `null` thi dang them moi.

## 5. Cach chay project

### 5.1 Chay backend

Mo terminal trong thu muc `backend` va chay:

```powershell
npm install
npm start
```

Mac dinh backend se chay o `http://localhost:3000`.

### 5.2 Chay frontend

Mo terminal khac trong thu muc `frontend` va chay:

```powershell
npm install
npm run dev
```

Neu muon frontend goi backend local thay vi backend da deploy, tao file `.env` trong thu muc `frontend/` voi noi dung:

```env
VITE_API_URL=http://localhost:3000
```

Da co san file mau `frontend/.env.example` de tham khao.

Sau do mo URL ma Vite hien ra, thuong la `http://localhost:5173`.

## 6. Thu tu doc code de de hieu nhat

Neu ban muon hoc luong chay cua project, nen doc theo thu tu nay:

1. `frontend/index.html`
2. `frontend/src/main.jsx`
3. `frontend/src/App.jsx`
4. `backend/server.js`
5. `frontend/tailwind.config.js`
6. `frontend/vite.config.js`

## 7. Luu y ky thuat

- Frontend hien dang luu trang thai dang nhap trong RAM, nen tai lai trang se mat phien dang nhap.
- Backend dang so sanh mat khau truc tiep trong database, chua bam mat khau.
- Thong tin ket noi database hien dang nam trong ma nguon backend. Ve sau nen dua ra bien moi truong de an toan hon.
- Nhieu style dang viet truc tiep bang class Tailwind trong JSX, nen file `App.jsx` la noi can doc ky nhat.

## 8. Ban da duoc minh bo sung gi

- Them comment truc tiep vao cac file code chinh va file cau hinh.
- Them script `npm start` cho backend.
- Them file mau bien moi truong `frontend/.env.example`.
- Tach ro hon luong tai phong ban va luong tai nhan vien trong `App.jsx`.
