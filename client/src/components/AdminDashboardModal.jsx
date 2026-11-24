import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlayground } from '../context/PlaygroundContext';
import { api } from '../utils/api';
import { 
  X, 
  ShieldCheck, 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  Globe, 
  EyeOff, 
  Search, 
  BarChart3, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Save, 
  Code2, 
  Filter,
  Flame,
  ArrowUpDown,
  Play
} from 'lucide-react';

export default function AdminDashboardModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { showToast, syncEvent } = usePlayground();

  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'analytics' | 'users'
  const [loading, setLoading] = useState(true);

  // Questions state
  const [questions, setQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Question Edit/Create Form state
  const [editingQuestion, setEditingQuestion] = useState(null); // null when not modal, {} for new, or question obj
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'Easy',
    topic: 'Arrays',
    description: '',
    input_format: '',
    output_format: '',
    constraints: '',
    is_published: true,
    starter_templates: {
      python: '# Write solution\n',
      java: 'public class Main {\n    public static void main(String[] args) {\n    }\n}\n',
      cpp: '#include <iostream>\nint main() {\n    return 0;\n}\n',
      javascript: 'const fs = require("fs");\n'
    },
    sample_input: '',
    sample_output: '',
    hidden_input: '',
    hidden_output: ''
  });

  // Analytics & Users state
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, questionsRes, usersRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminQuestions(),
        api.getAdminUsers()
      ]);
      setAnalytics(statsRes);
      setQuestions(questionsRes.questions || []);
      setUsersList(usersRes.users || []);
    } catch (err) {
      showToast('Admin access error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAdminData();
    }
  }, [isOpen]);

  // Real-time synchronization event listener
  useEffect(() => {
    if (syncEvent) {
      if (syncEvent.type === 'question_updated') {
        api.getAdminQuestions().then(res => setQuestions(res.questions || [])).catch(() => {});
      }
    }
  }, [syncEvent]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      title: '',
      difficulty: 'Easy',
      topic: 'Arrays',
      description: '',
      input_format: '',
      output_format: '',
      constraints: '',
      is_published: true,
      starter_templates: {
        python: 'import sys\n# Read input and solve\n',
        java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n    }\n}\n',
        cpp: '#include <iostream>\n\nint main() {\n    return 0;\n}\n',
        javascript: 'const fs = require("fs");\n'
      },
      sample_input: '',
      sample_output: '',
      hidden_input: '',
      hidden_output: ''
    });
    setEditingQuestion({ isNew: true });
  };

  // Open Edit Modal
  const handleOpenEdit = (q) => {
    const sampleTc = q.test_cases?.find(tc => tc.is_sample) || q.test_cases?.[0] || { input: '', expected_output: '' };
    const hiddenTc = q.test_cases?.find(tc => !tc.is_sample) || q.test_cases?.[1] || { input: '', expected_output: '' };

    setFormData({
      title: q.title,
      difficulty: q.difficulty || 'Easy',
      topic: q.topic || 'General',
      description: q.description || '',
      input_format: q.input_format || '',
      output_format: q.output_format || '',
      constraints: q.constraints || '',
      is_published: !!q.is_published,
      starter_templates: q.starter_templates || {},
      sample_input: sampleTc.input || '',
      sample_output: sampleTc.expected_output || '',
      hidden_input: hiddenTc.input || '',
      hidden_output: hiddenTc.expected_output || ''
    });
    setEditingQuestion(q);
  };

  // Save question (Create or Update)
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      showToast('Title and Description are required', 'warning');
      return;
    }

    const testCases = [
      { input: formData.sample_input, expected_output: formData.sample_output, is_sample: true }
    ];
    if (formData.hidden_input || formData.hidden_output) {
      testCases.push({ input: formData.hidden_input, expected_output: formData.hidden_output, is_sample: false });
    }

    const payload = {
      title: formData.title,
      difficulty: formData.difficulty,
      topic: formData.topic,
      description: formData.description,
      input_format: formData.input_format,
      output_format: formData.output_format,
      constraints: formData.constraints,
      starter_templates: formData.starter_templates,
      test_cases: testCases,
      is_published: formData.is_published ? 1 : 0
    };

    try {
      if (editingQuestion.isNew) {
        await api.createAdminQuestion(payload);
        showToast('Created new question in global bank!', 'success');
      } else {
        await api.updateAdminQuestion(editingQuestion.id, payload);
        showToast('Question updated globally!', 'success');
      }
      setEditingQuestion(null);
      loadAdminData();
    } catch (err) {
      showToast('Save failed: ' + err.message, 'error');
    }
  };

  // Toggle publish
  const handleTogglePublish = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await api.togglePublishQuestion(id);
      setQuestions(prev => prev.map(q => q.id === id ? { ...q, is_published: res.is_published } : q));
      showToast(res.message, 'info');
    } catch (err) {
      showToast('Toggle failed: ' + err.message, 'error');
    }
  };

  // Delete question
  const handleDeleteQuestion = async (id, title, e) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${title}" globally?`)) return;

    try {
      await api.deleteAdminQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      showToast(`Deleted "${title}"`, 'success');
    } catch (err) {
      showToast('Delete failed: ' + err.message, 'error');
    }
  };

  // Toggle user role
  const handleToggleUserRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'student' : 'admin';
    if (!confirm(`Change role of ${targetUser.name} to ${newRole.toUpperCase()}?`)) return;

    try {
      await api.updateUserRole(targetUser.id, newRole);
      setUsersList(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
      showToast(`Updated ${targetUser.name}'s role to ${newRole}`, 'success');
    } catch (err) {
      showToast('Failed to update role: ' + err.message, 'error');
    }
  };

  if (!isOpen) return null;

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    if (searchQuery && !q.title.toLowerCase().includes(searchQuery.toLowerCase()) && !q.topic.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (difficultyFilter !== 'all' && q.difficulty.toLowerCase() !== difficultyFilter.toLowerCase()) {
      return false;
    }
    if (statusFilter === 'published' && !q.is_published) return false;
    if (statusFilter === 'draft' && q.is_published) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-6xl h-[90vh] bg-[#161b22] border border-red-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-gray-200">
        {/* Header */}
        <div className="h-16 border-b border-gray-800 px-6 flex items-center justify-between bg-[#1f242c]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 text-white shadow-lg shadow-rose-950/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Central Admin Dashboard</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  SUPERUSER ACCESS
                </span>
              </div>
              <p className="text-xs text-gray-400">Global Question Bank & Platform Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-[#12161c] p-1 rounded-xl border border-gray-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('questions')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'questions' ? 'bg-sky-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Question Bank ({questions.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'analytics' ? 'bg-sky-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analytics</span>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'users' ? 'bg-sky-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Users ({usersList.length})</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0d1117]/60">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-rose-400 mb-3" />
              <p className="text-xs font-medium">Synchronizing global question database...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: QUESTION BANK MANAGEMENT */}
              {activeTab === 'questions' && (
                <div className="space-y-4">
                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-lg">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Search questions by title or topic..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#161b22] border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <select
                        value={difficultyFilter}
                        onChange={e => setDifficultyFilter(e.target.value)}
                        className="text-xs p-2 rounded-xl bg-[#161b22] border border-gray-700 text-gray-300 focus:outline-none focus:border-rose-500"
                      >
                        <option value="all">All Difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>

                      <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="text-xs p-2 rounded-xl bg-[#161b22] border border-gray-700 text-gray-300 focus:outline-none focus:border-rose-500"
                      >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Drafts</option>
                      </select>
                    </div>

                    <button
                      onClick={handleOpenCreate}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Question</span>
                    </button>
                  </div>

                  {/* Questions Table */}
                  <div className="border border-gray-800 rounded-2xl overflow-hidden bg-[#161b22] shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#1f242c] text-gray-400 font-semibold border-b border-gray-800">
                        <tr>
                          <th className="p-3.5">Title & Topic</th>
                          <th className="p-3.5">Difficulty</th>
                          <th className="p-3.5">Global Status</th>
                          <th className="p-3.5 text-center">Attempts</th>
                          <th className="p-3.5 text-center">Solves</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/80 text-gray-300">
                        {filteredQuestions.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="py-12 text-center text-gray-500">
                              No questions match the selected filters.
                            </td>
                          </tr>
                        ) : (
                          filteredQuestions.map(q => {
                            const isEasy = q.difficulty === 'Easy' || q.difficulty === 'Beginner';
                            const isMedium = q.difficulty === 'Medium' || q.difficulty === 'Intermediate';
                            const diffColor = isEasy 
                              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                              : isMedium
                              ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                              : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

                            return (
                              <tr key={q.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-3.5">
                                  <p className="font-semibold text-white">{q.title}</p>
                                  <p className="text-[11px] text-gray-500 mt-0.5">{q.topic}</p>
                                </td>

                                <td className="p-3.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${diffColor}`}>
                                    {q.difficulty}
                                  </span>
                                </td>

                                <td className="p-3.5">
                                  <button
                                    onClick={(e) => handleTogglePublish(q.id, e)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${
                                      q.is_published
                                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                                    }`}
                                    title="Click to toggle published / draft state"
                                  >
                                    {q.is_published ? <Globe className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                    <span>{q.is_published ? 'Published' : 'Draft'}</span>
                                  </button>
                                </td>

                                <td className="p-3.5 text-center font-mono font-medium">
                                  {q.attempts_count || 0}
                                </td>

                                <td className="p-3.5 text-center font-mono text-emerald-400 font-medium">
                                  {q.solves_count || 0}
                                </td>

                                <td className="p-3.5 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => handleOpenEdit(q)}
                                      className="p-1.5 rounded-lg text-gray-400 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                                      title="Edit Question"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>

                                    <button
                                      onClick={(e) => handleDeleteQuestion(q.id, q.title, e)}
                                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                      title="Delete Question"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: PLATFORM ANALYTICS */}
              {activeTab === 'analytics' && analytics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-[#161b22] border border-gray-800">
                      <p className="text-xs text-gray-400 font-semibold">Total Registered Users</p>
                      <p className="text-2xl font-bold text-white mt-2">{analytics.stats.totalUsers}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{analytics.stats.totalStudents} students · {analytics.stats.totalAdmins} admins</p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#161b22] border border-gray-800">
                      <p className="text-xs text-gray-400 font-semibold">Total Global Questions</p>
                      <p className="text-2xl font-bold text-sky-400 mt-2">{analytics.stats.totalQuestions}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{analytics.stats.publishedQuestions} live · {analytics.stats.draftQuestions} drafts</p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#161b22] border border-gray-800">
                      <p className="text-xs text-gray-400 font-semibold">Total Submissions</p>
                      <p className="text-2xl font-bold text-amber-300 mt-2">{analytics.stats.totalSubmissions}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{analytics.stats.acceptedSubmissions} accepted runs</p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#161b22] border border-gray-800">
                      <p className="text-xs text-gray-400 font-semibold">Overall Pass Rate</p>
                      <p className="text-2xl font-bold text-emerald-400 mt-2">{analytics.stats.acceptanceRate}%</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{analytics.stats.totalPrograms} student programs saved</p>
                    </div>
                  </div>

                  {/* Top attempted challenges */}
                  <div className="p-5 rounded-2xl bg-[#161b22] border border-gray-800 space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-400" />
                      Most Attempted Coding Questions
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analytics.topProblems?.map(p => (
                        <div key={p.id} className="p-3.5 rounded-xl bg-[#0d1117] border border-gray-800 flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-xs text-white">{p.title}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{p.topic} · {p.difficulty}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-mono font-bold text-amber-300">{p.attempts || 0} attempts</p>
                            <p className="text-[10px] text-emerald-400 font-mono">{p.accepted_count || 0} solved</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: USER MANAGEMENT */}
              {activeTab === 'users' && (
                <div className="border border-gray-800 rounded-2xl overflow-hidden bg-[#161b22]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1f242c] text-gray-400 font-semibold border-b border-gray-800">
                      <tr>
                        <th className="p-3.5">User</th>
                        <th className="p-3.5">Role</th>
                        <th className="p-3.5 text-center">Programs Saved</th>
                        <th className="p-3.5 text-center">Submissions</th>
                        <th className="p-3.5">Joined Date</th>
                        <th className="p-3.5 text-right">Role Access</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/80 text-gray-300">
                      {usersList.map(u => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3.5">
                            <p className="font-semibold text-white">{u.name}</p>
                            <p className="text-[11px] text-gray-500">{u.email}</p>
                          </td>

                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.role === 'admin' 
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                                : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            }`}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>

                          <td className="p-3.5 text-center font-mono">
                            {u.programs_count || 0}
                          </td>

                          <td className="p-3.5 text-center font-mono">
                            {u.submissions_count || 0}
                          </td>

                          <td className="p-3.5 text-gray-500 text-[11px]">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>

                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleToggleUserRole(u)}
                              className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-[11px] font-medium text-gray-300 transition-colors"
                            >
                              Toggle to {u.role === 'admin' ? 'Student' : 'Admin'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* CREATE / EDIT QUESTION MODAL */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in zoom-in-95 select-text">
          <div className="w-full max-w-3xl h-[85vh] bg-[#161b22] border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-gray-200">
            {/* Header */}
            <div className="h-14 border-b border-gray-800 px-6 flex items-center justify-between bg-[#1f242c]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                {editingQuestion.isNew ? 'Add New Question to Global Bank' : `Edit Question: ${formData.title}`}
              </h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="p-1 rounded text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveQuestion} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-gray-300 mb-1">Question Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Reverse Linked List"
                    className="w-full p-2.5 rounded-lg bg-[#0d1117] border border-gray-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#0d1117] border border-gray-700 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Programming Topic</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={e => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g. Arrays, Loops, OOP, Strings"
                  className="w-full p-2.5 rounded-lg bg-[#0d1117] border border-gray-700 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Description & Problem Statement *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain what the program should compute and constraints..."
                  className="w-full p-2.5 rounded-lg bg-[#0d1117] border border-gray-700 text-white focus:outline-none focus:border-sky-500 resize-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Input Format</label>
                  <input
                    type="text"
                    value={formData.input_format}
                    onChange={e => setFormData({ ...formData, input_format: e.target.value })}
                    placeholder="e.g. Integer N followed by N numbers"
                    className="w-full p-2 rounded-lg bg-[#0d1117] border border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Output Format</label>
                  <input
                    type="text"
                    value={formData.output_format}
                    onChange={e => setFormData({ ...formData, output_format: e.target.value })}
                    placeholder="e.g. Single integer output"
                    className="w-full p-2 rounded-lg bg-[#0d1117] border border-gray-700 text-white"
                  />
                </div>
              </div>

              {/* Sample Test Case */}
              <div className="p-3.5 rounded-xl bg-[#0d1117] border border-gray-800 space-y-2">
                <p className="font-bold text-sky-400">Sample Test Case (Visible to students)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Sample Input (stdin)</label>
                    <textarea
                      rows={2}
                      value={formData.sample_input}
                      onChange={e => setFormData({ ...formData, sample_input: e.target.value })}
                      placeholder="10 20"
                      className="w-full p-2 rounded bg-[#161b22] border border-gray-700 font-mono text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Sample Expected Output</label>
                    <textarea
                      rows={2}
                      value={formData.sample_output}
                      onChange={e => setFormData({ ...formData, sample_output: e.target.value })}
                      placeholder="30"
                      className="w-full p-2 rounded bg-[#161b22] border border-gray-700 font-mono text-xs text-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* Hidden Evaluation Test Case */}
              <div className="p-3.5 rounded-xl bg-[#0d1117] border border-gray-800 space-y-2">
                <p className="font-bold text-amber-400">Hidden Evaluation Test Case (Used for automated grading)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Hidden Input (stdin)</label>
                    <textarea
                      rows={2}
                      value={formData.hidden_input}
                      onChange={e => setFormData({ ...formData, hidden_input: e.target.value })}
                      placeholder="100 250"
                      className="w-full p-2 rounded bg-[#161b22] border border-gray-700 font-mono text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Hidden Expected Output</label>
                    <textarea
                      rows={2}
                      value={formData.hidden_output}
                      onChange={e => setFormData({ ...formData, hidden_output: e.target.value })}
                      placeholder="350"
                      className="w-full p-2 rounded bg-[#161b22] border border-gray-700 font-mono text-xs text-emerald-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pubCheck"
                  checked={formData.is_published}
                  onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
                  className="rounded text-sky-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="pubCheck" className="font-semibold text-gray-200 cursor-pointer">
                  Publish immediately (makes question globally visible to all students)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingQuestion.isNew ? 'Create Question' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
