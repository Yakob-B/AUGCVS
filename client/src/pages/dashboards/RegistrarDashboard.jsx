import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'
import * as verificationService from '../../services/verifications'
import {
  MdVerifiedUser,
  MdPendingActions,
  MdCheckCircle,
  MdCancel,
  MdArrowForward,
  MdFileUpload
} from 'react-icons/md'
import BulkUploadModal from '../../components/graduates/BulkUploadModal'

const RegistrarDashboard = () => {
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  })
  const [recentVerifications, setRecentVerifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await verificationService.getVerifications()
      const verifications = response.data || []

      const stats = {
        total: verifications.length,
        pending: verifications.filter(v => v.status === 'pending').length,
        approved: verifications.filter(v => v.status === 'approved').length,
        rejected: verifications.filter(v => v.status === 'rejected').length,
      }

      setStats(stats)
      setRecentVerifications(verifications.slice(0, 5))
    } catch (error) {
      showNotification('error', 'Error loading data', error.message)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Requests',
      value: stats.total,
      icon: <MdVerifiedUser />,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: <MdPendingActions />,
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'Approved',
      value: stats.approved,
      icon: <MdCheckCircle />,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      icon: <MdCancel />,
      color: 'from-red-500 to-rose-500',
    },
  ]

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in dark:text-dark-text light:text-light-text">
      {/* Header */}
      <div className="mb-8 animate-slide-down">
        <h1 className="text-4xl font-heading font-bold dark:text-dark-text light:text-light-text mb-2">
          Registrar Dashboard
        </h1>
        <p className="dark:text-dark-muted light:text-light-muted">
          Welcome back, {user?.firstName} {user?.lastName}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="card-hover border hover:border-primary-500/50 transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`w-14 h-14 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center text-white text-2xl mb-4`}>
              {card.icon}
            </div>
            <div className="text-3xl font-heading font-bold text-blue-400 mb-1">
              {card.value}
            </div>
            <div className="dark:text-dark-muted light:text-light-muted">{card.title}</div>
          </div>
        ))}
      </div>

      {/* Recent Verifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card shadow-lg animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-semibold dark:text-dark-text light:text-light-text">
              Recent Verifications
            </h2>
            <Link
              to="/registrar/verifications"
              className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center"
            >
              View All
              <MdArrowForward className="ml-1" />
            </Link>
          </div>
          {recentVerifications.length === 0 ? (
            <div className="text-center py-8 dark:text-dark-muted light:text-light-muted">
              No verification requests yet
            </div>
          ) : (
            <div className="space-y-4">
              {recentVerifications.map((verification) => (
                <Link
                  key={verification._id}
                  to={`/registrar/verifications`}
                  className="block p-4 rounded-lg dark:bg-dark-surface light:bg-light-surface hover:dark:bg-dark-card hover:light:bg-gray-100 transition-colors group border dark:border-dark-border light:border-light-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="dark:text-dark-text light:text-light-text font-semibold">
                      {verification.graduate?.firstName} {verification.graduate?.lastName}
                    </div>
                    {getStatusBadge(verification.status)}
                  </div>
                  <div className="text-sm dark:text-dark-muted light:text-light-muted">
                    Request #{verification.requestNumber}
                  </div>
                  <div className="text-xs dark:text-dark-muted light:text-light-muted mt-1">
                    {new Date(verification.createdAt).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card shadow-lg animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-2xl font-heading font-semibold dark:text-dark-text light:text-light-text mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              to="/registrar/verifications"
              className="flex items-center justify-between p-4 rounded-lg dark:bg-dark-surface light:bg-light-surface hover:dark:bg-dark-card hover:light:bg-gray-100 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <MdVerifiedUser className="text-primary-400 text-xl" />
                <span className="dark:text-dark-text light:text-light-text">Review Pending</span>
              </div>
              <MdArrowForward className="dark:text-dark-muted light:text-light-muted group-hover:text-primary-400 transition-colors" />
            </Link>
            <div className="p-4 rounded-lg dark:bg-dark-surface light:bg-light-surface">
              <div className="dark:text-dark-muted light:text-light-muted text-sm mb-1">Priority</div>
              <div className="dark:text-dark-text light:text-light-text font-semibold">
                {stats.pending} Pending Review
              </div>
            </div>

            <button
              onClick={() => setIsBulkUploadOpen(true)}
              className="w-full flex items-center justify-between p-4 rounded-lg border border-primary-500/30 dark:bg-primary-500/5 hover:dark:bg-primary-500/10 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <MdFileUpload className="text-primary-400 text-xl" />
                <span className="dark:text-dark-text light:text-light-text">Bulk Upload</span>
              </div>
              <MdArrowForward className="dark:text-dark-muted light:text-light-muted group-hover:text-primary-400 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onUploadSuccess={loadData}
      />
    </div>
  )
}

export default RegistrarDashboard
