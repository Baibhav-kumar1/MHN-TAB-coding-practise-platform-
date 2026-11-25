// Resolve API base URL based on runtime environment, bindings, and browser context
const getApiBase = () => {
  // If running in Node/SSR environment with Vercel service binding SERVER_URL
  if (typeof process !== 'undefined' && process.env && process.env.SERVER_URL) {
    const base = process.env.SERVER_URL.replace(/\/+$/, '');
    return `${base}/api`;
  }

  // If injected via Vite build-time environment variable
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env.VITE_SERVER_URL) {
      const base = import.meta.env.VITE_SERVER_URL.replace(/\/+$/, '');
      return `${base}/api`;
    }
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
    }
  }

  // If running in local browser development directly against Vite dev server on port 3000
  if (typeof window !== 'undefined' && window.location.port === '3000') {
    return 'http://localhost:5001/api';
  }

  // Default: In production or when deployed behind Vercel rewrites, use public relative path
  return '/api';
};

export const API_BASE = getApiBase();

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
