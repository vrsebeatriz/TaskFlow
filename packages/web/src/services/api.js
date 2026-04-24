// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

// Interceptor para injetar o token JWT em cada requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@TaskFlow:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para lidar com token expirado (401/403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('@TaskFlow:token');
      localStorage.removeItem('@TaskFlow:user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Service de Tarefas
export const tasksService = {
  getAllTasks: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  updateTask: async (taskId, updates) => {
    const response = await api.put(`/tasks/${taskId}`, updates);
    return response.data;
  },

  completeTask: async (taskId) => {
    const response = await api.put(`/tasks/${taskId}/complete`);
    return response.data;
  },

  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  }
};

// Service de Autenticação
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }
};

export const habitsService = {
  getAll: async () => { const r = await api.get('/habits'); return r.data; },
  create: async (data) => { const r = await api.post('/habits', data); return r.data; },
  delete: async (id) => { const r = await api.delete(`/habits/${id}`); return r.data; },
  getLogs: async () => { const r = await api.get('/habitLogs'); return r.data; },
  logHabit: async (data) => { const r = await api.post('/habitLogs', data); return r.data; }
};

export const workoutsService = {
  getAll: async () => { const r = await api.get('/workouts'); return r.data; },
  create: async (data) => { const r = await api.post('/workouts', data); return r.data; },
  update: async (id, data) => { const r = await api.put(`/workouts/${id}`, data); return r.data; },
  delete: async (id) => { const r = await api.delete(`/workouts/${id}`); return r.data; }
};

export const goalsService = {
  getAll: async () => { const r = await api.get('/goals'); return r.data; },
  create: async (data) => { const r = await api.post('/goals', data); return r.data; },
  update: async (id, data) => { const r = await api.put(`/goals/${id}`, data); return r.data; },
  delete: async (id) => { const r = await api.delete(`/goals/${id}`); return r.data; }
};

export const financesService = {
  getTransactions: async () => { const r = await api.get('/transactions'); return r.data; },
  createTransaction: async (data) => { const r = await api.post('/transactions', data); return r.data; },
  deleteTransaction: async (id) => { const r = await api.delete(`/transactions/${id}`); return r.data; },
  analyze: async (data) => { const r = await api.post('/finances/analyze', data); return r.data; }
};

export const dietService = {
  getAll: async () => { const r = await api.get('/meals'); return r.data; },
  create: async (data) => { const r = await api.post('/meals', data); return r.data; },
  delete: async (id) => { const r = await api.delete(`/meals/${id}`); return r.data; }
};

// Exportação padrão para garantir compatibilidade com o App.tsx
export default api;