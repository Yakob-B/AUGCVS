import React, { useState, useEffect } from 'react'
import { useNotification } from '../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import { useSocket } from '../../contexts/SocketContext'
import * as verificationService from '../../services/verifications'
import VerificationRequestForm from '../../components/verifications/VerificationRequestForm'
import VerificationReviewModal from '../../components/verifications/VerificationReviewModal'
import ChatModal from '../../components/chat/ChatModal'
import Pagination from '../../components/common/Pagination'
import * as chatService from '../../services/chat'
import { MdVerifiedUser, MdPendingActions, MdCheckCircle, MdCancel, MdAddCircle, MdChat, MdVisibility, MdRateReview } from 'react-icons/md'

const Verifications = () => {
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const { socket } = useSocket()
  const [verifications, setVerifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [selectedVerification, setSelectedVerification] = useState(null)
  const [chatVerificationId, setChatVerificationId] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  const [chatUnreadCounts, setChatUnreadCounts] = useState({})

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
    loadVerifications(1)
  }, [filter])

  useEffect(() => {
    if (pagination.page) {
      loadVerifications(pagination.page)
    }
  }, [pagination.page])

  // Listen for real-time verification updates
  useEffect(() => {
    if (socket) {
      // Listen for new verification requests (for registrars)
      socket.on('new-verification-request', (data) => {
        if (user.role === 'registrar' || user.role === 'admin') {
          showNotification('info', 'New Verification Request', `Request #${data.requestNumber} has been submitted.`)
          loadVerifications()
        }
      })

      // Listen for verification processed updates
      socket.on('verification-processed', (data) => {
        showNotification(
          'success',
          'Verification Processed',
          `Your verification request #${data.requestNumber} has been ${data.status}.`
        )
        loadVerifications()
      })

      // Listen for verification created confirmation
      socket.on('verification-created', (data) => {
        const userId = user._id || user.id
        if (data.requester === userId || userId === data.requester) {
          showNotification(
            'success',
            'Request Submitted',
            `Your verification request #${data.requestNumber} has been submitted.`
          )
          loadVerifications()
        }
      })

      // Listen for chat message notifications
      socket.on('chat-message-notification', (data) => {
        if (chatVerificationId !== data.verificationId) {
          showNotification(
            'info',
            'New Chat Message',
            `${data.sender.firstName} ${data.sender.lastName}: ${data.message}`
          )

          // Update unread count
          setChatUnreadCounts(prev => ({
            ...prev,
            [data.verificationId]: data.unreadCount[user.role === 'external' ? 'external' : 'registrar'] || 0
          }))
        }
      })

      // Listen for new messages to update unread counts
      socket.on('new-message', (data) => {
        if (chatVerificationId !== data.verificationId) {
          setChatUnreadCounts(prev => ({
            ...prev,
            [data.verificationId]: data.unreadCount[user.role === 'external' ? 'external' : 'registrar'] || 0
          }))
        }
      })

      return () => {
        socket.off('new-verification-request')
        socket.off('verification-processed')
        socket.off('verification-created')
        socket.off('chat-message-notification')
        socket.off('new-message')
      }
    }
  }, [socket, user, chatVerificationId])

  const loadVerifications = async (page = 1) => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: 10,
        ...(filter !== 'all' && { status: filter })
      }
      const response = user.role === 'external'
        ? await verificationService.getMyVerifications(params)
        : await verificationService.getVerifications(params)
      setVerifications(response.data || [])
      setPagination({
        page: response.page || page,
        limit: 10,
        total: response.total || 0,
        pages: response.pages || 1
      })

      // Load unread counts for chats
      loadChatUnreadCounts(response.data || [])
    } catch (error) {
      showNotification('error', 'Error loading verifications', error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadChatUnreadCounts = async (verifications) => {
    try {
      const chatsResponse = await chatService.getMyChats()
      const chats = chatsResponse.data || []

      const unreadMap = {}
      chats.forEach(chat => {
        const unread = user.role === 'external'
          ? chat.unreadCount?.external || 0
          : chat.unreadCount?.registrar || 0
        unreadMap[chat.verification._id] = unread
      })

      setChatUnreadCounts(unreadMap)
    } catch (error) {
      // Silently fail - not critical
      console.error('Error loading chat unread counts:', error)
    }
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 border border-amber-500/30">
            <MdPendingActions className="text-sm" />
            Pending
          </span>
        )
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-500 border border-emerald-500/30">
            <MdCheckCircle className="text-sm" />
            Approved
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-500 border border-red-500/30">
            <MdCancel className="text-sm" />
            Rejected
          </span>
        )
      default:
        return <span className="badge-pending">{status}</span>
    }
  }

  if (loading && verifications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  const handleFormSuccess = (newVerification) => {
    setShowForm(false)
    loadVerifications() // Reload the list
  }

  const handleReviewSuccess = () => {
    setSelectedVerification(null)
    loadVerifications() // Reload the list
  }

  return (
    <div className="animate-fade-in dark:text-dark-text light:text-light-text">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold dark:text-dark-text light:text-light-text mb-2">Verification Requests</h1>
          <p className="dark:text-dark-muted light:text-light-muted">Manage and review verification requests</p>
        </div>
        {user.role === 'external' && (
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/30"
          >
            <MdAddCircle className="mr-2" />
            New Verification Request
          </button>
        )}
      </div>

      {/* Verification Request Form Modal */}
      {showForm && (
        <VerificationRequestForm
          onClose={() => setShowForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Verification Review Modal */}
      {selectedVerification && (
        <VerificationReviewModal
          verificationId={selectedVerification}
          onClose={() => setSelectedVerification(null)}
          onSuccess={handleReviewSuccess}
        />
      )}

      {/* Chat Modal */}
      {chatVerificationId && (
        <ChatModal
          verificationId={chatVerificationId}
          onClose={() => setChatVerificationId(null)}
        />
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${filter === 'all'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30'
              : 'dark:bg-dark-surface light:bg-gray-100 dark:text-dark-text light:text-light-text hover:dark:bg-dark-card hover:light:bg-gray-200'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${filter === 'pending'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
              : 'dark:bg-dark-surface light:bg-gray-100 dark:text-dark-text light:text-light-text hover:dark:bg-dark-card hover:light:bg-gray-200'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${filter === 'approved'
              ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30'
              : 'dark:bg-dark-surface light:bg-gray-100 dark:text-dark-text light:text-light-text hover:dark:bg-dark-card hover:light:bg-gray-200'}`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${filter === 'rejected'
              ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30'
              : 'dark:bg-dark-surface light:bg-gray-100 dark:text-dark-text light:text-light-text hover:dark:bg-dark-card hover:light:bg-gray-200'}`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Verifications List */}
      <div className="card shadow-lg">
        {verifications.length === 0 ? (
          <div className="text-center py-12 dark:text-dark-muted light:text-light-muted">
            <MdVerifiedUser className="text-5xl mx-auto mb-4 opacity-50 text-primary-400" />
            <p>No verification requests found</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {verifications.map((verification) => (
                <div
                  key={verification._id}
                  className="p-5 rounded-xl border-2 dark:border-dark-border light:border-light-border dark:bg-dark-surface/50 light:bg-gray-50/50 hover:dark:bg-dark-card hover:light:bg-white transition-all duration-300 hover:shadow-lg"
                >
                  {/* Header with Name and Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold dark:text-dark-text light:text-light-text truncate">
                        {verification.graduate?.firstName} {verification.graduate?.lastName}
                      </h3>
                      <p className="text-sm dark:text-dark-muted light:text-light-muted mt-1">
                        Request #{verification.requestNumber}
                      </p>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      {getStatusBadge(verification.status)}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-sm">
                    <div className="flex justify-between sm:block">
                      <span className="dark:text-dark-muted light:text-light-muted">Certificate #:</span>
                      <span className="dark:text-dark-text light:text-light-text font-medium ml-2 sm:ml-0 sm:block">
                        {verification.certificateNumber}
                      </span>
                    </div>
                    {verification.requester?.organization && (
                      <div className="flex justify-between sm:block">
                        <span className="dark:text-dark-muted light:text-light-muted">Organization:</span>
                        <span className="dark:text-dark-text light:text-light-text font-medium ml-2 sm:ml-0 sm:block">
                          {verification.requester.organization}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between sm:block">
                      <span className="dark:text-dark-muted light:text-light-muted">Date:</span>
                      <span className="dark:text-dark-text light:text-light-text font-medium ml-2 sm:ml-0 sm:block">
                        {new Date(verification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons - Ultra Creative Design */}
                  <div className="flex items-center gap-3 pt-4 border-t dark:border-dark-border light:border-light-border">
                    {/* Chat Button - Animated Message Icon */}
                    <button
                      onClick={() => setChatVerificationId(verification._id)}
                      className="group relative flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 overflow-hidden rounded-2xl font-bold transition-all duration-500 transform hover:scale-[1.03] active:scale-[0.97]
                        bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white
                        shadow-lg shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/50
                        ring-2 ring-transparent hover:ring-blue-300/50
                        before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/30 before:to-white/0 
                        before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-1000
                        after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/20 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity"
                      title="Open Chat"
                    >
                      <MdChat className="text-xl transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                      <span className="relative z-10">Chat</span>
                      {chatUnreadCounts[verification._id] > 0 && (
                        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce shadow-lg shadow-red-500/50 ring-2 ring-white">
                          {chatUnreadCounts[verification._id] > 9 ? '9+' : chatUnreadCounts[verification._id]}
                        </span>
                      )}
                    </button>

                    {/* Review/View Button - Dynamic styles based on status */}
                    <button
                      onClick={() => setSelectedVerification(verification._id)}
                      className={`group relative flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 overflow-hidden rounded-2xl font-bold transition-all duration-500 transform hover:scale-[1.03] active:scale-[0.97] ring-2 ring-transparent ${(user.role === 'admin' || user.role === 'registrar') && verification.status === 'pending'
                        ? `bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 text-white
                             shadow-lg shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/50
                             hover:ring-purple-300/50
                             before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/30 before:to-white/0 
                             before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-1000
                             after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/20 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity
                             animate-pulse-slow`
                        : `bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-700 text-white
                             shadow-lg shadow-gray-500/20 hover:shadow-xl hover:shadow-gray-500/40
                             hover:ring-gray-400/50
                             before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/20 before:to-white/0 
                             before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-1000`
                        }`}
                    >
                      {(user.role === 'admin' || user.role === 'registrar') && verification.status === 'pending' ? (
                        <>
                          <MdRateReview className="text-xl transition-all duration-300 group-hover:scale-125 group-hover:-rotate-6" />
                          <span className="relative z-10">Review</span>
                          {/* Pulsing ring for pending items */}
                          <span className="absolute inset-0 rounded-2xl border-2 border-purple-400/50 animate-ping opacity-30"></span>
                        </>
                      ) : (
                        <>
                          <MdVisibility className="text-xl transition-all duration-300 group-hover:scale-110" />
                          <span className="relative z-10">View</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {pagination.pages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Verifications
