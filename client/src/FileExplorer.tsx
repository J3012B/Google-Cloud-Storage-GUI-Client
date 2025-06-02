import React, { useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type GcsItem = {
  name: string;
  size: number;
  updated: string;
  contentType: string;
};

interface FileExplorerProps {}

const FileExplorer: React.FC<FileExplorerProps> = () => {
  const [currentPath, setCurrentPath] = useState('');
  
  const { data, error, isLoading } = useSWR(
    `/api/list?prefix=${encodeURIComponent(currentPath)}`,
    fetcher
  );

  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
  };

  const navigateUp = () => {
    if (currentPath === '') return; // Already at root
    
    // Remove the last folder from the path
    const pathParts = currentPath.split('/').filter(part => part !== '');
    pathParts.pop(); // Remove the last part
    const newPath = pathParts.length > 0 ? pathParts.join('/') + '/' : '';
    setCurrentPath(newPath);
  };

  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      setCurrentPath(''); // Navigate to root
      return;
    }
    
    const pathParts = currentPath.split('/').filter(part => part !== '');
    const newPathParts = pathParts.slice(0, index + 1);
    const newPath = newPathParts.join('/') + '/';
    setCurrentPath(newPath);
  };

  const openFile = async (filePath: string) => {
    const res = await fetch(`/api/signed-url?file=${encodeURIComponent(filePath)}`);
    const { url } = await res.json();
    window.open(url, '_blank');
  };

  const formatFileSize = (size: number): string => {
    if (size === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  const renderBreadcrumbs = () => {
    const pathParts = currentPath.split('/').filter(part => part !== '');
    
    return (
      <div style={{ 
        padding: '12px 16px', 
        backgroundColor: '#f8f9fa', 
        borderBottom: '1px solid #dee2e6',
        fontFamily: 'monospace',
        fontSize: '14px'
      }}>
        <span 
          onClick={() => navigateToBreadcrumb(-1)}
          style={{ 
            cursor: 'pointer', 
            color: '#007bff',
            textDecoration: 'underline'
          }}
        >
          /
        </span>
        {pathParts.map((part, index) => (
          <span key={index}>
            <span 
              onClick={() => navigateToBreadcrumb(index)}
              style={{ 
                cursor: 'pointer', 
                color: '#007bff',
                textDecoration: 'underline'
              }}
            >
              {part}
            </span>
            <span>/</span>
          </span>
        ))}
      </div>
    );
  };

  if (error) return <div style={{ padding: '1rem', color: 'red' }}>Error loading directory</div>;
  if (isLoading || !data) return <div style={{ padding: '1rem' }}>Loading...</div>;

  return (
    <div style={{ border: '1px solid #dee2e6', borderRadius: '4px', overflow: 'hidden' }}>
      {/* Breadcrumb navigation */}
      {renderBreadcrumbs()}
      
      {/* Toolbar */}
      <div style={{ 
        padding: '8px 16px', 
        backgroundColor: '#fff', 
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <button 
          onClick={navigateUp}
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
      </div>

      {/* File listing */}
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
              onClick={() => navigateToFolder(folderPath)}
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
              onClick={() => openFile(file.name)}
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
    </div>
  );
};

export { FileExplorer }; 