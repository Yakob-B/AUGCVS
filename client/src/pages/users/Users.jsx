import React, { useState, useEffect } from 'react'
import { useNotification } from '../contexts/NotificationContext'
import * as userService from '../../services/users'
import { MdPeople, MdAdd, MdEdit, MdDelete } from 'react-icons/md'

const Users = () => {
  const { showNotification } = useNotification()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await userService.getUsers()
      setUsers(response.data || [])
    } catch (error) {
      showNotification('error', 'Error loading users', error.message)
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="badge-danger">Admin</span>
      case 'registrar':
        return <span className="badge-warning">Registrar</span>
      case 'external':
        return <span className="badge-info">External</span>
      default:
        return <span className="badge-pending">{role}</span>
    }
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold text-white mb-2">User Management</h1>
          <p className="text-dark-muted">Manage system users and access</p>
        </div>
        <button className="btn-primary mt-4 md:mt-0 inline-flex items-center">
          <MdAdd className="mr-2" />
          Add User
        </button>
      </div>

      <div className="card overflow-x-auto">
        {users.length === 0 ? (
          <div className="text-center py-12 text-dark-muted">
            <MdPeople className="text-5xl mx-auto mb-4 opacity-50" />
            <p>No users found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left p-4 text-dark-text font-semibold">Name</th>
                <th className="text-left p-4 text-dark-text font-semibold">Email</th>
                <th className="text-left p-4 text-dark-text font-semibold">Role</th>
                <th className="text-left p-4 text-dark-text font-semibold">Organization</th>
                <th className="text-left p-4 text-dark-text font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-dark-border hover:bg-dark-surface transition-colors">
                  <td className="p-4 text-dark-text">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="p-4 text-dark-muted">{user.email}</td>
                  <td className="p-4">{getRoleBadge(user.role)}</td>
                  <td className="p-4 text-dark-muted">{user.organization || '-'}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-primary-500 hover:bg-primary-500/10 rounded transition-colors">
                        <MdEdit />
                      </button>
                      <button className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors">
                        <MdDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Users
