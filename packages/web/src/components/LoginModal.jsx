import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LoginModal({ isOpen, onClose, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-50 dark:bg-[#000000]/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white dark:bg-[#0A0A0A] rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-white/10 animate-in fade-in duration-300 transform scale-100">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30">
              <Activity className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-500">
                Acesso Seguro
              </p>
              <h2 className="text-[13px] font-mono font-bold uppercase tracking-[0.2em] text-gray-900 dark:text-white mt-1">Entrar</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:text-white transition-colors border border-transparent hover:border-gray-200 dark:border-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-md p-4 flex items-center gap-3">
              <p className="text-red-400 text-[11px] font-mono uppercase tracking-widest">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-[0.15em] text-gray-600 dark:text-gray-400 mb-3">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-500 h-4 w-4" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] rounded-md focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-white/[0.04] transition-all duration-200 text-gray-800 dark:text-gray-200 text-[13px] outline-none font-sans"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-[0.15em] text-gray-600 dark:text-gray-400 mb-3">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-500 h-4 w-4" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] rounded-md focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-white/[0.04] transition-all duration-200 text-gray-800 dark:text-gray-200 text-[13px] outline-none font-sans"
                placeholder="Sua senha"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold tracking-[0.2em] text-[11px] uppercase py-4 px-4 transition-all hover:bg-blue-500 disabled:opacity-50 font-sans rounded-none"
            >
              {loading ? 'Autenticando...' : 'Entrar na Conta'}
            </button>
          </div>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-[11px] font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:text-white transition-colors"
            >
              Não tem uma conta? <span className="text-blue-400">Cadastre-se</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
