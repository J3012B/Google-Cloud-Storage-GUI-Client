import React from 'react';

interface BreadcrumbsProps {
  currentPath: string;
  onNavigate: (index: number) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentPath, onNavigate }) => {
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
        onClick={() => onNavigate(-1)}
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
            onClick={() => onNavigate(index)}
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

export { Breadcrumbs }; 