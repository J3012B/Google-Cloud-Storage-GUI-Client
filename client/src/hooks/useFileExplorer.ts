import { useState } from 'react';
import useSWR from 'swr';
import { FileListData } from '../types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export const useFileExplorer = () => {
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
    if (!res.ok) {
      console.error('Failed to get signed URL:', res.status, res.statusText);
      // Could add user notification here in the future
      return;
    }
    
    const data = await res.json();
    if (!data.url) {
      console.error('No URL returned from signed-url API');
      return;
    }
    
    window.open(data.url, '_blank');
  };

  return {
    currentPath,
    data: data as FileListData,
    error,
    isLoading,
    navigateToFolder,
    navigateUp,
    navigateToBreadcrumb,
    openFile
  };
}; 