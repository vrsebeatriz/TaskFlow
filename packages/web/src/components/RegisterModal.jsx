import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    const result = await register(name, email, password);
    
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
        className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="relative z-10 bg-[#0A0A0A] rounded-xl shadow-2xl max-w-md w-full border border-white/10 animate-in fade-in duration-300 transform scale-100">
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 border border-purple-500/30">
              <Sparkles className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-gray-500">
                Novo Membro
              </p>
              <h2 className="text-[13px] font-mono font-bold uppercase tracking-[0.2em] text-white mt-1">Cadastrar</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-500 hover:bg-white/5 hover:text-white transition-colors border border-transparent hover:border-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-md p-4 flex items-center gap-3">
              <p className="text-red-400 text-[11px] font-mono uppercase tracking-widest">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-[0.15em] text-gray-400 mb-3">
              Nome
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-white/10 bg-white/[0.02] rounded-md focus:border-purple-500 focus:bg-white/[0.04] transition-all duration-200 text-gray-200 text-[13px] outline-none font-sans"
                placeholder="Seu nome completo"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-[0.15em] text-gray-400 mb-3">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-white/10 bg-white/[0.02] rounded-md focus:border-purple-500 focus:bg-white/[0.04] transition-all duration-200 text-gray-200 text-[13px] outline-none font-sans"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-[0.15em] text-gray-400 mb-3">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-2 py-3 border border-white/10 bg-white/[0.02] rounded-md focus:border-purple-500 focus:bg-white/[0.04] transition-all duration-200 text-gray-200 text-[13px] outline-none font-sans"
                  placeholder="Mínimo 6"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-[0.15em] text-gray-400 mb-3">
                Confirmar
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-white/10 bg-white/[0.02] rounded-md focus:border-purple-500 focus:bg-white/[0.04] transition-all duration-200 text-gray-200 text-[13px] outline-none font-sans"
                  placeholder="Repita"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white font-bold tracking-[0.2em] text-[11px] uppercase py-4 px-4 transition-all hover:bg-purple-500 disabled:opacity-50 font-sans rounded-none"
            >
              {loading ? 'Criando...' : 'Criar Conta'}
            </button>
          </div>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-[11px] font-mono uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
            >
              Já tem uma conta? <span className="text-purple-400">Entre</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
