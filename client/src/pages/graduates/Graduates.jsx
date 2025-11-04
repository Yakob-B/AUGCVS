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
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold text-white mb-2">Graduate Management</h1>
          <p className="text-white/70">Manage graduate records and certificates</p>
        </div>
        {(user.role === 'admin' || user.role === 'registrar') && (
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
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
            <input
              type="text"
              placeholder="Search by name, student ID, or certificate number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <button onClick={handleSearch} className="px-6 py-3 bg-gray-700/50 border border-gray-600/50 text-white rounded-lg hover:bg-gray-700/70 transition-colors">
            Search
          </button>
        </div>
      </div>

      {/* Graduates Table */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 shadow-lg overflow-x-auto">
        {graduates.length === 0 ? (
          <div className="text-center py-12 text-white/70">
            <MdSchool className="text-5xl mx-auto mb-4 opacity-50" />
            <p>No graduates found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="text-left p-4 text-white font-semibold">Student ID</th>
                <th className="text-left p-4 text-white font-semibold">Name</th>
                <th className="text-left p-4 text-white font-semibold">Program</th>
                <th className="text-left p-4 text-white font-semibold">Graduation Year</th>
                <th className="text-left p-4 text-white font-semibold">Certificate #</th>
                <th className="text-left p-4 text-white font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {graduates.map((graduate) => (
                <tr key={graduate._id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                  <td className="p-4 text-white">{graduate.studentId}</td>
                  <td className="p-4 text-white">
                    {graduate.firstName} {graduate.lastName}
                  </td>
                  <td className="p-4 text-white/70">{graduate.program}</td>
                  <td className="p-4 text-white/70">{graduate.graduationYear}</td>
                  <td className="p-4 text-white/70">{graduate.certificateNumber}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {(user.role === 'admin' || user.role === 'registrar') && (
                        <button
                          onClick={() => handleEdit(graduate)}
                          className="p-2 text-purple-400 hover:bg-purple-500/20 rounded transition-colors"
                          title="Edit"
                        >
                          <MdEdit />
                        </button>
                      )}
                      {user.role === 'admin' && (
                        <button
                          onClick={() => handleDelete(graduate)}
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
