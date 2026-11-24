import React, { useState, useEffect } from 'react';
import { usePlayground } from '../context/PlaygroundContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import confetti from 'canvas-confetti';
import { 
  X, 
  BookOpen, 
  CheckCircle2, 
  Play, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  HelpCircle, 
  Filter, 
  ChevronRight,
  Code2,
  Loader2,
  Trophy,
  Plus,
  ShieldCheck
} from 'lucide-react';

export default function PracticeModal({ isOpen, onClose, onOpenAdmin }) {
  const { loadProgramIntoEditor, openQuestionWorkspace, showToast, activeTab, syncEvent } = usePlayground();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterTopic, setFilterTopic] = useState('all');

  // Test case evaluation state
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Fetch problems
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.getProblems()
      .then(res => {
        setProblems(res.problems || []);
        if (res.problems?.length > 0 && !selectedProblem) {
          // fetch first problem details
          fetchProblemDetails(res.problems[0].id);
        }
      })
      .catch(err => {
        showToast('Failed to load practice problems', 'error');
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  // Live Centralized Synchronization for Question Bank
  useEffect(() => {
    if (syncEvent && syncEvent.type === 'question_updated') {
      api.getProblems()
        .then(res => {
          setProblems(res.problems || []);
          showToast('Question Bank updated in real-time!', 'info');
        })
        .catch(() => {});
    }
  }, [syncEvent]);

  const fetchProblemDetails = async (id) => {
    try {
      const res = await api.getProblem(id);
      setSelectedProblem(res.problem);
      setSubmissionResult(null);
    } catch (e) {
      showToast('Failed to fetch problem details', 'error');
    }
  };

  const handleSolveInPlayground = () => {
    if (!selectedProblem) return;
    openQuestionWorkspace(selectedProblem);
    onClose();
  };

  const handleSubmitSolution = async () => {
    if (!selectedProblem || !activeTab) return;
    setSubmitting(true);
    setSubmissionResult(null);

    try {
      const res = await api.submitProblem(selectedProblem.id, {
        code: activeTab.code,
        language: activeTab.language
      });

      setSubmissionResult(res);

      if (res.allPassed) {
        showToast('🎉 All test cases passed! Great job!', 'success');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        showToast(`Test failed: ${res.passedCount}/${res.totalCount} test cases passed.`, 'error');
      }
    } catch (err) {
      showToast('Submission failed: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Filter problems
  const filteredProblems = problems.filter(p => {
    if (filterDifficulty !== 'all') {
      const pDiff = (p.difficulty || '').toLowerCase();
      const fDiff = filterDifficulty.toLowerCase();
      const match = (fDiff === 'easy' && (pDiff === 'easy' || pDiff === 'beginner')) ||
                    (fDiff === 'medium' && (pDiff === 'medium' || pDiff === 'intermediate')) ||
                    (fDiff === 'hard' && (pDiff === 'hard' || pDiff === 'advanced')) ||
                    pDiff === fDiff;
      if (!match) return false;
    }
    if (filterTopic !== 'all' && p.topic.toLowerCase() !== filterTopic.toLowerCase()) return false;
    return true;
  });

  const topics = [
    'all',
    'Variables and Data Types',
    'Conditional Statements',
    'Loops',
    'Arrays',
    'Strings',
    'Functions',
    'Object-Oriented Programming',
    'Data Structures'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-6xl h-[88vh] bg-[#161b22] border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-gray-200">
        {/* Header */}
        <div className="h-14 border-b border-gray-800 px-6 flex items-center justify-between bg-[#1f242c]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Global Question Bank
                <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 font-medium">
                  {problems.length} Synchronized Questions
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">Centrally published coding challenges with automated evaluation</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isAdmin && (
              <button
                onClick={() => {
                  onClose();
                  if (onOpenAdmin) onOpenAdmin();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-950/40 transition-all"
                title="Open Admin Question Editor"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Question</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Problem List & Filters */}
          <div className="w-80 border-r border-gray-800 flex flex-col bg-[#12161c]">
            {/* Filter Bar */}
            <div className="p-3 border-b border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="font-semibold text-gray-300">Difficulty:</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-[11px]">
                {['all', 'Easy', 'Medium', 'Hard'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setFilterDifficulty(diff)}
                    className={`py-1 rounded text-center font-medium capitalize transition-colors ${
                      filterDifficulty.toLowerCase() === diff.toLowerCase()
                        ? 'bg-sky-600 text-white font-semibold'
                        : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              {/* Topic Select */}
              <div className="pt-1">
                <select
                  value={filterTopic}
                  onChange={(e) => setFilterTopic(e.target.value)}
                  className="w-full text-xs p-1.5 rounded bg-gray-800 border border-gray-700 text-gray-300 focus:outline-none focus:border-sky-500"
                >
                  <option value="all">All Topics</option>
                  {topics.filter(t => t !== 'all').map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mb-2" />
                  Loading questions...
                </div>
              ) : filteredProblems.length === 0 ? (
                <p className="text-center py-8 text-xs text-gray-500">No matching questions found.</p>
              ) : (
                filteredProblems.map(prob => {
                  const isSelected = selectedProblem?.id === prob.id;
                  const isEasy = prob.difficulty === 'Easy' || prob.difficulty === 'Beginner';
                  const isMedium = prob.difficulty === 'Medium' || prob.difficulty === 'Intermediate';
                  const diffColor = isEasy 
                    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                    : isMedium
                    ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                    : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

                  return (
                    <div
                      key={prob.id}
                      onClick={() => fetchProblemDetails(prob.id)}
                      className={`p-3 rounded-xl cursor-pointer border transition-all text-left ${
                        isSelected 
                          ? 'bg-[#1f242c] border-sky-500 shadow-md' 
                          : 'bg-[#161b22]/70 hover:bg-[#1a2029] border-gray-800/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-gray-200 line-clamp-1">{prob.title}</p>
                        {prob.isSolved ? (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                          </span>
                        ) : prob.isAttempted ? (
                          <span className="text-[10px] text-amber-400 font-semibold shrink-0">
                            Attempted
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${diffColor}`}>
                          {isEasy ? 'Easy' : isMedium ? 'Medium' : 'Hard'}
                        </span>
                        <span className="text-[10px] text-gray-400 truncate">
                          {prob.topic}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Problem Description & Submission Tester */}
          <div className="flex-1 flex flex-col bg-[#0d1117] overflow-y-auto p-6">
            {selectedProblem ? (
              <div className="space-y-6 max-w-4xl">
                {/* Title and metadata */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {selectedProblem.topic}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-300">
                      {selectedProblem.difficulty}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-white">{selectedProblem.title}</h1>
                </div>

                {/* Problem Statement */}
                <div className="p-4 rounded-xl bg-[#161b22] border border-gray-800 space-y-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Problem Description</h3>
                  <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{selectedProblem.description}</p>
                </div>

                {/* Input & Output Specifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#161b22] border border-gray-800 space-y-2">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Input Format</h4>
                    <p className="text-xs text-gray-300 leading-relaxed">{selectedProblem.input_format}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#161b22] border border-gray-800 space-y-2">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Output Format</h4>
                    <p className="text-xs text-gray-300 leading-relaxed">{selectedProblem.output_format}</p>
                  </div>
                </div>

                {/* Constraints */}
                {selectedProblem.constraints && (
                  <div className="p-3 rounded-xl bg-[#161b22] border border-gray-800 text-xs">
                    <span className="font-semibold text-gray-400">Constraints: </span>
                    <span className="text-amber-300 font-mono">{selectedProblem.constraints}</span>
                  </div>
                )}

                {/* Sample Test Cases */}
                {selectedProblem.sample_test_cases?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sample Test Cases</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedProblem.sample_test_cases.map((stc, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-[#161b22] border border-gray-800 space-y-2">
                          <p className="text-xs font-bold text-sky-400">Sample {idx + 1}</p>
                          <div>
                            <p className="text-[10px] text-gray-500 font-semibold">INPUT:</p>
                            <pre className="p-2 rounded bg-[#0d1117] font-mono text-xs text-gray-300 overflow-x-auto">{stc.input}</pre>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 font-semibold">EXPECTED OUTPUT:</p>
                            <pre className="p-2 rounded bg-[#0d1117] font-mono text-xs text-emerald-400 overflow-x-auto">{stc.expected_output}</pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleSolveInPlayground}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-sky-900/30"
                  >
                    <Code2 className="w-4 h-4" />
                    <span>Load Starter Template into Editor</span>
                  </button>

                  <button
                    onClick={handleSubmitSolution}
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-emerald-900/30"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Evaluating Test Cases...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>Submit Current Code & Test</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Submission Results Display */}
                {submissionResult && (
                  <div className="p-4 rounded-xl border bg-[#161b22] border-gray-700 space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {submissionResult.allPassed ? (
                          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                            <Trophy className="w-5 h-5 text-amber-400" />
                            ACCEPTED - ALL TEST CASES PASSED!
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                            <AlertCircle className="w-5 h-5" />
                            {submissionResult.status} ({submissionResult.passedCount}/{submissionResult.totalCount} passed)
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Test Case Breakdown */}
                    <div className="space-y-2">
                      {submissionResult.results?.map((res, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-lg border text-xs font-mono flex flex-col gap-2 ${
                            res.passed
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                              : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold">Test Case #{res.testCaseIndex}</span>
                            <span className="font-semibold">{res.passed ? 'PASSED ✓' : 'FAILED ✗'}</span>
                          </div>
                          {res.isSample && (
                            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mt-1 text-gray-300">
                              <div>Expected: <span className="text-emerald-400">{res.expectedOutput}</span></div>
                              <div>Actual: <span className={res.passed ? 'text-emerald-400' : 'text-rose-400'}>{res.actualOutput || 'Empty'}</span></div>
                            </div>
                          )}
                          {res.error && (
                            <div className="text-[11px] text-rose-400 bg-rose-950/40 p-2 rounded">
                              {res.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                Select a problem from the left sidebar to view details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
