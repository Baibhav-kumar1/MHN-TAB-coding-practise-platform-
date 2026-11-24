import React, { useState, useEffect } from 'react';
import { usePlayground } from '../context/PlaygroundContext';
import { api } from '../utils/api';
import { getLanguageConfig } from '../utils/languages';
import { 
  X, 
  History, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Loader2,
  Code2
} from 'lucide-react';

export default function HistoryModal({ isOpen, onClose }) {
  const { loadProgramIntoEditor, showToast } = usePlayground();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.getHistory()
      .then(res => {
        setHistory(res.history || []);
      })
      .catch(() => {
        showToast('Failed to fetch execution history', 'error');
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleLoadCode = (item) => {
    const config = getLanguageConfig(item.language);
    loadProgramIntoEditor({
      title: `history_${item.language}`,
      language: item.language,
      code: item.code,
      stdin: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl h-[75vh] bg-[#161b22] border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-gray-200">
        {/* Header */}
        <div className="h-14 border-b border-gray-800 px-6 flex items-center justify-between bg-[#1f242c]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Execution History</h2>
              <p className="text-[11px] text-gray-400">Log of recent code runs and performance benchmarks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 text-xs">
              <Loader2 className="w-6 h-6 animate-spin mb-2 text-emerald-400" />
              Loading run history...
            </div>
          ) : history.length === 0 ? (
            <div className="py-16 text-center text-gray-500 text-xs">
              No executions recorded yet. Run any program in the editor!
            </div>
          ) : (
            history.map((item) => {
              const config = getLanguageConfig(item.language);
              const isSuccess = item.status === 'SUCCESS';

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-gray-800 bg-[#0d1117] hover:bg-[#12161f] transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-gray-800/80">
                      {isSuccess ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span 
                          className="px-2 py-0.2 rounded text-[10px] font-semibold"
                          style={{ backgroundColor: `${config.color}20`, color: config.color }}
                        >
                          {config.name}
                        </span>
                        <span className="text-xs font-medium text-gray-200">
                          {item.status.replace(/_/g, ' ')}
                        </span>
                        {item.execution_time && (
                          <span className="text-[11px] text-gray-500">
                            ({item.execution_time}ms)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleTimeString()} · {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleLoadCode(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-sky-400 hover:text-white bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 shrink-0 transition-colors"
                  >
                    <span>Load Code</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
