import React, { useState, useEffect } from 'react'
import { useNotification } from '../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import * as userService from '../../services/users'
import UserForm from '../../components/users/UserForm'
import { MdPeople, MdAdd, MdEdit, MdDelete } from 'react-icons/md'

const Users = () => {
  const { user: currentUser } = useAuth()
  const { showNotification } = useNotification()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

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

  const handleFormSuccess = () => {
    setShowForm(false)
    setSelectedUser(null)
    loadUsers()
  }

  const handleEdit = (user) => {
    setSelectedUser(user._id)
    setShowForm(true)
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      return
    }

    try {
      await userService.deleteUser(user._id)
      showNotification('success', 'User Deleted', 'User has been deleted successfully.')
      loadUsers()
    } catch (error) {
      showNotification('error', 'Delete Failed', error.message)
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in dark:text-dark-text light:text-light-text">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold dark:text-dark-text light:text-light-text mb-2">User Management</h1>
          <p className="dark:text-dark-muted light:text-light-muted">Manage system users and access</p>
        </div>
        <button
          onClick={() => {
            setSelectedUser(null)
            setShowForm(true)
          }}
          className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/30"
        >
          <MdAdd className="mr-2" />
          Add User
        </button>
      </div>

      {/* User Form Modal */}
      {showForm && (
        <UserForm
          userId={selectedUser}
          onClose={() => {
            setShowForm(false)
            setSelectedUser(null)
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      <div className="card shadow-lg overflow-x-auto">
        {users.length === 0 ? (
          <div className="text-center py-12 dark:text-dark-muted light:text-light-muted">
            <MdPeople className="text-5xl mx-auto mb-4 opacity-50 text-primary-400" />
            <p>No users found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-dark-border light:border-light-border">
                <th className="text-left p-4 font-semibold dark:text-dark-text light:text-light-text">Name</th>
                <th className="text-left p-4 font-semibold dark:text-dark-text light:text-light-text">Email</th>
                <th className="text-left p-4 font-semibold dark:text-dark-text light:text-light-text">Role</th>
                <th className="text-left p-4 font-semibold dark:text-dark-text light:text-light-text">Organization</th>
                <th className="text-left p-4 font-semibold dark:text-dark-text light:text-light-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b dark:border-dark-border light:border-light-border hover:dark:bg-dark-surface hover:light:bg-gray-50 transition-colors">
                  <td className="p-4">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="p-4 dark:text-dark-muted light:text-light-muted">{user.email}</td>
                  <td className="p-4">{getRoleBadge(user.role)}</td>
                  <td className="p-4 dark:text-dark-muted light:text-light-muted">{user.organization || '-'}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-primary-400 hover:bg-primary-500/10 rounded transition-colors"
                        title="Edit"
                      >
                        <MdEdit />
                      </button>
                      {currentUser?._id !== user._id && (
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                          title="Delete"
                        >
                          <MdDelete />
                        </button>
                      )}
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
