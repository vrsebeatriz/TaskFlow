import { useState, useEffect } from 'react';
import { goalsService } from '../services/api';
import type { Goal } from '../types';
import { useToast } from './Toast';
import { motion } from 'framer-motion';
import { Target, X, Trash2, Plus, TrendingUp } from 'lucide-react';

interface GoalsOverviewProps {
  searchQuery?: string;
}

export function GoalsOverview({ searchQuery = "" }: GoalsOverviewProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', category: 'FINANCEIRA', targetValue: '', deadline: '' });
  
  // Estado para contribuições rápidas
  const [contributions, setContributions] = useState<{[key: number]: string}>({});
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  // Simulador
  const [simulatedGoalId, setSimulatedGoalId] = useState<number | null>(null);
  const [simulatedValue, setSimulatedValue] = useState<number>(0);

  const { addToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail === 'goals') setIsAdding(true);
    };
    window.addEventListener('lifeos:add', handler);
    return () => window.removeEventListener('lifeos:add', handler);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await goalsService.getAll();
      setGoals(data);
      if (data.length > 0) {
        setSimulatedGoalId(data[0].id);
        setSimulatedValue(data[0].currentValue);
      }
    } catch (error) {
      addToast("Erro ao carregar metas.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!newGoal.title || !newGoal.targetValue) return;
    try {
      const created = await goalsService.create({
        ...newGoal,
        currentValue: 0,
        targetValue: Number(newGoal.targetValue)
      } as any);
      setGoals([...goals, created]);
      setIsAdding(false);
      setNewGoal({ title: '', category: 'FINANCEIRA', targetValue: '', deadline: '' });
      addToast("Meta criada!", "success");
    } catch (error) {
      addToast("Erro ao criar meta.", "error");
    }
  };

  const handleDeleteGoal = async (id: number) => {
    try {
      await goalsService.delete(id);
      setGoals(goals.filter(g => g.id !== id));
      addToast("Meta removida.", "info");
    } catch (error) {
      addToast("Erro ao remover meta.", "error");
    }
  };

  const handleAddContribution = async (goalId: number) => {
    const amount = Number(contributions[goalId]);
    if (!amount || amount <= 0) return;
    
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    setIsUpdating(goalId);
    try {
      const newValue = goal.currentValue + amount;
      const updated = await goalsService.update(goalId, { ...goal, currentValue: newValue });
      
      setGoals(goals.map(g => g.id === goalId ? updated : g));
      setContributions(prev => ({ ...prev, [goalId]: '' }));
      
      // Atualiza simulador se for a mesma meta
      if (simulatedGoalId === goalId) {
        setSimulatedValue(newValue);
      }
      
      addToast(`Adicionado ${formatValue(amount, goal.category)} à meta!`, "success");
    } catch (error) {
      addToast("Erro ao atualizar progresso.", "error");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleUpdateSimulatedValue = async () => {
    if (!simulatedGoalId || !simulatedGoal) return;
    
    setIsUpdating(simulatedGoalId);
    try {
      const updated = await goalsService.update(simulatedGoalId, { ...simulatedGoal, currentValue: simulatedValue });
      setGoals(goals.map(g => g.id === simulatedGoalId ? updated : g));
      addToast("Progresso da meta atualizado!", "success");
    } catch (error) {
      addToast("Erro ao salvar progresso.", "error");
    } finally {
      setIsUpdating(null);
    }
  };

  const getPercentage = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(100, Math.max(0, (current / target) * 100));
  };

  const formatValue = (val: number, category: string) => {
    if (category === "FINANCEIRA" || category === "MATERIAL") {
      return `R$ ${val.toLocaleString('pt-BR')}`;
    }
    return `${val} unid.`;
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-mono text-sm">Carregando Metas...</div>;
  }

  const simulatedGoal = goals.find(g => g.id === simulatedGoalId);
  const simPercentage = simulatedGoal ? getPercentage(simulatedValue, simulatedGoal.targetValue) : 0;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in zoom-in duration-500 px-4 pb-12">
      
      <div className="text-left mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Suas Metas</h2>
        <p className="text-[13px] text-gray-500">Acompanhe seu progresso e injete capital nos seus sonhos.</p>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-10 items-start">
        
        {/* COLUNA ESQUERDA: LISTA DE METAS EM GRID */}
        <div className="lg:col-span-8 space-y-6">
          {isAdding && (
            <div className="mb-6 bg-white/80 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Nova Meta</h3>
                  <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white"><X size={18} /></button>
                </div>
                <div className="space-y-4">
                    <input 
                      autoFocus
                      className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-3 text-[14px] outline-none" 
                      placeholder="Título da meta (ex: Comprar Carro)" 
                      value={newGoal.title}
                      onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <select 
                        className="bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-3 text-[13px] outline-none appearance-none"
                        value={newGoal.category}
                        onChange={e => setNewGoal({...newGoal, category: e.target.value as any})}
                      >
                        <option value="FINANCEIRA">💰 FINANCEIRA</option>
                        <option value="MATERIAL">🚗 MATERIAL</option>
                        <option value="PESSOAL">🔥 PESSOAL</option>
                      </select>
                      <input 
                        type="number"
                        className="bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-3 text-[14px] outline-none" 
                        placeholder="Valor Alvo" 
                        value={newGoal.targetValue}
                        onChange={e => setNewGoal({...newGoal, targetValue: e.target.value})}
                      />
                    </div>
                    <input 
                      className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-3 text-[13px] outline-none" 
                      placeholder="Prazo (ex: Dez 2026)" 
                      value={newGoal.deadline}
                      onChange={e => setNewGoal({...newGoal, deadline: e.target.value})}
                    />
                    <button 
                      onClick={handleCreateGoal}
                      className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-[13px] tracking-widest uppercase shadow-md"
                    >
                      Criar Meta
                    </button>
                </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.length === 0 && (
              <div className="col-span-full text-center py-16 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-3xl">
                <Target className="mx-auto text-gray-300 mb-3" size={32} />
                <p className="text-[13px] text-gray-500">Você ainda não tem metas. Defina sua primeira acima!</p>
              </div>
            )}
            {goals.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase())).map((goal) => {
              const isSimulated = goal.id === simulatedGoalId;
              const displayValue = isSimulated ? simulatedValue : goal.currentValue;
              const percentage = getPercentage(displayValue, goal.targetValue);
              
              let icon = "🎯";
              if (goal.category === "FINANCEIRA") icon = "💰";
              if (goal.category === "MATERIAL") icon = "🚗";
              if (goal.category === "PESSOAL") icon = "🔥";

              return (
                <div key={goal.id} className="bg-white/50 dark:bg-[#111111]/80 border border-gray-200 dark:border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col group transition-all hover:bg-white dark:hover:bg-[#161616]">
                  <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center gap-4">
                        <span className="text-3xl p-2 bg-gray-50 dark:bg-white/5 rounded-2xl">{icon}</span>
                        <div>
                          <p className="text-[10px] tracking-widest text-gray-500 uppercase font-bold">{goal.category}</p>
                          <h3 className="text-[17px] font-bold text-gray-900 dark:text-white">{goal.title}</h3>
                        </div>
                     </div>
                     <button 
                       onClick={() => handleDeleteGoal(goal.id)}
                       className="text-gray-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                     >
                       <Trash2 size={16} />
                     </button>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-[11px] font-bold text-gray-900 dark:text-white">{percentage.toFixed(0)}% concluído</span>
                       <span className="text-[10px] font-mono text-gray-400 uppercase">{goal.deadline || 'Sem prazo'}</span>
                    </div>
                    <div className="h-3 w-full bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden mb-3 relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="absolute top-0 left-0 h-full bg-gray-900 dark:bg-white rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                      />
                    </div>

                    <div className="text-[12px] font-mono text-gray-500 text-right">
                      {formatValue(displayValue, goal.category)} / {formatValue(goal.targetValue, goal.category)}
                    </div>
                  </div>

                  <div className="mt-auto space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Adicionar Investimento</p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-mono">R$</span>
                        <input 
                          type="number"
                          className="w-full bg-gray-100 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-[13px] outline-none text-gray-900 dark:text-white transition-all" 
                          placeholder="Valor" 
                          value={contributions[goal.id] || ''}
                          onChange={e => setContributions({...contributions, [goal.id]: e.target.value})}
                        />
                      </div>
                      <button 
                        disabled={isUpdating === goal.id}
                        onClick={() => handleAddContribution(goal.id)}
                        className="bg-gray-900 dark:bg-white text-white dark:text-black p-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUNA DIREITA: SIMULADOR */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8 mt-10 lg:mt-0">
          <div className="bg-white/50 dark:bg-[#111111]/80 border border-gray-200 dark:border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-lg border-t-white/20 dark:border-t-white/5">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                  <TrendingUp size={20} />
               </div>
               <h3 className="text-[14px] font-bold text-gray-900 dark:text-white tracking-tight uppercase">Simulador de Futuro</h3>
            </div>
            
            <p className="text-[12px] text-gray-500 mb-8 leading-relaxed">
              Arraste a barra para visualizar o progresso ou clique em **Salvar** para registrar o valor como o novo estado da meta.
            </p>

            <div className="flex flex-col gap-2 mb-8">
              {goals.map(g => (
                <button 
                  key={g.id}
                  onClick={() => {
                    setSimulatedGoalId(g.id);
                    setSimulatedValue(g.currentValue);
                  }}
                  className={`w-full text-left px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all border ${
                    simulatedGoalId === g.id 
                      ? 'bg-gray-900 dark:bg-white border-transparent text-white dark:text-black shadow-lg scale-[1.02]' 
                      : 'bg-gray-100/50 dark:bg-white/5 border-transparent text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/10 hover:border-gray-200 dark:hover:border-white/10'
                  }`}
                >
                  {g.title}
                </button>
              ))}
            </div>

            {goals.length > 0 && simulatedGoal ? (
              <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/5">
                <input 
                  type="range" 
                  min="0" 
                  max={simulatedGoal.targetValue} 
                  value={simulatedValue}
                  onChange={(e) => setSimulatedValue(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-gray-900 dark:accent-white mb-8"
                />
                
                <div className="text-center mb-8">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {simPercentage.toFixed(0)}%
                  </p>
                  <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Estado da Meta</p>
                  <p className="text-[13px] font-bold text-gray-700 dark:text-gray-300 mt-2">
                    {formatValue(simulatedValue, simulatedGoal.category)}
                  </p>
                </div>

                <button 
                  disabled={isUpdating === simulatedGoal.id || simulatedValue === simulatedGoal.currentValue}
                  onClick={handleUpdateSimulatedValue}
                  className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-[11px] tracking-widest uppercase shadow-md disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Salvar Progresso
                </button>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50/50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                 <p className="text-[11px] text-gray-400 italic">Selecione uma meta para começar.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
