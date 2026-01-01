import React, { useState, useEffect } from 'react'
import { useNotification } from '../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import * as graduateService from '../../services/graduates'
import GraduateForm from '../../components/graduates/GraduateForm'
import Pagination from '../../components/common/Pagination'
import { MdSchool, MdAdd, MdSearch, MdEdit, MdDelete } from 'react-icons/md'

const Graduates = () => {
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [graduates, setGraduates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedGraduate, setSelectedGraduate] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })

  useEffect(() => {
    loadGraduates(pagination.page)
  }, [])

  useEffect(() => {
    if (pagination.page && !searchQuery) {
      loadGraduates(pagination.page)
    }
  }, [pagination.page])

  const loadGraduates = async (page = 1) => {
    try {
      setLoading(true)
      const params = { page, limit: 10 }
      const response = await graduateService.getGraduates(params)
      setGraduates(response.data || [])
      setPagination({
        page: response.page || page,
        limit: 10,
        total: response.total || 0,
        pages: response.pages || 1
      })
    } catch (error) {
      showNotification('error', 'Error loading graduates', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    loadGraduates(newPage)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setPagination(prev => ({ ...prev, page: 1 }))
      loadGraduates(1)
      return
    }
    try {
      setLoading(true)
      const response = await graduateService.searchGraduates(searchQuery)
      setGraduates(response.data || [])
      // Reset pagination for search results
      setPagination({ page: 1, limit: 10, total: response.count || 0, pages: 1 })
    } catch (error) {
      showNotification('error', 'Search failed', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setSelectedGraduate(null)
    loadGraduates()
  }

  const handleEdit = (graduate) => {
    setSelectedGraduate(graduate._id)
    setShowForm(true)
  }

  const handleDelete = async (graduate) => {
    if (!window.confirm(`Are you sure you want to delete ${graduate.firstName} ${graduate.lastName}?`)) {
      return
    }

    try {
      await graduateService.deleteGraduate(graduate._id)
      showNotification('success', 'Graduate Deleted', 'Graduate record has been deleted.')
      loadGraduates()
    } catch (error) {
      showNotification('error', 'Delete Failed', error.message)
    }
  }

  if (loading && graduates.length === 0) {
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
          <h1 className="text-4xl font-heading font-bold dark:text-dark-text light:text-light-text mb-2">Graduate Management</h1>
          <p className="dark:text-dark-muted light:text-light-muted">Manage graduate records and certificates</p>
        </div>
        {user.role === 'registrar' && (
          <button
            onClick={() => {
              setSelectedGraduate(null)
              setShowForm(true)
            }}
            className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/30"
          >
            <MdAdd className="mr-2" />
            Add Graduate
          </button>
        )}
      </div>

      {/* Graduate Form Modal */}
      {showForm && (
        <GraduateForm
          graduateId={selectedGraduate}
          onClose={() => {
            setShowForm(false)
            setSelectedGraduate(null)
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Search Bar */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 dark:text-dark-muted light:text-light-muted" size={20} />
            <input
              type="text"
              placeholder="Search by name, student ID, or certificate number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="input pl-10"
            />
          </div>
          <button onClick={handleSearch} className="btn-secondary whitespace-nowrap">
            Search
          </button>
        </div>
      </div>

      {/* Graduates List */}
      <div className="card shadow-lg">
        {graduates.length === 0 ? (
          <div className="text-center py-12 dark:text-dark-muted light:text-light-muted">
            <MdSchool className="text-5xl mx-auto mb-4 opacity-50 text-primary-400" />
            <p>No graduates found</p>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="block md:hidden space-y-4">
              {graduates.map((graduate) => (
                <div
                  key={graduate._id}
                  className="p-4 rounded-xl dark:bg-dark-surface light:bg-light-surface border dark:border-dark-border light:border-light-border"
                >
                  {/* Graduate Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold dark:text-dark-text light:text-light-text text-lg truncate">
                        {graduate.firstName} {graduate.lastName}
                      </h3>
                      <p className="text-sm dark:text-dark-muted light:text-light-muted mt-1">
                        ID: {graduate.studentId}
                      </p>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {graduate.graduationYear}
                      </span>
                    </div>
                  </div>

                  {/* Graduate Details */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="dark:text-dark-muted light:text-light-muted">Program</span>
                      <span className="dark:text-dark-text light:text-light-text font-medium truncate ml-4 max-w-[60%] text-right">
                        {graduate.program}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="dark:text-dark-muted light:text-light-muted">Certificate #</span>
                      <span className="dark:text-dark-text light:text-light-text font-medium">
                        {graduate.certificateNumber}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons - Beautifully Styled */}
                  {user.role === 'registrar' && (
                    <div className="flex items-center gap-3 pt-4 border-t dark:border-dark-border light:border-light-border">
                      <button
                        onClick={() => handleEdit(graduate)}
                        className="group flex-1 relative flex items-center justify-center gap-2 py-3.5 px-4 overflow-hidden rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-95
                          bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white
                          shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40
                          before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/25 before:to-white/0 
                          before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700"
                      >
                        <MdEdit className="text-lg transition-transform group-hover:rotate-12" />
                        <span>Edit</span>
                      </button>
                      {user.role === 'registrar' && (
                        <button
                          onClick={() => handleDelete(graduate)}
                          className="group flex-1 relative flex items-center justify-center gap-2 py-3.5 px-4 overflow-hidden rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-95
                            bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 text-white
                            shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40
                            before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/25 before:to-white/0 
                            before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700"
                        >
                          <MdDelete className="text-lg transition-transform group-hover:scale-110" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-dark-border light:border-light-border">
                    <th className="text-left p-4 font-semibold dark:text-dark-text light:text-light-text">Student ID</th>
                    <th className="text-left p-4 font-semibold dark:text-dark-text light:text-light-text">Name</th>
                    <th className="text-left p-4 font-semibold dark:text-dark-text light:text-light-text">Program</th>
                    <th className="text-left p-4 font-semibold dark:text-dark-text light:text-light-text">Graduation Year</th>
                    <th className="text-left p-4 font-semibold dark:text-dark-text light:text-light-text">Certificate #</th>
                    <th className="text-left p-4 font-semibold dark:text-dark-text light:text-light-text">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {graduates.map((graduate) => (
                    <tr key={graduate._id} className="border-b dark:border-dark-border light:border-light-border hover:dark:bg-dark-surface hover:light:bg-gray-50 transition-colors">
                      <td className="p-4">{graduate.studentId}</td>
                      <td className="p-4">
                        {graduate.firstName} {graduate.lastName}
                      </td>
                      <td className="p-4 dark:text-dark-muted light:text-light-muted">{graduate.program}</td>
                      <td className="p-4 dark:text-dark-muted light:text-light-muted">{graduate.graduationYear}</td>
                      <td className="p-4 dark:text-dark-muted light:text-light-muted">{graduate.certificateNumber}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {user.role === 'registrar' && (
                            <button
                              onClick={() => handleEdit(graduate)}
                              className="group relative p-2.5 rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-110 active:scale-95
                                bg-gradient-to-br from-violet-600 to-indigo-600 text-white
                                shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/40
                                before:absolute before:inset-0 before:bg-white/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity"
                              title="Edit Graduate"
                            >
                              <MdEdit className="text-lg relative z-10 transition-transform group-hover:rotate-12" />
                            </button>
                          )}
                          {user.role === 'registrar' && (
                            <button
                              onClick={() => handleDelete(graduate)}
                              className="group relative p-2.5 rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-110 active:scale-95
                                bg-gradient-to-br from-rose-600 to-pink-600 text-white
                                shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/40
                                before:absolute before:inset-0 before:bg-white/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity"
                              title="Delete Graduate"
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
        {pagination.pages > 1 && !searchQuery && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  )
}

export default Graduates
