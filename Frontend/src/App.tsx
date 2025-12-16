import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { AppLayout } from "./components/layout/AppLayout"
import { DashboardPage } from "./pages/DashboardPage"
import { GeneratorPage } from "./pages/GeneratorPage"
import { HistoryPage } from "./pages/HistoryPage"
import { DocsPage } from "./pages/DocsPage"
import { LoginPage } from "./pages/LoginPage"
import { ProfilePage } from "./pages/ProfilePage"
import { AdminUsersPage } from "./pages/AdminUsersPage"
import { SupportPage } from "./pages/SupportPage"

// Wrapper to conditionally render Layout
function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isLoginPage = location.pathname === "/login"

  if (isLoginPage) {
    return <>{children}</>
  }

  return <AppLayout>{children}</AppLayout>
}

function App() {
  return (
    <BrowserRouter>
      <LayoutWrapper>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/generate" element={<GeneratorPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminUsersPage />} />
          <Route path="/support" element={<SupportPage />} />

          {/* Default Redirect: Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </LayoutWrapper>
    </BrowserRouter>
  )
}

export default App
