import React, { useState, useEffect } from 'react'
import { useNotification } from '../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import * as verificationService from '../../services/verifications'
import { MdVerifiedUser, MdPendingActions, MdCheckCircle, MdCancel } from 'react-icons/md'

const Verifications = () => {
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [verifications, setVerifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadVerifications()
  }, [])

  const loadVerifications = async () => {
    try {
      setLoading(true)
      const response = user.role === 'external' 
        ? await verificationService.getMyVerifications()
        : await verificationService.getVerifications()
      setVerifications(response.data || [])
    } catch (error) {
      showNotification('error', 'Error loading verifications', error.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredVerifications = verifications.filter((v) => {
    if (filter === 'all') return true
    return v.status === filter
  })

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

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold text-white mb-2">Verification Requests</h1>
        <p className="text-dark-muted">Manage and review verification requests</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`badge ${filter === 'all' ? 'badge-info' : 'badge-pending'}`}
          >
            All ({verifications.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`badge ${filter === 'pending' ? 'badge-warning' : 'badge-pending'}`}
          >
            Pending ({verifications.filter(v => v.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`badge ${filter === 'approved' ? 'badge-success' : 'badge-pending'}`}
          >
            Approved ({verifications.filter(v => v.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`badge ${filter === 'rejected' ? 'badge-danger' : 'badge-pending'}`}
          >
            Rejected ({verifications.filter(v => v.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Verifications List */}
      <div className="card">
        {filteredVerifications.length === 0 ? (
          <div className="text-center py-12 text-dark-muted">
            <MdVerifiedUser className="text-5xl mx-auto mb-4 opacity-50" />
            <p>No verification requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVerifications.map((verification) => (
              <div
                key={verification._id}
                className="p-6 bg-dark-surface rounded-lg hover:bg-dark-border transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {verification.graduate?.firstName} {verification.graduate?.lastName}
                      </h3>
                      {getStatusBadge(verification.status)}
                    </div>
                    <div className="text-sm text-dark-muted space-y-1">
                      <p>Request #: {verification.requestNumber}</p>
                      <p>Certificate #: {verification.certificateNumber}</p>
                      {verification.requester?.organization && (
                        <p>Organization: {verification.requester.organization}</p>
                      )}
                      <p>Date: {new Date(verification.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {(user.role === 'admin' || user.role === 'registrar') && verification.status === 'pending' && (
                    <div className="mt-4 md:mt-0 md:ml-4">
                      <button className="btn-primary">Review</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Verifications
