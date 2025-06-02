export type GcsItem = {
  name: string;
  size: number;
  updated: string;
  contentType: string;
};

export interface FileListData {
  prefixes?: string[];
  files?: GcsItem[];
}

export interface FileExplorerProps {} 