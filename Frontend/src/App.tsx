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
import "./index.css"

// Protected Route Component - vérifie l'authentification via localStorage
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  // Check auth synchronously on every render/navigation (no stale state)
  const isAuthenticated = localStorage.getItem("demo_authenticated") === "true"

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

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

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/generate" element={<ProtectedRoute><GeneratorPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/docs" element={<ProtectedRoute><DocsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />

          {/* Default Redirect - DEMO MODE: Go to dashboard directly */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </LayoutWrapper>
    </BrowserRouter>
  )
}

export default App
