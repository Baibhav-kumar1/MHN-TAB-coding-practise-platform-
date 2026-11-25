import React, { useState } from 'react';
import { usePlayground } from '../context/PlaygroundContext';
import { LANGUAGES, getLanguageConfig } from '../utils/languages';
import { 
  Play, 
  RotateCcw, 
  Save, 
  Share2, 
  Download, 
  Maximize2, 
  Minimize2, 
  FileCode2, 
  Check, 
  ChevronDown, 
  MessageSquare,
  Sparkles,
  Loader2,
  Columns,
  Rows,
  Terminal,
  BookOpen,
  AlertTriangle
} from 'lucide-react';

export default function Toolbar({ onOpenSave, onOpenShare, onOpenAi }) {
  const { 
    activeTab, 
    changeLanguage, 
    resetCode, 
    resetToDefaultTemplate,
    runCode, 
    isRunning, 
    downloadCode, 
    setOutputTab, 
    setIsCollapsed,
    showToast,
    // Layout
    layoutMode,
    setLayoutMode,
    resetLayout,
    // Question Workspace
    activeQuestion,
    isQuestionPanelOpen,
    setIsQuestionPanelOpen,
    resetToStarterCode
  } = usePlayground();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pendingLangSwitch, setPendingLangSwitch] = useState(null);

  const currentLangConfig = getLanguageConfig(activeTab?.language);

  // Detect if code uses standard input reading functions
  const hasInputInCode = Boolean(
    activeTab?.code &&
    (/(cin\s*>>|scanf\s*\(|getline\s*\(|input\s*\(|sys\.stdin|Scanner\s+|readLine\s*\(|readline\s*\()/i).test(activeTab.code)
  );

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const handleSelectLanguage = (langId) => {
    setLangMenuOpen(false);
    if (langId === activeTab?.language) return;

    // If solving a question and current code is modified, ask confirmation before replacing template
    if (activeQuestion && activeTab?.isModified) {
      setPendingLangSwitch(langId);
      return;
    }

    applyLanguageChange(langId);
  };

  const applyLanguageChange = (langId) => {
    changeLanguage(langId);
    if (activeQuestion) {
      const template = activeQuestion.starter_templates?.[langId] || 
                       activeQuestion.starter_templates?.python || 
                       `// Solution for: ${activeQuestion.title}\n`;
      // slight delay to let changeLanguage initialize tab title then apply question template
      setTimeout(() => {
        const config = getLanguageConfig(langId);
        showToast(`Loaded ${config.name} starter code for "${activeQuestion.title}"`, 'info');
      }, 50);
    }
    setPendingLangSwitch(null);
  };

  const handleConfirmReset = () => {
    if (activeQuestion) {
      resetToStarterCode();
    } else {
      resetToDefaultTemplate();
    }
    setResetConfirmOpen(false);
  };

  return (
    <div className="h-11 border-b border-gray-800 bg-[#1f242c] px-3 flex items-center justify-between select-none relative z-20">
      {/* Left: Language Selector, Problem Badge, Run Code & Operations */}
      <div className="flex items-center gap-2">
        {/* Language Dropdown */}
        <div className="relative">
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium text-gray-200 bg-[#21262d] hover:bg-[#30363d] border border-gray-700 transition-colors"
          >
            <span 
              className="w-2.5 h-2.5 rounded-full shrink-0" 
              style={{ backgroundColor: currentLangConfig.color }}
            />
            <span className="font-semibold">{currentLangConfig.name}</span>
            <span className="text-[10px] text-gray-400 hidden sm:inline">{currentLangConfig.version}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
          </button>

          {langMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setLangMenuOpen(false)} 
              />
              <div className="absolute left-0 top-full mt-1.5 w-60 rounded-xl bg-[#161b22] border border-gray-700 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-gray-800">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Select Language
                  </p>
                </div>
                <div className="py-1 max-h-72 overflow-y-auto">
                  {LANGUAGES.map((lang) => {
                    const isSelected = lang.id === activeTab?.language;
                    return (
                      <button
                        key={lang.id}
                        onClick={() => handleSelectLanguage(lang.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                          isSelected ? 'bg-sky-500/15 text-sky-400 font-semibold' : 'text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: lang.color }}
                          />
                          <div>
                            <p className="font-medium">{lang.name}</p>
                            <p className="text-[10px] text-gray-500">{lang.description}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Problem Indicator Pill when question is active */}
        {activeQuestion && (
          <button
            onClick={() => setIsQuestionPanelOpen(!isQuestionPanelOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
              isQuestionPanelOpen
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-[#21262d] text-gray-300 hover:text-white border-gray-700'
            }`}
            title="Toggle Question Statement Panel"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="max-w-[120px] truncate hidden md:inline">{activeQuestion.title}</span>
            <span className="text-[10px] text-amber-400 font-bold">Question</span>
          </button>
        )}

        {/* Prominent Run Code button */}
        <button
          onClick={runCode}
          disabled={isRunning}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold text-white transition-all shadow-sm active:scale-95 ${
            isRunning
              ? 'bg-emerald-600/50 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30'
          }`}
          title="Run Code (Cmd/Ctrl + Enter)"
        >
          {isRunning ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>Run</span>
        </button>

        {/* Ask AI Toolbar button */}
        <button
          onClick={onOpenAi}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-sm shadow-purple-900/30 transition-all active:scale-95"
          title="Ask AI Coding Mentor"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>

        {/* Input (stdin) Quick Switch */}
        <button
          onClick={() => {
            setOutputTab('input');
            setIsCollapsed(false);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${
            hasInputInCode && !activeTab?.stdin
              ? 'bg-amber-950/40 text-amber-300 border border-amber-600/50 hover:bg-amber-900/50'
              : 'text-gray-300 hover:text-white bg-[#21262d] hover:bg-[#30363d] border border-gray-700'
          }`}
          title="Open Stdin Input Tab"
        >
          <MessageSquare className={`w-3.5 h-3.5 ${hasInputInCode && !activeTab?.stdin ? 'text-amber-400' : 'text-sky-400'}`} />
          <span className="hidden sm:inline">Input (stdin)</span>
          {activeTab?.stdin ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          ) : hasInputInCode ? (
            <span className="px-1 py-0.2 rounded text-[9px] bg-amber-500/30 text-amber-200 font-mono animate-pulse">
              needed
            </span>
          ) : null}
        </button>

        {/* Reset Code Button */}
        <div className="relative">
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-gray-400 hover:text-gray-200 hover:bg-[#30363d] transition-colors"
            title={activeQuestion ? 'Reset to question starter template' : 'Reset to Default Template'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset to Template</span>
          </button>

          {/* Reset Confirmation Tooltip/Modal */}
          {resetConfirmOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setResetConfirmOpen(false)} 
              />
              <div className="absolute left-0 top-full mt-1.5 w-64 p-3 rounded-xl bg-[#161b22] border border-rose-500/30 shadow-2xl z-50 text-left">
                <p className="text-xs font-semibold text-rose-300">
                  {activeQuestion ? 'Reset to question template?' : 'Reset to Default Template?'}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  This will discard your current edits in this tab.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={handleConfirmReset}
                    className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium"
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => setResetConfirmOpen(false)}
                    className="px-2.5 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center/Right: Advanced Layout Switcher Control Group */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-[#161b22] p-0.5 rounded-lg border border-gray-800">
          <button
            onClick={() => setLayoutMode('horizontal')}
            className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1 ${
              layoutMode === 'horizontal' 
                ? 'bg-sky-600 text-white shadow-sm font-semibold' 
                : 'text-gray-400 hover:text-white'
            }`}
            title="Horizontal Split View (Editor Left, Output Right)"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px]">Split H</span>
          </button>

          <button
            onClick={() => setLayoutMode('vertical')}
            className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1 ${
              layoutMode === 'vertical' 
                ? 'bg-sky-600 text-white shadow-sm font-semibold' 
                : 'text-gray-400 hover:text-white'
            }`}
            title="Vertical Split View (Editor Top, Output Bottom)"
          >
            <Rows className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px]">Split V</span>
          </button>

          <button
            onClick={() => setLayoutMode('full-editor')}
            className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1 ${
              layoutMode === 'full-editor' 
                ? 'bg-sky-600 text-white shadow-sm font-semibold' 
                : 'text-gray-400 hover:text-white'
            }`}
            title="Full Editor View (100% Code Editor)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px]">Editor</span>
          </button>

          <button
            onClick={() => setLayoutMode('full-output')}
            className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1 ${
              layoutMode === 'full-output' 
                ? 'bg-sky-600 text-white shadow-sm font-semibold' 
                : 'text-gray-400 hover:text-white'
            }`}
            title="Full Output View (100% Terminal Output)"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px]">Output</span>
          </button>

          <button
            onClick={resetLayout}
            className="p-1.5 rounded text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Reset Split Layout to 50/50 balance"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Action Controls: Save, Share, Download, Fullscreen */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenSave}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-gray-300 hover:text-white bg-[#21262d] hover:bg-[#30363d] border border-gray-700 transition-colors"
            title="Save Program to Account / Local"
          >
            <Save className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={onOpenShare}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-gray-300 hover:text-white bg-[#21262d] hover:bg-[#30363d] border border-gray-700 transition-colors"
            title="Share Code via Link"
          >
            <Share2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={downloadCode}
            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#30363d] transition-colors"
            title="Download Code File"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#30363d] transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Editor'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Language Switch Confirmation Modal in Question Mode */}
      {pendingLangSwitch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#161b22] border border-amber-500/40 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Switch Problem Language?</h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              You have modified code in this tab. Switching to <strong className="text-sky-400">{getLanguageConfig(pendingLangSwitch).name}</strong> will replace your current code with the problem's starter template.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1 font-sans">
              <button
                onClick={() => setPendingLangSwitch(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => applyLanguageChange(pendingLangSwitch)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors shadow-md"
              >
                Yes, Switch & Load Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
