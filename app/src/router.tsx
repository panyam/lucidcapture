import { BrowserRouter, Routes, Route } from 'react-router'
import { TopNav } from './components/shared/TopNav'
import { LandingPage } from './pages/LandingPage'
import { LandingCompactPage } from './pages/LandingCompactPage'
import { LandingTallPage } from './pages/LandingTallPage'
import { ComparePage } from './pages/ComparePage'
import { DashboardPage } from './pages/DashboardPage'
import { EditorPage } from './pages/EditorPage'
import { PlayerPage } from './pages/PlayerPage'
import { PrivacyPage } from './pages/PrivacyPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Full-screen pages — no TopNav */}
        <Route path="/play/:id" element={<PlayerPage />} />
        <Route path="/compare" element={<ComparePage />} />
        {/* All other pages get TopNav */}
        <Route path="*" element={
          <>
            <TopNav />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/landing/compact" element={<LandingCompactPage />} />
              <Route path="/landing/tall" element={<LandingTallPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/editor/:id" element={<EditorPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
            </Routes>
          </>
        } />
      </Routes>
    </BrowserRouter>
  )
}
