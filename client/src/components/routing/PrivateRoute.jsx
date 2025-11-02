import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check role authorization
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role]
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'registrar' ? '/registrar' : '/external'} replace />
    }
  }

  return children
}

export default PrivateRoute
