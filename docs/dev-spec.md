## 日本自驾旅行 PWA 开发规范（Dev Spec）

> 面向已经熟悉 React/TypeScript 的开发者，目标是让任何人拿着此文档 + UI 设计稿，就能把项目完整实现出来。

---

## 1. 项目概览与目标

- **产品定位**：日本自驾行程助手 + 旅行记账 PWA，主要在手机浏览器中使用，可添加到主屏，离线可浏览行程与基础数据。
- **目标用户**：会自己规划路线、租车自驾的旅行者，多数在国外移动网络不稳定或流量有限的场景下使用。
- **核心场景**：
  - 早上起床看「今天去哪、天气如何」。
  - 在路上快速点开某个景点/餐厅，查看简介、攻略、导航。
  - 记当天开销，控制整体预算。
  - 查航班、酒店、紧急联络方式。
- **非目标（当前版本不做）**：
  - 多用户/多人协作编辑行程。
  - 行程在线编辑器、日历拖拽排程。
  - 登录/权限系统。

**边界假设**：
- App 当前只服务 **一个 Trip（一次旅行）**，所有页面都围绕 `TripData` 展开。
- 行程数据由用户（你）线下编辑 `src/data/itinerary.ts`，前端只读。
- 记账数据是「本地优先」，写入 Firestore 成功则云同步，否则保持在 `localStorage`，等待网络恢复再自动重试。

---

## 2. 技术栈与非功能需求

- **技术栈**：
  - React 18 + TypeScript + Vite
  - Tailwind CSS + shadcn/ui（组件库 + 基础样式）
  - React Router v6
  - Zustand（全局状态管理）
  - Firebase Firestore（仅用于记账数据）
  - PWA：`vite-plugin-pwa`
- **运行环境**：
  - 主要目标：移动 Safari / Chrome (iOS / Android)
  - 次要：桌面 Chrome / Edge

**非功能需求整理**：
- **性能**：
  - 首屏 LCP \< 2.5s（以 4G 网络 + 中端手机为参考）。
  - 分包策略：按页面/路由拆包（Home / DayDetail / Info / Budget）。
  - 使用 `React.lazy` + `Suspense` 对非首屏页面懒加载。
  - 列表组件（行程卡、记账记录）避免不必要重渲染（`React.memo`、合理 key）。
- **离线能力**：
  - 行程数据是打包在 `bundle` 中，离线天然可用。
  - 天气 API 使用 `NetworkFirst`，无法访问网络时读取缓存。
  - 基本静态资源通过 Service Worker 预缓存（HTML、JS、CSS、图标）。
- **可用性与适配**：
  - 以 375px 宽度为主设计，430px 与 iPad 只做简单扩展（增加左右留白，最大宽度 768px）。
  - 支持 iOS 安全区域：底部 Tab 使用 `env(safe-area-inset-bottom)`。
- **无障碍（A11y）**：
  - 所有点击区域 >= 44×44 px。
  - 色彩对比至少符合 WCAG AA。
  - 可点击元素使用语义化标签（`button`, `a`），带 `aria-label`（尤其是只靠图标的按钮）。

---

## 3. 领域模型与数据结构

行程数据全部集中在 `src/data/itinerary.ts`，导出一个只读的 `tripData: TripData`。

### 3.1 核心类型

```ts
// 卡片类型
export type CardType = 'attraction' | 'restaurant' | 'transport' | 'hotel'

// 特殊标签
export type SpecialTag =
  | 'must-eat'
  | 'must-order'
  | 'must-buy'
  | 'reservation'
  | 'tip'
  | 'story'

export interface SpecialInfo {
  tag: SpecialTag
  text: string
  code?: string
}

export interface Location {
  name: string
  address: string
  lat: number
  lng: number
  googleMapsUrl?: string
  appleMapsUrl?: string
}

export interface ItineraryCard {
  id: string
  type: CardType
  time?: string
  title: string
  titleJa?: string
  description: string
  location?: Location
  duration?: string
  cost?: string
  openHours?: string
  specialInfos?: SpecialInfo[]
  imageUrl?: string
  tips?: string[]
}

export interface DayItinerary {
  dayNumber: number
  date: string
  title: string
  region: string
  weatherLat: number
  weatherLng: number
  cards: ItineraryCard[]
}
```

旅行整体数据：

```ts
export interface FlightInfo {
  id: string
  airline: string
  flightNo: string
  route: string
  departure: string
  arrival: string
  terminal?: string
  bookingRef?: string
  notes?: string
}

export interface HotelInfo {
  id: string
  name: string
  nights: string
  address: string
  phone: string
  checkIn?: string
  checkOut?: string
  bookingRef?: string
  lat?: number
  lng?: number
  googleMapsUrl?: string
  notes?: string
}

export interface EmergencyContact {
  category: string
  name: string
  phone: string
  note?: string
}

export interface BudgetConfig {
  totalBudget: number // TWD
  currency: 'TWD'
  exchangeRate: number // TWD -> JPY
  categories: string[]
}

export interface TripData {
  tripName: string
  year: number
  totalDays: number
  days: DayItinerary[]
  flightInfo: FlightInfo[]
  hotelInfo: HotelInfo[]
  emergencyContacts: EmergencyContact[]
  budget: BudgetConfig
}

export const tripData: TripData = { /* …见示例数据… */ }
```

### 3.2 行程与预算关系（概念图）

```mermaid
flowchart TD
  trip[TripData]
  days[DayItinerary[]]
  cards[ItineraryCard[]]
  budget[BudgetConfig]
  expenses[Expense[]]

  trip --> days
  days --> cards
  trip --> budget
  budget --> expenses
```

记账数据模型（前端 + Firestore）：

```ts
export interface Expense {
  id: string
  tripId: string
  day: number
  amountJPY: number
  amountTWD: number
  category: string
  note?: string
  date: string // ISO
  createdAt: string // ISO，前端生成，存到 Firestore 可映射为 Timestamp
}
```

Firestore 路径：`trips/{tripId}/expenses/{expenseId}`。
tripId 可以简单用 `tripData.year-tripData.tripName` 做一个 slug（如 `2025-日本自駕之旅`）。

---

## 4. 前端架构与目录约定

整体目录（已在原文中给出，这里补充职责说明）：

- `src/main.tsx`：应用入口，挂载 React，注入全局样式、路由。
- `src/App.tsx`：
  - 放路由布局（顶栏 `PageHeader` + `Outlet` + `BottomNav`）。
  - 提供跨页面的布局状态（例如当前 Day 高亮）。
- `src/router.tsx`：
  - 集中定义所有路由与懒加载页面。
- `src/data/itinerary.ts`：
  - 导出 `tripData`，不在运行时修改。
- `src/pages/`：
  - `Home.tsx`：今日行程 + 今日天气。
  - `DayDetail.tsx`：单日时间轴视图。
  - `Info.tsx`：航班 / 住宿 / 紧急联络 Tab。
  - `Budget.tsx`：记账与预算。
- `src/components/layout/`：
  - `PageHeader.tsx`：顶部标题区域。
  - `BottomNav.tsx`：底部 Tab 导航。
- `src/components/cards/`：
  - `AttractionCard.tsx` / `RestaurantCard.tsx` / `TransportCard.tsx` / 可选 `HotelCard.tsx`。
- `src/components/widgets/`：
  - `WeatherWidget.tsx` / `NavigateButton.tsx` / `TagBadge.tsx` / `TipSection.tsx` 等。
- `src/components/budget/`：
  - `ExpenseForm.tsx` / `ExpenseList.tsx` / `BudgetSummary.tsx`。
- `src/hooks/`：
  - `useWeather.ts`：天气数据获取与缓存。
  - `useBudget.ts`：封装预算+记账的业务逻辑（FireStore + localStorage）。
- `src/lib/`：
  - `firebase.ts`：初始化 Firebase + 导出 `db`。
  - `utils.ts`：通用工具函数（格式化日期/金额、生成 tripId、slug 等）。
- `src/styles/globals.css`：
  - Tailwind base + 自定义 CSS 变量（色板、字体）。

---

## 5. 路由设计与页面行为

### 5.1 路由表

- `/` → `Home`（今日行程）
- `/day/:dayNumber` → `DayDetail`
- `/info` → `Info`
- `/budget` → `Budget`

可以根据 URL 决定 `BottomNav` 的选中态。`dayNumber` 从 1 开始。

`router.tsx` 示例：

```tsx
// src/router.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './App'
import { Suspense, lazy } from 'react'

const Home = lazy(() => import('./pages/Home'))
const DayDetail = lazy(() => import('./pages/DayDetail'))
const Info = lazy(() => import('./pages/Info'))
const Budget = lazy(() => import('./pages/Budget'))

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/day/:dayNumber" element={<DayDetail />} />
            <Route path="/info" element={<Info />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppLayout>
    </BrowserRouter>
  )
}
```

`main.tsx` 只渲染 `AppRouter`。

### 5.2 页面要点

- **Home**：
  - 根据「今天日期」找到对应的 `DayItinerary`（找不到则默认第 1 天）。
  - 顶部显示「第 X 天 / 共 Y 天」+ 行程标题。
  - 引用 `WeatherWidget` 获取该天 `weatherLat`/`weatherLng` 的天气。
  - 显示当天 `cards`，按 `time` 升序排列，无时间的放在最后。
  - 底部按钮「查看完整行程」跳转到 `DayDetail`（默认今天）或一个简单的 days 列表页（如未来需要可扩展）。

- **DayDetail**：
  - 从 `useParams` 取 `dayNumber`，在 `tripData.days` 中查找。
  - 页面顶部显示日期、地区、天气小卡（可重用 `WeatherWidget` 的缩略版）。
  - 使用垂直时间轴布局，左侧时间，右侧为不同 card 组件：
    - `type === 'attraction'` → `AttractionCard`
    - `type === 'restaurant'` → `RestaurantCard`
    - `type === 'transport'` → `TransportCard`
    - `type === 'hotel'` → 可选 `HotelCard` 或复用 `AttractionCard` 样式
  - 有 `location` 的卡片底部渲染 `NavigateButton`。

- **Info**：
  - 头部 Tab 切换：航班 / 住宿 / 紧急联络（可用 shadcn/ui Tabs）。
  - 航班：遍历 `tripData.flightInfo`，按去程/回程分栏或只按时间排序。
  - 住宿：`tripData.hotelInfo`，有坐标则配 `NavigateButton`。
  - 紧急联络：`tripData.emergencyContacts`，点击电话用 `tel:` 链接。

- **Budget**：
  - 顶部预算进度条：`已花费TWD / totalBudget`。
  - 中间圆饼图：`recharts`，数据来源 `useBudget` 里的按类别汇总。
  - 表单：`ExpenseForm`，输入日元金额、自动换算 TWD、选择类别和日期。
  - 列表：`ExpenseList`，每条可删除（前端先删，再尝试删 Firestore）。

---

## 6. 状态管理（Zustand）设计

### 6.1 Store 划分

建议两个 slice：

- `useTripStore`：只读的行程 + 当前 UI 状态。
- `useBudgetStore`：记账相关状态（Expense 列表、加载/错误状态等）。

**`useTripStore` 示例：**

```ts
import { create } from 'zustand'
import { tripData, TripData, DayItinerary } from '@/data/itinerary'

interface TripState {
  trip: TripData
  currentDayNumber: number
  setCurrentDay: (day: number) => void
  getDay: (dayNumber: number) => DayItinerary | undefined
}

export const useTripStore = create<TripState>((set, get) => ({
  trip: tripData,
  currentDayNumber: 1,
  setCurrentDay: (day) => set({ currentDayNumber: day }),
  getDay: (dayNumber) => get().trip.days.find((d) => d.dayNumber === dayNumber),
}))
```

**`useBudgetStore` 示例（不含 Firestore 细节）**：

```ts
interface BudgetState {
  expenses: Expense[]
  loading: boolean
  error?: string
  addExpense: (input: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>
  removeExpense: (id: string) => Promise<void>
  totalTWD: () => number
}
```

`useBudget.ts` 中负责：
- 从 `localStorage` 中初始化 `expenses`。
- 监听变更写回 `localStorage`。
- 若有网络连接 + 已初始化 Firestore，则：
  - 在 `addExpense` / `removeExpense` 时尝试同步到 Firestore。
  - 失败时记录一个「待同步队列」（可简化为标记在本地，之后再补）。

---

## 7. 关键模块规范

### 7.1 `useWeather` + `WeatherWidget`

**职责**：
- 给定 `(lat, lng)` 和 `date`，请求 Open-Meteo，返回当日本地天气概览 + 每 3 小时一条的预报。
- 对同一 `(lat,lng,date)` 组合做内存缓存，避免多次请求。

**Hook 签名**：

```ts
interface WeatherPoint {
  time: string
  temperature: number
  precipitationProbability: number
  weatherCode: number
}

interface UseWeatherResult {
  loading: boolean
  error?: string
  summary?: {
    minTemp: number
    maxTemp: number
    weatherCode: number
  }
  hourly: WeatherPoint[]
}

export function useWeather(lat: number, lng: number, date: string): UseWeatherResult
```

**错误与加载展示**：
- `loading === true`：组件显示 skeleton。
- `error` 不为 null：显示「天气获取失败」的小提示，但不影响其他内容。

`WeatherWidget` 只负责 UI 渲染，不直接请求 API。

### 7.2 `NavigateButton`

- 入参：`location: Location`。
- 行为：
  - 判断是否 iOS：`/iPad|iPhone|iPod/.test(navigator.userAgent)`。
  - 优先使用 `location.appleMapsUrl`，否则 fallback 到 `maps://` scheme。
  - 其他平台用 `https://maps.google.com/?q=lat,lng`，若有 `googleMapsUrl` 则直接打开该 URL。
- 没有 `lat/lng` 时不渲染按钮。

### 7.3 `TagBadge`

- 入参：`info: SpecialInfo`。
- 不同 `tag` 使用不同 Tailwind class（印章贴纸风）。
- `reservation` 类型额外显示 `code`（粗体+下划线）。

### 7.4 预算模块组件

- `BudgetSummary`：接收 `totalBudget` 与 `expenses`，计算剩余预算、各类别占比。
- `ExpenseForm`：
  - 受控表单，用 `shadcn/ui` 的 `Input`、`Select`、`Button`。
  - 选择日期默认当天，可选绑定到某个 `dayNumber`。
  - 提交后调用 `useBudgetStore.addExpense`。
- `ExpenseList`：
  - 按日期倒序排列。
  - 删除时调用 `useBudgetStore.removeExpense`。

---

## 8. PWA 与部署

### 8.1 PWA 关键点

- `public/manifest.json`：
  - `name`, `short_name`, `theme_color`, `background_color` 按日系配色设置。
  - icons 至少提供 192, 512，含 `maskable`。
- `vite-plugin-pwa` 配置：
  - `registerType: 'autoUpdate'`。
  - Workbox：
    - 预缓存 `index.html`、所有构建产物。
    - 对 `https://api.open-meteo.com` 使用 `NetworkFirst` + 短期缓存（5 分钟）。
    - 对 Google Fonts 使用长期 `CacheFirst`。
  - 可选：离线 fallback（访问未知路由时返回 `offline.html`）。

### 8.2 部署到 GitHub + Kinsta

- GitHub：
  - 标准 Node 18 workflow，`npm ci` + `npm run build`。
  - Firestore 环境变量通过 GitHub Secrets 传入。
- Kinsta Static Site：
  - Build command：`npm run build`。
  - Publish directory：`dist`。
  - 在 Kinsta 面板中配置所有 `VITE_FIREBASE_*` 环境变量。

---

## 9. 开发顺序与里程碑（从 Checklist 萃取）

### 里程碑 1：项目骨架 + 行程静态渲染

- 初始化 Vite + React + TS + Tailwind + shadcn/ui + React Router + Zustand。
- 搭建目录结构。
- 完成 `tripData` 的类型与示例数据填充。
- 实现路由与页面骨架（不含天气、记账、PWA）。
- 实现行程卡片组件（景点/餐厅/交通/酒店）+ 特殊标签渲染。

**验收**：
- 可以在 `/` 和 `/day/:day` 正确浏览所有天的行程，卡片样式区分明显。

### 里程碑 2：天气与导航能力

- 实现 `useWeather` 与 `WeatherWidget`。
- 在首页 & DayDetail 顶部集成天气展示。
- 实现 `NavigateButton`，所有带地址的卡片出现导航按钮。

**验收**：
- 打开首页能看到今日天气，切换到某天详情也能看到对应地区天气。
- 点击导航按钮能唤起地图 App 或浏览器中的 Google Maps。

### 里程碑 3：旅行工具页（航班 / 住宿 / 紧急联络）

- 实现 `Info` 页的 Tab 结构。
- 渲染航班卡片 / 住宿卡片（含导航按钮） / 紧急联络列表（`tel:` 链接）。

**验收**：
- Info 页三个 Tab 功能完整，信息可读、可点击拨号。

### 里程碑 4：记账模块 + Firestore 集成

- 初始化 Firebase + Firestore。
- 实现 `useBudget` + `useBudgetStore`：
  - `localStorage` 持久化。
  - 与 Firestore 双写（有网时）。
- 完成 `Budget` 页 UI：
  - 预算进度条。
  - 类别圆饼图（recharts）。
  - 新增/删除支出。
  - 日元 ↔ 台币换算工具。

**验收**：
- 重刷页面后记账记录仍存在（本地持久化）。
- 有网络时，多设备可看到同一 trip 的统一账目（Firestore 同步）。

### 里程碑 5：PWA 打磨 + 无障碍 + 上线

- 配置 manifest 与 Service Worker（`vite-plugin-pwa`）。
- 手机上可「添加到主屏幕」，断网时仍能浏览已打开过的页面。
- 样式层面检查 safe-area、对比度、可点击区域大小。
- 配好 GitHub Actions 与 Kinsta，完成一条龙自动部署。

**验收**：
- 安装到手机后像原生 App 一样运行。
- 断网仍能打开首页、DayDetail、Info 等页面并查看静态行程数据。

---

## 10. 后续可扩展方向（非本版必做）

- 多 Trip 支持：Trip 列表 + 选择当前 Trip。
- 行程编辑器：前端可视化编辑 `TripData` 并写回某种存储（JSON / Firestore）。
- 更智能的天气和导航：自动根据当前 GPS 选择最近的行程点、预估驾车时间等。

