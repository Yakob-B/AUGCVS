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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold dark:text-white light:text-light-text mb-2">Graduate Management</h1>
          <p className="dark:text-dark-muted light:text-light-muted">Manage graduate records and certificates</p>
        </div>
        {(user.role === 'admin' || user.role === 'registrar') && (
          <button
            onClick={() => {
              setSelectedGraduate(null)
              setShowForm(true)
            }}
            className="btn-primary mt-4 md:mt-0 inline-flex items-center"
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
          <button onClick={handleSearch} className="btn-secondary">
            Search
          </button>
        </div>
      </div>

      {/* Graduates Table */}
      <div className="card overflow-x-auto">
        {graduates.length === 0 ? (
          <div className="text-center py-12 dark:text-dark-muted light:text-light-muted">
            <MdSchool className="text-5xl mx-auto mb-4 opacity-50" />
            <p>No graduates found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left p-4 dark:text-dark-text light:text-light-text font-semibold">Student ID</th>
                <th className="text-left p-4 dark:text-dark-text light:text-light-text font-semibold">Name</th>
                <th className="text-left p-4 dark:text-dark-text light:text-light-text font-semibold">Program</th>
                <th className="text-left p-4 dark:text-dark-text light:text-light-text font-semibold">Graduation Year</th>
                <th className="text-left p-4 dark:text-dark-text light:text-light-text font-semibold">Certificate #</th>
                <th className="text-left p-4 dark:text-dark-text light:text-light-text font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {graduates.map((graduate) => (
                <tr key={graduate._id} className="border-b border-dark-border hover:bg-dark-surface transition-colors">
                  <td className="p-4 dark:text-dark-text light:text-light-text">{graduate.studentId}</td>
                  <td className="p-4 dark:text-dark-text light:text-light-text">
                    {graduate.firstName} {graduate.lastName}
                  </td>
                  <td className="p-4 dark:text-dark-muted light:text-light-muted">{graduate.program}</td>
                  <td className="p-4 dark:text-dark-muted light:text-light-muted">{graduate.graduationYear}</td>
                  <td className="p-4 dark:text-dark-muted light:text-light-muted">{graduate.certificateNumber}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {(user.role === 'admin' || user.role === 'registrar') && (
                        <button
                          onClick={() => handleEdit(graduate)}
                          className="p-2 text-primary-500 hover:bg-primary-500/10 rounded transition-colors"
                          title="Edit"
                        >
                          <MdEdit />
                        </button>
                      )}
                      {user.role === 'admin' && (
                        <button
                          onClick={() => handleDelete(graduate)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
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
