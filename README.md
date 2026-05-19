# LYFT — DOPAMINE RESET 21
### Neural Rewire System · Progressive Web App

---

## Tổng quan

LYFT Dopamine Reset là một PWA (Progressive Web App) cá nhân hóa cho chương trình cai nghiện dopamine 21 ngày — bao gồm gamification system, AI narrator, journal, boss battles, và daily tracking.

**Stack:** Vanilla HTML/CSS/JS · localStorage · Anthropic API · Service Worker

---

## Cấu trúc file

```
lyft-pwa/
├── index.html          # App shell, UI structure
├── style.css           # All styles, dark theme
├── script.js           # App logic, data, API calls
├── manifest.json       # PWA manifest
├── service-worker.js   # Offline caching
├── icons/              # App icons (cần tạo thủ công)
│   ├── icon-72.png
│   ├── icon-96.png
│   ├── icon-128.png
│   ├── icon-144.png
│   ├── icon-152.png
│   ├── icon-192.png
│   ├── icon-384.png
│   └── icon-512.png
└── README.md
```

---

## Setup Icons

App cần icons để hiển thị đúng trên màn hình điện thoại.

**Cách nhanh nhất:** Dùng [RealFaviconGenerator](https://realfavicongenerator.net) hoặc [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator).

```bash
# Nếu có npm:
npx pwa-asset-generator logo.png icons/
```

Hoặc tạo thủ công: một ảnh PNG nền đen `#0e0e0d` với chữ **LYFT** màu `#F5F0E8`, export ra các kích thước trên.

---

## Chạy local (VS Code)

### Option 1 — Live Server (khuyên dùng)

1. Cài extension **Live Server** trong VS Code
2. Chuột phải vào `index.html`
3. Chọn **Open with Live Server**
4. App chạy tại `http://127.0.0.1:5500`

> **Lưu ý:** Service Worker chỉ hoạt động trên `localhost` hoặc HTTPS. Live Server dùng localhost nên hoạt động bình thường.

### Option 2 — Python HTTP Server

```bash
cd lyft-pwa
python3 -m http.server 8080
# Mở http://localhost:8080
```

### Option 3 — Node http-server

```bash
npm install -g http-server
cd lyft-pwa
http-server -p 8080
```

---

## Cấu hình Anthropic API

App dùng Anthropic API để generate AI narrative. API key được xử lý qua Claude artifact proxy — **không cần cấu hình thêm khi chạy trong Claude**.

Nếu deploy standalone (ngoài Claude):

1. Tạo file `config.js` (không commit lên git):

```javascript
// config.js
window.ANTHROPIC_API_KEY = 'sk-ant-...';
```

2. Thêm vào `index.html` trước `script.js`:

```html
<script src="config.js"></script>
```

3. Trong `script.js`, thêm header Authorization:

```javascript
headers: {
  'Content-Type': 'application/json',
  'x-api-key': window.ANTHROPIC_API_KEY,
  'anthropic-version': '2023-06-01',
  'anthropic-dangerous-direct-browser-access': 'true'
}
```

> **Bảo mật:** Không bao giờ commit API key. Thêm `config.js` vào `.gitignore`.

---

## Deploy lên web (để dùng PWA đúng nghĩa)

PWA cần HTTPS để hoạt động đầy đủ (Service Worker, Add to Home Screen).

### Option 1 — Netlify (miễn phí, dễ nhất)

1. Vào [netlify.com/drop](https://app.netlify.com/drop)
2. Kéo thả toàn bộ folder `lyft-pwa/` vào trang
3. Netlify tạo URL như `https://random-name.netlify.app`
4. Mở URL trên điện thoại

### Option 2 — Netlify CLI

```bash
npm install -g netlify-cli
cd lyft-pwa
netlify deploy --prod --dir .
```

### Option 3 — GitHub Pages

```bash
cd lyft-pwa
git init
git add .
git commit -m "init"
git branch -M main
git remote add origin https://github.com/USERNAME/lyft-reset.git
git push -u origin main
# Bật GitHub Pages trong Settings → Pages → Branch: main
```

### Option 4 — Vercel

```bash
npm install -g vercel
cd lyft-pwa
vercel --prod
```

---

## Add to Home Screen (iOS/Android)

### iPhone (Safari)

1. Mở URL của app trong **Safari** (không phải Chrome)
2. Nhấn biểu tượng **Share** (hình vuông có mũi tên lên)
3. Scroll xuống, chọn **Add to Home Screen**
4. Đặt tên **LYFT RESET** và nhấn **Add**
5. Icon xuất hiện trên màn hình chính

### Android (Chrome)

1. Mở URL trong **Chrome**
2. Nhấn menu **3 chấm** góc trên phải
3. Chọn **Add to Home Screen** hoặc **Install App**
4. Xác nhận

> **Sau khi add:** App mở full screen, không có thanh browser, giống app thật. localStorage được giữ lại giữa các lần mở.

---

## Dữ liệu và Backup

### Lưu ở đâu
Toàn bộ dữ liệu (XP, streak, journal, narrative) lưu trong `localStorage` với key `lyft_dopamine_v1`.

### Xem dữ liệu thô
Mở DevTools (F12) → Console → gõ:
```javascript
JSON.parse(localStorage.getItem('lyft_dopamine_v1'))
```

### Export backup
```javascript
// Trong Console:
const data = localStorage.getItem('lyft_dopamine_v1');
const blob = new Blob([data], {type: 'application/json'});
const url  = URL.createObjectURL(blob);
const a    = document.createElement('a');
a.href     = url;
a.download = 'lyft-backup.json';
a.click();
```

### Import backup
```javascript
// Trong Console:
const input = document.createElement('input');
input.type  = 'file';
input.accept = '.json';
input.onchange = e => {
  const reader = new FileReader();
  reader.onload = r => {
    localStorage.setItem('lyft_dopamine_v1', r.target.result);
    location.reload();
  };
  reader.readAsText(e.target.files[0]);
};
input.click();
```

### Reset toàn bộ
```javascript
// Trong Console (KHÔNG THỂ KHÔI PHỤC):
localStorage.removeItem('lyft_dopamine_v1');
location.reload();
```

### Nguy cơ mất dữ liệu
- Xóa cache/history trình duyệt
- Xóa app Safari/Chrome
- Đổi thiết bị
- Dùng Incognito mode

**Khuyến nghị:** Backup JSON mỗi tuần + screenshot Narrative Log.

---

## Cách sử dụng hàng ngày

### Sáng (2 phút)
1. Mở app
2. Đọc AI Narrator
3. Xem quests hôm nay

### Khi có urge
1. Mở Journal → loại Urge
2. Ghi ngay lúc đó (không sau)
3. Hoặc dùng Emergency Mode (nút đỏ)

### Tối trước ngủ (5 phút)
1. Vào tab Quests
2. Tick các quest đã làm
3. Nhấn GHI NHẬN NGÀY → nhận XP
4. Viết Journal entry (Daily/Win/Insight)

### Khi vượt qua boss trigger
1. Vào tab Boss
2. Nhấn Counter-Attack trên boss tương ứng
3. +30 XP

---

## Hệ thống XP

| Hành vi | XP |
|---|---|
| Không mua cần sa | +30 |
| Không mại dâm | +30 |
| Deep work 25 phút | +25 |
| Workout / Pickleball | +20 |
| Điện thoại <2h | +20 |
| 1 action Lyft Zone | +20 |
| Đọc sách 20 phút | +15 |
| Ngủ trước 11:30 | +15 |
| Thiền 10 phút | +10 |
| Uống đủ nước | +10 |
| Viết journal | +5 |
| Counter-attack boss | +30 |
| **Relapse** | **-50** |

---

## Troubleshooting

**App không load được font / icon:**
→ Không cần font ngoài, app dùng Arial. Icons cần tạo thủ công (xem phần Setup Icons).

**AI Narrator không hoạt động:**
→ Kiểm tra kết nối internet. Khi offline, narrator hiển thị fallback text. Dữ liệu vẫn được lưu bình thường.

**Dữ liệu bị mất sau khi đóng app:**
→ Kiểm tra có đang dùng Incognito mode không. Incognito không lưu localStorage.

**Service Worker không active:**
→ App phải chạy trên `localhost` hoặc HTTPS. File:// protocol không hỗ trợ Service Worker.

**Lỗi CORS khi gọi Anthropic API:**
→ Khi deploy, cần thêm header `anthropic-dangerous-direct-browser-access: true` và API key hợp lệ.

---

## License

Dự án cá nhân — Chí Đạt × Lyft Zone × Claude.
