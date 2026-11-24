import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { usePlayground } from '../context/PlaygroundContext';
import { useTheme } from '../context/ThemeContext';
import { getLanguageConfig } from '../utils/languages';
import { Loader2, Sparkles, FileCode } from 'lucide-react';

export default function CodeEditor({ onOpenSave }) {
  const { activeTab, updateActiveCode, runCode, settings, insertBoilerplateIfEmpty } = usePlayground();
  const { theme } = useTheme();
  const editorRef = useRef(null);

  const langConfig = getLanguageConfig(activeTab?.language);
  const isEmpty = !activeTab?.code || !activeTab.code.trim();

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define keyboard shortcuts
    // Ctrl/Cmd + Enter to Run Code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      runCode();
    });

    // Ctrl/Cmd + S to Save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (onOpenSave) onOpenSave();
    });
  };

  const handleEditorChange = (value) => {
    updateActiveCode(value || '');
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0d1117]">
      <Editor
        height="100%"
        language={langConfig.monacoLang}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        value={activeTab?.code || ''}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        loading={
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#0d1117] text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
            <span className="text-xs font-medium">Loading Monaco Editor Engine...</span>
          </div>
        }
        options={{
          fontSize: settings.fontSize || 14,
          tabSize: settings.tabSize || 4,
          wordWrap: settings.wordWrap || 'on',
          autoClosingBrackets: settings.autoClosingBrackets || 'always',
          minimap: { enabled: !!settings.minimap },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          automaticLayout: true,
          fontFamily: "'Fira Code', 'JetBrains Mono', Menlo, Monaco, monospace",
          fontLigatures: true,
          padding: { top: 12, bottom: 12 },
          lineNumbersMinChars: 3,
          renderLineHighlight: 'all'
        }}
      />

      {/* Empty File Template Insertion Helper */}
      {isEmpty && (
        <div className="absolute bottom-5 right-5 z-20 flex items-center gap-2.5 bg-[#161b22]/95 border border-sky-500/40 rounded-xl px-3.5 py-2 shadow-2xl backdrop-blur-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="text-xs text-gray-300">File is empty</span>
          </div>
          <button
            onClick={insertBoilerplateIfEmpty}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-all"
            title="Automatically insert starter template for this extension"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Insert Starter Template</span>
          </button>
        </div>
      )}
    </div>
  );
}
