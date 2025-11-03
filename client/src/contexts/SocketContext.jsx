import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
      })

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id)
        setConnected(true)

        // Join user's personal room
        const userId = user._id || user.id
        if (userId) {
          newSocket.emit('join-user-room', userId)
        }

        // Join registrar room if user is registrar or admin
        if (user.role === 'registrar' || user.role === 'admin') {
          newSocket.emit('join-registrar-room')
        }
      })

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected')
        setConnected(false)
      })

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setConnected(false)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    } else {
      if (socket) {
        socket.close()
        setSocket(null)
        setConnected(false)
      }
    }
  }, [isAuthenticated, user])

  const value = {
    socket,
    connected,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
