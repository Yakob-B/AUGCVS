import React, { useState, useEffect } from 'react'
import * as supportService from '../../services/support'
import { useNotification } from '../contexts/NotificationContext'
import {
    MdEmail,
    MdCheckCircle,
    MdDelete,
    MdAccessTime,
    MdMessage,
    MdOutlinedFlag
} from 'react-icons/md'
import { FaSpinner } from 'react-icons/fa'

const SupportInbox = () => {
    const { showNotification } = useNotification()
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('pending') // all, pending, resolved

    useEffect(() => {
        loadRequests()
    }, [])

    const loadRequests = async () => {
        try {
            setLoading(true)
            const response = await supportService.getSupportRequests()
            setRequests(response.data)
        } catch (error) {
            showNotification('error', 'Failed to Load', 'Could not fetch support requests.')
        } finally {
            setLoading(false)
        }
    }

    const handleResolve = async (id) => {
        try {
            await supportService.resolveSupportRequest(id)
            showNotification('success', 'Request Resolved', 'Issue marked as resolved.')
            loadRequests()
        } catch (error) {
            showNotification('error', 'Action Failed', error.message)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this support request?')) return
        try {
            await supportService.deleteSupportRequest(id)
            showNotification('success', 'Deleted', 'Support request removed.')
            loadRequests()
        } catch (error) {
            showNotification('error', 'Delete Failed', error.message)
        }
    }

    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true
        return req.status === filter
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FaSpinner className="animate-spin text-4xl text-blue-500" />
            </div>
        )
    }

    return (
        <div className="animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-heading font-bold dark:text-dark-text light:text-light-text mb-2">
                        Support Inbox
                    </h1>
                    <p className="dark:text-dark-muted light:text-light-muted">
                        Manage messages from deactivated users and system inquiries.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex p-1 bg-gray-100 dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-white/10">
                    {['all', 'pending', 'resolved'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300 ${filter === f
                                ? 'bg-white dark:bg-dark-card text-blue-600 shadow-md transform scale-105'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Requests Grid */}
            <div className="grid grid-cols-1 gap-6">
                {filteredRequests.length === 0 ? (
                    <div className="p-12 text-center bg-gray-50 dark:bg-dark-surface rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/5">
                        <MdOutlinedFlag className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-xl font-heading font-semibold text-gray-500">No support requests found</p>
                        <p className="text-gray-400">Everything looks clear for now!</p>
                    </div>
                ) : (
                    filteredRequests.map((request) => (
                        <div
                            key={request._id}
                            className={`group p-6 rounded-2xl transition-all duration-300 border-2 ${request.status === 'pending'
                                ? 'bg-white dark:bg-dark-card border-transparent hover:border-blue-500/30 shadow-lg hover:shadow-blue-500/10'
                                : 'bg-gray-50/50 dark:bg-dark-surface/50 border-transparent opacity-75'
                                }`}
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Status & Icon */}
                                <div className="flex-shrink-0">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${request.status === 'pending'
                                        ? 'bg-blue-100 text-blue-600 animate-pulse-slow'
                                        : 'bg-green-100 text-green-600'
                                        }`}>
                                        {request.status === 'pending' ? <MdMessage /> : <MdCheckCircle />}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-grow space-y-3">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <MdEmail className="text-gray-400" />
                                            <span className="font-bold text-lg dark:text-dark-text">{request.userEmail}</span>
                                            {request.status === 'pending' && (
                                                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-black uppercase">New</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <MdAccessTime />
                                            {new Date(request.createdAt).toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 dark:bg-dark-surface rounded-xl italic text-gray-700 dark:text-dark-muted border-l-4 border-blue-500/30">
                                        "{request.message}"
                                    </div>

                                    {request.status === 'resolved' && (
                                        <div className="flex items-center gap-2 text-xs text-green-500 font-medium">
                                            <MdCheckCircle />
                                            Resolved by {request.resolvedBy?.firstName} at {new Date(request.resolvedAt).toLocaleTimeString()}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex md:flex-col justify-end gap-2">
                                    {request.status === 'pending' && (
                                        <button
                                            onClick={() => handleResolve(request._id)}
                                            className="flex-1 md:flex-none px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                                            title="Mark as Resolved"
                                        >
                                            <MdCheckCircle /> Resolve
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(request._id)}
                                        className="px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold transition-all active:scale-95 flex items-center justify-center"
                                        title="Delete Request"
                                    >
                                        <MdDelete size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default SupportInbox
