import React, { useState, useEffect, useRef } from 'react'
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

  const renderCountRef = useRef(0)
  renderCountRef.current += 1

  // ✅ Always declare hooks first (no conditional return before them)

  useEffect(() => {
    if (isOpen && isAuthenticated && user) {
      loadChats()
    }
  }, [isOpen, isAuthenticated, user])

  useEffect(() => {
    if (!socket || !user) return

    const onNewMessage = (data) => {
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.verification._id === data.verificationId) {
            return {
              ...chat,
              messages: [...(chat.messages || []), data.message],
              unreadCount: data.unreadCount,
              lastMessage: new Date(),
            }
          }
          return chat
        })
      )
      recalcUnread()
    }

    const onChatNotification = (data) => {
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.verification._id === data.verificationId) {
            return { ...chat, unreadCount: data.unreadCount }
          }
          return chat
        })
      )
      recalcUnread()
    }

    socket.on('new-message', onNewMessage)
    socket.on('chat-message-notification', onChatNotification)

    return () => {
      socket.off('new-message', onNewMessage)
      socket.off('chat-message-notification', onChatNotification)
    }
  }, [socket, user?.role])

  const loadChats = async () => {
    try {
      setLoading(true)
      const response = await chatService.getMyChats()
      setChats(response.data || [])
      recalcUnread(response.data)
    } catch (error) {
      showNotification('error', 'Error loading chats', error.message)
    } finally {
      setLoading(false)
    }
  }

  const recalcUnread = (data) => {
    setChats((prev) => {
      const source = data || prev
      const total =
        source?.reduce((sum, chat) => {
          const unread = user.role === 'external' ? chat.unreadCount?.external || 0 : chat.unreadCount?.registrar || 0
          return sum + unread
        }, 0) || 0
      setTotalUnread(total)
      return prev
    })
  }

  const handleChatClick = async (verificationId) => {
    setOpenChatId(verificationId)
    setIsOpen(false)
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
    const diffMins = Math.floor((now - msgDate) / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return msgDate.toLocaleDateString()
  }

  const getUnreadCount = (chat) =>
    user.role === 'external' ? chat.unreadCount?.external || 0 : chat.unreadCount?.registrar || 0

  // ✅ Handle unauthorized users *after* hooks
  if (!isAuthenticated || !user) {
    return null
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
      </>
    )
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 w-80 h-[600px] rounded-xl border dark:border-dark-border light:border-light-border shadow-2xl flex flex-col z-50 dark:bg-dark-card/95 light:bg-light-card">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-dark-border light:border-light-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
              <MdChat className="text-white" size={20} />
            </div>
            <div>
              <h3 className="dark:text-dark-text light:text-light-text font-semibold">Chats</h3>
              {totalUnread > 0 && (
                <p className="text-xs text-primary-400">{totalUnread} unread {totalUnread === 1 ? 'message' : 'messages'}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg dark:text-dark-muted light:text-light-muted hover:dark:text-dark-text hover:light:text-light-text hover:dark:bg-dark-surface hover:light:bg-gray-100 transition-colors"
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
            <div className="text-center py-12 dark:text-dark-muted light:text-light-muted">
              <MdVerifiedUser className="text-4xl mx-auto mb-4 opacity-50 text-primary-400" />
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
                    className="w-full p-3 rounded-lg transition-colors text-left border dark:border-dark-border/60 light:border-light-border/80 dark:bg-dark-surface light:bg-light-surface hover:dark:bg-dark-card hover:light:bg-gray-100"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="dark:text-dark-text light:text-light-text font-semibold text-sm truncate">
                            Verification #{chat.verification.requestNumber}
                          </p>
                          {chat.verification.status === 'pending' && (
                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30 flex-shrink-0">
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="text-xs dark:text-dark-muted light:text-light-muted mt-1">
                          {chat.verification.graduate?.firstName} {chat.verification.graduate?.lastName}
                        </p>
                      </div>
                      {unread > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 animate-pulse">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs dark:text-dark-muted light:text-light-muted truncate">{formatLastMessage(chat)}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs dark:text-dark-muted light:text-light-muted">{formatTime(chat.lastMessage)}</p>
                      {chat.messages && chat.messages.length > 0 && (
                        <span className="text-xs text-primary-400">
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

export default ChatList;
