import React from 'react';
import { FileExplorerProps } from './types';
import { useFileExplorer } from './hooks/useFileExplorer';
import { Breadcrumbs } from './components/Breadcrumbs';
import { Toolbar } from './components/Toolbar';
import { FileList } from './components/FileList';
import { UploadDialog } from './components/UploadDialog';

const FileExplorer: React.FC<FileExplorerProps> = () => {
  const {
    currentPath,
    data,
    error,
    isLoading,
    navigateToFolder,
    navigateUp,
    navigateToBreadcrumb,
    openFile,
    refresh
  } = useFileExplorer();

  const [showUpload, setShowUpload] = React.useState(false);

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
        onOpenUploadDialog={() => setShowUpload(true)}
      />

      <FileList 
        data={data}
        currentPath={currentPath}
        onNavigateToFolder={navigateToFolder}
        onOpenFile={openFile}
      />

      <UploadDialog
        isOpen={showUpload}
        currentPath={currentPath}
        onClose={() => setShowUpload(false)}
        onUploaded={() => {
          setShowUpload(false);
          refresh();
        }}
      />
    </div>
  );
};

export { FileExplorer }; 