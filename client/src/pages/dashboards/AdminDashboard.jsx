import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'
import * as userService from '../../services/users'
import {
  MdSchool,
  MdPeople,
  MdVerifiedUser,
  MdTrendingUp,
  MdArrowForward,
  MdAdd,
  MdFileUpload
} from 'react-icons/md'
import BulkUploadModal from '../../components/graduates/BulkUploadModal'

const AdminDashboard = () => {
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [stats, setStats] = useState({
    users: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const usersRes = await userService.getUsers()

      setStats({
        users: usersRes.data?.length || 0,
      })
    } catch (error) {
      showNotification('error', 'Error loading stats', error.message)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users,
      icon: <MdPeople />,
      color: 'from-green-500 to-emerald-500',
      link: '/admin/users',
      action: 'Manage Users',
    },
    {
      title: 'Active Sessions',
      value: 'Live', // Placeholder for actual session count if available
      icon: <MdTrendingUp />,
      color: 'from-orange-500 to-red-500',
      link: '/admin/users',
      action: 'Audit Logs',
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
    <div className="animate-fade-in dark:text-dark-text light:text-light-text">
      {/* Header */}
      <div className="mb-8 animate-slide-down">
        <h1 className="text-4xl font-heading font-bold dark:text-dark-text light:text-light-text mb-2">
          Admin Dashboard
        </h1>
        <p className="dark:text-dark-muted light:text-light-muted">
          Welcome back, {user?.firstName} {user?.lastName}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className="card-hover border-2 border-transparent hover:border-primary-500/50 transition-all duration-300 group"
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
            <div className="dark:text-dark-muted light:text-light-muted mb-2">{card.title}</div>
            <div className="text-sm text-primary-400 font-medium group-hover:text-primary-300 transition-colors">
              {card.action} →
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-2xl font-heading font-semibold dark:text-dark-text light:text-light-text mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              to="/admin/users"
              className="flex items-center justify-between p-4 rounded-lg dark:bg-dark-surface light:bg-light-surface hover:dark:bg-dark-card hover:light:bg-gray-100 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <MdPeople className="text-primary-400 text-xl" />
                <span className="dark:text-dark-text light:text-light-text">Add New User</span>
              </div>
              <MdAdd className="dark:text-dark-muted light:text-light-muted group-hover:text-primary-400 transition-colors" />
            </Link>
          </div>
        </div>

        <div className="card animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-2xl font-heading font-semibold dark:text-dark-text light:text-light-text mb-4">
            System Overview
          </h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg dark:bg-dark-surface light:bg-light-surface">
              <div className="dark:text-dark-muted light:text-light-muted text-sm mb-1">System Status</div>
              <div className="text-green-400 font-semibold">All Systems Operational</div>
            </div>
            <div className="p-4 rounded-lg dark:bg-dark-surface light:bg-light-surface">
              <div className="dark:text-dark-muted light:text-light-muted text-sm mb-1">Total System Users</div>
              <div className="dark:text-dark-text light:text-light-text font-semibold text-xl">
                {stats.users}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default AdminDashboard
