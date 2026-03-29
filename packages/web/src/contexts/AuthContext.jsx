import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tenta carregar o usuário e o token salvos ao iniciar a aplicação
    async function loadStorageData() {
      const storageUser = localStorage.getItem('@TaskFlow:user');
      const storageToken = localStorage.getItem('@TaskFlow:token');

      if (storageUser && storageToken) {
        // Define o cabeçalho de autorização para todas as chamadas futuras
        api.defaults.headers.Authorization = `Bearer ${storageToken}`;
        setUser(JSON.parse(storageUser));
      }
      setLoading(false);
    }

    loadStorageData();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      // Persistência dos dados no localStorage
      localStorage.setItem('@TaskFlow:token', token);
      localStorage.setItem('@TaskFlow:user', JSON.stringify(userData));

      // Configura o token nas futuras requisições da API
      api.defaults.headers.Authorization = `Bearer ${token}`;
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Falha na autenticação' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      await api.post('/auth/register', { name, email, password });
      return { success: true };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao criar conta' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('@TaskFlow:token');
    localStorage.removeItem('@TaskFlow:user');
    api.defaults.headers.Authorization = undefined;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      signed: !!user, 
      user, 
      loading, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};