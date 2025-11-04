import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'
import * as verificationService from '../../services/verifications'
import { 
  MdVerifiedUser, 
  MdAddCircle,
  MdPendingActions,
  MdCheckCircle,
  MdCancel,
  MdArrowForward
} from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

const ExternalDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  })
  const [myVerifications, setMyVerifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await verificationService.getMyVerifications()
      const verifications = response.data || []

      const stats = {
        total: verifications.length,
        pending: verifications.filter(v => v.status === 'pending').length,
        approved: verifications.filter(v => v.status === 'approved').length,
        rejected: verifications.filter(v => v.status === 'rejected').length,
      }

      setStats(stats)
      setMyVerifications(verifications.slice(0, 5))
    } catch (error) {
      showNotification('error', 'Error loading data', error.message)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'My Requests',
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
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 animate-slide-down">
        <h1 className="text-4xl font-heading font-bold text-white mb-2">
          My Dashboard
        </h1>
        <p className="text-white/70">
          Welcome back, {user?.firstName} {user?.lastName}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:bg-gray-800/70 animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`w-14 h-14 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center text-white text-2xl mb-4`}>
              {card.icon}
            </div>
            <div className="text-3xl font-heading font-bold text-blue-400 mb-1">
              {card.value}
            </div>
            <div className="text-white/70">{card.title}</div>
          </div>
        ))}
      </div>

      {/* My Verifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 shadow-lg animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-semibold text-white">
              My Verification Requests
            </h2>
            <Link
              to="/external/verifications"
              className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center"
            >
              View All
              <MdArrowForward className="ml-1" />
            </Link>
          </div>
          {myVerifications.length === 0 ? (
            <div className="text-center py-8 text-white/70">
              <MdVerifiedUser className="text-4xl mx-auto mb-4 text-white/50" />
              <p className="mb-4">No verification requests yet</p>
              <Link
                to="/external/verifications"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/30"
              >
                <MdAddCircle className="mr-2" />
                Submit New Request
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myVerifications.map((verification) => (
                <Link
                  key={verification._id}
                  to={`/external/verifications`}
                  className="block p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors group border border-gray-600/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-semibold">
                      {verification.graduate?.firstName} {verification.graduate?.lastName}
                    </div>
                    {getStatusBadge(verification.status)}
                  </div>
                  <div className="text-sm text-white/70">
                    Request #{verification.requestNumber}
                  </div>
                  {verification.verificationResult && verification.verificationResult !== 'pending' && (
                    <div className="text-xs text-white/70 mt-1">
                      Result: {verification.verificationResult}
                    </div>
                  )}
                  <div className="text-xs text-white/70 mt-1">
                    {new Date(verification.createdAt).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 shadow-lg animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-2xl font-heading font-semibold text-white mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/external/verifications')}
              className="w-full flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors group text-left"
            >
              <div className="flex items-center space-x-3">
                <MdAddCircle className="text-purple-400 text-xl" />
                <span className="text-white">New Request</span>
              </div>
              <MdArrowForward className="text-white/50 group-hover:text-purple-400 transition-colors" />
            </button>
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <div className="text-white/70 text-sm mb-1">Organization</div>
              <div className="text-white font-semibold">{user?.organization || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExternalDashboard
