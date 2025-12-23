import React, { useState, useRef } from 'react';
import { MdCloudUpload, MdClose, MdCheckCircle, MdError, MdFileDownload } from 'react-icons/md';
import api from '../../services/api';
import { useNotification } from '../../pages/contexts/NotificationContext';

const BulkUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);
    const { showNotification } = useNotification();

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const allowedExtensions = ['.csv', '.xlsx', '.xls'];
            const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

            if (!allowedExtensions.includes(fileExtension)) {
                showNotification('error', 'Invalid file type', 'Please upload a CSV or Excel file.');
                setFile(null);
                return;
            }

            setFile(selectedFile);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/graduates/bulk-upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setResult(response.data);
                showNotification('success', 'Upload complete', `Successfully imported ${response.data.summary.success} graduates.`);
                if (onUploadSuccess) onUploadSuccess();
            }
        } catch (error) {
            console.error('Upload failed:', error);
            showNotification('error', 'Upload failed', error.response?.data?.message || 'Something went wrong during upload.');
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        const headers = [
            'Student ID', 'First Name', 'Last Name', 'Middle Name',
            'Date of Birth', 'Gender', 'Program', 'Department',
            'College', 'Graduation Year', 'Graduation Date',
            'Degree Type', 'GPA', 'Certificate Number'
        ];

        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "graduate_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-dark-surface border border-dark-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-zoom-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-dark-border bg-dark-card">
                    <h2 className="text-2xl font-heading font-bold text-white">Bulk Graduate Upload</h2>
                    <button onClick={onClose} className="text-dark-muted hover:text-white transition-colors">
                        <MdClose size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {!result ? (
                        <div className="space-y-6">
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${file ? 'border-primary-500 bg-primary-500/10' : 'border-dark-border hover:border-primary-500 hover:bg-dark-card'
                                    }`}
                            >
                                <MdCloudUpload className={`text-6xl mb-4 ${file ? 'text-primary-500' : 'text-dark-muted'}`} />
                                <p className="text-lg font-medium text-white">
                                    {file ? file.name : 'Click or drag file to upload'}
                                </p>
                                <p className="text-sm text-dark-muted mt-2">
                                    Supports CSV, XLSX, XLS (Max 10MB)
                                </p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept=".csv,.xlsx,.xls"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    onClick={downloadTemplate}
                                    className="flex items-center text-primary-400 hover:text-primary-300 text-sm font-medium"
                                >
                                    <MdFileDownload className="mr-1" />
                                    Download Template
                                </button>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2 rounded-lg border border-dark-border text-dark-text hover:bg-dark-card transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        disabled={!file || uploading}
                                        className={`px-8 py-2 rounded-lg bg-primary-600 text-white font-bold transition-all ${!file || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-500/20 active:scale-95'
                                            }`}
                                    >
                                        {uploading ? 'Uploading...' : 'Start Import'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                                <h3 className="text-xl font-bold text-white mb-4">Upload Summary</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-400">{result.summary.total}</div>
                                        <div className="text-xs text-dark-muted uppercase tracking-wider">Total Rows</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-400">{result.summary.success}</div>
                                        <div className="text-xs text-dark-muted uppercase tracking-wider">Successful</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-400">{result.summary.failed}</div>
                                        <div className="text-xs text-dark-muted uppercase tracking-wider">Failed</div>
                                    </div>
                                </div>
                            </div>

                            {result.results.some(r => r.status === 'failed') && (
                                <div className="max-h-60 overflow-y-auto rounded-xl border border-dark-border divide-y divide-dark-border bg-dark-card/50">
                                    {result.results.filter(r => r.status === 'failed').map((err, idx) => (
                                        <div key={idx} className="p-3 flex items-start space-x-3">
                                            <MdError className="text-red-500 mt-1 flex-shrink-0" />
                                            <div>
                                                <div className="text-sm font-semibold text-white">Row {err.row}</div>
                                                <div className="text-xs text-red-400">{err.error}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="px-8 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-500 transition-all shadow-lg active:scale-95"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkUploadModal;
