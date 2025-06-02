import React from 'react';
import { FileExplorer } from './FileExplorer';

const App: React.FC = () => {
  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', 
      margin: 0,
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          padding: '1rem 1.5rem',
          backgroundColor: '#fff',
          borderBottom: '1px solid #dee2e6'
        }}>
          <h1 style={{ 
            margin: 0,
            fontSize: '1.5rem',
            color: '#333',
            fontWeight: '600'
          }}>
            GCS Bucket Explorer
          </h1>
        </div>
        <FileExplorer />
      </div>
    </div>
  );
};

export default App; 