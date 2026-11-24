import React, { useState, useRef, useEffect } from 'react';
import { usePlayground, getLanguageFromFilename } from '../context/PlaygroundContext';
import { getLanguageConfig } from '../utils/languages';
import { 
  Plus, 
  X, 
  FileCode, 
  FilePlus, 
  Edit2, 
  Check, 
  Sparkles,
  Code
} from 'lucide-react';

const POPULAR_EXTENSIONS = [
  { ext: '.html', name: 'HTML5', color: '#ea580c' },
  { ext: '.css', name: 'CSS3', color: '#06b6d4' },
  { ext: '.js', name: 'JavaScript', color: '#facc15' },
  { ext: '.jsx', name: 'React', color: '#38bdf8' },
  { ext: '.ts', name: 'TypeScript', color: '#3b82f6' },
  { ext: '.py', name: 'Python', color: '#38bdf8' },
  { ext: '.java', name: 'Java', color: '#f97316' },
  { ext: '.cpp', name: 'C++', color: '#ec4899' },
  { ext: '.c', name: 'C', color: '#94a3b8' },
  { ext: '.sql', name: 'SQL', color: '#e38c00' },
  { ext: '.json', name: 'JSON', color: '#a855f7' }
];

export default function TabsBar() {
  const { 
    tabs, 
    activeTabId, 
    setActiveTabId, 
    createCustomFile, 
    renameTab, 
    closeTab,
    settings,
    showToast 
  } = usePlayground();

  // New File Dialog state
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [filenameInput, setFilenameInput] = useState('');
  const inputRef = useRef(null);

  // Tab renaming state
  const [renamingTabId, setRenamingTabId] = useState(null);
  const [renameInput, setRenameInput] = useState('');
  const renameInputRef = useRef(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isNewFileModalOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isNewFileModalOpen]);

  // Auto-focus rename input
  useEffect(() => {
    if (renamingTabId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingTabId]);

  const handleOpenNewFileModal = () => {
    setFilenameInput(`Solution_${tabs.length + 1}.py`);
    setIsNewFileModalOpen(true);
  };

  const handleSelectExtensionChip = (ext) => {
    let base = filenameInput.trim();
    if (!base) {
      base = `code`;
    }
    const dotIdx = base.lastIndexOf('.');
    if (dotIdx !== -1) {
      base = base.substring(0, dotIdx);
    }
    setFilenameInput(`${base}${ext}`);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleCreateFileSubmit = (e) => {
    if (e) e.preventDefault();
    const clean = filenameInput.trim();
    if (!clean) {
      showToast('Please enter a valid filename', 'error');
      return;
    }
    createCustomFile(clean);
    setIsNewFileModalOpen(false);
    setFilenameInput('');
  };

  const handleStartRename = (tab, e) => {
    e.stopPropagation();
    setRenamingTabId(tab.id);
    setRenameInput(tab.title);
  };

  const handleFinishRename = (tabId) => {
    if (renameInput.trim()) {
      renameTab(tabId, renameInput.trim());
    }
    setRenamingTabId(null);
  };

  // Real-time language detection for the entered filename
  const detectedLangId = getLanguageFromFilename(filenameInput);
  const detectedConfig = getLanguageConfig(detectedLangId);

  return (
    <div className="h-9 bg-[#161b22] border-b border-gray-800 flex items-center justify-between px-2 select-none relative z-20">
      {/* Tabs scrollable row */}
      <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const langConfig = getLanguageConfig(tab.language);
          const isRenaming = renamingTabId === tab.id;

          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              onDoubleClick={(e) => handleStartRename(tab, e)}
              className={`group flex items-center gap-2 px-3 py-1 rounded-t-md text-xs cursor-pointer border-t-2 transition-all shrink-0 ${
                isActive
                  ? 'bg-[#1f242c] text-white border-sky-400 font-medium shadow-sm'
                  : 'bg-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5 border-transparent'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: langConfig.color }}
              />

              {isRenaming ? (
                <input
                  ref={renameInputRef}
                  type="text"
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  onBlur={() => handleFinishRename(tab.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFinishRename(tab.id);
                    if (e.key === 'Escape') setRenamingTabId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#0d1117] text-white text-xs px-1.5 py-0.5 rounded border border-sky-500 focus:outline-none w-28 font-mono"
                />
              ) : (
                <span className="truncate max-w-[130px] font-mono">{tab.title}</span>
              )}

              {tab.isModified && !isRenaming && (
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" title="Unsaved changes" />
              )}

              {/* Close Tab Button */}
              {tabs.length > 1 && !isRenaming && (
                <button
                  onClick={(e) => closeTab(tab.id, e)}
                  className="opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded p-0.5 transition-opacity"
                  title="Close Tab"
                >
                  <X className="w-3 h-3 text-gray-400 hover:text-white" />
                </button>
              )}
            </div>
          );
        })}

        {/* Create New File with Desired Extension Button */}
        <button
          onClick={handleOpenNewFileModal}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-sky-400 hover:text-white hover:bg-sky-500/20 transition-all ml-1 border border-transparent hover:border-sky-500/30"
          title="Create New File with Custom Extension"
        >
          <FilePlus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-medium text-[11px]">New File</span>
        </button>
      </div>

      {/* NEW CUSTOM FILE MODAL */}
      {isNewFileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in select-none">
          <div className="w-full max-w-md bg-[#161b22] border border-gray-700 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Create Custom File</h3>
                  <p className="text-[11px] text-gray-400">Specify any filename and desired extension</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewFileModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFileSubmit} className="space-y-4 font-sans">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Filename &amp; Extension:
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={filenameInput}
                  onChange={(e) => setFilenameInput(e.target.value)}
                  placeholder="e.g. Solution.java, main.py, algo.cpp, script.js"
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-gray-700 text-white font-mono text-xs focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              {/* Quick Extension Selector Chips */}
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Quick Extensions:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_EXTENSIONS.map((item) => (
                    <button
                      key={item.ext}
                      type="button"
                      onClick={() => handleSelectExtensionChip(item.ext)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-[#0d1117] hover:bg-white/10 border border-gray-700/80 hover:border-gray-500 transition-all font-mono"
                    >
                      <span 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: item.color }} 
                      />
                      <span className="font-semibold text-gray-200">{item.ext}</span>
                      <span className="text-[10px] text-gray-500">({item.name})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-Time Detection Pill */}
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-gray-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">Auto-Detected Language:</span>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: detectedConfig.color }}
                    />
                    {detectedConfig.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-800/80">
                  <span className="text-gray-500">Automatic Boilerplate:</span>
                  <span className={settings.autoBoilerplate !== false ? "text-emerald-400 font-medium" : "text-gray-500"}>
                    {settings.autoBoilerplate !== false ? '✓ Starter Template will be inserted' : 'Disabled (blank file)'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewFileModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 transition-all shadow-md shadow-sky-950/40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create File</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
