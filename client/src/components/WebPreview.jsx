import React, { useState, useEffect, useRef } from 'react';
import { usePlayground } from '../context/PlaygroundContext';
import { RotateCw, ExternalLink, Smartphone, Tablet, Monitor } from 'lucide-react';

export default function WebPreview() {
  const { activeTab, tabs } = usePlayground();
  const [deviceMode, setDeviceMode] = useState('full'); // 'full' | 'tablet' | 'mobile'
  const [key, setKey] = useState(0);
  const iframeRef = useRef(null);

  // If active tab is HTML, use it; otherwise search for html/css tabs
  const htmlTab = tabs.find(t => t.language === 'html');
  const cssTab = tabs.find(t => t.language === 'css');
  const jsTab = tabs.find(t => t.language === 'javascript');

  let htmlContent = '';
  if (activeTab?.language === 'html') {
    htmlContent = activeTab.code;
  } else if (htmlTab) {
    htmlContent = htmlTab.code;
  } else {
    htmlContent = `
      <div style="font-family: sans-serif; text-align: center; padding: 40px; color: #64748b;">
        <h3>No HTML template loaded</h3>
        <p>Switch to HTML language or open an HTML tab to preview web applications.</p>
      </div>
    `;
  }

  // Inject additional CSS if active tab is CSS
  if (activeTab?.language === 'css') {
    htmlContent += `\n<style>\n${activeTab.code}\n</style>`;
  }

  const widths = {
    full: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]'
  };

  const reloadPreview = () => {
    setKey(prev => prev + 1);
  };

  const openInNewTab = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0f172a] text-gray-200">
      {/* Mini preview bar */}
      <div className="h-8 border-b border-gray-800 bg-[#161b22] px-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-gray-300">Live Sandboxed Iframe</span>
          <span className="text-[10px] text-gray-500">Auto-evaluating</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`p-1 rounded hover:bg-white/10 ${deviceMode === 'mobile' ? 'text-sky-400 bg-white/10' : 'text-gray-400'}`}
            title="Mobile View (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            className={`p-1 rounded hover:bg-white/10 ${deviceMode === 'tablet' ? 'text-sky-400 bg-white/10' : 'text-gray-400'}`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceMode('full')}
            className={`p-1 rounded hover:bg-white/10 ${deviceMode === 'full' ? 'text-sky-400 bg-white/10' : 'text-gray-400'}`}
            title="Responsive Full View"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-3 bg-gray-700 mx-1" />

          <button
            onClick={reloadPreview}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Reload Preview"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={openInNewTab}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Open In New Window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 bg-slate-950 flex items-center justify-center p-2 overflow-auto">
        <div className={`h-full ${widths[deviceMode]} transition-all duration-300 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-800`}>
          <iframe
            key={key}
            ref={iframeRef}
            srcDoc={htmlContent}
            title="Web Preview"
            sandbox="allow-scripts allow-modals"
            className="w-full h-full border-none bg-white"
          />
        </div>
      </div>
    </div>
  );
}
