import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlayground } from '../context/PlaygroundContext';
import { api } from '../utils/api';
import { getLanguageConfig } from '../utils/languages';
import { 
  X, 
  LayoutDashboard, 
  CheckCircle2, 
  Clock, 
  Code2, 
  FolderGit2, 
  Trophy, 
  Flame, 
  Brain, 
  ArrowRight, 
  BarChart3, 
  History, 
  Loader2, 
  User, 
  Calendar,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function StudentDashboardModal({ isOpen, onClose, onOpenAi }) {
  const { user, isAuthenticated } = useAuth();
  const { loadProgramIntoEditor, showToast } = usePlayground();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    setLoading(true);
    api.getStudentDashboard()
      .then(res => {
        setData(res);
      })
      .catch(err => {
        showToast('Failed to load dashboard: ' + err.message, 'error');
      })
      .finally(() => setLoading(false));
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  const stats = data?.stats;
  const recentPrograms = data?.recentPrograms || [];
  const executionTimeline = data?.executionTimeline || [];
  const recentAiChats = data?.recentAiChats || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-5xl h-[88vh] bg-[#161b22] border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-gray-200">
        {/* Header */}
        <div className="h-16 border-b border-gray-800 px-6 flex items-center justify-between bg-[#1f242c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {user?.name ? user.name[0].toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{user?.name || 'Trainee'}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  MHN TAB Developer
                </span>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-2">
                <span>{user?.email}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active'}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0d1117]/60">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-sky-400 mb-3" />
              <p className="text-xs font-medium">Computing your real-time training analytics...</p>
            </div>
          ) : (
            <>
              {/* 1. Quick Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Total Programs */}
                <div className="p-4 rounded-xl bg-[#161b22] border border-gray-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400">Total Programs</span>
                    <FolderGit2 className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-white">{stats?.totalPrograms || 0}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Saved in cloud</p>
                  </div>
                </div>

                {/* Questions Solved */}
                <div className="p-4 rounded-xl bg-[#161b22] border border-gray-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400">Solved Challenges</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-3">
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-2xl font-bold text-emerald-400">{stats?.totalSolved || 0}</p>
                      <span className="text-xs text-gray-500">/ {stats?.totalPublishedProblems || 0}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">{stats?.solveRate || 0}% overall completion</p>
                  </div>
                </div>

                {/* Attempted */}
                <div className="p-4 rounded-xl bg-[#161b22] border border-gray-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400">Questions Attempted</span>
                    <Flame className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-amber-300">{stats?.totalAttempted || 0}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{stats?.totalSubmissions || 0} total test evaluations</p>
                  </div>
                </div>

                {/* Pending */}
                <div className="p-4 rounded-xl bg-[#161b22] border border-gray-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400">Challenges Pending</span>
                    <Clock className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-sky-300">{stats?.totalPending || 0}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Ready for practice</p>
                  </div>
                </div>
              </div>

              {/* 2. Difficulty Breakdown & Language Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Difficulty Progress */}
                <div className="p-5 rounded-2xl bg-[#161b22] border border-gray-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      Problem Solving by Difficulty
                    </h3>
                  </div>

                  <div className="space-y-3.5">
                    {/* Easy */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-emerald-400">Easy</span>
                        <span className="text-gray-400 font-mono">
                          {stats?.difficultyStats?.Easy?.solved || 0} / {stats?.difficultyStats?.Easy?.total || 0} ({stats?.difficultyStats?.Easy?.percentage || 0}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${stats?.difficultyStats?.Easy?.percentage || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Medium */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-amber-400">Medium</span>
                        <span className="text-gray-400 font-mono">
                          {stats?.difficultyStats?.Medium?.solved || 0} / {stats?.difficultyStats?.Medium?.total || 0} ({stats?.difficultyStats?.Medium?.percentage || 0}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 transition-all duration-500"
                          style={{ width: `${stats?.difficultyStats?.Medium?.percentage || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Hard */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-rose-400">Hard</span>
                        <span className="text-gray-400 font-mono">
                          {stats?.difficultyStats?.Hard?.solved || 0} / {stats?.difficultyStats?.Hard?.total || 0} ({stats?.difficultyStats?.Hard?.percentage || 0}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                        <div 
                          className="h-full bg-rose-500 transition-all duration-500"
                          style={{ width: `${stats?.difficultyStats?.Hard?.percentage || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Language Activity Distribution */}
                <div className="p-5 rounded-2xl bg-[#161b22] border border-gray-800 space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-sky-400" />
                    Programming Languages Used
                  </h3>

                  {stats?.languageDistribution?.length === 0 ? (
                    <p className="text-xs text-gray-500 py-6 text-center">Run code or save programs to see language metrics.</p>
                  ) : (
                    <div className="space-y-3">
                      {stats?.languageDistribution?.map(lang => {
                        const config = getLanguageConfig(lang.language);
                        return (
                          <div key={lang.language}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-semibold flex items-center gap-2 text-gray-300">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                                {config.name}
                              </span>
                              <span className="text-gray-400 font-mono">{lang.percentage}% ({lang.count} events)</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                              <div 
                                className="h-full transition-all duration-500"
                                style={{ width: `${lang.percentage}%`, backgroundColor: config.color }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Recently Opened & Saved Programs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-purple-400" />
                    Recently Saved Programs
                  </h3>
                </div>

                {recentPrograms.length === 0 ? (
                  <div className="p-6 rounded-xl bg-[#161b22] border border-gray-800 text-center text-xs text-gray-500">
                    No programs saved yet. Click "Save" in the editor toolbar!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {recentPrograms.map(p => {
                      const config = getLanguageConfig(p.language);
                      return (
                        <div
                          key={p.id}
                          className="p-3.5 rounded-xl bg-[#161b22] border border-gray-800 hover:border-gray-700 flex flex-col justify-between group transition-all"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span 
                                className="text-[10px] font-semibold px-2 py-0.5 rounded"
                                style={{ backgroundColor: `${config.color}20`, color: config.color }}
                              >
                                {config.name}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {new Date(p.updated_at).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors mt-2 truncate">
                              {p.title}
                            </h4>
                            {p.description && (
                              <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{p.description}</p>
                            )}
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-gray-800/80 flex justify-end">
                            <button
                              onClick={async () => {
                                const full = await api.getProgram(p.id);
                                loadProgramIntoEditor(full.program);
                                onClose();
                              }}
                              className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                            >
                              <span>Open in Editor</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. Execution Timeline & Recent AI Chats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Execution Timeline */}
                <div className="p-5 rounded-2xl bg-[#161b22] border border-gray-800 space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-400" />
                    Recent Execution Activity
                  </h3>

                  {executionTimeline.length === 0 ? (
                    <p className="text-xs text-gray-500 py-4 text-center">No code runs recorded yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto">
                      {executionTimeline.slice(0, 6).map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-[#0d1117] flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${item.status === 'SUCCESS' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            <span className="font-semibold text-gray-200 uppercase">{item.language}</span>
                            <span className="text-[11px] text-gray-500">{item.status}</span>
                          </div>
                          <span className="text-[11px] text-gray-400">
                            {item.execution_time ? `${item.execution_time}ms` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent AI Mentor Chats */}
                <div className="p-5 rounded-2xl bg-[#161b22] border border-gray-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-400" />
                      Recent AI Mentor Chats
                    </h3>
                    <button
                      onClick={() => {
                        onClose();
                        if (onOpenAi) onOpenAi();
                      }}
                      className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Ask AI</span>
                    </button>
                  </div>

                  {recentAiChats.length === 0 ? (
                    <p className="text-xs text-gray-500 py-4 text-center">No AI conversations yet. Ask AI for help anytime!</p>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto">
                      {recentAiChats.map(chat => (
                        <div
                          key={chat.id}
                          onClick={() => {
                            onClose();
                            if (onOpenAi) onOpenAi();
                          }}
                          className="p-2.5 rounded-lg bg-[#0d1117] hover:bg-[#12161f] cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-semibold text-gray-200 truncate">{chat.title}</p>
                            <p className="text-[10px] text-gray-500">{new Date(chat.updated_at).toLocaleDateString()}</p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
