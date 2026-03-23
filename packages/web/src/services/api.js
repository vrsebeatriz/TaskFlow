// src/services/api.js

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const API_OFFLINE_MESSAGE = 'API offline. Inicie `npm run dev:api` para carregar as tasks.';

const getStoredUser = () => {
  const savedUser = localStorage.getItem('user');

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

// FunÃ§Ã£o para obter o userId do localStorage
const getCurrentUserId = () => {
  const user = getStoredUser();
  return user?.id;
};

const request = async (path, options = {}, fallbackMessage = 'Erro na requisição') => {
  try {
    const response = await fetch(`${API_BASE}${path}`, options);
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : null;

    if (!response.ok) {
      throw new Error(data?.error || fallbackMessage);
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(API_OFFLINE_MESSAGE);
    }

    throw error;
  }
};

// Tasks Service
export const tasksService = {
  // Buscar tasks do usuÃ¡rio atual
  getAllTasks: async () => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('UsuÃ¡rio nÃ£o autenticado');

    return request(`/tasks?userId=${userId}`, {}, 'Erro ao buscar tasks');
  },

  // Criar task para o usuÃ¡rio atual
  createTask: async (taskData) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('UsuÃ¡rio nÃ£o autenticado');

    return request('/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...taskData,
        userId,
      }),
    }, 'Erro ao criar task');
  },

  // Atualizar task (apenas do usuÃ¡rio atual)
  updateTask: async (taskId, updates) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('UsuÃ¡rio nÃ£o autenticado');

    return request(`/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...updates,
        userId,
      }),
    }, 'Erro ao atualizar task');
  },

  // Marcar task como completa
  completeTask: async (taskId) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('UsuÃ¡rio nÃ£o autenticado');

    return request(`/tasks/${taskId}/complete`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    }, 'Erro ao completar task');
  },

  // Deletar task (apenas do usuÃ¡rio atual)
  deleteTask: async (taskId) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('UsuÃ¡rio nÃ£o autenticado');

    return request(`/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    }, 'Erro ao deletar task');
  },

  // Buscar estatÃ­sticas do usuÃ¡rio atual
  getStats: async () => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('UsuÃ¡rio nÃ£o autenticado');

    return request(`/stats?userId=${userId}`, {}, 'Erro ao buscar estatÃ­sticas');
  },

  // Calcular eficiÃªncia do usuÃ¡rio atual
  getEfficiency: async () => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('UsuÃ¡rio nÃ£o autenticado');

    return request(`/efficiency?userId=${userId}`, {}, 'Erro ao calcular eficiÃªncia');
  }
};

// Auth Service
export const authService = {
  // Registrar usuÃ¡rio
  register: async (userData) => {
    return request('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    }, 'Erro ao cadastrar usuário');
  },

  // Login
  login: async (credentials) => {
    return request('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    }, 'Erro ao fazer login');
  },

  // Verificar usuÃ¡rio atual
  getCurrentUser: async () => {
    return request('/auth/me', {}, 'Erro ao verificar usuÃ¡rio');
  },

  // Logout (frontend apenas)
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
};

// Health check
export const healthCheck = async () => {
  return request('/health', {}, 'Erro ao verificar a API');
};

// FunÃ§Ã£o utilitÃ¡ria para verificar conexÃ£o com a API
export const checkApiConnection = async () => {
  try {
    const health = await healthCheck();
    return { connected: true, data: health };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};

// FunÃ§Ã£o para simular delay (para testes)
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
