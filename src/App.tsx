import { Outlet, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { PageHeader } from './components/layout/PageHeader'
import { BottomNav } from './components/layout/BottomNav'
import { Home } from './pages/Home'
import { Budget } from './pages/Budget'
import { Info } from './pages/Info'
import { DayDetail } from './pages/DayDetail'
import { PlaceDetail } from './pages/PlaceDetail'
import { Trips } from './pages/Trips'

function AppLayout() {
  const location = useLocation()

  return (
    <div className="app-shell">
      <div className="app-frame">
        <PageHeader />
        <main className="flex-1 overflow-y-auto px-5 pb-4 pt-3">
          <Outlet />
        </main>
        <BottomNav pathname={location.pathname} />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="/day/:dayNumber" element={<DayDetail />} />
        <Route path="/place/:cardId" element={<PlaceDetail />} />
        <Route path="/info" element={<Info />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/trips" element={<Trips />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

