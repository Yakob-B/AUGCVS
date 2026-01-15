import React, { useState, useRef } from 'react';
import { MdCloudUpload, MdClose, MdCheckCircle, MdError, MdDelete, MdInfo } from 'react-icons/md';
import * as graduateService from '../../services/graduates';
import { useNotification } from '../../pages/contexts/NotificationContext';

const BatchCertificateUpload = ({ isOpen, onClose, onUploadSuccess }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);
    const { showNotification } = useNotification();

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = selectedFiles.filter(file => {
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            return allowedTypes.includes(file.type);
        });

        if (validFiles.length !== selectedFiles.length) {
            showNotification('warning', 'Some files skipped', 'Only PDF and image files are allowed.');
        }

        setFiles(validFiles);
        setResult(null);
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        try {
            setUploading(true);
            const response = await graduateService.batchUploadCertificates(files);

            if (response.success) {
                setResult(response);
                showNotification(
                    'success',
                    'Upload complete',
                    `Successfully uploaded ${response.summary.success} of ${response.summary.total} certificates.`
                );
                if (onUploadSuccess) onUploadSuccess();
            }
        } catch (error) {
            console.error('Upload failed:', error);
            showNotification('error', 'Upload failed', error.response?.data?.message || 'Something went wrong during upload.');
        } finally {
            setUploading(false);
        }
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const resetModal = () => {
        setFiles([]);
        setResult(null);
        setUploading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-dark-surface border border-dark-border w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-zoom-in max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-dark-border bg-dark-card">
                    <div>
                        <h2 className="text-2xl font-heading font-bold text-white">Batch Certificate Upload</h2>
                        <p className="text-sm text-dark-muted mt-1">Upload multiple certificate files at once</p>
                    </div>
                    <button onClick={resetModal} className="text-dark-muted hover:text-white transition-colors">
                        <MdClose size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {!result ? (
                        <div className="space-y-6">
                            {/* Instructions */}
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                                <div className="flex items-start space-x-3">
                                    <MdInfo className="text-blue-400 text-xl mt-0.5 flex-shrink-0" />
                                    <div className="text-sm">
                                        <p className="text-blue-300 font-semibold mb-2">File Naming Instructions:</p>
                                        <ul className="text-dark-muted space-y-1 list-disc list-inside">
                                            <li>Name files using <strong className="text-white">Student ID</strong>: <code className="bg-dark-card px-2 py-0.5 rounded text-blue-300">UGR-12345-16.pdf</code></li>
                                            <li>Accepted formats: <code className="bg-dark-card px-2 py-0.5 rounded">UGR_12345_16.pdf</code> or <code className="bg-dark-card px-2 py-0.5 rounded">12345-16.pdf</code></li>
                                            <li>Supported types: PDF, JPG, PNG (max 5MB each)</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Upload Area */}
                            {files.length === 0 ? (
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className="border-2 border-dashed border-dark-border hover:border-primary-500 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all bg-dark-card/20 hover:bg-dark-card/40"
                                >
                                    <MdCloudUpload className="text-6xl text-dark-muted mb-4" />
                                    <p className="text-lg font-medium text-white">Click to select certificate files</p>
                                    <p className="text-sm text-dark-muted mt-2">PDF, JPG, PNG (up to 100 files)</p>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        multiple
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-white font-semibold">{files.length} files selected</p>
                                        <button
                                            onClick={() => fileInputRef.current.click()}
                                            className="text-primary-400 hover:text-primary-300 text-sm font-medium"
                                        >
                                            Add more
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={handleFileChange}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            multiple
                                        />
                                    </div>

                                    <div className="max-h-64 overflow-y-auto space-y-2 rounded-xl border border-dark-border p-3 bg-dark-card/30">
                                        {files.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-dark-surface rounded-lg border border-dark-border"
                                            >
                                                <div className="flex items-center space-x-3 overflow-hidden flex-1">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow">
                                                        {file.name.split('.').pop().toUpperCase()}
                                                    </div>
                                                    <div className="truncate">
                                                        <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                                        <p className="text-xs text-dark-muted">{(file.size / 1024).toFixed(2)} KB</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeFile(index)}
                                                    className="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-lg transition-all"
                                                >
                                                    <MdDelete size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={resetModal}
                                    className="px-6 py-2 rounded-lg border border-dark-border text-dark-text hover:bg-dark-card transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={files.length === 0 || uploading}
                                    className={`px-8 py-2 rounded-lg bg-primary-600 text-white font-bold transition-all ${files.length === 0 || uploading
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-500/20 active:scale-95'
                                        }`}
                                >
                                    {uploading ? 'Uploading...' : `Upload ${files.length} Certificate${files.length !== 1 ? 's' : ''}`}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            {/* Summary */}
                            <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                                <h3 className="text-xl font-bold text-white mb-4">Upload Summary</h3>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-400">{result.summary.total}</div>
                                        <div className="text-xs text-dark-muted uppercase tracking-wider">Total</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-400">{result.summary.success}</div>
                                        <div className="text-xs text-dark-muted uppercase tracking-wider">Success</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-400">{result.summary.failed}</div>
                                        <div className="text-xs text-dark-muted uppercase tracking-wider">Failed</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-yellow-400">{result.summary.skipped}</div>
                                        <div className="text-xs text-dark-muted uppercase tracking-wider">Skipped</div>
                                    </div>
                                </div>
                            </div>

                            {/* Results */}
                            {result.results.some(r => r.status !== 'success') && (
                                <div className="max-h-80 overflow-y-auto rounded-xl border border-dark-border divide-y divide-dark-border bg-dark-card/50">
                                    {result.results.filter(r => r.status !== 'success').map((item, idx) => (
                                        <div key={idx} className="p-4 flex items-start space-x-3">
                                            <MdError className="text-red-500 mt-1 flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold text-white">{item.filename}</div>
                                                <div className="text-xs text-red-400 mt-1">{item.error}</div>
                                                {item.studentId && (
                                                    <div className="text-xs text-dark-muted mt-1">Detected ID: {item.studentId}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Done Button */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={resetModal}
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

export default BatchCertificateUpload;
