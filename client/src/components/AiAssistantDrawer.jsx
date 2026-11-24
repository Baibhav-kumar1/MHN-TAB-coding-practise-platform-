import React, { useState, useEffect, useRef } from 'react';
import { usePlayground } from '../context/PlaygroundContext';
import { api } from '../utils/api';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Copy, 
  Check, 
  ArrowRight, 
  RefreshCw, 
  History, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Code2, 
  Wand2, 
  Trash2,
  HelpCircle
} from 'lucide-react';

export default function AiAssistantDrawer({ isOpen, onClose, initialPrompt = '' }) {
  const { 
    activeTab, 
    executionResult, 
    updateActiveCode, 
    showToast 
  } = usePlayground();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      message: `Baibhav have assigned me for your help plz go ahead`,
      suggestedCode: null
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeEngine, setActiveEngine] = useState('Pedagogical Mentor');
  const [conversationId, setConversationId] = useState(null);
  const [conversationsList, setConversationsList] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  // Apply code confirmation modal state
  const [pendingApplyCode, setPendingApplyCode] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load previous conversations list
  const loadConversations = async () => {
    try {
      const res = await api.getAiConversations();
      setConversationsList(res.conversations || []);
    } catch (e) {}
  };

  useEffect(() => {
    if (isOpen) {
      loadConversations();
      if (initialPrompt && messages.length <= 1) {
        handleSendMessage(initialPrompt);
      }
    }
  }, [isOpen, initialPrompt]);

  // Select a past conversation
  const handleSelectConversation = async (conv) => {
    try {
      setLoading(true);
      const res = await api.getAiConversation(conv.id);
      setConversationId(conv.id);
      setMessages(res.messages || []);
      setShowHistory(false);
      showToast(`Loaded conversation: "${conv.title}"`, 'info');
    } catch (e) {
      showToast('Failed to load conversation', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Start new conversation
  const handleNewConversation = () => {
    setConversationId(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        message: `Baibhav have assigned me for your help plz go ahead`,
        suggestedCode: null
      }
    ]);
    setShowHistory(false);
  };

  // Delete conversation
  const handleDeleteConversation = async (id, e) => {
    e.stopPropagation();
    try {
      await api.deleteAiConversation(id);
      setConversationsList(prev => prev.filter(c => c.id !== id));
      if (conversationId === id) {
        handleNewConversation();
      }
      showToast('Conversation removed', 'info');
    } catch (e) {
      showToast('Failed to delete conversation', 'error');
    }
  };

  // Send message to AI
  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      message: text,
      suggestedCode: null
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const payload = {
        conversationId,
        message: text,
        code: activeTab?.code || '',
        language: activeTab?.language || 'python',
        error: executionResult?.stderr || '',
        stdout: executionResult?.stdout || ''
      };

      const res = await api.aiChat(payload);

      if (res.conversationId && !conversationId) {
        setConversationId(res.conversationId);
        loadConversations();
      }

      if (res.engine) {
        setActiveEngine(res.engine === 'gemini' ? (res.model || 'Gemini 2.0') : 'Pedagogical Mentor');
      }

      const assistantMsg = {
        id: res.messageId || `asst-${Date.now()}`,
        sender: 'assistant',
        message: res.reply,
        suggestedCode: res.suggestedCode
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          message: `⚠️ I encountered an issue connecting to the mentor service: ${err.message}.`,
          isError: true,
          failedPrompt: text,
          suggestedCode: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Apply suggested code to editor
  const handleConfirmApply = () => {
    if (!pendingApplyCode) return;
    updateActiveCode(pendingApplyCode);
    showToast('✨ Applied AI-suggested code to editor!', 'success');
    setPendingApplyCode(null);
  };

  // Copy code snippet
  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    showToast('Code copied to clipboard', 'info');
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  if (!isOpen) return null;

  const hasRuntimeError = !!executionResult?.stderr;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] bg-[#161b22] border-l border-gray-800 shadow-2xl flex flex-col overflow-hidden text-gray-200 animate-in slide-in-from-right duration-200 select-text">
      {/* 1. Header */}
      <div className="h-14 border-b border-gray-800 px-4 flex items-center justify-between bg-[#1f242c] select-none">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-sky-900/30">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">AI Coding Mentor</h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {activeEngine}
              </span>
            </div>
            <p className="text-[10px] text-gray-400">Contextual pedagogical assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-1.5 rounded-lg transition-colors ${
              showHistory ? 'bg-sky-500/20 text-sky-400' : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title="Conversation History"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={handleNewConversation}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Start New Conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Workspace Context Badge */}
      <div className="px-4 py-2 border-b border-gray-800/80 bg-[#12161c] flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold text-gray-300">File: {activeTab?.title}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-400 uppercase font-mono">
            {activeTab?.language}
          </span>
        </div>

        {hasRuntimeError ? (
          <span className="flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            <AlertCircle className="w-3 h-3" /> Error Detected
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Ready
          </span>
        )}
      </div>

      {/* 3. History Drawer Overlay */}
      {showHistory && (
        <div className="p-3 border-b border-gray-800 bg-[#12161c] max-h-56 overflow-y-auto space-y-1 select-none">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Previous Conversations</p>
          {conversationsList.length === 0 ? (
            <p className="text-xs text-gray-500 py-3 text-center">No past conversations yet.</p>
          ) : (
            conversationsList.map(c => (
              <div
                key={c.id}
                onClick={() => handleSelectConversation(c)}
                className={`p-2.5 rounded-lg flex items-center justify-between text-xs cursor-pointer border transition-colors ${
                  conversationId === c.id 
                    ? 'bg-sky-500/15 border-sky-500/40 text-sky-300' 
                    : 'bg-[#161b22] border-gray-800 text-gray-300 hover:bg-gray-800'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <p className="font-medium truncate">{c.title}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{new Date(c.updated_at).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(c.id, e)}
                  className="p-1 rounded text-gray-500 hover:text-rose-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0d1117]/80">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs shadow-sm ${
                isUser ? 'bg-sky-600 text-white' : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Body */}
              <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2.5 shadow-sm ${
                isUser 
                  ? 'bg-sky-600 text-white rounded-tr-none' 
                  : 'bg-[#161b22] border border-gray-800 text-gray-200 rounded-tl-none'
              }`}>
                <div className="whitespace-pre-wrap font-sans">
                  {m.message}
                </div>

                {m.isError && m.failedPrompt && (
                  <div className="pt-1">
                    <button
                      onClick={() => handleSendMessage(m.failedPrompt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/35 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Request</span>
                    </button>
                  </div>
                )}

                {/* Suggested Code Snippet with 1-Click Apply */}
                {m.suggestedCode && (
                  <div className="mt-2 rounded-xl bg-[#0d1117] border border-sky-500/30 overflow-hidden font-mono text-[11px]">
                    <div className="px-3 py-1.5 bg-[#12161c] border-b border-gray-800 flex items-center justify-between text-gray-400">
                      <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
                        <Wand2 className="w-3 h-3" />
                        Suggested Code Fix
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyCode(m.suggestedCode, m.id)}
                          className="hover:text-white transition-colors"
                          title="Copy Code"
                        >
                          {copiedCodeId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <pre className="p-3 text-emerald-300 overflow-x-auto max-h-60 whitespace-pre-wrap leading-relaxed">
                      {m.suggestedCode}
                    </pre>

                    {/* Apply Button */}
                    <div className="p-2 bg-[#12161c] border-t border-gray-800/80 flex items-center justify-end">
                      <button
                        onClick={() => setPendingApplyCode(m.suggestedCode)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors shadow-sm"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>Apply to Editor</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-[#161b22] border border-gray-800 text-xs text-sky-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing code and preparing mentor guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 5. Quick Prompt Chips */}
      <div className="px-3 py-2 border-t border-gray-800 bg-[#12161c] flex items-center gap-1.5 overflow-x-auto select-none">
        {hasRuntimeError && (
          <button
            onClick={() => handleSendMessage('Please diagnose this execution error, explain why it occurred, and suggest a step-by-step fix.')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 whitespace-nowrap transition-colors"
          >
            <AlertCircle className="w-3 h-3 text-rose-400" />
            <span>Fix My Error</span>
          </button>
        )}

        <button
          onClick={() => handleSendMessage('Can you explain what this code does in simple, beginner-friendly terms with an example?')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 whitespace-nowrap transition-colors"
        >
          <span>📖 Explain Code</span>
        </button>

        <button
          onClick={() => handleSendMessage('How can I optimize this program for time and space complexity?')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 whitespace-nowrap transition-colors"
        >
          <span>⚡ Optimize Solution</span>
        </button>

        <button
          onClick={() => handleSendMessage('What edge cases or tricky test cases should I test for this problem?')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 whitespace-nowrap transition-colors"
        >
          <span>🧪 Test Cases</span>
        </button>
      </div>

      {/* 6. Input Area */}
      <div className="p-3 border-t border-gray-800 bg-[#161b22]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask your mentor (e.g. why is line 5 failing?)..."
            disabled={loading}
            className="flex-1 p-2.5 rounded-xl bg-[#0d1117] border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 transition-colors"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white transition-colors shrink-0 shadow-md shadow-sky-900/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* 7. Permission Confirmation Modal for Applying Code */}
      {pendingApplyCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
          <div className="w-full max-w-sm bg-[#161b22] border border-sky-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <Wand2 className="w-5 h-5" />
              <span>Apply AI Code to Editor?</span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              This will update the code in your active editor tab (<span className="text-white font-mono">{activeTab?.title}</span>).
              Your previous code can still be undone with <kbd className="px-1 py-0.5 rounded bg-gray-800 font-mono text-[10px]">Ctrl/Cmd + Z</kbd>.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPendingApplyCode(null)}
                className="px-3.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApply}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-900/40 transition-colors"
              >
                Yes, Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
