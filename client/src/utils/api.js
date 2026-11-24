export const API_BASE = (typeof window !== 'undefined' && window.location.port === '3000')
  ? 'http://localhost:5001/api'
  : '/api';

function getAuthHeader() {
  const token = localStorage.getItem('ojt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  
  const headers = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...getAuthHeader(),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.stderr || 'Network request failed');
  }

  return data;
}

export const api = {
  // Execution
  executeCode: (payload) => request('/execute', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getHistory: () => request('/execute/history'),

  // Auth
  register: (payload) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  login: (payload) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getMe: () => request('/auth/me'),

  // Programs
  getPrograms: (params = '') => request(`/programs${params ? `?${params}` : ''}`),
  getProgram: (id) => request(`/programs/${id}`),
  createProgram: (payload) => request('/programs', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateProgram: (id, payload) => request(`/programs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  deleteProgram: (id) => request(`/programs/${id}`, {
    method: 'DELETE'
  }),
  shareProgram: (id) => request(`/programs/${id}/share`, {
    method: 'POST'
  }),
  getSharedProgram: (shareId) => request(`/programs/shared/${shareId}`),

  // Practice Problems
  getProblems: (params = '') => request(`/practice${params ? `?${params}` : ''}`),
  getProblem: (id) => request(`/practice/${id}`),
  submitProblem: (id, payload) => request(`/practice/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // AI Assistant
  aiChat: (payload) => request('/ai/chat', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getAiConversations: () => request('/ai/conversations'),
  getAiConversation: (id) => request(`/ai/conversations/${id}`),
  deleteAiConversation: (id) => request(`/ai/conversations/${id}`, {
    method: 'DELETE'
  }),

  // Student Dashboard
  getStudentDashboard: () => request('/student/dashboard'),

  // Admin Dashboard
  getAdminStats: () => request('/admin/stats'),
  getAdminQuestions: () => request('/admin/questions'),
  createAdminQuestion: (payload) => request('/admin/questions', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateAdminQuestion: (id, payload) => request(`/admin/questions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  togglePublishQuestion: (id) => request(`/admin/questions/${id}/publish`, {
    method: 'PATCH'
  }),
  deleteAdminQuestion: (id) => request(`/admin/questions/${id}`, {
    method: 'DELETE'
  }),
  getAdminUsers: () => request('/admin/users'),
  updateUserRole: (id, role) => request(`/admin/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role })
  })
};
