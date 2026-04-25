import { useState, useEffect } from 'react';
import { habitsService } from '../services/api';
import type { Habit, HabitLog } from '../types';
import { useToast } from './Toast';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Check, Trash2, X } from 'lucide-react';

const EMOJI_OPTIONS = ['💪', '📖', '💧', '🧠', '🧹', '🏃', '🧘', '💤', '🍎', '💊', '✍️', '🎯', '🎵', '🐶', '☀️', '🚭'];

interface HabitTrackerProps {
  searchQuery?: string;
}

export function HabitTracker({ searchQuery = "" }: HabitTrackerProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitEmoji, setNewHabitEmoji] = useState('💪');
  const { addToast } = useToast();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail === 'habits') setIsAdding(true);
    };
    window.addEventListener('lifeos:add', handler);
    return () => window.removeEventListener('lifeos:add', handler);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedHabits, fetchedLogs] = await Promise.all([
        habitsService.getAll(),
        habitsService.getLogs()
      ]);
      
      setHabits(fetchedHabits);
      setLogs(fetchedLogs);
    } catch (error) {
      addToast("Erro ao carregar hábitos.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = async () => {
    if (!newHabitTitle.trim()) return;
    try {
      const created = await habitsService.create({ title: newHabitTitle, emoji: newHabitEmoji });
      setHabits([...habits, created]);
      setNewHabitTitle('');
      setNewHabitEmoji('💪');
      setIsAdding(false);
      addToast("Hábito criado!", "success");
    } catch (error) {
      addToast("Erro ao criar hábito.", "error");
    }
  };

  const handleDeleteHabit = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await habitsService.delete(id);
      setHabits(habits.filter(h => h.id !== id));
      addToast("Hábito removido.", "info");
    } catch (error) {
      addToast("Erro ao remover hábito.", "error");
    }
  };

  const handleToggleHabit = async (habitId: number, currentCompleted: boolean) => {
    try {
      // Optimistic update
      const newCompleted = !currentCompleted;
      setLogs(prev => {
        const existingLogIndex = prev.findIndex(l => l.habitId === habitId && l.date === today);
        if (existingLogIndex >= 0) {
          const newLogs = [...prev];
          newLogs[existingLogIndex].completed = newCompleted;
          return newLogs;
        } else {
          return [...prev, { id: Date.now(), habitId, userId: 0, date: today, completed: newCompleted }];
        }
      });

      await habitsService.logHabit({ habitId, date: today, completed: newCompleted });
    } catch (error) {
      addToast("Erro ao registrar hábito.", "error");
      loadData(); // Revert
    }
  };

  // Filtra logs apenas de hábitos que ainda existem
  const activeLogs = logs.filter(l => habits.some(h => h.id === l.habitId));

  // Calcula Streak para a semana
  const getChartData = () => {
    const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    const data = [];
    
    // Mostra os últimos 7 dias até hoje
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Quantos hábitos completados neste dia
      const completedCount = activeLogs.filter(l => l.date === dateStr && l.completed).length;
      
      data.push({
        name: days[d.getDay()],
        completed: completedCount,
        fullDate: dateStr
      });
    }
    return data;
  };

  const chartData = getChartData();
  const completedToday = activeLogs.filter(l => l.date === today && l.completed).length;
  const streak = activeLogs.filter(l => l.completed).length; // Simplificação do streak total

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-mono text-sm">Carregando Hábitos...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in zoom-in duration-500 px-4">
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-10 items-start">
        
        {/* COLUNA ESQUERDA: LISTA DE HÁBITOS EM GRID */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Seus Hábitos</h2>
              <p className="text-[13px] text-gray-500">Mantenha a constância para ver o progresso.</p>
            </div>
            <div className="hidden lg:block text-right">
              <p className="text-[10px] tracking-widest text-gray-500 uppercase font-mono mb-1">Hoje</p>
              <p className="text-[14px] font-bold text-gray-900 dark:text-white">{completedToday} / {habits.length}</p>
            </div>
          </div>

          {isAdding && (
            <div className="mb-6 bg-white/80 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-xl animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Novo Hábito</h3>
                  <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white"><X size={18} /></button>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button 
                      key={emoji}
                      onClick={() => setNewHabitEmoji(emoji)}
                      className={`w-9 h-9 rounded-lg text-[16px] flex items-center justify-center transition-all ${
                        newHabitEmoji === emoji 
                          ? 'bg-gray-900 dark:bg-white scale-110 shadow-md' 
                          : 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                   <input 
                     autoFocus
                     className="flex-1 min-w-0 bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-3 text-[14px] outline-none" 
                     placeholder="Ex: Meditar" 
                     value={newHabitTitle}
                     onChange={e => setNewHabitTitle(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handleCreateHabit()}
                   />
                   <button 
                     onClick={handleCreateHabit}
                     className="bg-gray-900 dark:bg-white text-white dark:text-black px-4 rounded-xl font-bold text-[12px]"
                   >
                     Adicionar
                   </button>
                </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.filter(h => h.title.toLowerCase().includes(searchQuery.toLowerCase())).map((habit) => {
              const isCompleted = logs.some(l => l.habitId === habit.id && l.date === today && l.completed);
              
              return (
                <div 
                  key={habit.id}
                  onClick={() => handleToggleHabit(habit.id, isCompleted)}
                  className="group flex items-center p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] backdrop-blur-md cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-white/[0.04] active:scale-[0.98]"
                >
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center mr-4 transition-colors ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                    {isCompleted && <Check size={14} strokeWidth={4} />}
                  </div>
                  <span className="text-[20px] mr-4">
                     {habit.emoji || '🎯'}
                  </span>
                  <div className="flex-1">
                    <span className={`text-[15px] font-bold transition-colors block ${isCompleted ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-gray-200'}`}>
                      {habit.title}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">Diário</span>
                  </div>
                   <button 
                     onClick={(e) => handleDeleteHabit(e, habit.id)}
                     className="text-gray-400 hover:text-red-500 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1"
                   >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUNA DIREITA: STATS & CHART */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8 mt-10 lg:mt-0">
          <div className="bg-white/50 dark:bg-[#111111]/80 border border-gray-200 dark:border-white/10 rounded-3xl p-8 flex flex-col items-center backdrop-blur-md">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-8">Meta Diária</h3>
            <div className="w-32 h-32 rounded-full border-8 border-gray-100 dark:border-white/5 flex items-center justify-center relative">
               <div className="text-center">
                 <span className="text-3xl font-bold text-gray-900 dark:text-white block">{streak}</span>
                 <span className="text-[10px] uppercase tracking-tighter text-gray-500">Dias</span>
               </div>
               <svg className="absolute w-32 h-32 -rotate-90 scale-110">
                 <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-transparent" />
                 <circle 
                    cx="64" 
                    cy="64" 
                    r="60" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray="377" 
                    strokeDashoffset={377 - (377 * completedToday) / Math.max(habits.length, 1)} 
                    className="text-gray-900 dark:text-white transition-all duration-1000 stroke-round" 
                 />
               </svg>
            </div>
            <p className="mt-8 text-[12px] text-gray-500 font-mono uppercase tracking-widest">
              {completedToday} de {habits.length} feitos hoje
            </p>
          </div>

          <div className="bg-white/50 dark:bg-[#111111]/80 border border-gray-200 dark:border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-6">Desempenho Semanal</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#6b7280'}}
                    dy={10}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="currentColor" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: "currentColor", strokeWidth: 0 }} 
                    activeDot={{ r: 6 }} 
                    className="text-gray-900 dark:text-white"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
