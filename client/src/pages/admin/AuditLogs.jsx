import React, { useState, useEffect } from 'react'
import { MdSearch, MdRefresh, MdSecurity, MdError } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { getAuditLogs } from '../../services/auditLogService'
import { useNotification } from '../../pages/contexts/NotificationContext'
import { format } from 'date-fns'

const AuditLogs = () => {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [actionFilter, setActionFilter] = useState('')
    const { showNotification } = useNotification()

    useEffect(() => {
        fetchLogs()
    }, [page])

    const fetchLogs = async () => {
        try {
            setLoading(true)
            const response = await getAuditLogs(page, 20, actionFilter)
            if (response.success) {
                setLogs(response.data)
                setTotalPages(response.pagination.pages)
            }
        } catch (error) {
            showNotification('error', 'Error fetching logs', error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setPage(1)
        fetchLogs()
    }

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold dark:text-dark-text light:text-light-text flex items-center gap-2">
                        <MdSecurity className="text-primary-500" />
                        System Audit Logs
                    </h1>
                    <p className="dark:text-dark-muted light:text-light-muted mt-2">
                        View system activities and security events
                    </p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-grow md:flex-grow-0">
                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search actions..."
                                value={actionFilter}
                                onChange={(e) => setActionFilter(e.target.value)}
                                className="pl-10 pr-4 py-2 rounded-lg border dark:bg-dark-surface dark:border-dark-border light:bg-light-surface light:border-light-border dark:text-dark-text w-full md:w-64 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            Search
                        </button>
                    </form>
                    <button
                        onClick={fetchLogs}
                        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        title="Refresh"
                    >
                        <MdRefresh className="text-xl dark:text-dark-text" />
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg overflow-hidden border dark:border-dark-border">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-dark-bg border-b dark:border-dark-border">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wider">
                                    Timestamp
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wider">
                                    Action
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wider">
                                    Details
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wider">
                                    IP Address
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-dark-muted">
                                        <div className="flex flex-col items-center gap-2">
                                            <MdError className="text-4xl text-gray-400" />
                                            <p>No logs found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-dark-card transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-dark-text">
                                            {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {log.user ? (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-dark-text">
                                                        {log.user.firstName} {log.user.lastName}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-dark-muted">
                                                        {log.user.email}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500 dark:text-dark-muted italic">
                                                    System / Guest
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${log.action.includes('error') || log.action.includes('fail')
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-dark-muted max-w-xs truncate" title={JSON.stringify(log.details)}>
                                            {JSON.stringify(log.details)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-muted font-mono">
                                            {log.ip || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-border flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-dark-muted">
                        Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                            className="px-3 py-1 rounded border dark:border-dark-border disabled:opacity-50 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-card transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={page === totalPages}
                            className="px-3 py-1 rounded border dark:border-dark-border disabled:opacity-50 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-card transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuditLogs
