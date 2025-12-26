
import React, { useState } from 'react';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  size?: string;
  children?: FileNode[];
}

const MOCK_FS: FileNode[] = [
  {
    name: 'bin',
    type: 'folder',
    children: [
      { name: 'kernel.bin', type: 'file', size: '1.2MB' },
      { name: 'sh', type: 'file', size: '450KB' },
      { name: 'gemini-core', type: 'file', size: '8.4MB' },
    ]
  },
  {
    name: 'etc',
    type: 'folder',
    children: [
      { name: 'hosts', type: 'file', size: '1KB' },
      { name: 'os-release', type: 'file', size: '2KB' },
      { name: 'neural-config.json', type: 'file', size: '12KB' },
    ]
  },
  {
    name: 'home',
    type: 'folder',
    children: [
      {
        name: 'root',
        type: 'folder',
        children: [
          { name: 'readme.txt', type: 'file', size: '512B' },
          { name: 'top_secret.lock', type: 'file', size: '0B' },
        ]
      }
    ]
  },
  { name: 'vmlinuz-gemini', type: 'file', size: '32MB' },
  { name: 'initrd.img', type: 'file', size: '15MB' },
];

export const FileExplorer: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const getCurrentItems = () => {
    let current = MOCK_FS;
    for (const segment of currentPath) {
      const found = current.find(item => item.name === segment);
      if (found && found.children) {
        current = found.children;
      }
    }
    return current;
  };

  const navigateTo = (name: string) => {
    setCurrentPath([...currentPath, name]);
  };

  const goBack = () => {
    setCurrentPath(currentPath.slice(0, -1));
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/50">
      <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 bg-slate-800/30">
        <button onClick={goBack} disabled={currentPath.length === 0} className="p-1 hover:bg-white/10 rounded disabled:opacity-30">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="text-xs text-slate-400 font-mono flex gap-1">
          <span className="text-emerald-500">root@gemini:</span>
          <span>/{currentPath.join('/')}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {getCurrentItems().map(item => (
          <div 
            key={item.name} 
            onDoubleClick={() => item.type === 'folder' ? navigateTo(item.name) : setSelectedFile(item.name)}
            onClick={() => setSelectedFile(item.name)}
            className={`flex flex-col items-center p-2 rounded-lg cursor-pointer transition-colors ${selectedFile === item.name ? 'bg-blue-500/20 ring-1 ring-blue-500/40' : 'hover:bg-white/5'}`}
          >
            {item.type === 'folder' ? (
              <svg className="w-10 h-10 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
            ) : (
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth="2"/></svg>
            )}
            <span className="text-[10px] text-center mt-1 truncate w-full px-1">{item.name}</span>
            {item.size && <span className="text-[8px] text-slate-500">{item.size}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};
