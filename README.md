# 21D RESET
### Hệ thống kiểm soát dopamine 21 ngày · Progressive Web App

---

## Tổng quan

21D RESET là một PWA cá nhân hóa để kiểm soát hành vi bốc đồng và tái lập trình hệ dopamine trong 21 ngày. Không có backend, không đăng nhập, toàn bộ dữ liệu lưu trong thiết bị.

**Stack:** Vanilla HTML/CSS/JS · localStorage · Service Worker

---

## Cấu trúc file

```
21d-reset/
├── index.html          # App shell, UI
├── style.css           # Toàn bộ style, dark theme
├── script.js           # Logic, data, realtime system
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker, offline cache
├── icons/
│   ├── icon-192.png    # PWA icon
│   └── icon-512.png    # PWA icon lớn
└── README.md
```

---

## Chạy local

### Option 1 — Live Server (VS Code)
1. Cài extension **Live Server**
2. Chuột phải `index.html` → **Open with Live Server**
3. App chạy tại `http://127.0.0.1:5500`

### Option 2 — Python
```bash
cd 21d-reset
python3 -m http.server 8080
# Mở http://localhost:8080
```

### Option 3 — Node
```bash
npx http-server -p 8080
```

> Service Worker chỉ hoạt động trên `localhost` hoặc HTTPS.

---

## Deploy (để dùng PWA đúng nghĩa)

### Netlify Drop (nhanh nhất)
1. Vào [app.netlify.com/drop](https://app.netlify.com/drop)
2. Kéo thả toàn bộ folder `21d-reset/` vào trang
3. Netlify tạo URL `https://xxx.netlify.app`
4. Mở URL trên điện thoại

### GitHub Pages
```bash
git init && git add . && git commit -m "init"
git remote add origin https://github.com/USERNAME/21d-reset.git
git push -u origin main
# Settings → Pages → Branch: main
```

### Vercel
```bash
npx vercel --prod
```

---

## Add to Home Screen

### iPhone (Safari)
1. Mở URL trong **Safari**
2. Nhấn **Share** → **Add to Home Screen**
3. Đặt tên **21D RESET** → **Add**

### Android (Chrome)
1. Mở URL trong **Chrome**
2. Menu **3 chấm** → **Add to Home Screen** hoặc **Install App**

---

## Dữ liệu

Toàn bộ lưu trong `localStorage` với key `reset21_v7`.

### Xem dữ liệu
```javascript
// Console (F12):
JSON.parse(localStorage.getItem('reset21_v7'))
```

### Export backup
```javascript
const data = localStorage.getItem('reset21_v7');
const a = Object.assign(document.createElement('a'), {
  href: URL.createObjectURL(new Blob([data], {type:'application/json'})),
  download: '21d-reset-backup.json'
});
a.click();
```

### Import backup
```javascript
const input = Object.assign(document.createElement('input'), {type:'file', accept:'.json'});
input.onchange = e => {
  const r = new FileReader();
  r.onload = x => { localStorage.setItem('reset21_v7', x.target.result); location.reload(); };
  r.readAsText(e.target.files[0]);
};
input.click();
```

### Reset toàn bộ
```javascript
localStorage.removeItem('reset21_v7');
location.reload();
```

> **Lưu ý:** Incognito mode không lưu localStorage. Backup JSON mỗi tuần.

---

## Tính năng

| Tính năng | Mô tả |
|---|---|
| Streak 21 ngày | Đếm ngày liên tục, reset mềm khi tái phạm |
| Hồi phục não | Progress bar + 6 mốc khoa học từ ngày 1–21 |
| Cam kết hôm nay | Nghi thức bắt đầu ngày, reset mỗi ngày |
| Trạng thái ngày | 4 cấp độ từ Bão thôi thúc → Tỉnh táo |
| Thanh năng lượng | Log mức kỷ luật sáng/tối |
| Nhiệm vụ tuỳ chỉnh | Thêm/xoá/sửa nhiệm vụ hàng ngày |
| Khung giờ nguy hiểm | Cảnh báo tự động 3h chiều / 21h–02h |
| Quy trình 90 giây | Hít thở + 5 bước khi lên cơn |
| Lịch sử cơn thèm | Ghi trigger, cường độ 1–10, kết quả |
| Hành động thay thế | Gợi ý cụ thể theo trigger |
| Đóng ngày | Nghi thức tổng kết + gợi ý ngày mai |
| Thống kê | Kỷ lục / Tổng ngày sạch / Cơn vượt / Tái phạm |
| Realtime | Đồng hồ, phát hiện qua ngày, resume từ nền |
| Offline | Service Worker cache toàn bộ app |

---

## Troubleshooting

**Service Worker không active:**
App phải chạy trên `localhost` hoặc HTTPS. `file://` không hỗ trợ SW.

**Dữ liệu mất sau khi đóng app:**
Kiểm tra có đang dùng Incognito không.

**Icon không hiển thị trên iPhone:**
Dùng Safari để Add to Home Screen, không dùng Chrome trên iOS.

**Streak hiển thị sai sau khi tái phạm:**
Đúng — tái phạm reset về ngày 1, không về 0. Đây là thiết kế cố ý.

---

*21D RESET · Vanilla PWA · Không AI · Không backend · Không cloud*
