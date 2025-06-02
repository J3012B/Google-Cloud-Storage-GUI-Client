import React from 'react';

interface ToolbarProps {
  currentPath: string;
  onNavigateUp: () => void;
  onOpenUploadDialog: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ currentPath, onNavigateUp, onOpenUploadDialog }) => {
  return (
    <div style={{ 
      padding: '8px 16px', 
      backgroundColor: '#fff', 
      borderBottom: '1px solid #dee2e6',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <button 
        onClick={onNavigateUp}
        disabled={currentPath === ''}
        style={{
          padding: '4px 8px',
          backgroundColor: currentPath === '' ? '#f8f9fa' : '#007bff',
          color: currentPath === '' ? '#6c757d' : 'white',
          border: '1px solid ' + (currentPath === '' ? '#dee2e6' : '#007bff'),
          borderRadius: '4px',
          cursor: currentPath === '' ? 'not-allowed' : 'pointer',
          fontSize: '12px'
        }}
      >
        ↑ Up
      </button>

      <button
        onClick={onOpenUploadDialog}
        style={{
          padding: '4px 8px',
          backgroundColor: '#28a745',
          color: 'white',
          border: '1px solid #28a745',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        ⬆ Upload
      </button>
    </div>
  );
};

export { Toolbar }; 