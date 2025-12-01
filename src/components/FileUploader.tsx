import { useState } from 'react';
import './FileUploader.css';

interface FileUploaderProps {
  title: string;
  subtitle: string;
  onLoad: () => Promise<void>;
  loaded: boolean;
  loading: boolean;
}

export function FileUploader({ 
  title, 
  subtitle, 
  onLoad, 
  loaded, 
  loading 
}: FileUploaderProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    // Note: Tauri doesn't support drag-drop files directly in web view
    // This is just UI feedback
  };

  return (
    <div 
      className={`file-uploader ${dragOver ? 'drag-over' : ''} ${loaded ? 'loaded' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="uploader-content">
        {loaded ? (
          <>
            <div className="success-icon">✓</div>
            <h3>{title}</h3>
            <p className="success-text">Loaded successfully</p>
            <button 
              className="btn-secondary btn-small"
              onClick={onLoad}
              disabled={loading}
            >
              Change File
            </button>
          </>
        ) : (
          <>
            <div className="upload-icon">📁</div>
            <h3>{title}</h3>
            <p>{subtitle}</p>
            <button 
              className="btn-primary"
              onClick={onLoad}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Select File'}
            </button>
            <p className="file-formats">
              Supported: WAV, MP3, FLAC, OGG, M4A, AAC
            </p>
          </>
        )}
      </div>
    </div>
  );
}
