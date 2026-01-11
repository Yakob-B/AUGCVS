import React, { createContext, useState, useEffect, useContext } from 'react'
import * as authService from '../services/auth'

export const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      authService.setAuthToken(token)
      loadUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const loadUser = async () => {
    try {
      const userData = await authService.getMe()
      setUser(userData)
    } catch (error) {
      console.error('Error loading user:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const response = await authService.login(email, password)
    const { token: newToken, user: userData } = response
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(userData)
    authService.setAuthToken(newToken)
    return userData
  }

  const register = async (userData) => {
    const response = await authService.register(userData)
    const { token: newToken, user: registeredUser } = response
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(registeredUser)
    authService.setAuthToken(newToken)
    return registeredUser
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    authService.setAuthToken(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isRegistrar: user?.role === 'registrar',
    isExternal: user?.role === 'external',
    isSuperAdmin: user?.role === 'superadmin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
