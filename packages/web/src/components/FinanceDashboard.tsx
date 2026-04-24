import { useState, useEffect, useRef } from 'react';
import { financesService } from '../services/api';
import { useToast } from './Toast';
import { Trash2, Send, Sparkles, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface FinanceDashboardProps {
  searchQuery?: string;
}

export function FinanceDashboard({ searchQuery = "" }: FinanceDashboardProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [newTx, setNewTx] = useState({ description: '', amount: '', type: 'expense', date: 'HOJE' });
  
  // Novo estado para controle de data funcional
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail === 'finances') setIsAdding(true);
    };
    window.addEventListener('lifeos:add', handler);
    return () => window.removeEventListener('lifeos:add', handler);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await financesService.getTransactions();
      setTransactions(data);
    } catch (error) {
      addToast("Erro ao carregar finanças.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async () => {
    if (!newTx.description || !newTx.amount) return;
    try {
      // Usamos uma data ISO interna para filtragem precisa, 
      // mas mantemos o campo 'date' para exibição compatível
      const now = new Date();
      const displayDate = newTx.date === 'HOJE' 
        ? now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase().replace('.', '') 
        : newTx.date;

      const tx = await financesService.createTransaction({ 
        ...newTx, 
        amount: Number(newTx.amount),
        date: displayDate,
        isoDate: now.toISOString() // Campo extra para filtragem funcional
      });
      
      setTransactions([...transactions, tx]);
      setNewTx({ description: '', amount: '', type: 'expense', date: 'HOJE' });
      setIsAdding(false);
      addToast("Movimentação salva!", "success");
    } catch (error) {
      addToast("Erro ao salvar.", "error");
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      await financesService.deleteTransaction(id);
      setTransactions(transactions.filter(t => t.id !== id));
      addToast("Removido.", "info");
    } catch (error) {
      addToast("Erro ao excluir.", "error");
    }
  };

  const handleAiSubmit = async (text?: string) => {
    const input = text || chatInput;
    if (!input) return;

    const userMsg = { role: 'user' as const, text: input };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput("");
    setIsAiLoading(true);

    try {
      const response = await financesService.analyze({ text: input });
      setChatHistory(prev => [...prev, { role: 'ai' as const, text: response.insight }]);
    } catch (error) {
      addToast("A IA está descansando agora. Tente mais tarde.", "error");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Lógica de navegação de meses
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthYearDisplay = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();

  // Filtragem funcional por mês selecionado
  const filteredTransactions = transactions.filter(t => {
    const queryMatch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Se tiver isoDate (novas transações), usamos ele
    if (t.isoDate) {
      const d = new Date(t.isoDate);
      return queryMatch && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    }
    
    // Fallback para as antigas (baseado na string "24 ABR" ou "24 de Abril")
    const monthShort = currentDate.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
    const monthFull = currentDate.toLocaleDateString('pt-BR', { month: 'long' }).toLowerCase();
    
    return queryMatch && (
      t.date.toUpperCase().includes(monthShort) || 
      t.date.toLowerCase().includes(monthFull)
    );
  });

  const income = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expense;

  // Saldo global (todas as transações)
  const totalBalance = transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);

  if (loading) return <div className="p-8 text-center text-gray-500 font-mono text-sm">Carregando Finanças...</div>;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in zoom-in duration-500 pb-12 px-4">
      
      <div className="text-left mb-10">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
          FINANÇAS
        </h2>
        <p className="text-[13px] text-gray-500 dark:text-gray-400">
          Gerencie seu capital com precisão e inteligência artificial.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-10 items-start">
        
        {/* COLUNA ESQUERDA: EXTRATO E STATS */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-center lg:justify-start gap-6 text-gray-500 dark:text-gray-400 mb-2">
             <button 
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all active:scale-90"
             >
               <ChevronLeft size={18} />
             </button>
             <span className="text-[13px] font-bold font-mono uppercase tracking-[0.2em] min-w-[150px] text-center">
               {monthYearDisplay}
             </span>
             <button 
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all active:scale-90"
             >
               <ChevronRight size={18} />
             </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/50 dark:bg-[#111111]/80 border border-gray-200 dark:border-white/10 rounded-3xl p-5 text-center backdrop-blur-md shadow-sm">
               <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">Entrou</p>
               <p className="text-[18px] font-bold text-emerald-600 dark:text-emerald-400">R$ {income.toLocaleString('pt-BR')}</p>
            </div>
            <div className="bg-white/50 dark:bg-[#111111]/80 border border-gray-200 dark:border-white/10 rounded-3xl p-5 text-center backdrop-blur-md shadow-sm">
               <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">Saiu</p>
               <p className="text-[18px] font-bold text-red-600 dark:text-red-400">R$ {expense.toLocaleString('pt-BR')}</p>
            </div>
            <div className="bg-white/50 dark:bg-[#111111]/80 border border-gray-200 dark:border-white/10 rounded-3xl p-5 text-center backdrop-blur-md shadow-sm">
               <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">Saldo Mês</p>
               <p className={`text-[18px] font-bold ${balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                 R$ {balance.toLocaleString('pt-BR')}
               </p>
            </div>
          </div>

          <div className="flex justify-between items-center px-2">
            <p className="text-[11px] text-gray-500 font-mono">
              Patrimônio Líquido: <span className="font-bold text-gray-700 dark:text-gray-300">R$ {totalBalance.toLocaleString('pt-BR')}</span>
            </p>
            <p className="text-[11px] text-gray-500 font-mono">
              {filteredTransactions.length} movimentações no período
            </p>
          </div>

          {isAdding && (
            <div className="mb-6 bg-white/80 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Nova Movimentação</h3>
                  <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white"><X size={20} /></button>
                </div>
                <div className="space-y-4">
                  <input 
                    autoFocus
                    className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-2xl px-5 py-4 text-[15px] outline-none text-gray-900 dark:text-white placeholder:text-gray-400" 
                    placeholder="Descrição (ex: Aluguel, Salário...)" 
                    value={newTx.description}
                    onChange={e => setNewTx({...newTx, description: e.target.value})}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">R$</span>
                      <input 
                        type="number"
                        className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-2xl pl-10 pr-5 py-4 text-[15px] outline-none text-gray-900 dark:text-white" 
                        placeholder="0,00" 
                        value={newTx.amount}
                        onChange={e => setNewTx({...newTx, amount: e.target.value})}
                      />
                    </div>
                    <select 
                      className="bg-gray-100 dark:bg-white/5 border-none rounded-2xl px-5 py-4 text-[14px] outline-none appearance-none text-gray-700 dark:text-gray-300"
                      value={newTx.type}
                      onChange={e => setNewTx({...newTx, type: e.target.value})}
                    >
                      <option value="expense">💸 Despesa</option>
                      <option value="income">💰 Receita</option>
                    </select>
                  </div>
                  <input 
                    className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-2xl px-5 py-3 text-[13px] outline-none text-gray-500 font-mono" 
                    placeholder="Data (ex: HOJE ou 25 ABR)" 
                    value={newTx.date}
                    onChange={e => setNewTx({...newTx, date: e.target.value})}
                  />
                  <button 
                    onClick={handleCreateTransaction}
                    className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-[13px] tracking-[0.2em] uppercase shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Confirmar Registro
                  </button>
                </div>
            </div>
          )}

          <div className="bg-white/30 dark:bg-white/[0.01] border border-gray-200 dark:border-white/5 rounded-[2rem] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">Extrato Detalhado</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredTransactions.length === 0 && (
                <div className="text-center py-20 px-10">
                  <div className="text-3xl mb-4 opacity-20">📂</div>
                  <p className="text-[13px] text-gray-400 italic">Nenhuma movimentação encontrada para {monthYearDisplay.toLowerCase()}.</p>
                </div>
              )}
              {filteredTransactions.slice().reverse().map(t => (
                <div key={t.id} className="group flex justify-between items-center px-6 py-5 hover:bg-white dark:hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-center gap-6">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {t.type === 'income' ? '↓' : '↑'}
                     </div>
                     <div>
                       <span className="text-[15px] font-bold text-gray-900 dark:text-gray-100 block mb-0.5">{t.description}</span>
                       <span className="text-[11px] font-mono text-gray-400 uppercase tracking-widest">{t.date}</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={`text-[16px] font-bold font-mono ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <button 
                      onClick={() => handleDeleteTransaction(t.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/5"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: IA FINANCEIRA */}
        <div className="lg:col-span-5 h-fit lg:sticky lg:top-8 bg-white/50 dark:bg-[#111111]/80 border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md mt-10 lg:mt-0 shadow-xl border-t-white/20 dark:border-t-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-400/20 rounded-xl">
              <Sparkles size={20} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight">Financial AI</h3>
              <p className="text-[11px] text-gray-500 font-mono uppercase tracking-widest">Powered by Life OS</p>
            </div>
          </div>
          
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent mb-8"></div>

          <div className="space-y-6 mb-8 max-h-[450px] overflow-y-auto pr-3 hide-scrollbar">
            {chatHistory.length === 0 && (
              <div className="space-y-3 animate-in fade-in duration-700">
                <p className="text-[11px] text-gray-400 mb-4 font-mono uppercase tracking-widest px-1">Sugestões de Análise:</p>
                {[
                  "Resumo de gastos de " + monthYearDisplay.toLowerCase(),
                  "Qual minha maior despesa este mês?",
                  "Dicas para economizar 10% do salário",
                  "Projeção de saldo para o próximo mês"
                ].map((suggestion, i) => (
                  <button 
                    key={i}
                    onClick={() => handleAiSubmit(suggestion)}
                    className="block w-full text-left p-4 rounded-2xl border border-gray-100 dark:border-white/5 text-[13px] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all active:scale-[0.98]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[90%] p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-black font-medium rounded-tr-none' 
                    : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {isAiLoading && (
              <div className="flex justify-start animate-in fade-in">
                <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-tl-none flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="relative group">
            <input 
              className="w-full bg-gray-100 dark:bg-white/5 border border-transparent focus:border-gray-300 dark:focus:border-white/20 rounded-2xl pl-5 pr-14 py-4 text-[14px] outline-none transition-all text-gray-900 dark:text-white" 
              placeholder="Analise suas finanças..." 
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAiSubmit()}
            />
            <button 
              onClick={() => handleAiSubmit()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-white text-white dark:text-black p-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
