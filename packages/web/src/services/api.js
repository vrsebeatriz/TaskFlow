// src/services/api.js

const API_BASE = 'http://localhost:3001/api';

// Função para obter o userId do localStorage
const getCurrentUserId = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.id;
};

// Tasks Service
export const tasksService = {
  // Buscar tasks do usuário atual
  getAllTasks: async () => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');
    
    const response = await fetch(`${API_BASE}/tasks?userId=${userId}`);
    if (!response.ok) throw new Error('Erro ao buscar tasks');
    return await response.json();
  },

  // Criar task para o usuário atual
  createTask: async (taskData) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');

    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...taskData,
        userId: userId
      }),
    });
    if (!response.ok) throw new Error('Erro ao criar task');
    return await response.json();
  },

  // Atualizar task (apenas do usuário atual)
  updateTask: async (taskId, updates) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');

    const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...updates,
        userId: userId
      }),
    });
    if (!response.ok) throw new Error('Erro ao atualizar task');
    return await response.json();
  },

  // Marcar task como completa
  completeTask: async (taskId) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');

    const response = await fetch(`${API_BASE}/tasks/${taskId}/complete`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Erro ao completar task');
    return await response.json();
  },

  // Deletar task (apenas do usuário atual)
  deleteTask: async (taskId) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');

    const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Erro ao deletar task');
    return await response.json();
  },

  // Buscar estatísticas do usuário atual
  getStats: async () => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');

    const response = await fetch(`${API_BASE}/stats?userId=${userId}`);
    if (!response.ok) throw new Error('Erro ao buscar estatísticas');
    return await response.json();
  },

  // Calcular eficiência do usuário atual
  getEfficiency: async () => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');

    const response = await fetch(`${API_BASE}/efficiency?userId=${userId}`);
    if (!response.ok) throw new Error('Erro ao calcular eficiência');
    return await response.json();
  }
};

// Auth Service
export const authService = {
  // Registrar usuário
  register: async (userData) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  // Login
  login: async (credentials) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  // Verificar usuário atual
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE}/auth/me`);
    if (!response.ok) throw new Error('Erro ao verificar usuário');
    return await response.json();
  },

  // Logout (frontend apenas)
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
};

// Health check
export const healthCheck = async () => {
  const response = await fetch(`${API_BASE}/health`);
  return await response.json();
};

// Função utilitária para verificar conexão com a API
export const checkApiConnection = async () => {
  try {
    const health = await healthCheck();
    return { connected: true, data: health };
  } catch (error) {
    return { connected: false, error: error.message };
  }
};

// Função para simular delay (para testes)
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));