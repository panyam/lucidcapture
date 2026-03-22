import { BrowserRouter, Routes, Route } from 'react-router'
import { TopNav } from './components/shared/TopNav'
import { LandingPage } from './pages/LandingPage'
import { DashboardPage } from './pages/DashboardPage'
import { EditorPage } from './pages/EditorPage'
import { PlayerPage } from './pages/PlayerPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Player is full-screen, no TopNav */}
        <Route path="/play/:id" element={<PlayerPage />} />
        {/* All other pages get TopNav */}
        <Route path="*" element={
          <>
            <TopNav />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/editor/:id" element={<EditorPage />} />
            </Routes>
          </>
        } />
      </Routes>
    </BrowserRouter>
  )
}
