import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface UploadedFile {
    filename: string;
    size: number;
    path: string;
}

interface UploadCSVProps {
    onUploadComplete?: (files: UploadedFile[]) => void;
}

export function UploadCSV({ onUploadComplete }: UploadCSVProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const uploadFiles = async (files: FileList) => {
        const csvFiles = Array.from(files).filter(f => f.name.endsWith('.csv'));

        if (csvFiles.length === 0) {
            setUploadStatus('error');
            setStatusMessage('Veuillez sélectionner des fichiers CSV uniquement');
            return;
        }

        setIsUploading(true);
        setUploadStatus('idle');

        const formData = new FormData();
        csvFiles.forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setUploadStatus('success');
                setStatusMessage(data.message);
                setUploadedFiles(data.files || []);
                onUploadComplete?.(data.files || []);
            } else {
                setUploadStatus('error');
                setStatusMessage(data.error || 'Erreur lors de l\'upload');
            }
        } catch (error) {
            setUploadStatus('error');
            setStatusMessage('Erreur de connexion au serveur');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files.length > 0) {
            uploadFiles(e.dataTransfer.files);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            uploadFiles(e.target.files);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="upload-csv-container">
            <div
                className={`upload-zone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept=".csv"
                    multiple
                    onChange={handleFileSelect}
                    className="file-input"
                    id="csv-upload"
                    disabled={isUploading}
                />
                <label htmlFor="csv-upload" className="upload-label">
                    {isUploading ? (
                        <Loader2 className="upload-icon spinning" size={48} />
                    ) : (
                        <Upload className="upload-icon" size={48} />
                    )}
                    <span className="upload-text">
                        {isUploading
                            ? 'Upload en cours...'
                            : 'Glissez vos fichiers CSV ici ou cliquez pour sélectionner'}
                    </span>
                    <span className="upload-hint">
                        Formats acceptés : .csv (MOCA-O ou OpenData)
                    </span>
                </label>
            </div>

            {uploadStatus !== 'idle' && (
                <div className={`upload-status ${uploadStatus}`}>
                    {uploadStatus === 'success' ? (
                        <CheckCircle size={20} />
                    ) : (
                        <XCircle size={20} />
                    )}
                    <span>{statusMessage}</span>
                </div>
            )}

            {uploadedFiles.length > 0 && (
                <div className="uploaded-files">
                    <h4>Fichiers uploadés :</h4>
                    <ul>
                        {uploadedFiles.map((file, index) => (
                            <li key={index}>
                                <FileText size={16} />
                                <span className="filename">{file.filename}</span>
                                <span className="filesize">({formatFileSize(file.size)})</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <style>{`
        .upload-csv-container {
          margin: 1.5rem 0;
        }

        .upload-zone {
          border: 2px dashed #cbd5e0;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          background: #f7fafc;
          cursor: pointer;
        }

        .upload-zone:hover {
          border-color: #3bb3a9;
          background: rgba(59, 179, 169, 0.05);
        }

        .upload-zone.dragging {
          border-color: #48bb78;
          background: rgba(72, 187, 120, 0.08);
          transform: scale(1.02);
        }

        .upload-zone.uploading {
          border-color: #ed8936;
          cursor: wait;
        }

        .file-input {
          display: none;
        }

        .upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          cursor: inherit;
        }

        .upload-icon {
          color: #3bb3a9;
          transition: transform 0.3s ease;
        }

        .upload-icon.spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .upload-zone:hover .upload-icon {
          transform: scale(1.1);
        }

        .upload-text {
          color: #4a5568;
          font-size: 1rem;
          font-weight: 500;
        }

        .upload-hint {
          color: #a0aec0;
          font-size: 0.85rem;
        }

        .upload-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-top: 1rem;
          font-size: 0.9rem;
        }

        .upload-status.success {
          background: rgba(72, 187, 120, 0.2);
          color: #48bb78;
        }

        .upload-status.error {
          background: rgba(245, 101, 101, 0.2);
          color: #f56565;
        }

        .uploaded-files {
          margin-top: 1rem;
          padding: 1rem;
          background: #edf2f7;
          border-radius: 8px;
        }

        .uploaded-files h4 {
          margin: 0 0 0.75rem 0;
          color: #4a5568;
          font-size: 0.9rem;
        }

        .uploaded-files ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .uploaded-files li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0;
          color: #2d3748;
          border-bottom: 1px solid #e2e8f0;
        }

        .uploaded-files li:last-child {
          border-bottom: none;
        }

        .uploaded-files .filename {
          flex: 1;
        }

        .uploaded-files .filesize {
          color: #718096;
          font-size: 0.85rem;
        }
      `}</style>
        </div>
    );
}
