import React, { useState, useEffect } from 'react';
import { usePlayground } from '../context/PlaygroundContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { getLanguageConfig, LANGUAGES } from '../utils/languages';
import { 
  X, 
  FolderGit2, 
  Search, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Edit3, 
  Clock, 
  Tag, 
  FileCode2, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

export default function MyProgramsModal({ isOpen, onClose }) {
  const { loadProgramIntoEditor, showToast, activeTab } = usePlayground();
  const { isAuthenticated, user } = useAuth();

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  
  // Create / Save Modal state
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLang, setNewLang] = useState('python');
  const [newTags, setNewTags] = useState('project');

  const fetchPrograms = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedLanguage) params.append('language', selectedLanguage);
      const res = await api.getPrograms(params.toString());
      setPrograms(res.programs || []);
    } catch (e) {
      showToast('Failed to load programs: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchPrograms();
    }
  }, [isOpen, isAuthenticated, searchTerm, selectedLanguage]);

  const handleOpenProgram = async (p) => {
    try {
      const res = await api.getProgram(p.id);
      loadProgramIntoEditor(res.program);
      onClose();
    } catch (e) {
      showToast('Failed to open program: ' + e.message, 'error');
    }
  };

  const handleDelete = async (id, title, e) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await api.deleteProgram(id);
      setPrograms(prev => prev.filter(p => p.id !== id));
      showToast(`Deleted "${title}"`, 'success');
    } catch (e) {
      showToast('Failed to delete program: ' + e.message, 'error');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Title is required', 'warning');
      return;
    }

    try {
      const config = getLanguageConfig(newLang);
      const res = await api.createProgram({
        title: newTitle.trim(),
        description: newDesc.trim(),
        language: newLang,
        code: activeTab?.code || `// ${newTitle}\n`,
        stdin: activeTab?.stdin || '',
        tags: newTags.split(',').map(t => t.trim()).filter(Boolean)
      });

      setPrograms(prev => [res.program, ...prev]);
      setIsCreating(false);
      setNewTitle('');
      setNewDesc('');
      showToast(`Saved program "${res.program.title}"`, 'success');
    } catch (err) {
      showToast('Failed to save program: ' + err.message, 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl h-[82vh] bg-[#161b22] border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-gray-200">
        {/* Header */}
        <div className="h-14 border-b border-gray-800 px-6 flex items-center justify-between bg-[#1f242c]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                My Saved Programs
                {isAuthenticated && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
                    {programs.length} Saved
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-gray-400">Manage, organize, and revisit your MHN TAB project codebase</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCreating && (
              <button
                onClick={() => {
                  setNewLang(activeTab?.language || 'python');
                  setNewTitle(activeTab?.title?.split('.')[0] || 'My Program');
                  setIsCreating(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Current Code</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isCreating ? (
          /* Create Form */
          <form onSubmit={handleCreateSubmit} className="flex-1 p-6 space-y-4 max-w-xl mx-auto w-full">
            <h3 className="text-base font-bold text-white">Save Program to Cloud</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Program Title *</label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Binary Search Tree Implementation"
                className="w-full p-2.5 rounded-lg bg-[#0d1117] border border-gray-700 text-xs text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Description (Optional)</label>
              <textarea
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Brief description of the logic, algorithms, or requirements..."
                rows={3}
                className="w-full p-2.5 rounded-lg bg-[#0d1117] border border-gray-700 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Language</label>
                <select
                  value={newLang}
                  onChange={e => setNewLang(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#0d1117] border border-gray-700 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {LANGUAGES.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  placeholder="e.g. dsa, recursion, ojt"
                  className="w-full p-2.5 rounded-lg bg-[#0d1117] border border-gray-700 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-md shadow-purple-900/40"
              >
                Save Program
              </button>
            </div>
          </form>
        ) : (
          /* Programs List View */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between gap-3 bg-[#12161c]">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search by title or description..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#161b22] border border-gray-700 text-xs text-white focus:outline-none focus:border-purple-500 placeholder-gray-500"
                />
              </div>

              <select
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value)}
                className="text-xs p-1.5 rounded-lg bg-[#161b22] border border-gray-700 text-gray-300 focus:outline-none focus:border-purple-500"
              >
                <option value="">All Languages</option>
                {LANGUAGES.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin mb-2 text-purple-400" />
                  Loading your saved programs...
                </div>
              ) : programs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 space-y-2">
                  <FileCode2 className="w-10 h-10 opacity-40 text-purple-400" />
                  <p className="text-sm font-medium text-gray-300">No programs found</p>
                  <p className="text-xs text-gray-500">Save code from the editor or create a new program.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {programs.map(p => {
                    const langConfig = getLanguageConfig(p.language);
                    let tags = [];
                    try {
                      tags = JSON.parse(p.tags || '[]');
                    } catch (e) {}

                    return (
                      <div
                        key={p.id}
                        onClick={() => handleOpenProgram(p)}
                        className="p-4 rounded-xl border border-gray-800 bg-[#161b22] hover:bg-[#1f242c] hover:border-gray-700 transition-all cursor-pointer flex flex-col justify-between group shadow-sm text-left"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold text-white group-hover:text-sky-400 transition-colors">
                              {p.title}
                            </h4>
                            <span 
                              className="px-2 py-0.5 rounded text-[10px] font-semibold text-white shrink-0"
                              style={{ backgroundColor: `${langConfig.color}25`, color: langConfig.color }}
                            >
                              {langConfig.name}
                            </span>
                          </div>
                          {p.description && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{p.description}</p>
                          )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(p.updated_at || p.created_at).toLocaleDateString()}
                          </span>

                          <div className="flex items-center gap-1">
                            {tags.slice(0, 2).map((t, idx) => (
                              <span key={idx} className="px-1.5 py-0.2 rounded bg-gray-800 text-gray-400 text-[10px]">
                                #{t}
                              </span>
                            ))}
                            <button
                              onClick={(e) => handleDelete(p.id, p.title, e)}
                              className="p-1 rounded text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 ml-1 transition-colors"
                              title="Delete Program"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
