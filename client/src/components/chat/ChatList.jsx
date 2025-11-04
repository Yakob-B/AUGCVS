import React, { useState, useEffect } from 'react'
import { useSocket } from '../../contexts/SocketContext'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../pages/contexts/NotificationContext'
import * as chatService from '../../services/chat'
import { MdChat, MdClose, MdVerifiedUser } from 'react-icons/md'
import { FaSpinner } from 'react-icons/fa'
import ChatModal from './ChatModal'

const ChatList = () => {
  const { socket } = useSocket()
  const { user, isAuthenticated } = useAuth()
  const { showNotification } = useNotification()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [openChatId, setOpenChatId] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [totalUnread, setTotalUnread] = useState(0)

  // Don't show chat if not authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  useEffect(() => {
    if (isOpen) {
      loadChats()
    }
  }, [isOpen])

  useEffect(() => {
    if (socket) {
      socket.on('new-message', handleNewMessage)
      socket.on('chat-message-notification', handleChatNotification)
    }

    return () => {
      if (socket) {
        socket.off('new-message')
        socket.off('chat-message-notification')
      }
    }
  }, [socket, chats])

  const loadChats = async () => {
    try {
      setLoading(true)
      const response = await chatService.getMyChats()
      setChats(response.data || [])
      
      // Calculate total unread
      const total = response.data?.reduce((sum, chat) => {
        const unread = user.role === 'external' ? chat.unreadCount?.external || 0 : chat.unreadCount?.registrar || 0
        return sum + unread
      }, 0) || 0
      setTotalUnread(total)
    } catch (error) {
      showNotification('error', 'Error loading chats', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleNewMessage = (data) => {
    setChats(prev => prev.map(chat => {
      if (chat.verification._id === data.verificationId) {
        return {
          ...chat,
          messages: [...chat.messages, data.message],
          unreadCount: data.unreadCount,
          lastMessage: new Date()
        }
      }
      return chat
    }))

    // Update total unread
    updateTotalUnread()
  }

  const handleChatNotification = (data) => {
    // Update unread count in chat list
    setChats(prev => prev.map(chat => {
      if (chat.verification._id === data.verificationId) {
        return {
          ...chat,
          unreadCount: data.unreadCount
        }
      }
      return chat
    }))

    updateTotalUnread()
  }

  const updateTotalUnread = () => {
    setChats(prev => {
      const total = prev.reduce((sum, chat) => {
        const unread = user.role === 'external' ? chat.unreadCount?.external || 0 : chat.unreadCount?.registrar || 0
        return sum + unread
      }, 0)
      setTotalUnread(total)
      return prev
    })
  }

  const handleChatClick = async (verificationId) => {
    setOpenChatId(verificationId)
    setIsOpen(false)
    
    // Mark as read
    try {
      await chatService.markAsRead(verificationId)
      loadChats()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const formatLastMessage = (chat) => {
    if (!chat.messages || chat.messages.length === 0) return 'No messages yet'
    const lastMsg = chat.messages[chat.messages.length - 1]
    return lastMsg.message.substring(0, 50) + (lastMsg.message.length > 50 ? '...' : '')
  }

  const formatTime = (date) => {
    const msgDate = new Date(date)
    const now = new Date()
    const diffMs = now - msgDate
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return msgDate.toLocaleDateString()
  }

  const getUnreadCount = (chat) => {
    return user.role === 'external' ? chat.unreadCount?.external || 0 : chat.unreadCount?.registrar || 0
  }

  if (!isOpen) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full shadow-lg shadow-purple-500/30 hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center z-40 animate-glow"
          title="Open Chats"
        >
          <MdChat size={24} />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </button>
        {openChatId && (
          <ChatModal
            verificationId={openChatId}
            onClose={() => {
              setOpenChatId(null)
              loadChats()
            }}
          />
        )}
      </>
    )
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 w-80 h-[600px] bg-gray-800/95 rounded-xl border border-gray-700/50 shadow-2xl flex flex-col z-50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
              <MdChat className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-white font-semibold">Chats</h3>
              {totalUnread > 0 && (
                <p className="text-xs text-purple-400">{totalUnread} unread {totalUnread === 1 ? 'message' : 'messages'}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-white/70 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <FaSpinner className="animate-spin text-purple-400" size={24} />
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-12 text-white/70">
              <MdVerifiedUser className="text-4xl mx-auto mb-4 opacity-50" />
              <p>No chats yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => {
                const unread = getUnreadCount(chat)
                return (
                  <button
                    key={chat._id}
                    onClick={() => handleChatClick(chat.verification._id)}
                    className="w-full p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors text-left border border-transparent hover:border-purple-500/30"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-white font-semibold text-sm truncate">
                            Verification #{chat.verification.requestNumber}
                          </p>
                          {chat.verification.status === 'pending' && (
                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30 flex-shrink-0">
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/70 mt-1">
                          {chat.verification.graduate?.firstName} {chat.verification.graduate?.lastName}
                        </p>
                      </div>
                      {unread > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 animate-pulse">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/60 truncate">{formatLastMessage(chat)}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-white/50">{formatTime(chat.lastMessage)}</p>
                      {chat.messages && chat.messages.length > 0 && (
                        <span className="text-xs text-purple-400">
                          {chat.messages.length} {chat.messages.length === 1 ? 'msg' : 'msgs'}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {openChatId && (
        <ChatModal
          verificationId={openChatId}
          onClose={() => {
            setOpenChatId(null)
            loadChats()
          }}
        />
      )}
    </>
  )
}

export default ChatList

