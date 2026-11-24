import React, { useState } from 'react';
import { usePlayground } from '../context/PlaygroundContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { X, Share2, Copy, Check, Globe, Link, Sparkles } from 'lucide-react';

export default function ShareModal({ isOpen, onClose }) {
  const { activeTab, showToast } = usePlayground();
  const { isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateShare = async () => {
    setLoading(true);
    try {
      // First save program or generate guest share
      const title = activeTab?.title || 'Shared Program';
      let url = window.location.origin;

      if (isAuthenticated) {
        // Save and get share ID
        const res = await api.createProgram({
          title,
          language: activeTab.language,
          code: activeTab.code,
          stdin: activeTab.stdin || '',
          tags: ['shared']
        });
        const shareRes = await api.shareProgram(res.program.id);
        url = `${window.location.origin}?shared=${shareRes.shareId}`;
      } else {
        // Encode state in base64 URL parameter for instant guest sharing
        const payload = JSON.stringify({
          title: activeTab.title,
          language: activeTab.language,
          code: activeTab.code,
          stdin: activeTab.stdin
        });
        const b64 = btoa(encodeURIComponent(payload));
        url = `${window.location.origin}?code=${b64}`;
      }

      setShareUrl(url);
    } catch (e) {
      showToast('Could not generate share link: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    showToast('Share link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-[#161b22] border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-gray-200">
        {/* Header */}
        <div className="h-14 border-b border-gray-800 px-6 flex items-center justify-between bg-[#1f242c]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Share Program</h2>
              <p className="text-[11px] text-gray-400">Collaborate with fellow students and instructors</p>
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
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-[#0d1117] border border-gray-800 text-xs space-y-1">
            <p className="font-semibold text-white">File: {activeTab?.title}</p>
            <p className="text-gray-400">Language: {activeTab?.language?.toUpperCase()}</p>
          </div>

          {!shareUrl ? (
            <button
              onClick={handleGenerateShare}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-900/30"
            >
              <Globe className="w-4 h-4" />
              <span>{loading ? 'Generating Link...' : 'Generate Public Share URL'}</span>
            </button>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-300">Public Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full p-2.5 rounded-lg bg-[#0d1117] border border-gray-700 text-xs text-gray-200 font-mono select-all focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="p-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white shrink-0 transition-colors"
                  title="Copy link"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-gray-400">
                Anyone with this link can view and run your code in their own sandbox.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
