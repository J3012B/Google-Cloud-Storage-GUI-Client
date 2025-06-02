import React from 'react';
import { FileListData, GcsItem } from '../types';
import { formatFileSize, formatDate } from '../utils/fileUtils';

interface FileListProps {
  data: FileListData;
  currentPath: string;
  onNavigateToFolder: (folderPath: string) => void;
  onOpenFile: (filePath: string) => void;
}

const FileList: React.FC<FileListProps> = ({ 
  data, 
  currentPath, 
  onNavigateToFolder, 
  onOpenFile 
}) => {
  return (
    <div>
      {/* Table header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '40px 1fr 120px 150px',
        padding: '8px 16px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#6c757d'
      }}>
        <div></div>
        <div>Name</div>
        <div>Size</div>
        <div>Modified</div>
      </div>

      {/* Folders */}
      {data.prefixes && data.prefixes.map((folderPath: string) => {
        const folderName = folderPath.slice(currentPath.length).replace('/', '');
        return (
          <div 
            key={folderPath}
            onClick={() => onNavigateToFolder(folderPath)}
            style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 120px 150px',
              padding: '8px 16px',
              cursor: 'pointer',
              borderBottom: '1px solid #f8f9fa'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div>📁</div>
            <div style={{ fontWeight: '500' }}>{folderName}</div>
            <div style={{ color: '#6c757d', fontSize: '12px' }}>—</div>
            <div style={{ color: '#6c757d', fontSize: '12px' }}>—</div>
          </div>
        );
      })}

      {/* Files */}
      {data.files && data.files.map((file: GcsItem) => {
        const fileName = file.name.slice(currentPath.length);
        return (
          <div 
            key={file.name}
            onClick={() => onOpenFile(file.name)}
            style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 120px 150px',
              padding: '8px 16px',
              cursor: 'pointer',
              borderBottom: '1px solid #f8f9fa'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div>📄</div>
            <div>{fileName}</div>
            <div style={{ color: '#6c757d', fontSize: '12px' }}>{formatFileSize(file.size)}</div>
            <div style={{ color: '#6c757d', fontSize: '12px' }}>{formatDate(file.updated)}</div>
          </div>
        );
      })}

      {/* Empty directory message */}
      {(!data.prefixes || data.prefixes.length === 0) && 
       (!data.files || data.files.length === 0) && (
        <div style={{ 
          padding: '32px 16px', 
          textAlign: 'center', 
          color: '#6c757d',
          fontStyle: 'italic'
        }}>
          This directory is empty
        </div>
      )}
    </div>
  );
};

export { FileList }; 