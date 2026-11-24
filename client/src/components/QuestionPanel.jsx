import React, { useState } from 'react';
import { usePlayground } from '../context/PlaygroundContext';
import { api } from '../utils/api';
import confetti from 'canvas-confetti';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  RotateCcw, 
  Sparkles, 
  Loader2, 
  Trophy, 
  Check, 
  Copy 
} from 'lucide-react';

export default function QuestionPanel({ onOpenAi }) {
  const { 
    activeQuestion, 
    closeQuestionWorkspace, 
    isQuestionPanelOpen, 
    setIsQuestionPanelOpen,
    activeTab, 
    resetToStarterCode, 
    showToast 
  } = usePlayground();

  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!activeQuestion) return null;

  const handleSubmitSolution = async () => {
    if (!activeQuestion || !activeTab) return;
    setSubmitting(true);
    setSubmissionResult(null);

    try {
      const res = await api.submitProblem(activeQuestion.id, {
        code: activeTab.code,
        language: activeTab.language
      });

      setSubmissionResult(res);

      if (res.allPassed) {
        showToast('🎉 All test cases passed! Solution Accepted!', 'success');
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        showToast(`Evaluation: ${res.passedCount}/${res.totalCount} test cases passed.`, 'error');
      }
    } catch (err) {
      showToast('Submission failed: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const isEasy = activeQuestion.difficulty === 'Easy' || activeQuestion.difficulty === 'Beginner';
  const isMedium = activeQuestion.difficulty === 'Medium' || activeQuestion.difficulty === 'Intermediate';
  const diffClass = isEasy
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    : isMedium
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    : 'bg-rose-500/20 text-rose-300 border-rose-500/40';

  if (!isQuestionPanelOpen) {
    return (
      <div className="w-10 bg-[#161b22] border-r border-gray-800 flex flex-col items-center py-3 select-none shrink-0 transition-all z-20">
        <button
          onClick={() => setIsQuestionPanelOpen(true)}
          className="p-2 rounded-lg text-sky-400 hover:text-white hover:bg-sky-500/20 transition-colors"
          title="Expand Question Panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div 
          onClick={() => setIsQuestionPanelOpen(true)}
          className="mt-6 [writing-mode:vertical-rl] text-xs font-semibold text-gray-400 hover:text-sky-400 cursor-pointer flex items-center gap-2 tracking-wider"
        >
          <BookOpen className="w-3.5 h-3.5 rotate-90 text-amber-400" />
          <span>{activeQuestion.title}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 md:w-96 bg-[#161b22] border-r border-gray-800 flex flex-col h-full overflow-hidden select-none shrink-0 z-20 transition-all">
      {/* Header */}
      <div className="h-10 px-3 bg-[#1f242c] border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs font-bold text-white truncate">{activeQuestion.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsQuestionPanelOpen(false)}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Collapse Question Panel"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={closeQuestionWorkspace}
            className="p-1 rounded text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Exit Question Workspace"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content scroll area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 select-text">
        {/* Badges */}
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${diffClass}`}>
            {activeQuestion.difficulty}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-sky-500/15 text-sky-300 border border-sky-500/30">
            {activeQuestion.topic}
          </span>
        </div>

        {/* Problem Description */}
        <div className="space-y-1.5">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Problem Statement</h4>
          <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap font-sans">
            {activeQuestion.description}
          </p>
        </div>

        {/* Input & Output Format */}
        {activeQuestion.input_format && (
          <div className="space-y-1 bg-[#0d1117] p-2.5 rounded-lg border border-gray-800">
            <h5 className="text-[10px] font-bold text-gray-400 uppercase">Input Format</h5>
            <p className="text-xs text-gray-300 leading-relaxed font-sans">{activeQuestion.input_format}</p>
          </div>
        )}

        {activeQuestion.output_format && (
          <div className="space-y-1 bg-[#0d1117] p-2.5 rounded-lg border border-gray-800">
            <h5 className="text-[10px] font-bold text-gray-400 uppercase">Output Format</h5>
            <p className="text-xs text-gray-300 leading-relaxed font-sans">{activeQuestion.output_format}</p>
          </div>
        )}

        {/* Constraints */}
        {activeQuestion.constraints && (
          <div className="p-2.5 rounded-lg bg-[#0d1117] border border-gray-800 text-xs">
            <span className="font-bold text-gray-400 text-[10px] uppercase block mb-0.5">Constraints:</span>
            <code className="text-amber-300 font-mono text-[11px]">{activeQuestion.constraints}</code>
          </div>
        )}

        {/* Sample Test Cases */}
        {activeQuestion.sample_test_cases?.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Sample Cases</h4>
            {activeQuestion.sample_test_cases.map((stc, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-[#0d1117] border border-gray-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-sky-400">Sample #{idx + 1}</span>
                  <button
                    onClick={() => copyToClipboard(stc.input, idx)}
                    className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white"
                    title="Copy sample input to clipboard"
                  >
                    {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIdx === idx ? 'Copied' : 'Copy Input'}</span>
                  </button>
                </div>
                <div>
                  <span className="text-[9px] font-semibold text-gray-500 block mb-0.5">INPUT:</span>
                  <pre className="p-1.5 rounded bg-[#161b22] font-mono text-[11px] text-gray-300 overflow-x-auto whitespace-pre-wrap">{stc.input}</pre>
                </div>
                <div>
                  <span className="text-[9px] font-semibold text-gray-500 block mb-0.5">EXPECTED OUTPUT:</span>
                  <pre className="p-1.5 rounded bg-[#161b22] font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-pre-wrap">{stc.expected_output}</pre>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-2 space-y-2 select-none">
          <button
            onClick={handleSubmitSolution}
            disabled={submitting}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md active:scale-95 ${
              submitting
                ? 'bg-emerald-600/60 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Evaluating Test Cases...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Submit Solution & Run Tests</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={resetToStarterCode}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white bg-[#21262d] hover:bg-[#30363d] border border-gray-700 transition-colors"
              title="Reset code to question template"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
              <span>Reset Starter</span>
            </button>

            {onOpenAi && (
              <button
                onClick={onOpenAi}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-sm"
                title="Ask AI Mentor for hints or explanation"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Ask AI</span>
              </button>
            )}
          </div>
        </div>

        {/* Submission Evaluation Results */}
        {submissionResult && (
          <div className="p-3 rounded-xl border bg-[#0d1117] border-gray-700 space-y-3 animate-in fade-in select-text">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {submissionResult.allPassed ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    ACCEPTED (All {submissionResult.totalCount} Passed)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                    <AlertCircle className="w-4 h-4" />
                    {submissionResult.status} ({submissionResult.passedCount}/{submissionResult.totalCount})
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {submissionResult.results?.map((res, i) => (
                <div
                  key={i}
                  className={`p-2 rounded text-[11px] font-mono border ${
                    res.passed
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>Case #{res.testCaseIndex}</span>
                    <span>{res.passed ? 'PASSED ✓' : 'FAILED ✗'}</span>
                  </div>
                  {res.isSample && !res.passed && (
                    <div className="mt-1 text-[10px] space-y-0.5 text-gray-300">
                      <div>Expected: <span className="text-emerald-400">{res.expectedOutput}</span></div>
                      <div>Actual: <span className="text-rose-400">{res.actualOutput || 'Empty'}</span></div>
                    </div>
                  )}
                  {res.error && (
                    <div className="mt-1 text-[10px] text-rose-400 bg-rose-950/40 p-1.5 rounded">
                      {res.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
