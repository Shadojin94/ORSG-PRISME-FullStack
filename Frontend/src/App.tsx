import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { AppLayout } from "./components/layout/AppLayout"
import { DashboardPage } from "./pages/DashboardPage"
import { GeneratorPage } from "./pages/GeneratorPage"
import { HistoryPage } from "./pages/HistoryPage"
import { DocsPage } from "./pages/DocsPage"
import { LoginPage } from "./pages/LoginPage"
import { ProfilePage } from "./pages/ProfilePage"
import { AdminUsersPage } from "./pages/AdminUsersPage"
import { SupportPage } from "./pages/SupportPage"
import PocketBase from "pocketbase"

const pb = new PocketBase("http://127.0.0.1:8090")

// Protected Route Component - DEMO MODE: Auth disabled for presentation
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // DEMO MODE: Skip authentication for client presentation
  const DEMO_MODE = true;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(DEMO_MODE ? true : null)

  useEffect(() => {
    if (DEMO_MODE) {
      setIsAuthenticated(true);
      return;
    }

    // Check if user is authenticated
    const checkAuth = () => {
      const isValid = pb.authStore.isValid
      setIsAuthenticated(isValid)
    }

    checkAuth()

    // Listen for auth changes
    const unsubscribe = pb.authStore.onChange(() => {
      checkAuth()
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Loading state
  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
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
