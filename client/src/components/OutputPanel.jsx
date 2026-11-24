import React, { useState, useRef, useEffect } from 'react';
import { usePlayground } from '../context/PlaygroundContext';
import WebPreview from './WebPreview';
import { 
  Terminal, 
  AlertOctagon, 
  MessageSquare, 
  Eye, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Play, 
  Loader2,
  Cpu,
  Sparkles
} from 'lucide-react';

export default function OutputPanel({ onOpenAi, isWorkspaceManaged = true }) {
  const { 
    outputTab, 
    setOutputTab, 
    panelHeight, 
    setPanelHeight, 
    isCollapsed, 
    setIsCollapsed, 
    executionResult, 
    isRunning, 
    clearOutput,
    activeTab,
    updateActiveStdin
  } = usePlayground();

  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(panelHeight);

  // Drag resizer handlers
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = panelHeight;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaY = startYRef.current - e.clientY;
    const newHeight = Math.min(Math.max(startHeightRef.current + deltaY, 120), window.innerHeight * 0.75);
    setPanelHeight(newHeight);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  // Status badge styling
  const renderStatusBadge = () => {
    if (isRunning) {
      return (
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
          Running Code...
        </span>
      );
    }

    if (executionResult.status === 'SUCCESS') {
      return (
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          Success ({executionResult.executionTime}ms)
        </span>
      );
    }

    if (executionResult.status === 'TIME_LIMIT_EXCEEDED') {
      return (
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
          <Clock className="w-3 h-3 text-rose-400" />
          Time Limit Exceeded (&gt;6s)
        </span>
      );
    }

    if (executionResult.status === 'COMPILATION_ERROR' || executionResult.status === 'RUNTIME_ERROR' || executionResult.status === 'SERVER_ERROR') {
      return (
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
          <AlertCircle className="w-3 h-3 text-rose-400" />
          {executionResult.status.replace(/_/g, ' ')}
        </span>
      );
    }

    return (
      <span className="text-[11px] text-gray-500">
        Ready for execution
      </span>
    );
  };

  const isWebLanguage = activeTab?.language === 'html' || activeTab?.language === 'css';

  return (
    <div 
      className={`bg-[#161b22] flex flex-col overflow-hidden transition-all duration-150 ${
        isWorkspaceManaged 
          ? 'h-full w-full' 
          : `border-t border-gray-800 ${isCollapsed ? 'h-9' : ''}`
      }`}
      style={!isWorkspaceManaged ? { height: isCollapsed ? 36 : panelHeight } : undefined}
    >
      {/* Resizer Handle (Only when not managed by WorkspaceLayout) */}
      {!isWorkspaceManaged && !isCollapsed && (
        <div 
          onMouseDown={handleMouseDown}
          className="h-1.5 w-full bg-[#1f242c] hover:bg-sky-500/60 transition-colors cursor-row-resize flex items-center justify-center group"
          title="Drag up or down to resize output panel"
        >
          <div className="w-12 h-0.5 rounded-full bg-gray-600 group-hover:bg-white" />
        </div>
      )}

      {/* Tabs Header */}
      <div className="h-9 px-3 bg-[#161b22] border-b border-gray-800/80 flex items-center justify-between select-none">
        {/* Output Tabs */}
        <div className="flex items-center gap-1">
          {/* Output Tab */}
          <button
            onClick={() => {
              setOutputTab('output');
              setIsCollapsed(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              outputTab === 'output' && !isCollapsed
                ? 'bg-[#21262d] text-sky-400 border border-gray-700'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Output</span>
          </button>

          {/* Errors Tab */}
          <button
            onClick={() => {
              setOutputTab('errors');
              setIsCollapsed(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              outputTab === 'errors' && !isCollapsed
                ? 'bg-[#21262d] text-rose-400 border border-gray-700'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            <span>Errors</span>
            {executionResult.stderr && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {/* Stdin Input Tab */}
          <button
            onClick={() => {
              setOutputTab('input');
              setIsCollapsed(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              outputTab === 'input' && !isCollapsed
                ? 'bg-[#21262d] text-emerald-400 border border-gray-700'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Input (stdin)</span>
            {activeTab?.stdin ? (
              <span className="px-1 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-mono">
                set
              </span>
            ) : null}
          </button>

          {/* Web Preview Tab */}
          <button
            onClick={() => {
              setOutputTab('preview');
              setIsCollapsed(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              outputTab === 'preview' && !isCollapsed
                ? 'bg-[#21262d] text-amber-400 border border-gray-700'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Preview</span>
            {isWebLanguage && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </button>

          {/* Console / Diagnostics Tab */}
          <button
            onClick={() => {
              setOutputTab('console');
              setIsCollapsed(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              outputTab === 'console' && !isCollapsed
                ? 'bg-[#21262d] text-purple-400 border border-gray-700'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Diagnostics</span>
          </button>
        </div>

        {/* Right Status Badges & Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center">
            {renderStatusBadge()}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={clearOutput}
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Clear Output"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
            >
              {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Panel Body */}
      {!isCollapsed && (
        <div className="flex-1 overflow-auto bg-[#0d1117] text-gray-300 font-mono text-xs p-3">
          {/* TAB 1: OUTPUT */}
          {outputTab === 'output' && (
            <div className="h-full flex flex-col justify-between">
              {isRunning ? (
                <div className="flex items-center gap-3 text-sky-400 py-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Executing program in isolated container...</span>
                </div>
              ) : executionResult.stdout ? (
                <pre className="whitespace-pre-wrap font-mono leading-relaxed select-text text-gray-200">
                  {executionResult.stdout}
                </pre>
              ) : executionResult.stderr ? (
                <div className="text-rose-400 flex flex-col gap-2">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Execution produced errors:
                  </p>
                  <pre className="whitespace-pre-wrap bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/50 font-mono">
                    {executionResult.stderr}
                  </pre>
                  <button
                    onClick={() => setOutputTab('errors')}
                    className="self-start text-xs text-sky-400 hover:underline flex items-center gap-1"
                  >
                    View Beginner Fix Recommendations &rarr;
                  </button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 py-8">
                  <Terminal className="w-8 h-8 mb-2 opacity-40" />
                  <p className="font-sans text-sm">Program output will appear here</p>
                  <p className="font-sans text-[11px] text-gray-600 mt-0.5">Click "Run Code" or press ⌘+Enter to execute.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INPUT (STDIN) */}
          {outputTab === 'input' && (
            <div className="h-full flex flex-col gap-2 font-sans">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  Standard Input (stdin)
                </span>
                <span className="text-[11px] text-gray-500">
                  Passed to Scanner (Java), input() (Python), cin (C++)
                </span>
              </div>
              <textarea
                value={activeTab?.stdin || ''}
                onChange={(e) => updateActiveStdin(e.target.value)}
                placeholder="Enter input for interactive programs here (e.g. numbers, names, multiline values)..."
                rows={4}
                className="w-full flex-1 p-2.5 rounded-lg bg-[#161b22] border border-gray-700 text-gray-200 font-mono text-xs focus:outline-none focus:border-sky-500 transition-colors resize-none"
              />
            </div>
          )}

          {/* TAB 3: ERRORS & EXPLANATION */}
          {outputTab === 'errors' && (
            <div className="space-y-3 font-sans">
              {/* Beginner Helper Card if available */}
              {executionResult.explanation && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-sky-950/30 to-purple-950/40 border border-amber-500/30 text-amber-100 shadow-lg">
                  <div className="flex items-center gap-2 mb-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <h4 className="font-semibold text-xs text-amber-300">
                      Beginner Explanation: {executionResult.explanation.title}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {executionResult.explanation.hint}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-amber-500/20 text-xs text-sky-300 flex items-start gap-1.5">
                    <span className="font-semibold shrink-0">💡 Suggested Fix:</span>
                    <span>{executionResult.explanation.action}</span>
                  </div>
                </div>
              )}

              {/* Raw Error Trace */}
              {executionResult.stderr ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                      Compiler / Runtime Output
                    </p>
                    {onOpenAi && (
                      <button
                        onClick={onOpenAi}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-950/40 transition-all active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Ask AI to Fix This Error</span>
                      </button>
                    )}
                  </div>
                  <pre className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 text-rose-300 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                    {executionResult.stderr}
                  </pre>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500 font-sans">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/50" />
                  <p className="text-sm font-medium">No errors detected</p>
                  <p className="text-xs text-gray-600">Your program executed cleanly with exit code 0.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WEB PREVIEW */}
          {outputTab === 'preview' && (
            <div className="h-full -m-3">
              <WebPreview />
            </div>
          )}

          {/* TAB 5: DIAGNOSTICS */}
          {outputTab === 'console' && (
            <div className="space-y-2 font-mono text-xs text-gray-300">
              <div className="p-3 rounded-lg bg-[#161b22] border border-gray-800 space-y-1.5">
                <p><span className="text-gray-500">Language:</span> {activeTab?.language}</p>
                <p><span className="text-gray-500">Status:</span> {executionResult.status}</p>
                <p><span className="text-gray-500">Execution Duration:</span> {executionResult.executionTime ? `${executionResult.executionTime} ms` : 'N/A'}</p>
                <p><span className="text-gray-500">Exit Code:</span> {executionResult.exitCode !== null ? executionResult.exitCode : 'N/A'}</p>
                <p><span className="text-gray-500">Sandbox Isolation:</span> Active (POSIX Temp Directory Sandbox)</p>
                <p><span className="text-gray-500">Stdin Bytes:</span> {activeTab?.stdin?.length || 0} bytes</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
