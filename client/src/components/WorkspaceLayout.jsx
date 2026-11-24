import React, { useState, useRef, useEffect, useCallback } from 'react';
import CodeEditor from './CodeEditor';
import OutputPanel from './OutputPanel';
import QuestionPanel from './QuestionPanel';
import { usePlayground } from '../context/PlaygroundContext';
import { 
  Columns, 
  Rows, 
  Maximize2, 
  Terminal, 
  RotateCcw,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function WorkspaceLayout({ onOpenSave, onOpenAi }) {
  const { 
    layoutMode, 
    setLayoutMode, 
    splitRatio, 
    setSplitRatio, 
    resetLayout,
    activeQuestion 
  } = usePlayground();

  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Horizontal Drag Handlers (Left/Right)
  const handleHorizontalStart = useCallback((clientX) => {
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = e.touches ? e.touches[0].clientX : e.clientX;
      const offsetX = currentX - rect.left;
      const newRatio = (offsetX / rect.width) * 100;
      setSplitRatio(newRatio);
    };

    const onEnd = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
  }, [setSplitRatio]);

  // Vertical Drag Handlers (Top/Bottom)
  const handleVerticalStart = useCallback((clientY) => {
    setIsDragging(true);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    const onMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const currentY = e.touches ? e.touches[0].clientY : e.clientY;
      const offsetY = currentY - rect.top;
      const newRatio = (offsetY / rect.height) * 100;
      setSplitRatio(newRatio);
    };

    const onEnd = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
  }, [setSplitRatio]);

  return (
    <div className="flex-1 flex min-h-0 relative overflow-hidden bg-[#0d1117]">
      {/* 1. Collapsible Question Panel when active problem is selected */}
      {activeQuestion && (
        <QuestionPanel onOpenAi={onOpenAi} />
      )}

      {/* 2. Main Workspace Layout Area */}
      <div ref={containerRef} className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* VIEW A: FULL EDITOR */}
        {layoutMode === 'full-editor' && (
          <div className="flex-1 h-full min-h-0 relative flex flex-col overflow-hidden">
            <CodeEditor onOpenSave={onOpenSave} />
            {/* Quick floating switcher back to split */}
            <button
              onClick={() => setLayoutMode('horizontal')}
              className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#161b22]/90 hover:bg-[#1f242c] text-sky-400 border border-sky-500/40 shadow-lg backdrop-blur transition-all active:scale-95"
              title="Show Output Panel (Horizontal Split)"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Show Output</span>
            </button>
          </div>
        )}

        {/* VIEW B: FULL OUTPUT */}
        {layoutMode === 'full-output' && (
          <div className="flex-1 h-full min-h-0 relative flex flex-col overflow-hidden">
            <OutputPanel onOpenAi={onOpenAi} isWorkspaceManaged={true} />
            {/* Quick floating switcher back to editor */}
            <button
              onClick={() => setLayoutMode('horizontal')}
              className="absolute top-12 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#161b22]/90 hover:bg-[#1f242c] text-sky-400 border border-sky-500/40 shadow-lg backdrop-blur transition-all active:scale-95"
              title="Show Code Editor"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Show Code Editor</span>
            </button>
          </div>
        )}

        {/* VIEW C: HORIZONTAL SPLIT (Editor Left, Output Right) */}
        {layoutMode === 'horizontal' && (
          <div className="flex-1 flex flex-row min-h-0 w-full h-full relative overflow-hidden">
            {/* Left: Code Editor */}
            <div 
              style={{ width: `${splitRatio}%` }} 
              className="h-full min-w-0 relative flex flex-col overflow-hidden transition-[width] duration-75"
            >
              <CodeEditor onOpenSave={onOpenSave} />
            </div>

            {/* Draggable Vertical Divider */}
            <div
              onMouseDown={(e) => handleHorizontalStart(e.clientX)}
              onTouchStart={(e) => handleHorizontalStart(e.touches[0].clientX)}
              onDoubleClick={resetLayout}
              className={`w-2 h-full bg-[#161b22] hover:bg-sky-500/40 transition-colors cursor-col-resize flex items-center justify-center shrink-0 group select-none z-10 border-x border-gray-800/80 ${
                isDragging ? 'bg-sky-500/60 shadow-lg shadow-sky-500/20' : ''
              }`}
              title="Drag horizontally to resize (Double click to reset 50/50)"
            >
              <div 
                className={`h-12 w-1 rounded-full transition-colors ${
                  isDragging ? 'bg-sky-400 scale-y-110' : 'bg-gray-600 group-hover:bg-sky-400'
                }`} 
              />
            </div>

            {/* Right: Output Panel */}
            <div 
              style={{ width: `${100 - splitRatio}%` }} 
              className="h-full min-w-0 relative flex flex-col overflow-hidden transition-[width] duration-75"
            >
              <OutputPanel onOpenAi={onOpenAi} isWorkspaceManaged={true} />
            </div>
          </div>
        )}

        {/* VIEW D: VERTICAL SPLIT (Editor Top, Output Bottom) */}
        {layoutMode === 'vertical' && (
          <div className="flex-1 flex flex-col min-h-0 w-full h-full relative overflow-hidden">
            {/* Top: Code Editor */}
            <div 
              style={{ height: `${splitRatio}%` }} 
              className="w-full min-h-0 relative flex flex-col overflow-hidden transition-[height] duration-75"
            >
              <CodeEditor onOpenSave={onOpenSave} />
            </div>

            {/* Draggable Horizontal Divider */}
            <div
              onMouseDown={(e) => handleVerticalStart(e.clientY)}
              onTouchStart={(e) => handleVerticalStart(e.touches[0].clientY)}
              onDoubleClick={resetLayout}
              className={`h-2 w-full bg-[#161b22] hover:bg-sky-500/40 transition-colors cursor-row-resize flex items-center justify-center shrink-0 group select-none z-10 border-y border-gray-800/80 ${
                isDragging ? 'bg-sky-500/60 shadow-lg shadow-sky-500/20' : ''
              }`}
              title="Drag vertically to resize (Double click to reset 50/50)"
            >
              <div 
                className={`w-14 h-1 rounded-full transition-colors ${
                  isDragging ? 'bg-sky-400 scale-x-110' : 'bg-gray-600 group-hover:bg-sky-400'
                }`} 
              />
            </div>

            {/* Bottom: Output Panel */}
            <div 
              style={{ height: `${100 - splitRatio}%` }} 
              className="w-full min-h-0 relative flex flex-col overflow-hidden transition-[height] duration-75"
            >
              <OutputPanel onOpenAi={onOpenAi} isWorkspaceManaged={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
