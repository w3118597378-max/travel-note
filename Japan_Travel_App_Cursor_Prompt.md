# 🗾 日本自駕旅遊 PWA App — Cursor 完整開發提示詞

> 使用方式：將本文件全文貼入 Cursor 的 AI Chat（或 Composer），讓 Cursor Agent 逐步建構整個專案。

---

## 🎯 專案概覽

請幫我建立一個「日本自駕旅遊行程 PWA App」，使用者是自駕旅行者，需要在手機上即時查看行程、導航、天氣、景點攻略，以及記帳與旅行資訊。

**技術棧：**
- Frontend: React 18 + TypeScript + Vite
- 樣式: Tailwind CSS + shadcn/ui
- PWA: vite-plugin-pwa（離線可用）
- 路由: React Router v6
- 狀態管理: Zustand
- 資料庫 (記帳模組): Firebase Firestore
- 地圖/導航: Google Maps URL Scheme（直接喚起手機地圖 App）
- 天氣: Open-Meteo API（免費、無需 API Key）
- 部署: GitHub → Kinsta Static Site Hosting

---

## 🎨 視覺設計規格

**主題：日系旅途風格（Travel Journal × Soft Organic）**

- 色票：
  - 主色 `--ink: #2D2A26`（墨色）
  - 背景 `--paper: #FAF7F2`（和紙米白）
  - 強調 `--vermillion: #C0392B`（朱紅，日式印章感）
  - 次要 `--moss: #5C7A5C`（苔綠，自然感）
  - 卡片底 `--card: #FFFFFF`
  - 邊框 `--border: #E8E3DC`

- 字型：
  - 標題：`Noto Serif JP`（Google Fonts，日文混排優美）
  - 內文：`Noto Sans JP`（清晰易讀）
  - 數字/英文強調：`DM Serif Display`

- 設計語言：
  - 卡片使用細邊框 + 微陰影，圓角 `12px`
  - 重要資訊標籤用印章/貼紙風格（橢圓或圓角矩形 + 色塊）
  - 景點卡頂部加細紅線裝飾（如和風書籤）
  - 底部導航 Tab Bar，Icon + 文字，背景模糊效果
  - 頁面切換使用滑動動畫（`framer-motion` slide transition）

---

## 📁 專案資料夾結構

請建立以下結構：

```
japan-trip-app/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── icons/                 # App icons (192x192, 512x512)
│   └── offline.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── router.tsx
│   ├── data/
│   │   └── itinerary.ts       # 行程硬編碼資料（見下方資料規格）
│   ├── pages/
│   │   ├── Home.tsx           # 今日行程 / 行程總覽
│   │   ├── DayDetail.tsx      # 單日詳細行程
│   │   ├── Info.tsx           # 航班+住宿+緊急聯絡
│   │   └── Budget.tsx         # 記帳/預算頁
│   ├── components/
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx
│   │   │   └── PageHeader.tsx
│   │   ├── cards/
│   │   │   ├── AttractionCard.tsx
│   │   │   ├── RestaurantCard.tsx
│   │   │   └── TransportCard.tsx
│   │   ├── widgets/
│   │   │   ├── WeatherWidget.tsx
│   │   │   ├── NavigateButton.tsx
│   │   │   ├── TagBadge.tsx
│   │   │   └── TipSection.tsx
│   │   └── budget/
│   │       ├── ExpenseForm.tsx
│   │       ├── ExpenseList.tsx
│   │       └── BudgetSummary.tsx
│   ├── hooks/
│   │   ├── useWeather.ts
│   │   └── useBudget.ts
│   ├── lib/
│   │   ├── firebase.ts
│   │   └── utils.ts
│   └── styles/
│       └── globals.css
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 📊 行程資料規格（`src/data/itinerary.ts`）

請定義以下 TypeScript 型別並填入行程資料：

```typescript
// 卡片類型
type CardType = 'attraction' | 'restaurant' | 'transport' | 'hotel'

// 特殊標籤類型
type SpecialTag = 
  | 'must-eat'        // 必吃美食 → 朱紅色標籤
  | 'must-order'      // 必點菜單 → 橘色標籤
  | 'must-buy'        // 必買伴手禮 → 紫色標籤
  | 'reservation'     // 重要預約 → 藍色標籤（附預約代號）
  | 'tip'             // 攻略小貼士 → 綠色標籤
  | 'story'           // 景點故事 → 棕色標籤

interface SpecialInfo {
  tag: SpecialTag
  text: string
  code?: string       // 預約代號（reservation 類型使用）
}

interface Location {
  name: string
  address: string
  lat: number
  lng: number
  googleMapsUrl?: string  // 直接打開 Google Maps 導航
  appleMapsUrl?: string   // Apple Maps 備用
}

interface ItineraryCard {
  id: string
  type: CardType
  time?: string           // e.g. "09:00"
  title: string           // 景點/餐廳名稱（中日文對照）
  titleJa?: string        // 日文原名
  description: string     // 簡介
  location?: Location     // 有地址才加導航按鈕
  duration?: string       // e.g. "約1小時"
  cost?: string           // 費用估算
  openHours?: string
  specialInfos?: SpecialInfo[]  // 特殊標籤資訊
  imageUrl?: string       // 可選景點圖片
  tips?: string[]         // 額外攻略
}

interface DayItinerary {
  dayNumber: number
  date: string            // e.g. "2025-03-15"
  title: string           // e.g. "東京 → 箱根"
  region: string          // 用於抓天氣的城市名
  weatherLat: number      // 天氣 API 座標
  weatherLng: number
  cards: ItineraryCard[]
}

interface TripData {
  tripName: string
  year: number
  totalDays: number
  days: DayItinerary[]
  flightInfo: FlightInfo[]
  hotelInfo: HotelInfo[]
  emergencyContacts: EmergencyContact[]
  budget: BudgetConfig
}
```

**⚠️ 重要：請根據以下行程內容填入資料（若 PDF 未附，請使用範例資料，之後用戶可自行替換）**

使用以下範例日程作為資料填充範本（共 5 天）：

```typescript
// 範例資料結構，請依實際 PDF 行程替換
const tripData: TripData = {
  tripName: "日本自駕之旅",
  year: 2025,
  totalDays: 7,
  days: [
    {
      dayNumber: 1,
      date: "2025-04-01",
      title: "抵達東京・淺草散策",
      region: "Tokyo",
      weatherLat: 35.6762,
      weatherLng: 139.6503,
      cards: [
        {
          id: "d1-1",
          type: "transport",
          time: "11:30",
          title: "成田機場 → 東京市區",
          description: "搭乘利木津巴士或成田特快前往酒店，約 60-90 分鐘",
          cost: "約 ¥3,000/人",
          tips: ["建議預購 Suica 交通卡，方便後續自駕前的市區移動"]
        },
        {
          id: "d1-2",
          type: "attraction",
          time: "14:00",
          title: "淺草寺",
          titleJa: "浅草寺",
          description: "東京最古老的寺院，建於 628 年，雷門大燈籠是東京代表性地標。仲見世商店街長達 250 公尺，販售各式傳統工藝品與小吃。",
          location: {
            name: "淺草寺",
            address: "東京都台東区浅草2-3-1",
            lat: 35.7148,
            lng: 139.7967,
            googleMapsUrl: "https://maps.google.com/?q=35.7148,139.7967"
          },
          duration: "約 1.5 小時",
          cost: "免費",
          openHours: "24小時（本堂 06:00-17:00）",
          specialInfos: [
            {
              tag: "must-buy",
              text: "仲見世的「人形燒」和「雷おこし」是經典伴手禮"
            },
            {
              tag: "tip",
              text: "建議早晨 8 點前或傍晚前往，人潮較少且光線絕美"
            },
            {
              tag: "story",
              text: "傳說漁夫在隅田川打魚時撈起觀音像，當地領主便在此建寺供奉，為東京最古老的信仰中心"
            }
          ]
        },
        {
          id: "d1-3",
          type: "restaurant",
          time: "18:00",
          title: "大黒家天麩羅",
          titleJa: "大黒家天麩羅",
          description: "創業超過 130 年的老字號天婦羅店，使用芝麻油炸制，顏色偏深、香氣濃郁，與一般天婦羅風味截然不同。",
          location: {
            name: "大黒家天麩羅 本店",
            address: "東京都台東区浅草1-38-10",
            lat: 35.7118,
            lng: 139.7964,
            googleMapsUrl: "https://maps.google.com/?q=35.7118,139.7964"
          },
          openHours: "11:00-21:00（週一公休）",
          cost: "¥2,000-3,000/人",
          specialInfos: [
            {
              tag: "must-eat",
              text: "天丼（天婦羅丼）是必點招牌，濃厚芝麻醬汁配蝦天婦羅"
            },
            {
              tag: "must-order",
              text: "天婦羅定食：蝦 × 2、穴子、野菜、白飯、味噌湯"
            },
            {
              tag: "tip",
              text: "午餐時段排隊約 30-60 分，建議 11 點開門前到場"
            }
          ]
        }
      ]
    },
    // ... 後續天數依此格式繼續
  ],
  flightInfo: [
    {
      id: "fl-1",
      airline: "長榮航空",
      flightNo: "BR2196",
      route: "台北（TPE）→ 東京成田（NRT）",
      departure: "2025-04-01 08:30",
      arrival: "2025-04-01 12:45",
      terminal: "第2航廈",
      bookingRef: "ABCD12",
      notes: "行李額度 23kg × 2件"
    },
    {
      id: "fl-2",
      airline: "長榮航空",
      flightNo: "BR2195",
      route: "東京成田（NRT）→ 台北（TPE）",
      departure: "2025-04-07 14:30",
      arrival: "2025-04-07 17:50",
      terminal: "第2航廈",
      bookingRef: "ABCD13",
      notes: "提前3小時到機場"
    }
  ],
  hotelInfo: [
    {
      id: "ht-1",
      name: "東京淺草 Richmond Hotel",
      nights: "4/1 - 4/3（2晚）",
      address: "東京都台東区浅草1-15-2",
      phone: "+81-3-5806-1234",
      checkIn: "15:00",
      checkOut: "11:00",
      bookingRef: "HTL-00123",
      lat: 35.7120,
      lng: 139.7963,
      googleMapsUrl: "https://maps.google.com/?q=35.7120,139.7963",
      notes: "提供停車場（需預約，¥1,500/晚）"
    }
  ],
  emergencyContacts: [
    { category: "警察", name: "日本警察", phone: "110", note: "遺失物報案" },
    { category: "救護/消防", name: "緊急救援", phone: "119", note: "醫療緊急" },
    { category: "道路救援", name: "JAF 道路救援", phone: "0570-00-8139", note: "租車拋錨" },
    { category: "租車公司", name: "Nippon Rent-A-Car", phone: "0120-123-456", note: "行程預約代碼: NRC-789" },
    { category: "台灣駐日代表處", name: "緊急聯絡", phone: "+81-3-3280-7830", note: "護照遺失 24小時" },
    { category: "信用卡掛失", name: "Visa 國際", phone: "00531-44-0022", note: "" },
    { category: "旅遊保險", name: "國泰產險", phone: "0800-058-888", note: "保單號: INS-456789" }
  ],
  budget: {
    totalBudget: 80000,  // 新台幣
    currency: "TWD",
    exchangeRate: 0.22,  // TWD to JPY 參考匯率
    categories: ["交通", "住宿", "餐飲", "景點門票", "購物", "雜費"]
  }
}
```

---

## 🖥️ 頁面規格

### 1. `Home.tsx` — 首頁（今日行程）

- **頂部**：App 標題 + 旅行天數 badge（第 X 天 / 共 Y 天）
- **今日天氣區塊**：調用 `useWeather` hook，顯示：
  - 天氣圖示 + 溫度（最高/最低）
  - 體感溫度、降雨機率
  - 3 小時間隔預報橫向捲動條
- **今日行程卡片列表**：依時間順序排列
- **底部**：「查看完整行程」按鈕，跳到行程總覽

### 2. `DayDetail.tsx` — 每日詳細行程

- 頂部 Header：日期、地區名、天氣縮略圖
- 時間軸佈局（垂直 timeline，左側時間，右側卡片）
- 三種卡片樣式：
  - **景點卡** `AttractionCard`：朱紅頂邊線、景點名（中日對照）、簡介、特殊標籤
  - **餐廳卡** `RestaurantCard`：橘色頂邊線、必吃/必點標籤突出顯示
  - **交通卡** `TransportCard`：灰色，簡潔，箭頭指向設計
- 每張有地址的卡片底部加 **導航按鈕**（NavigateButton）

### 3. `Info.tsx` — 旅行資訊頁（分 Tab）

Tab 分三區：
- **✈️ 航班**：去程/回程卡片，顯示航班號、時間、訂位代碼
- **🏨 住宿**：每晚住宿資訊 + 導航按鈕
- **🆘 緊急聯絡**：分類列表，每筆可直接點擊撥打電話（`tel:` 協議）

### 4. `Budget.tsx` — 記帳頁

- **預算進度條**：已花費 / 總預算（以新台幣顯示）
- **類別圓餅圖**（使用 recharts）
- **新增支出表單**：金額、類別、備註、日期
- **支出明細列表**：可刪除單筆
- **匯率換算小工具**：輸入日圓，即時顯示台幣金額
- 資料儲存：**Firebase Firestore**（雲端同步）+ `localStorage` 離線備份

---

## 🧩 元件規格

### `WeatherWidget.tsx`
```typescript
// 使用 Open-Meteo API（免費、無需 API Key）
// API: https://api.open-meteo.com/v1/forecast
// 參數: latitude, longitude, hourly=temperature_2m,precipitation_probability,weathercode
// 天氣圖示: 使用 weathercode 對應 emoji 或 lucide-react icon

const weatherCodeMap: Record<number, { icon: string; label: string }> = {
  0: { icon: "☀️", label: "晴天" },
  1: { icon: "🌤", label: "多雲時晴" },
  2: { icon: "⛅", label: "局部多雲" },
  3: { icon: "☁️", label: "陰天" },
  45: { icon: "🌫", label: "霧" },
  51: { icon: "🌦", label: "毛毛雨" },
  61: { icon: "🌧", label: "小雨" },
  71: { icon: "❄️", label: "小雪" },
  80: { icon: "🌧", label: "陣雨" },
  95: { icon: "⛈", label: "雷雨" },
}
```

### `NavigateButton.tsx`
```typescript
// 智慧偵測裝置，決定打開 Google Maps 或 Apple Maps
const NavigateButton = ({ location }: { location: Location }) => {
  const handleNavigate = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    
    if (isIOS && location.appleMapsUrl) {
      // Apple Maps
      window.open(`maps://maps.apple.com/?q=${location.lat},${location.lng}`)
    } else {
      // Google Maps（Android / 桌機）
      window.open(`https://maps.google.com/?q=${location.lat},${location.lng}`)
    }
  }
  
  return (
    <button onClick={handleNavigate} className="navigate-btn">
      🧭 導航前往
    </button>
  )
}
```

### `TagBadge.tsx`
```typescript
// 不同標籤對應不同顏色風格（印章/貼紙感）
const tagStyles = {
  'must-eat':    'bg-red-100 text-red-700 border-red-300',      // 🍜 必吃
  'must-order':  'bg-orange-100 text-orange-700 border-orange-300', // 📋 必點
  'must-buy':    'bg-purple-100 text-purple-700 border-purple-300', // 🛍️ 必買
  'reservation': 'bg-blue-100 text-blue-700 border-blue-300',   // 📅 預約
  'tip':         'bg-green-100 text-green-700 border-green-300', // 💡 攻略
  'story':       'bg-amber-100 text-amber-700 border-amber-300', // 📖 故事
}
// 每個 badge 左側加對應 emoji icon
// reservation 類型額外顯示代號 code（粗體、底線）
```

---

## 🔥 Firebase 設定（記帳模組）

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// 請在 .env.local 設定以下環境變數
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Firestore 資料結構：
// trips/{tripId}/expenses/{expenseId}
// {
//   amount: number,        // 金額（日圓）
//   amountTWD: number,     // 換算台幣
//   category: string,
//   note: string,
//   date: Timestamp,
//   day: number,           // 第幾天
//   createdAt: Timestamp
// }
```

---

## 📱 PWA 設定

### `public/manifest.json`
```json
{
  "name": "日本自駕旅遊",
  "short_name": "JP Trip",
  "description": "日本自駕行程旅遊工具",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FAF7F2",
  "theme_color": "#C0392B",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### `vite.config.ts` — PWA 設定
```typescript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            // 快取天氣 API（5 分鐘更新）
            urlPattern: /^https:\/\/api\.open-meteo\.com/,
            handler: 'NetworkFirst',
            options: { cacheName: 'weather-cache', expiration: { maxAgeSeconds: 300 } }
          },
          {
            // 快取 Google Fonts
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
            handler: 'CacheFirst',
            options: { cacheName: 'fonts-cache', expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 } }
          }
        ]
      }
    })
  ]
})
```

---

## 🚀 部署流程（GitHub → Kinsta）

請在 `README.md` 中撰寫以下部署步驟：

### Step 1: 初始化 Git
```bash
git init
git add .
git commit -m "feat: initial Japan trip PWA app"
git remote add origin https://github.com/YOUR_USERNAME/japan-trip-app.git
git push -u origin main
```

### Step 2: GitHub Actions 自動部署
建立 `.github/workflows/deploy.yml`：
```yaml
name: Deploy to Kinsta
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: '18' }
      - run: npm ci
      - run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
      # Kinsta 支援從 GitHub 自動拉取 Static Site，
      # 在 Kinsta 控制台設定：Build path = dist，Build command = npm run build
```

### Step 3: Kinsta Static Site 設定
1. 登入 Kinsta → Static Sites → Add Site
2. 連結 GitHub repo
3. Build command: `npm run build`
4. Publish directory: `dist`
5. 加入所有 `VITE_FIREBASE_*` 環境變數
6. 啟用自訂 domain（可使用 Kinsta 免費 subdomain 或自訂網域）

---

## ✅ 完成 Checklist

請確認以下功能全部實作完成：

**核心功能**
- [ ] 行程資料正確渲染（景點、餐廳、交通三種卡片）
- [ ] 每日行程頂部顯示即時天氣（Open-Meteo API）
- [ ] 有地址的卡片顯示「導航按鈕」，正確喚起地圖 App
- [ ] 特殊標籤（必吃/必點/必買/預約/攻略/故事）以顏色標籤顯示
- [ ] 底部 Tab 導航（首頁、行程、資訊、記帳）

**旅行工具**
- [ ] 航班資訊卡片完整顯示
- [ ] 住宿資訊含導航按鈕
- [ ] 緊急聯絡可一鍵撥號

**記帳功能**
- [ ] 新增/刪除支出
- [ ] 類別圓餅圖
- [ ] 日圓 ↔ 台幣即時換算
- [ ] Firebase 雲端同步 + localStorage 離線備份

**PWA**
- [ ] 可加入主畫面
- [ ] 離線可瀏覽已快取行程
- [ ] 手機底部安全區域（safe-area-inset）適配

---

## 📝 附加說明

1. **行程資料填充**：請根據使用者提供的 PDF 行程內容，將 `src/data/itinerary.ts` 中的範例資料替換為真實行程（若使用者已提供 PDF 請解析其內容填入）。

2. **景點攻略自動生成**：對於每個景點，請根據你的知識庫自動補充：
   - 1-2 個歷史文化故事（`story` 標籤）
   - 2-3 個實用攻略（`tip` 標籤）
   - 必吃/必買建議（`must-eat` / `must-buy` 標籤）

3. **響應式設計**：所有元件以 375px（iPhone SE）為基準設計，同時支援 430px（iPhone Pro Max）和平板。

4. **無障礙**：按鈕最小點擊區域 44×44px，色彩對比度符合 WCAG AA 標準。

5. **效能**：首屏 LCP < 2.5s，使用 lazy loading 和 React.memo 優化重渲染。
