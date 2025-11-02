import React, { createContext, useState, useContext } from 'react'

const NotificationContext = createContext()

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const showNotification = (type, title, message, duration = 5000) => {
    const id = Date.now() + Math.random()
    const notification = { id, type, title, message, duration }
    
    setNotifications((prev) => [...prev, notification])
    
    setTimeout(() => {
      removeNotification(id)
    }, duration)
    
    return id
  }

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const success = (title, message, duration) => showNotification('success', title, message, duration)
  const error = (title, message, duration) => showNotification('error', title, message, duration)
  const warning = (title, message, duration) => showNotification('warning', title, message, duration)
  const info = (title, message, duration) => showNotification('info', title, message, duration)

  const value = {
    notifications,
    showNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
