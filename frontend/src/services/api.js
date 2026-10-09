const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';
const REQUEST_TIMEOUT = 10000;

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function getAuthToken() {
  return localStorage.getItem('auth_token') || localStorage.getItem('citizen_token') || localStorage.getItem('supervisor_token') || localStorage.getItem('admin_token');
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(data.error || data.message || 'Request failed', response.status, data);
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError' || err.name === 'TimeoutError') {
      throw new ApiError('Unable to connect to the Worker server. Please make sure the backend is running.', 0, {});
    }
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new ApiError('Unable to connect to the Worker server. Please make sure the backend is running.', 0, {});
    }
    throw err;
  }
}

export const authApi = {
  workerLogin: (employeeId, password) =>
    request('/auth/worker/login', {
      method: 'POST',
      body: JSON.stringify({ employeeId, password }),
    }),

  workerRegister: (username, email, mobile, password, confirmPassword) =>
    request('/auth/worker/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, mobile, password, confirmPassword }),
    }),

  citizenRegister: (name, email, password, confirmPassword) =>
    request('/auth/citizen/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirmPassword }),
    }),

  citizenLogin: (email, password) =>
    request('/auth/citizen/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  supervisorLogin: (supervisorId, password) =>
    request('/auth/supervisor/login', {
      method: 'POST',
      body: JSON.stringify({ supervisorId, password }),
    }),

  adminLogin: (username, password) =>
    request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  me: () => request('/auth/me'),

  logout: () => request('/auth/logout', { method: 'POST' }),
};

export const workerApi = {
  getDashboard: () => request('/worker/dashboard'),

  getTasks: () => request('/worker/tasks'),

  getTaskHistory: (limit = 10) =>
    request(`/worker/tasks/history?limit=${limit}`),

  getMe: () => request('/worker/me'),
};

export const citizenApi = {
  getDashboard: () => request('/citizen/dashboard'),

  getReports: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/citizen/reports${query ? `?${query}` : ''}`);
  },

  getReport: (id) => request(`/citizen/reports/${id}`),

  createReport: (data) => request('/citizen/reports', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export const supervisorApi = {
  getMe: () => request('/supervisor/me'),

  getDashboard: () => request('/supervisor/dashboard'),

  getReports: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/supervisor/reports${query ? `?${query}` : ''}`);
  },

  getReport: (id) => request(`/supervisor/reports/${id}`),

  approveReport: (id) => request(`/supervisor/reports/${id}/approve`, {
    method: 'PATCH',
  }),

  rejectReport: (id, rejectionReason) => request(`/supervisor/reports/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ rejectionReason }),
  }),
};

export const adminApi = {
  getMe: () => request('/admin/me'),

  getDashboard: () => request('/admin/dashboard'),

  getSupervisors: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/supervisors${query ? `?${query}` : ''}`);
  },

  createSupervisor: (data) => request('/admin/supervisors', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export { ApiError };