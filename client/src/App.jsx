import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { SocketProvider } from './contexts/SocketContext'
import { NotificationProvider } from './pages/contexts/NotificationContext'
import PrivateRoute from './components/routing/PrivateRoute'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import About from './pages/About'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'
import VerifyEmail from './components/auth/VerifyEmail'
import AdminDashboard from './pages/dashboards/AdminDashboard'
import RegistrarDashboard from './pages/dashboards/RegistrarDashboard'
import ExternalDashboard from './pages/dashboards/ExternalDashboard'
import Graduates from './pages/graduates/Graduates'
import Users from './pages/users/Users'
import Verifications from './pages/verifications/Verifications'
import NotificationToast from './components/common/NotificationToast'
import EmailVerificationBanner from './components/common/EmailVerificationBanner'

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
          <div className="min-h-screen dark:bg-dark-bg light:bg-light-bg">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <EmailVerificationBanner />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/verify-email/:token" element={<VerifyEmail />} />
                
                {/* Protected Routes */}
                <Route
                  path="/admin/*"
                  element={
                    <PrivateRoute role="admin">
                      <Routes>
                        <Route index element={<AdminDashboard />} />
                        <Route path="graduates" element={<Graduates />} />
                        <Route path="users" element={<Users />} />
                        <Route path="verifications" element={<Verifications />} />
                      </Routes>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/registrar/*"
                  element={
                    <PrivateRoute role={['registrar', 'admin']}>
                      <Routes>
                        <Route index element={<RegistrarDashboard />} />
                        <Route path="verifications" element={<Verifications />} />
                      </Routes>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/external/*"
                  element={
                    <PrivateRoute role="external">
                      <Routes>
                        <Route index element={<ExternalDashboard />} />
                        <Route path="verifications" element={<Verifications />} />
                      </Routes>
                    </PrivateRoute>
                  }
                />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <NotificationToast />
          </div>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
