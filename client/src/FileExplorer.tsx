import React from 'react';
import { FileExplorerProps } from './types';
import { useFileExplorer } from './hooks/useFileExplorer';
import { Breadcrumbs } from './components/Breadcrumbs';
import { Toolbar } from './components/Toolbar';
import { FileList } from './components/FileList';

const FileExplorer: React.FC<FileExplorerProps> = () => {
  const {
    currentPath,
    data,
    error,
    isLoading,
    navigateToFolder,
    navigateUp,
    navigateToBreadcrumb,
    openFile
  } = useFileExplorer();

  if (error) return <div style={{ padding: '1rem', color: 'red' }}>Error loading directory</div>;
  if (isLoading || !data) return <div style={{ padding: '1rem' }}>Loading...</div>;

  return (
    <div style={{ border: '1px solid #dee2e6', borderRadius: '4px', overflow: 'hidden' }}>
      <Breadcrumbs 
        currentPath={currentPath} 
        onNavigate={navigateToBreadcrumb} 
      />
      
      <Toolbar 
        currentPath={currentPath} 
        onNavigateUp={navigateUp} 
      />

      <FileList 
        data={data}
        currentPath={currentPath}
        onNavigateToFolder={navigateToFolder}
        onOpenFile={openFile}
      />
    </div>
  );
};

export { FileExplorer }; 