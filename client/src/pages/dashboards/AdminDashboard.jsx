import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'
import * as graduateService from '../../services/graduates'
import * as userService from '../../services/users'
import * as verificationService from '../../services/verifications'
import { 
  MdSchool, 
  MdPeople, 
  MdVerifiedUser, 
  MdTrendingUp,
  MdArrowForward,
  MdAdd
} from 'react-icons/md'

const AdminDashboard = () => {
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [stats, setStats] = useState({
    graduates: 0,
    users: 0,
    verifications: 0,
    pendingVerifications: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const [graduatesRes, usersRes, verificationsRes] = await Promise.all([
        graduateService.getGraduates(),
        userService.getUsers(),
        verificationService.getVerifications(),
      ])

      const pending = verificationsRes.data?.filter(v => v.status === 'pending') || []

      setStats({
        graduates: graduatesRes.count || 0,
        users: usersRes.data?.length || 0,
        verifications: verificationsRes.count || 0,
        pendingVerifications: pending.length,
      })
    } catch (error) {
      showNotification('error', 'Error loading stats', error.message)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Graduates',
      value: stats.graduates,
      icon: <MdSchool />,
      color: 'from-blue-500 to-cyan-500',
      link: '/admin/graduates',
      action: 'Manage Graduates',
    },
    {
      title: 'Total Users',
      value: stats.users,
      icon: <MdPeople />,
      color: 'from-green-500 to-emerald-500',
      link: '/admin/users',
      action: 'Manage Users',
    },
    {
      title: 'Verifications',
      value: stats.verifications,
      icon: <MdVerifiedUser />,
      color: 'from-purple-500 to-pink-500',
      link: '/admin/verifications',
      action: 'View All',
    },
    {
      title: 'Pending',
      value: stats.pendingVerifications,
      icon: <MdTrendingUp />,
      color: 'from-orange-500 to-red-500',
      link: '/admin/verifications',
      action: 'Review',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 animate-slide-down">
        <h1 className="text-4xl font-heading font-bold text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-white/70">
          Welcome back, {user?.firstName} {user?.lastName}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className="bg-gray-800/50 rounded-xl p-6 border-2 border-transparent hover:border-purple-500/50 transition-all duration-300 hover:bg-gray-800/70 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center text-white text-2xl transform group-hover:scale-110 transition-transform duration-300`}>
                {card.icon}
              </div>
              <MdArrowForward className="text-white/50 group-hover:text-purple-400 transition-colors" />
            </div>
            <div className="text-3xl font-heading font-bold text-blue-400 mb-1">
              {card.value}
            </div>
            <div className="text-white/70 mb-2">{card.title}</div>
            <div className="text-sm text-purple-400 font-medium group-hover:text-purple-300 transition-colors">
              {card.action} →
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-2xl font-heading font-semibold text-white mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              to="/admin/graduates"
              className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <MdSchool className="text-purple-400 text-xl" />
                <span className="text-white">Add New Graduate</span>
              </div>
              <MdAdd className="text-white/50 group-hover:text-purple-400 transition-colors" />
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <MdPeople className="text-purple-400 text-xl" />
                <span className="text-white">Add New User</span>
              </div>
              <MdAdd className="text-white/50 group-hover:text-purple-400 transition-colors" />
            </Link>
            <Link
              to="/admin/verifications"
              className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <MdVerifiedUser className="text-purple-400 text-xl" />
                <span className="text-white">Review Verifications</span>
              </div>
              <MdArrowForward className="text-white/50 group-hover:text-purple-400 transition-colors" />
            </Link>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-2xl font-heading font-semibold text-white mb-4">
            System Overview
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <div className="text-white/70 text-sm mb-1">System Status</div>
              <div className="text-green-400 font-semibold">All Systems Operational</div>
            </div>
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <div className="text-white/70 text-sm mb-1">Total Records</div>
              <div className="text-white font-semibold text-xl">
                {stats.graduates + stats.users + stats.verifications}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
