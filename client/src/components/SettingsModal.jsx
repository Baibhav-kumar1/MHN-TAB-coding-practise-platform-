import React from 'react';
import { usePlayground } from '../context/PlaygroundContext';
import { X, Settings, Sliders, Type, Code, ShieldCheck } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const { settings, setSettings, showToast } = usePlayground();

  if (!isOpen) return null;

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-[#161b22] border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-gray-200">
        {/* Header */}
        <div className="h-14 border-b border-gray-800 px-6 flex items-center justify-between bg-[#1f242c]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Playground Preferences</h2>
              <p className="text-[11px] text-gray-400">Customize Monaco editor behavior and layout</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Font Size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-gray-300 flex items-center gap-2">
                <Type className="w-4 h-4 text-sky-400" />
                Editor Font Size ({settings.fontSize || 14}px)
              </label>
            </div>
            <input
              type="range"
              min="12"
              max="24"
              step="1"
              value={settings.fontSize || 14}
              onChange={(e) => updateSetting('fontSize', parseInt(e.target.value, 10))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>Compact (12px)</span>
              <span>Default (14px)</span>
              <span>Large (24px)</span>
            </div>
          </div>

          {/* Tab Indentation */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-800">
            <div>
              <p className="font-semibold text-gray-300">Tab Indentation Spacing</p>
              <p className="text-[11px] text-gray-500">Number of spaces per indentation level</p>
            </div>
            <select
              value={settings.tabSize || 4}
              onChange={(e) => updateSetting('tabSize', parseInt(e.target.value, 10))}
              className="p-1.5 rounded-lg bg-[#0d1117] border border-gray-700 text-gray-200"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces (standard)</option>
            </select>
          </div>

          {/* Word Wrap */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-800">
            <div>
              <p className="font-semibold text-gray-300">Word Wrap</p>
              <p className="text-[11px] text-gray-500">Wrap long lines to fit editor viewport</p>
            </div>
            <button
              onClick={() => updateSetting('wordWrap', settings.wordWrap === 'on' ? 'off' : 'on')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                settings.wordWrap === 'on' ? 'bg-sky-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {settings.wordWrap === 'on' ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Auto-closing brackets */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-800">
            <div>
              <p className="font-semibold text-gray-300">Auto-Close Brackets & Quotes</p>
              <p className="text-[11px] text-gray-500">Automatically insert matching closing pair</p>
            </div>
            <button
              onClick={() => updateSetting('autoClosingBrackets', settings.autoClosingBrackets === 'always' ? 'never' : 'always')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                settings.autoClosingBrackets === 'always' ? 'bg-sky-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {settings.autoClosingBrackets === 'always' ? 'Always' : 'Never'}
            </button>
          </div>

          {/* Automatic File Boilerplate Generation */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-800">
            <div>
              <p className="font-semibold text-gray-300">Automatic File Boilerplate</p>
              <p className="text-[11px] text-gray-500">Auto-insert starter code when creating new files</p>
            </div>
            <button
              onClick={() => updateSetting('autoBoilerplate', settings.autoBoilerplate === false ? true : false)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                settings.autoBoilerplate !== false ? 'bg-sky-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {settings.autoBoilerplate !== false ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Isolation Info */}
          <div className="p-3 rounded-xl bg-gray-800/40 border border-gray-700/60 flex items-start gap-2.5 mt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-gray-400 leading-relaxed">
              <span className="font-semibold text-gray-300">Execution Sandbox:</span> All executions run with POSIX signal timeouts (6s) and memory caps to protect against runaway processes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
