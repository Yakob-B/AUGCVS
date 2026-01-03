import React, { useState, useEffect } from 'react'
import { useNotification } from '../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import * as userService from '../../services/users'
import UserForm from '../../components/users/UserForm'
import { MdPeople, MdAdd, MdEdit, MdDelete, MdBlock, MdCheckCircle } from 'react-icons/md'

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

  const handleToggleStatus = async (user) => {
    const action = user.status === 'active' ? 'deactivate' : 'activate'
    if (!window.confirm(`Are you sure you want to ${action} ${user.firstName}'s account?`)) {
      return
    }

    try {
      await userService.toggleUserStatus(user._id)
      showNotification('success', `User ${action === 'activate' ? 'Activated' : 'Deactivated'}`, `User account has been ${action}d successfully.`)
      loadUsers()
    } catch (error) {
      showNotification('error', `${action === 'activate' ? 'Activation' : 'Deactivation'} Failed`, error.message)
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

  const getStatusBadge = (status) => {
    const isActive = status === 'active'
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${isActive
          ? 'bg-green-100/20 text-green-500 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
          : 'bg-red-100/20 text-red-500 border border-red-500/30'
        }`}>
        {status}
      </span>
    )
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

      <div className="card shadow-lg">
        {users.length === 0 ? (
          <div className="text-center py-12 dark:text-dark-muted light:text-light-muted">
            <MdPeople className="text-5xl mx-auto mb-4 opacity-50 text-primary-400" />
            <p>No users found</p>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="block md:hidden space-y-4">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="p-4 rounded-xl dark:bg-dark-surface light:bg-light-surface border dark:border-dark-border light:border-light-border"
                >
                  {/* User Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold dark:text-dark-text light:text-light-text text-lg truncate">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm dark:text-dark-muted light:text-light-muted truncate mt-1">
                        {user.email}
                      </p>
                    </div>
                    <div className="ml-3 flex flex-col items-end gap-2">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status || 'active')}
                    </div>
                  </div>

                  {/* Organization */}
                  {user.organization && (
                    <div className="mb-4 text-sm">
                      <span className="dark:text-dark-muted light:text-light-muted">Organization: </span>
                      <span className="dark:text-dark-text light:text-light-text">{user.organization}</span>
                    </div>
                  )}

                  {/* Action Buttons - Beautifully Styled */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t dark:border-dark-border light:border-light-border">
                    <button
                      onClick={() => handleEdit(user)}
                      className="group relative flex items-center justify-center gap-2 py-3 px-4 overflow-hidden rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-95
                        bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white
                        shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40"
                    >
                      <MdEdit className="text-lg transition-transform group-hover:rotate-12" />
                      <span>Edit</span>
                    </button>
                    {currentUser?._id !== user._id && (
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`group relative flex items-center justify-center gap-2 py-3 px-4 overflow-hidden rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-95 text-white shadow-lg
                          ${user.status === 'deactivated'
                            ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 shadow-emerald-500/25 hover:shadow-emerald-500/40'
                            : 'bg-gradient-to-r from-orange-500 via-amber-600 to-yellow-600 shadow-amber-500/25 hover:shadow-amber-500/40'}`}
                      >
                        {user.status === 'deactivated' ? (
                          <><MdCheckCircle className="text-lg" /><span>Activate</span></>
                        ) : (
                          <><MdBlock className="text-lg" /><span>Deactivate</span></>
                        )}
                      </button>
                    )}
                    {currentUser?._id !== user._id && (
                      <button
                        onClick={() => handleDelete(user)}
                        className="group col-span-2 relative flex items-center justify-center gap-2 py-3 px-4 overflow-hidden rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-95
                          bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 text-white
                          shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40"
                      >
                        <MdDelete className="text-lg transition-transform group-hover:scale-110" />
                        <span>Delete Permanently</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-dark-border light:border-light-border">
                    <th className="text-left p-4 font-semibold dark:text-dark-text light:text-light-text">Name</th>
                    <th className="text-left p-4 font-semibold dark:text-dark-text light:text-light-text">Email</th>
                    <th className="text-left p-4 font-semibold dark:text-dark-text light:text-light-text">Role</th>
                    <th className="text-left p-4 font-semibold dark:text-dark-text light:text-light-text">Status</th>
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
                      <td className="p-4">
                        {getStatusBadge(user.status || 'active')}
                      </td>
                      <td className="p-4 dark:text-dark-muted light:text-light-muted">{user.organization || '-'}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="group relative p-2.5 rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-110 active:scale-95
                              bg-gradient-to-br from-violet-600 to-indigo-600 text-white
                              shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/40"
                            title="Edit User"
                          >
                            <MdEdit className="text-lg relative z-10 transition-transform group-hover:rotate-12" />
                          </button>

                          {currentUser?._id !== user._id && (
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className={`group relative p-2.5 rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-110 active:scale-95 text-white shadow-md
                                ${user.status === 'deactivated'
                                  ? 'bg-gradient-to-br from-green-600 to-emerald-600 shadow-emerald-500/20 hover:shadow-emerald-500/40'
                                  : 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-amber-500/20 hover:shadow-amber-500/40'}`}
                              title={user.status === 'deactivated' ? 'Activate User' : 'Deactivate User'}
                            >
                              {user.status === 'deactivated' ? (
                                <MdCheckCircle className="text-lg relative z-10" />
                              ) : (
                                <MdBlock className="text-lg relative z-10" />
                              )}
                            </button>
                          )}

                          {currentUser?._id !== user._id && (
                            <button
                              onClick={() => handleDelete(user)}
                              className="group relative p-2.5 rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-110 active:scale-95
                                bg-gradient-to-br from-rose-600 to-pink-600 text-white
                                shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/40"
                              title="Delete User"
                            >
                              <MdDelete className="text-lg relative z-10 transition-transform group-hover:scale-110" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Users
