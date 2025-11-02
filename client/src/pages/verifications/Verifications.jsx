import React, { useState, useEffect } from 'react'
import { useNotification } from '../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import { useSocket } from '../../contexts/SocketContext'
import * as verificationService from '../../services/verifications'
import VerificationRequestForm from '../../components/verifications/VerificationRequestForm'
import VerificationReviewModal from '../../components/verifications/VerificationReviewModal'
import Pagination from '../../components/common/Pagination'
import { MdVerifiedUser, MdPendingActions, MdCheckCircle, MdCancel, MdAddCircle } from 'react-icons/md'

const Verifications = () => {
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const { socket } = useSocket()
  const [verifications, setVerifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [selectedVerification, setSelectedVerification] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })

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

      return () => {
        socket.off('new-verification-request')
        socket.off('verification-processed')
        socket.off('verification-created')
      }
    }
  }, [socket, user])

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
    } catch (error) {
      showNotification('error', 'Error loading verifications', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge-warning">Pending</span>
      case 'approved':
        return <span className="badge-success">Approved</span>
      case 'rejected':
        return <span className="badge-danger">Rejected</span>
      default:
        return <span className="badge-pending">{status}</span>
    }
  }

  if (loading && verifications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
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
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold dark:text-white light:text-light-text mb-2">Verification Requests</h1>
          <p className="dark:text-dark-muted light:text-light-muted">Manage and review verification requests</p>
        </div>
        {user.role === 'external' && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary mt-4 md:mt-0 inline-flex items-center"
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

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`badge ${filter === 'all' ? 'badge-info' : 'badge-pending'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`badge ${filter === 'pending' ? 'badge-warning' : 'badge-pending'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`badge ${filter === 'approved' ? 'badge-success' : 'badge-pending'}`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`badge ${filter === 'rejected' ? 'badge-danger' : 'badge-pending'}`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Verifications List */}
      <div className="card">
        {verifications.length === 0 ? (
          <div className="text-center py-12 dark:text-dark-muted light:text-light-muted">
            <MdVerifiedUser className="text-5xl mx-auto mb-4 opacity-50" />
            <p>No verification requests found</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {verifications.map((verification) => (
              <div
                key={verification._id}
                className="p-6 dark:bg-dark-surface light:bg-light-surface rounded-lg hover:dark:bg-dark-border light:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold dark:text-white light:text-light-text">
                        {verification.graduate?.firstName} {verification.graduate?.lastName}
                      </h3>
                      {getStatusBadge(verification.status)}
                    </div>
                    <div className="text-sm dark:text-dark-muted light:text-light-muted space-y-1">
                      <p>Request #: {verification.requestNumber}</p>
                      <p>Certificate #: {verification.certificateNumber}</p>
                      {verification.requester?.organization && (
                        <p>Organization: {verification.requester.organization}</p>
                      )}
                      <p>Date: {new Date(verification.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-4">
                    <button
                      onClick={() => setSelectedVerification(verification._id)}
                      className={`btn-secondary ${
                        user.role === 'admin' || user.role === 'registrar' 
                          ? (verification.status === 'pending' ? 'btn-primary' : '')
                          : ''
                      }`}
                    >
                      {user.role === 'admin' || user.role === 'registrar'
                        ? (verification.status === 'pending' ? 'Review' : 'View Details')
                        : 'View Details'}
                    </button>
                  </div>
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
