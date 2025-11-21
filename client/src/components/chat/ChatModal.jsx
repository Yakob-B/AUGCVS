import React, { useState, useEffect, useRef } from 'react'
import { useSocket } from '../../contexts/SocketContext'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../pages/contexts/NotificationContext'
import * as chatService from '../../services/chat'
import { MdClose, MdSend, MdPerson } from 'react-icons/md'
import { FaSpinner } from 'react-icons/fa'

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
    
    // Join chat room
    if (socket && verificationId) {
      socket.emit('join-chat-room', verificationId)
    }

    // Listen for new messages
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
      
      // Mark as read
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
      
      // Mark as read if I'm viewing
      if (data.message.sender._id !== user._id) {
        chatService.markAsRead(verificationId).catch(console.error)
      }
      
      // Scroll to bottom when new message arrives
      setTimeout(() => scrollToBottom(), 100)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim() || sending) return

    // Stop typing indicator
    if (socket) {
      socket.emit('typing-stop', {
        verificationId,
        userId: user._id
      })
    }

    try {
      setSending(true)
      const response = await chatService.sendMessage(verificationId, message)
      
      // Message will be added via socket event, but we can add it optimistically
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

    // Emit typing start
    socket.emit('typing-start', {
      verificationId,
      userId: user._id,
      userName: `${user.firstName} ${user.lastName}`
    })

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Stop typing after 3 seconds of inactivity
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

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return messageDate.toLocaleDateString()
    }
  }

  const getParticipantName = (participant) => {
    if (participant._id === user._id) return 'You'
    return `${participant.firstName} ${participant.lastName}`
  }

  const getParticipantRole = (participant) => {
    if (participant._id === user._id) return null
    return participant.role === 'external' ? 'Organization' : participant.role.charAt(0).toUpperCase() + participant.role.slice(1)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="rounded-xl p-8 max-w-md w-full dark:bg-dark-card light:bg-light-card border dark:border-dark-border light:border-light-border shadow-2xl">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="rounded-xl border dark:border-dark-border light:border-light-border shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col dark:bg-dark-card/95 light:bg-light-card">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-dark-border light:border-light-border">
          <div>
            <h2 className="text-xl font-heading font-bold dark:text-dark-text light:text-light-text">
              Chat - Verification #{chat?.verification?.requestNumber}
            </h2>
            <p className="text-sm dark:text-dark-muted light:text-light-muted mt-1">
              {chat?.participants?.filter(p => p._id !== user._id).map(p => 
                `${p.firstName} ${p.lastName} (${getParticipantRole(p)})`
              ).join(', ')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg dark:text-dark-muted light:text-light-muted hover:dark:text-dark-text hover:light:text-light-text hover:dark:bg-dark-surface hover:light:bg-gray-100 transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 dark:bg-gradient-to-b dark:from-dark-bg/40 dark:to-dark-card/60 light:bg-gradient-to-b light:from-light-bg/40 light:to-light-card/70"
        >
          {chat?.messages?.map((msg, index) => {
            const isMine = msg.sender._id === user._id
            const showDate = index === 0 || 
              formatDate(msg.createdAt) !== formatDate(chat.messages[index - 1].createdAt)
            
            return (
              <div key={msg._id}>
                {showDate && (
                  <div className="text-center dark:text-dark-muted light:text-light-muted text-xs mb-4">
                    {formatDate(msg.createdAt)}
                  </div>
                )}
                <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${isMine ? 'order-2' : 'order-1'}`}>
                    {!isMine && (
                      <div className="flex items-center space-x-2 mb-1">
                        <MdPerson className="text-purple-400" size={16} />
                        <span className="text-xs text-white/70">
                          {msg.sender.firstName} {msg.sender.lastName}
                        </span>
                      </div>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isMine
                          ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/20'
                          : 'dark:bg-dark-surface light:bg-light-surface dark:text-dark-text light:text-light-text border dark:border-dark-border light:border-light-border'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                      <p className={`text-xs mt-1 ${isMine ? 'text-white/80' : 'dark:text-dark-muted light:text-light-muted'}`}>
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
            <div className="flex items-center space-x-2 text-sm italic mb-4 dark:text-dark-muted light:text-light-muted">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>
                {Object.values(typingUsers).join(', ')} {Object.keys(typingUsers).length === 1 ? 'is' : 'are'} typing...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-6 border-t dark:border-dark-border light:border-light-border">
          <div className="flex space-x-3">
            <input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                handleTyping()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
              placeholder="Type your message... (Press Enter to send)"
              className="input flex-1"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!message.trim() || sending}
              className="btn-primary px-6 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {sending ? (
                <FaSpinner className="animate-spin" size={20} />
              ) : (
                <MdSend size={20} />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatModal

