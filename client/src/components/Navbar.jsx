import React from 'react';
import { usePlayground } from '../context/PlaygroundContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Terminal, 
  Play, 
  BookOpen, 
  FolderGit2, 
  History, 
  Sun, 
  Moon, 
  Settings, 
  Loader2,
  Sparkles,
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';

export default function Navbar({ 
  onOpenPractice, 
  onOpenPrograms, 
  onOpenHistory, 
  onOpenSettings, 
  onOpenAuth,
  onOpenDashboard,
  onOpenAdmin,
  onOpenAi
}) {
  const { runCode, isRunning } = usePlayground();
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isAdmin = user?.role === 'admin';

  return (
    <header className="h-14 border-b border-gray-800 bg-[#161b22]/90 dark:bg-[#161b22]/90 backdrop-blur-md px-4 flex items-center justify-between select-none z-30 transition-colors">
      {/* Brand & Platform Identity */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                MHN <span className="text-sky-400 font-semibold">TAB</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-gray-400 hidden sm:block">Advanced Developer Platform</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1">
          <button 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-sky-400 bg-sky-500/10 border border-sky-500/20 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>

          <button 
            onClick={onOpenPractice}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Question Bank</span>
          </button>

          <button 
            onClick={onOpenPrograms}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-purple-400" />
            <span>My Programs</span>
          </button>

          {/* Student Dashboard */}
          <button 
            onClick={onOpenDashboard}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-teal-400" />
            <span>Dashboard</span>
          </button>

          <button 
            onClick={onOpenHistory}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-emerald-400" />
            <span>History</span>
          </button>
        </nav>
      </div>

      {/* Right Controls & User Info */}
      <div className="flex items-center gap-2.5">
        {/* Single Clean Admin Portal Button (Always Visible) */}
        <button
          onClick={onOpenAdmin}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-200 bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 transition-all shadow-sm active:scale-95"
          title="Open Central Admin Portal"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden md:inline">Admin Portal</span>
        </button>

        {/* Ask AI Mentor Button */}
        <button
          onClick={onOpenAi}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-900/40 transition-all active:scale-95"
          title="Open AI Coding Mentor"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Ask AI</span>
        </button>

        {/* Run Code Button */}
        <button
          onClick={runCode}
          disabled={isRunning}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-md transition-all active:scale-95 ${
            isRunning
              ? 'bg-emerald-600/60 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30 hover:shadow-emerald-600/40'
          }`}
          title="Run Code (Cmd/Ctrl + Enter)"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Code</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-emerald-700/50 rounded border border-emerald-500/40">
                ⌘↵
              </kbd>
            </>
          )}
        </button>

        <div className="h-4 w-px bg-gray-700 mx-0.5 hidden sm:block" />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Editor Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Developer Profile (No login/signup required) */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-700">
          <button
            onClick={onOpenDashboard}
            className="flex items-center gap-2 hover:opacity-85 transition-opacity"
            title="Open Developer Dashboard"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow">
              M
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-medium text-white leading-none">Developer</p>
              <p className="text-[10px] text-gray-400 leading-tight mt-0.5">Workspace Active</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
