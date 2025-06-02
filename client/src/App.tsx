import React from 'react';
import { FileExplorer } from './FileExplorer';

const App: React.FC = () => {
  return (
    <div style={{ fontFamily: 'sans-serif', margin: '1rem' }}>
      <h1>GCS Bucket Explorer</h1>
      <FileExplorer />
    </div>
  );
};

export default App; 