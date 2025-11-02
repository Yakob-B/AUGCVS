import React, { useState, useEffect } from 'react'
import { useNotification } from '../contexts/NotificationContext'
import * as graduateService from '../../services/graduates'
import { MdSchool, MdAdd, MdSearch, MdEdit, MdDelete, MdFilterList } from 'react-icons/md'

const Graduates = () => {
  const { showNotification } = useNotification()
  const [graduates, setGraduates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadGraduates()
  }, [])

  const loadGraduates = async () => {
    try {
      setLoading(true)
      const response = await graduateService.getGraduates()
      setGraduates(response.data || [])
    } catch (error) {
      showNotification('error', 'Error loading graduates', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadGraduates()
      return
    }
    try {
      setLoading(true)
      const response = await graduateService.searchGraduates(searchQuery)
      setGraduates(response.data || [])
    } catch (error) {
      showNotification('error', 'Search failed', error.message)
    } finally {
      setLoading(false)
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
          <h1 className="text-4xl font-heading font-bold text-white mb-2">Graduate Management</h1>
          <p className="text-dark-muted">Manage graduate records and certificates</p>
        </div>
        <button className="btn-primary mt-4 md:mt-0 inline-flex items-center">
          <MdAdd className="mr-2" />
          Add Graduate
        </button>
      </div>

      {/* Search Bar */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted" size={20} />
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
          <div className="text-center py-12 text-dark-muted">
            <MdSchool className="text-5xl mx-auto mb-4 opacity-50" />
            <p>No graduates found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left p-4 text-dark-text font-semibold">Student ID</th>
                <th className="text-left p-4 text-dark-text font-semibold">Name</th>
                <th className="text-left p-4 text-dark-text font-semibold">Program</th>
                <th className="text-left p-4 text-dark-text font-semibold">Graduation Year</th>
                <th className="text-left p-4 text-dark-text font-semibold">Certificate #</th>
                <th className="text-left p-4 text-dark-text font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {graduates.map((graduate) => (
                <tr key={graduate._id} className="border-b border-dark-border hover:bg-dark-surface transition-colors">
                  <td className="p-4 text-dark-text">{graduate.studentId}</td>
                  <td className="p-4 text-dark-text">
                    {graduate.firstName} {graduate.lastName}
                  </td>
                  <td className="p-4 text-dark-muted">{graduate.program}</td>
                  <td className="p-4 text-dark-muted">{graduate.graduationYear}</td>
                  <td className="p-4 text-dark-muted">{graduate.certificateNumber}</td>
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

export default Graduates
