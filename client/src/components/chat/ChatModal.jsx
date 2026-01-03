import React, { useState, useEffect, useRef } from 'react'
import { useSocket } from '../../contexts/SocketContext'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../pages/contexts/NotificationContext'
import * as chatService from '../../services/chat'
import { MdClose, MdSend, MdPerson, MdChat } from 'react-icons/md'
import { FaSpinner } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

const ChatModal = ({ verificationId, onClose }) => {
  const { socket } = useSocket()
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [chat, setChat] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState({})
  const typingTimeoutRef = useRef(null)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  useEffect(() => {
    loadChat()

    if (socket && verificationId) {
      socket.emit('join-chat-room', verificationId)
    }

    if (socket) {
      socket.on('new-message', handleNewMessage)
      socket.on('user-typing', handleUserTyping)
    }

    return () => {
      if (socket && verificationId) {
        socket.emit('leave-chat-room', verificationId)
        socket.off('new-message')
        socket.off('user-typing')
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [socket, verificationId])

  useEffect(() => {
    scrollToBottom()
  }, [chat?.messages])

  const loadChat = async () => {
    try {
      setLoading(true)
      const response = await chatService.getOrCreateChat(verificationId)
      setChat(response.data)
      await chatService.markAsRead(verificationId)
    } catch (error) {
      showNotification('error', 'Error loading chat', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleNewMessage = (data) => {
    if (data.verificationId === verificationId) {
      setChat(prev => {
        if (!prev) return null
        const messageExists = prev.messages.some(m => m._id === data.message._id)
        if (messageExists) return prev
        return {
          ...prev,
          messages: [...prev.messages, data.message],
          unreadCount: data.unreadCount,
          lastMessage: new Date()
        }
      })
      if (data.message.sender._id !== user._id) {
        chatService.markAsRead(verificationId).catch(console.error)
      }
      setTimeout(() => scrollToBottom(), 100)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim() || sending) return

    if (socket) {
      socket.emit('typing-stop', {
        verificationId,
        userId: user._id
      })
    }

    try {
      setSending(true)
      const response = await chatService.sendMessage(verificationId, message)
      setChat(prev => ({
        ...prev,
        messages: [...prev.messages, response.data],
        lastMessage: new Date()
      }))
      setMessage('')
      scrollToBottom()
    } catch (error) {
      showNotification('error', 'Error sending message', error.message)
    } finally {
      setSending(false)
    }
  }

  const handleUserTyping = (data) => {
    if (data.verificationId === verificationId && data.userId !== user._id) {
      if (data.isTyping) {
        setTypingUsers(prev => ({
          ...prev,
          [data.userId]: data.userName
        }))
      } else {
        setTypingUsers(prev => {
          const newTyping = { ...prev }
          delete newTyping[data.userId]
          return newTyping
        })
      }
    }
  }

  const handleTyping = () => {
    if (!socket || !verificationId) return
    socket.emit('typing-start', {
      verificationId,
      userId: user._id,
      userName: `${user.firstName} ${user.lastName}`
    })
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing-stop', {
        verificationId,
        userId: user._id
      })
    }, 3000)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (date) => {
    const messageDate = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (messageDate.toDateString() === today.toDateString()) return 'Today'
    if (messageDate.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return messageDate.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 flex flex-col items-center shadow-2xl">
          <div className="w-10 h-10 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm font-medium">Loading conversation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-900/70 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="standard-chat-surface rounded-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden shadow-2xl bg-white dark:bg-gray-900"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <MdChat size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Case Support
              </h2>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-2 mt-0.5">
                <span className="font-semibold">#{chat?.verification?.requestNumber}</span>
                <span>•</span>
                <span className="truncate max-w-[200px]">
                  {chat?.participants?.filter(p => p._id !== user._id).map(p =>
                    `${p.firstName} ${p.lastName}`
                  ).join(', ')}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <MdClose size={22} />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide bg-gray-50/50 dark:bg-gray-950/20"
        >
          {chat?.messages?.map((msg, index) => {
            const isMine = msg.sender._id === user._id
            const showDate = index === 0 || formatDate(msg.createdAt) !== formatDate(chat.messages[index - 1].createdAt)

            return (
              <div key={msg._id}>
                {showDate && (
                  <div className="text-center my-6">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[80%]">
                    {!isMine && (
                      <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 ml-2">
                        {msg.sender.firstName} {msg.sender.lastName}
                      </p>
                    )}
                    <div
                      className={`px-4 py-2.5 shadow-sm text-sm ${isMine
                          ? 'message-bubble-standard-user rounded-2xl rounded-tr-sm'
                          : 'message-bubble-standard-bot rounded-2xl rounded-tl-sm'
                        }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                      <p className={`text-[9px] mt-1.5 ${isMine ? 'text-white/60 text-right' : 'text-gray-400'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Typing Indicator */}
          {Object.keys(typingUsers).length > 0 && (
            <div className="flex items-center space-x-2 text-xs text-gray-400 ml-2 animate-pulse">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-100" />
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-200" />
              </div>
              <span>Typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            <input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                handleTyping()
              }}
              placeholder="Write a message..."
              className="flex-1 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-full px-5 py-3 text-sm outline-none transition-all"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!message.trim() || sending}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-all active:scale-95"
            >
              {sending ? (
                <FaSpinner className="animate-spin" size={18} />
              ) : (
                <MdSend size={20} />
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>

  )
}

export default ChatModal
