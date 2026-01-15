import React, { useState } from 'react'
import { MdCloudUpload, MdClose, MdCheckCircle, MdError, MdFileDownload } from 'react-icons/md'
import { FaSpinner, FaFileArchive } from 'react-icons/fa'
import { useNotification } from '../../pages/contexts/NotificationContext'
import { bulkUploadGraduates } from '../../services/graduates'

const BulkUploadModal = ({ onClose, onSuccess }) => {
    const { showNotification } = useNotification()
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0) // Mock progress for better UX
    const [result, setResult] = useState(null)
    const [dragActive, setDragActive] = useState(false)

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0])
        }
    }

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0])
        }
    }

    const validateAndSetFile = (selectedFile) => {
        if (!selectedFile.name.endsWith('.zip')) {
            showNotification('error', 'Invalid File', 'Please upload a ZIP file.')
            return
        }
        setFile(selectedFile)
        setResult(null)
    }

    const handleUpload = async () => {
        if (!file) return

        setLoading(true)
        setProgress(10) // Start progress

        const formData = new FormData()
        formData.append('file', file)

        try {
            // Mock progress increment
            const interval = setInterval(() => {
                setProgress((prev) => (prev >= 90 ? 90 : prev + 10))
            }, 500)

            const response = await bulkUploadGraduates(formData)

            clearInterval(interval)
            setProgress(100)
            setResult(response)

            if (response.success) {
                showNotification('success', 'Upload Complete', response.message)
                if (onSuccess) onSuccess()
            }
        } catch (error) {
            console.error(error)
            const msg = error.response?.data?.message || 'Upload failed'
            showNotification('error', 'Upload Failed', msg)
            setResult({ success: false, message: msg })
        } finally {
            setLoading(false)
        }
    }

    if (result) {
        const isActuallySuccessful = result.success && result.stats?.success > 0;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-8 text-center animate-scale-in max-h-[95vh] overflow-y-auto">
                    <div className={`w-16 h-16 ${isActuallySuccessful ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        {isActuallySuccessful ? (
                            <MdCheckCircle className="text-4xl text-green-500" />
                        ) : (
                            <MdClose className="text-4xl text-red-500" />
                        )}
                    </div>
                    <h2 className={`text-2xl font-bold ${isActuallySuccessful ? 'text-gray-800' : 'text-red-600'} mb-2`}>
                        {isActuallySuccessful ? 'Upload Successful!' : 'Upload Failed'}
                    </h2>
                    <p className="text-gray-600 mb-6">{result.message}</p>

                    <div className="grid grid-cols-2 gap-3 sm:gap-6 bg-gray-50 p-4 rounded-xl mb-6">
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-green-600">{result.stats?.success || 0}</div>
                            <div className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider">Success</div>
                        </div>
                        <div className="text-center border-l border-gray-200">
                            <div className="text-2xl sm:text-3xl font-bold text-red-500">{result.stats?.failed || 0}</div>
                            <div className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider">Failed</div>
                        </div>
                    </div>

                    {result.stats?.errors?.length > 0 && (
                        <div className="text-left bg-red-50 p-3 rounded-lg mb-6 max-h-40 overflow-y-auto text-sm border border-red-100">
                            <p className="font-semibold text-red-700 mb-1">Errors:</p>
                            <ul className="list-disc list-inside text-red-600">
                                {result.stats.errors.map((err, i) => (
                                    <li key={i}>{err.studentId}: {err.error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all"
                    >
                        Done
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 sm:p-6 text-white relative overflow-hidden flex-shrink-0">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-10 -translate-y-10"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -translate-x-5 translate-y-5"></div>

                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold mb-1">Bulk Certificate Import</h2>
                            <p className="text-purple-100 text-xs sm:text-sm">Upload ZIP containing Excel + Certificates</p>
                        </div>
                        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-lg">
                            <MdClose size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar">
                    {/* Guide */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5 flex items-start gap-3">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg mt-0.5">
                            <FaFileArchive />
                        </div>
                        <div className="text-sm text-blue-800">
                            <p className="font-semibold mb-1">ZIP File Structure:</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-700/80">
                                <li>1 Excel File (Student Data)</li>
                                <li>Certificate PDFs/Images</li>
                                <li>Filenames must match Student IDs</li>
                            </ul>
                            <a
                                href="/bulk_upload_template.csv"
                                download
                                className="inline-flex items-center gap-1 mt-3 text-blue-600 font-bold hover:underline"
                            >
                                <MdFileDownload className="text-lg" />
                                <span>Download CSV Template</span>
                            </a>
                        </div>
                    </div>

                    {/* Upload Area */}
                    <div
                        className={`border-3 border-dashed rounded-2xl p-6 sm:p-10 text-center transition-all duration-300 relative ${dragActive
                            ? 'border-purple-500 bg-purple-50 scale-[1.02]'
                            : file
                                ? 'border-green-400 bg-green-50'
                                : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            id="zipUpload"
                            accept=".zip"
                            className="hidden"
                            onChange={handleChange}
                        />

                        {file ? (
                            <div className="py-4">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                                    <FaFileArchive className="text-3xl" />
                                </div>
                                <p className="font-bold text-gray-800 text-lg truncate max-w-[200px] mx-auto">{file.name}</p>
                                <p className="text-gray-500 text-sm mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                <button
                                    onClick={() => setFile(null)}
                                    className="text-red-500 text-sm font-semibold hover:text-red-600 hover:underline"
                                >
                                    Remove File
                                </button>
                            </div>
                        ) : (
                            <label htmlFor="zipUpload" className="cursor-pointer block py-4">
                                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <MdCloudUpload className="text-3xl" />
                                </div>
                                <p className="text-gray-800 font-bold text-lg mb-1">Click to upload</p>
                                <p className="text-gray-500 text-sm">or drag and drop ZIP file here</p>
                            </label>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col gap-3">
                        <button
                            onClick={handleUpload}
                            disabled={!file || loading}
                            className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin text-lg sm:text-xl" />
                                    <span>Processing... ({progress}%)</span>
                                </>
                            ) : (
                                <>
                                    <MdCloudUpload className="text-lg sm:text-xl" />
                                    <span>Start Bulk Import</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="text-gray-500 font-semibold hover:text-gray-700 hover:bg-gray-100 py-3 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BulkUploadModal
