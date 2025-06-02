import React, { useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type GcsItem = {
  name: string;
  size: number;
  updated: string;
  contentType: string;
};

interface NodeProps {
  path: string;
  depth: number;
}

const Indent: React.FC<{ level: number }> = ({ level }) => (
  <span style={{ marginLeft: level * 16 }} />
);

const FileNode: React.FC<NodeProps> = ({ path, depth }) => {
  const [expanded, setExpanded] = useState(false);
  const { data, error, isLoading } = useSWR(
    () => (expanded ? `/api/list?prefix=${encodeURIComponent(path)}` : null),
    fetcher
  );

  const toggle = () => setExpanded((e) => !e);

  if (error) return <div>Error loading</div>;

  const isFolder = path.endsWith('/');
  const label = isFolder
    ? path.slice(path.lastIndexOf('/', path.length - 2) + 1, -1)
    : path.split('/').pop();

  const onClick = async () => {
    if (isFolder) {
      toggle();
    } else {
      const res = await fetch(`/api/signed-url?file=${encodeURIComponent(path)}`);
      const { url } = await res.json();
      window.open(url, '_blank');
    }
  };

  return (
    <div>
      <div onClick={onClick} style={{ cursor: isFolder ? 'pointer' : 'pointer' }}>
        <Indent level={depth} />
        {isFolder ? (expanded ? '📂' : '📁') : '📄'} {label}
      </div>
      {expanded && data && (
        <div>
          {data.prefixes.map((p: string) => (
            <FileNode key={p} path={p} depth={depth + 1} />
          ))}
          {data.files.map((f: GcsItem) => (
            <FileNode key={f.name} path={f.name} depth={depth + 1} />
          ))}
        </div>
      )}
      {expanded && isLoading && <div>Loading...</div>}
    </div>
  );
};

const FileExplorer: React.FC = () => {
  const { data, error, isLoading } = useSWR('/api/list?prefix=', fetcher);

  if (error) return <div>Error loading root</div>;
  if (isLoading || !data) return <div>Loading...</div>;

  return (
    <div>
      {data.prefixes.map((p: string) => (
        <FileNode key={p} path={p} depth={0} />
      ))}
      {data.files.map((f: GcsItem) => (
        <FileNode key={f.name} path={f.name} depth={0} />
      ))}
    </div>
  );
};

export { FileExplorer }; 