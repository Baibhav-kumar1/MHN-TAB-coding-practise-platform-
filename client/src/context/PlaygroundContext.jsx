import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { STARTER_TEMPLATES, getBoilerplateForExtension } from '../utils/starterTemplates';
import { LANGUAGES, getLanguageConfig, getLanguageByExtension } from '../utils/languages';
import { api } from '../utils/api';

const PlaygroundContext = createContext();

const DEFAULT_TABS = [
  {
    id: 'tab-1',
    title: 'Main.java',
    language: 'java',
    code: STARTER_TEMPLATES.java,
    stdin: 'Baibhav 95',
    isModified: false
  },
  {
    id: 'tab-2',
    title: 'script.py',
    language: 'python',
    code: STARTER_TEMPLATES.python,
    stdin: '',
    isModified: false
  }
];

export function getLanguageFromFilename(filename) {
  if (!filename || typeof filename !== 'string') return 'python';
  const clean = filename.trim();
  const dotIdx = clean.lastIndexOf('.');
  if (dotIdx === -1) return 'plaintext';
  const ext = clean.substring(dotIdx).toLowerCase();
  switch (ext) {
    case '.py':
    case '.pyw':
      return 'python';
    case '.java':
      return 'java';
    case '.cpp':
    case '.cc':
    case '.cxx':
    case '.hpp':
      return 'cpp';
    case '.c':
    case '.h':
      return 'c';
    case '.js':
    case '.mjs':
    case '.cjs':
      return 'javascript';
    case '.jsx':
      return 'jsx';
    case '.ts':
    case '.tsx':
      return 'typescript';
    case '.html':
    case '.htm':
      return 'html';
    case '.css':
      return 'css';
    case '.sql':
      return 'sql';
    case '.json':
      return 'json';
    default:
      return 'plaintext';
  }
}

export function PlaygroundProvider({ children }) {
  // Load saved tabs from localStorage or fallback to default
  const [tabs, setTabs] = useState(() => {
    try {
      const saved = localStorage.getItem('ojt_tabs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_TABS;
  });

  const [activeTabId, setActiveTabId] = useState(() => {
    try {
      const savedActive = localStorage.getItem('ojt_active_tab_id');
      if (savedActive && tabs.some(t => t.id === savedActive)) return savedActive;
    } catch (e) {}
    return tabs[0]?.id || 'tab-1';
  });

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  // Layout states: 'horizontal' | 'vertical' | 'full-editor' | 'full-output'
  const [layoutMode, setLayoutModeState] = useState(() => {
    try {
      const saved = localStorage.getItem('mhn_layout_mode');
      if (['horizontal', 'vertical', 'full-editor', 'full-output'].includes(saved)) return saved;
    } catch (e) {}
    return 'horizontal';
  });

  // Split ratio: percentage for editor (15 to 85, default 55%)
  const [splitRatio, setSplitRatioState] = useState(() => {
    try {
      const saved = localStorage.getItem('mhn_split_ratio');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 15 && parsed <= 85) return parsed;
      }
    } catch (e) {}
    return 55;
  });

  // Question Workspace states
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [isQuestionPanelOpen, setIsQuestionPanelOpen] = useState(true);

  // Output panel state
  const [outputTab, setOutputTab] = useState('output'); // 'output' | 'input' | 'errors' | 'preview' | 'console'
  const [panelHeight, setPanelHeight] = useState(() => {
    return parseInt(localStorage.getItem('ojt_panel_height') || '280', 10);
  });
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState({
    status: 'IDLE',
    stdout: '',
    stderr: '',
    executionTime: null,
    exitCode: null,
    explanation: null
  });

  // Editor Settings
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('ojt_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { autoBoilerplate: true, ...parsed };
      }
    } catch (e) {}
    return {
      fontSize: 14,
      tabSize: 4,
      wordWrap: 'on',
      autoClosingBrackets: 'always',
      minimap: false,
      autoBoilerplate: true
    };
  });

  // Active toast
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(prev => (prev?.id === prev?.id ? null : prev));
    }, 3500);
  }, []);

  // Persist tabs and active tab to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ojt_tabs', JSON.stringify(tabs));
      localStorage.setItem('ojt_active_tab_id', activeTabId);
    } catch (e) {}
  }, [tabs, activeTabId]);

  // Persist panel height
  useEffect(() => {
    localStorage.setItem('ojt_panel_height', panelHeight.toString());
  }, [panelHeight]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('ojt_settings', JSON.stringify(settings));
  }, [settings]);

  // Real-Time Global Content Synchronization Listener (SSE)
  const [syncEvent, setSyncEvent] = useState(null);

  useEffect(() => {
    let eventSource;
    let reconnectTimeout;

    const connectSync = () => {
      try {
        eventSource = new EventSource('/api/sync/events');

        eventSource.onopen = () => {
          // Connected to SSE
        };

        eventSource.onmessage = (e) => {
          try {
            const parsed = JSON.parse(e.data);
            if (parsed.type && parsed.type !== 'connected') {
              setSyncEvent(parsed);
            }
          } catch (err) {}
        };

        eventSource.onerror = () => {
          eventSource.close();
          // Auto reconnect after 3 seconds
          reconnectTimeout = setTimeout(connectSync, 3000);
        };
      } catch (err) {
        reconnectTimeout = setTimeout(connectSync, 5000);
      }
    };

    connectSync();

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  // Update active tab code
  const updateActiveCode = useCallback((newCode) => {
    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        return { ...tab, code: newCode, isModified: true };
      }
      return tab;
    }));
  }, [activeTabId]);

  // Update active tab stdin
  const updateActiveStdin = useCallback((newStdin) => {
    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        return { ...tab, stdin: newStdin };
      }
      return tab;
    }));
  }, [activeTabId]);

  // Switch language for active tab
  const changeLanguage = useCallback((langId) => {
    const config = getLanguageConfig(langId);
    const starter = STARTER_TEMPLATES[config.id] || `// Write your ${config.name} code here\n`;
    
    // Choose appropriate tab title extension
    const titleBase = activeTab.title.split('.')[0] || 'code';
    const newTitle = `${titleBase}${config.extension}`;

    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        return {
          ...tab,
          language: config.id,
          title: newTitle,
          code: starter,
          isModified: false
        };
      }
      return tab;
    }));

    if (config.id === 'html' || config.id === 'css') {
      setOutputTab('preview');
    }

    showToast(`Switched language to ${config.name}`, 'info');
  }, [activeTabId, activeTab, showToast]);

  // Reset current code to starter template
  const resetCode = useCallback(() => {
    const config = getLanguageConfig(activeTab.language);
    const starter = STARTER_TEMPLATES[config.id] || '';
    updateActiveCode(starter);
    showToast('Code reset to template default.', 'info');
  }, [activeTab, updateActiveCode, showToast]);

  // Create new tab with default or custom language
  const addTab = useCallback((langId = 'python') => {
    const config = getLanguageConfig(langId);
    const newId = `tab-${Date.now()}`;
    const newTab = {
      id: newId,
      title: `program_${tabs.length + 1}${config.extension}`,
      language: config.id,
      code: STARTER_TEMPLATES[config.id] || '',
      stdin: '',
      isModified: false
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
    showToast(`Created new tab (${config.name})`, 'info');
  }, [tabs.length, showToast]);

  // Create custom file with user's desired name and extension
  const createCustomFile = useCallback((filename, initialContent = null) => {
    let cleanName = (filename || '').trim();
    if (!cleanName) {
      cleanName = `file_${tabs.length + 1}.py`;
    }
    if (!cleanName.includes('.')) {
      cleanName += '.py';
    }

    const langId = getLanguageFromFilename(cleanName);
    const config = getLanguageConfig(langId);

    // Auto-resolve duplicate titles
    let finalTitle = cleanName;
    let counter = 1;
    while (tabs.some(t => t.title.toLowerCase() === finalTitle.toLowerCase())) {
      const dotIdx = cleanName.lastIndexOf('.');
      const base = cleanName.substring(0, dotIdx);
      const ext = cleanName.substring(dotIdx);
      finalTitle = `${base}_${counter}${ext}`;
      counter++;
    }

    const newId = `tab-${Date.now()}`;
    
    // Automatic boilerplate logic:
    // 1. If initialContent is explicitly provided (reopening file / project), NEVER overwrite existing code!
    // 2. If initialContent is null and settings.autoBoilerplate !== false:
    //    Use getBoilerplateForExtension (returns "" for unsupported extensions)
    // 3. If settings.autoBoilerplate === false:
    //    Create blank file ("")
    let content = '';
    if (initialContent !== null) {
      content = initialContent;
    } else if (settings.autoBoilerplate !== false) {
      content = getBoilerplateForExtension(finalTitle, finalTitle);
    }

    const newTab = {
      id: newId,
      title: finalTitle,
      language: config.id,
      code: content,
      stdin: '',
      isModified: false
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
    showToast(`Created "${finalTitle}" (${config.name})`, 'success');
    return newTab;
  }, [tabs, settings.autoBoilerplate, showToast]);

  // Reset current active tab code to default template for its extension/language
  const resetToDefaultTemplate = useCallback(() => {
    if (!activeTab) return;
    const boilerplate = getBoilerplateForExtension(activeTab.title, activeTab.title) || 
                        STARTER_TEMPLATES[activeTab.language] || '';
    updateActiveCode(boilerplate);
    showToast(`Reset "${activeTab.title}" to default template`, 'info');
  }, [activeTab, updateActiveCode, showToast]);

  // Insert template if current file is empty
  const insertBoilerplateIfEmpty = useCallback(() => {
    if (!activeTab) return;
    if (activeTab.code && activeTab.code.trim().length > 0) {
      showToast('File already contains code. Preserving existing code.', 'info');
      return;
    }
    const boilerplate = getBoilerplateForExtension(activeTab.title, activeTab.title) || 
                        STARTER_TEMPLATES[activeTab.language] || '';
    if (!boilerplate) {
      showToast('No boilerplate template available for this extension.', 'warning');
      return;
    }
    updateActiveCode(boilerplate);
    showToast(`Inserted starter template for "${activeTab.title}"`, 'success');
  }, [activeTab, updateActiveCode, showToast]);

  // Rename tab and auto-update language syntax if extension changed
  const renameTab = useCallback((tabId, newTitle) => {
    let cleanTitle = (newTitle || '').trim();
    if (!cleanTitle) return;
    
    setTabs(prev => prev.map(tab => {
      if (tab.id === tabId) {
        if (!cleanTitle.includes('.')) {
          const ext = getLanguageConfig(tab.language).extension;
          cleanTitle += ext;
        }
        const newLang = getLanguageFromFilename(cleanTitle);
        let updatedCode = tab.code;
        // If file is completely empty and autoBoilerplate is enabled, insert template for new extension
        if ((!updatedCode || !updatedCode.trim()) && settings.autoBoilerplate !== false) {
          const bp = getBoilerplateForExtension(cleanTitle, cleanTitle);
          if (bp) updatedCode = bp;
        }
        return {
          ...tab,
          title: cleanTitle,
          language: newLang,
          code: updatedCode
        };
      }
      return tab;
    }));
    showToast(`Renamed tab to "${cleanTitle}"`, 'info');
  }, [settings.autoBoilerplate, showToast]);

  // Layout mode controls
  const setLayoutMode = useCallback((mode) => {
    const valid = ['horizontal', 'vertical', 'full-editor', 'full-output'];
    if (valid.includes(mode)) {
      setLayoutModeState(mode);
      try { localStorage.setItem('mhn_layout_mode', mode); } catch (e) {}
    }
  }, []);

  const setSplitRatio = useCallback((ratio) => {
    const clamped = Math.min(Math.max(Math.round(ratio), 15), 85);
    setSplitRatioState(clamped);
    try { localStorage.setItem('mhn_split_ratio', clamped.toString()); } catch (e) {}
  }, []);

  const resetLayout = useCallback(() => {
    setSplitRatio(50);
    showToast('Split layout reset to 50/50 balance.', 'info');
  }, [setSplitRatio, showToast]);

  // Question Workspace actions
  const openQuestionWorkspace = useCallback((question) => {
    setActiveQuestion(question);
    setIsQuestionPanelOpen(true);

    const lang = activeTab?.language || 'python';
    const template = question.starter_templates?.[lang] || 
                     question.starter_templates?.python || 
                     `// Solution for: ${question.title}\n`;
    const config = getLanguageConfig(lang);
    const cleanTitle = `${question.title.replace(/[^a-zA-Z0-9_-]/g, '_')}${config.extension}`;

    // Switch or create question tab
    const existing = tabs.find(t => t.questionId === question.id);
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      const newId = `tab-${Date.now()}`;
      const newTab = {
        id: newId,
        title: cleanTitle,
        language: lang,
        code: template,
        stdin: question.sample_test_cases?.[0]?.input || '',
        isModified: false,
        questionId: question.id
      };
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newId);
    }

    if (layoutMode === 'full-output') {
      setLayoutMode('horizontal');
    }
    showToast(`Loaded Question Workspace: "${question.title}"`, 'success');
  }, [activeTab, tabs, layoutMode, setLayoutMode, showToast]);

  const closeQuestionWorkspace = useCallback(() => {
    setActiveQuestion(null);
    showToast('Exited Question Workspace', 'info');
  }, [showToast]);

  const resetToStarterCode = useCallback(() => {
    if (!activeQuestion) {
      resetCode();
      return;
    }
    const lang = activeTab.language;
    const template = activeQuestion.starter_templates?.[lang] || 
                     activeQuestion.starter_templates?.python || 
                     STARTER_TEMPLATES[lang] || '';
    updateActiveCode(template);
    showToast('Reset to question starter template.', 'info');
  }, [activeQuestion, activeTab, resetCode, updateActiveCode, showToast]);

  // Close tab
  const closeTab = useCallback((idToClose, e) => {
    if (e) e.stopPropagation();
    if (tabs.length <= 1) {
      showToast('Cannot close the only open tab.', 'warning');
      return;
    }

    const remaining = tabs.filter(t => t.id !== idToClose);
    setTabs(remaining);
    if (activeTabId === idToClose) {
      setActiveTabId(remaining[0].id);
    }
  }, [tabs, activeTabId, showToast]);

  // Load an existing program or problem into editor
  const loadProgramIntoEditor = useCallback((program) => {
    const config = getLanguageConfig(program.language);
    const tabId = `tab-${Date.now()}`;
    const newTab = {
      id: tabId,
      title: `${program.title.replace(/[^a-zA-Z0-9_-]/g, '_')}${config.extension}`,
      language: config.id,
      code: program.code,
      stdin: program.stdin || '',
      isModified: false
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTabId(tabId);
    showToast(`Loaded "${program.title}" into editor`, 'success');
  }, [showToast]);

  // Trigger Code Execution
  const runCode = useCallback(async () => {
    if (!activeTab || isRunning) return;

    if (activeTab.language === 'html' || activeTab.language === 'css') {
      setOutputTab('preview');
      setIsCollapsed(false);
      showToast('Preview refreshed.', 'success');
      return;
    }

    setIsRunning(true);
    setIsCollapsed(false);

    try {
      const result = await api.executeCode({
        language: activeTab.language,
        code: activeTab.code,
        stdin: activeTab.stdin || ''
      });

      setExecutionResult(result);

      if (result.success) {
        setOutputTab('output');
        showToast(`Executed successfully in ${result.executionTime}ms`, 'success');
      } else {
        if (result.explanation || result.status === 'COMPILATION_ERROR' || result.status === 'RUNTIME_ERROR') {
          setOutputTab('errors');
        } else {
          setOutputTab('output');
        }
        showToast(result.status === 'TIME_LIMIT_EXCEEDED' ? 'Execution Timed Out' : 'Execution Error', 'error');
      }
    } catch (err) {
      setExecutionResult({
        status: 'SERVER_ERROR',
        stdout: '',
        stderr: err.message || 'Execution request failed',
        executionTime: 0,
        exitCode: 1,
        explanation: null
      });
      setOutputTab('errors');
      showToast('Execution service unreachable', 'error');
    } finally {
      setIsRunning(false);
    }
  }, [activeTab, isRunning, showToast]);

  // Clear output
  const clearOutput = useCallback(() => {
    setExecutionResult({
      status: 'IDLE',
      stdout: '',
      stderr: '',
      executionTime: null,
      exitCode: null,
      explanation: null
    });
    showToast('Output cleared.', 'info');
  }, [showToast]);

  // Download active file
  const downloadCode = useCallback(() => {
    if (!activeTab) return;
    const blob = new Blob([activeTab.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeTab.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${activeTab.title}`, 'success');
  }, [activeTab, showToast]);

  return (
    <PlaygroundContext.Provider
      value={{
        tabs,
        activeTab,
        activeTabId,
        setActiveTabId,
        addTab,
        createCustomFile,
        renameTab,
        closeTab,
        updateActiveCode,
        updateActiveStdin,
        changeLanguage,
        resetCode,
        resetToDefaultTemplate,
        insertBoilerplateIfEmpty,
        loadProgramIntoEditor,
        // Layout system
        layoutMode,
        setLayoutMode,
        splitRatio,
        setSplitRatio,
        resetLayout,
        // Question Workspace
        activeQuestion,
        isQuestionPanelOpen,
        setIsQuestionPanelOpen,
        openQuestionWorkspace,
        closeQuestionWorkspace,
        resetToStarterCode,
        // Output panel
        outputTab,
        setOutputTab,
        panelHeight,
        setPanelHeight,
        isCollapsed,
        setIsCollapsed,
        // Execution
        isRunning,
        executionResult,
        runCode,
        clearOutput,
        downloadCode,
        // Settings & Toasts
        settings,
        setSettings,
        toast,
        showToast,
        syncEvent
      }}
    >
      {children}
    </PlaygroundContext.Provider>
  );
}

export const usePlayground = () => useContext(PlaygroundContext);
