import React, { useCallback, useRef, useState } from 'react';
import { mutate } from 'swr';

interface UploadDialogProps {
  isOpen: boolean;
  currentPath: string;
  onClose: () => void;
  onUploaded: () => void;
}

const UploadDialog: React.FC<UploadDialogProps> = ({ isOpen, currentPath, onClose, onUploaded }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const arr: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      arr.push(fileList[i]);
    }
    setFiles(prev => [...prev, ...arr]); // Append instead of replace
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const upload = async () => {
    console.log('Upload function called, files count:', files.length);
    
    if (files.length === 0) {
      console.log('No files to upload, returning early');
      return;
    }
    
    console.log('Starting upload process...');
    setIsUploading(true);
    
    try {
      for (const file of files) {
        const relativePath = (file as any).webkitRelativePath as string | undefined;
        const destinationPath = currentPath + (relativePath && relativePath !== '' ? relativePath : file.name);
        
        console.log('Processing file:', {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          relativePath,
          destinationPath,
          currentPath
        });
        
        // Create FormData for the upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('filePath', destinationPath);
        
        console.log('Uploading via server endpoint...');
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        console.log('Server upload response status:', res.status, res.statusText);
        
        if (!res.ok) {
          const errorData = await res.json();
          console.error('Failed to upload via server:', res.status, res.statusText, errorData);
          continue;
        }
        
        const responseData = await res.json();
        console.log('Upload response data:', responseData);
        console.log('Successfully uploaded:', destinationPath);
      }
      
      console.log('Upload complete, refreshing file list...');
      
      // refresh list
      mutate(`/api/list?prefix=${encodeURIComponent(currentPath)}`);
      onUploaded();
    } catch (err) {
      console.error('Upload failed with exception:', err);
    } finally {
      console.log('Upload process finished, setting isUploading to false');
      setIsUploading(false);
    }
  };

  const clearFiles = () => {
    setFiles([]);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          padding: '24px',
          borderRadius: '8px',
          minWidth: '400px',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Upload Files / Folders</h3>
        <div
          ref={dropRef}
          onDrop={onDrop}
          onDragOver={onDragOver}
          style={{
            border: '2px dashed #6c757d',
            borderRadius: '6px',
            padding: '40px',
            textAlign: 'center',
            color: '#6c757d',
            marginBottom: '16px',
          }}
        >
          Drag & Drop files here
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
            Select Folders:
          </label>
          <input
            type="file"
            multiple
            // @ts-ignore - non-standard attribute for folder selection
            webkitdirectory="true"
            // @ts-ignore
            directory="true"
            onChange={onFileInputChange}
            style={{ marginBottom: '8px' }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
            Select Individual Files:
          </label>
          <input
            type="file"
            multiple
            onChange={onFileInputChange}
          />
        </div>
        
        {files.length > 0 && (
          <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong>Selected files ({files.length}):</strong>
              <button 
                onClick={clearFiles}
                style={{ 
                  fontSize: '12px', 
                  padding: '2px 6px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            </div>
            {files.map((f, index) => (
              <div key={index} style={{ fontSize: '12px', padding: '2px 0' }}>
                {f.name} ({(f.size / 1024).toFixed(1)} KB)
              </div>
            ))}
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={onClose}
            disabled={isUploading}
            style={{
              padding: '6px 12px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={upload}
            disabled={isUploading || files.length === 0}
            style={{
              padding: '6px 12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: '1px solid #28a745',
              borderRadius: '4px',
              cursor: isUploading || files.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export { UploadDialog }; 