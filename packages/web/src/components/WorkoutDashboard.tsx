import { useState, useEffect } from 'react';
import { workoutsService } from '../services/api';
import type { Workout, WorkoutExercise, WorkoutSet } from '../types';
import { useToast } from './Toast';
import { Dumbbell, Save, Trash2, ChevronDown, ChevronUp, Calendar, X } from 'lucide-react';
import { DietDashboard } from './DietDashboard';

interface WorkoutDashboardProps {
  searchQuery?: string;
}

export function WorkoutDashboard({ searchQuery = "" }: WorkoutDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'workout' | 'diet'>('workout');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(true);
  
  // Estado local para o "Treino de Hoje"
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutExercise[]>([]);
  const [workoutName, setWorkoutName] = useState("Treino A");
  const [todayWorkoutId, setTodayWorkoutId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const { addToast } = useToast();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail === 'workouts') {
        if (activeSubTab === 'diet') {
          window.dispatchEvent(new CustomEvent('lifeos:add-diet'));
        } else {
          setActiveSubTab('workout');
          setCurrentWorkout(prev => [...prev, { name: "", sets: [{ weight: 0, reps: 0 }] }]);
        }
      }
    };
    window.addEventListener('lifeos:add', handler);
    return () => window.removeEventListener('lifeos:add', handler);
  }, [activeSubTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await workoutsService.getAll();
      setWorkouts(data);
      
      const todayWorkout = data.find((w: Workout) => w.date && w.date.startsWith(today));
      if (todayWorkout) {
        setTodayWorkoutId(todayWorkout.id);
        setWorkoutName(todayWorkout.name || "Treino A");
        setCurrentWorkout(todayWorkout.exercises || []);
      }
    } catch (error) {
      addToast("Erro ao carregar treinos.", "error");
    } finally {
      setLoading(false);
    }
  };

  const removeExercise = (exIndex: number) => {
    setCurrentWorkout(currentWorkout.filter((_, i) => i !== exIndex));
  };

  const addSet = (exIndex: number) => {
    const updated = [...currentWorkout];
    const lastSet = updated[exIndex].sets[updated[exIndex].sets.length - 1] || { weight: 0, reps: 0 };
    updated[exIndex].sets.push({ ...lastSet });
    setCurrentWorkout(updated);
  };

  const removeSet = (exIndex: number, setIndex: number) => {
    const updated = [...currentWorkout];
    if (updated[exIndex].sets.length > 1) {
      updated[exIndex].sets.splice(setIndex, 1);
      setCurrentWorkout(updated);
    } else {
      addToast("Mantenha ao menos uma série.", "info");
    }
  };

  const updateSet = (exIndex: number, setIndex: number, field: keyof WorkoutSet, value: string) => {
    const numValue = Number(value.replace(/\D/g, ''));
    const updated = [...currentWorkout];
    updated[exIndex].sets[setIndex][field] = numValue;
    setCurrentWorkout(updated);
  };

  const updateExerciseName = (exIndex: number, name: string) => {
    const updated = [...currentWorkout];
    updated[exIndex].name = name;
    setCurrentWorkout(updated);
  };

  const handleSaveWorkout = async () => {
    if (currentWorkout.length === 0) {
      addToast("Adicione pelo menos um exercício.", "error");
      return;
    }
    
    setIsSaving(true);
    try {
      if (todayWorkoutId) {
        await workoutsService.update(todayWorkoutId, { name: workoutName, exercises: currentWorkout });
        addToast("Treino atualizado!", "success");
      } else {
        const saved = await workoutsService.create({ 
          name: workoutName, 
          exercises: currentWorkout,
          date: new Date().toISOString()
        });
        setTodayWorkoutId(saved.id);
        addToast("Treino salvo com sucesso!", "success");
      }
      loadData();
    } catch (error) {
      addToast("Erro ao salvar treino.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkout = async (id: number) => {
    if (!confirm("Excluir este registro?")) return;
    try {
      await workoutsService.delete(id);
      if (id === todayWorkoutId) {
        setTodayWorkoutId(null);
        setCurrentWorkout([]);
      }
      setWorkouts(workouts.filter(w => w.id !== id));
      addToast("Registro removido.", "info");
    } catch (error) {
      addToast("Erro ao excluir.", "error");
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const totalSets = currentWorkout.reduce((acc, ex) => acc + ex.sets.length, 0);
  const filledSets = currentWorkout.reduce((acc, ex) => acc + ex.sets.filter(s => s.reps > 0).length, 0);
  const progressPercent = totalSets > 0 ? (filledSets / totalSets) * 100 : 0;

  if (loading) return <div className="p-8 text-center text-gray-500 font-mono text-sm uppercase tracking-widest">Sincronizando...</div>;

  const savedWorkouts = workouts.filter(w => 
    w.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.exercises?.some(ex => ex.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in zoom-in duration-500 pb-12 px-4">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Performance</h2>
          <p className="text-[13px] text-gray-500">Acompanhe seu progresso físico e nutricional.</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl w-full md:w-64">
          <button 
            onClick={() => setActiveSubTab('workout')}
            className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl transition-all text-[11px] font-bold tracking-widest uppercase ${
              activeSubTab === 'workout' ? 'bg-white dark:bg-[#1A1A1A] shadow-md text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Dumbbell size={14} /> Treino
          </button>
          <button 
            onClick={() => setActiveSubTab('diet')}
            className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl transition-all text-[11px] font-bold tracking-widest uppercase ${
              activeSubTab === 'diet' ? 'bg-white dark:bg-[#1A1A1A] shadow-md text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            🥗 Dieta
          </button>
        </div>
      </div>

      {activeSubTab === 'diet' ? (
        <DietDashboard searchQuery={searchQuery} />
      ) : (
        <div className="lg:grid lg:grid-cols-12 lg:gap-10 items-start">
          
          {/* COLUNA ESQUERDA: TREINO ATIVO */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white/50 dark:bg-[#111111]/80 border border-gray-200 dark:border-white/10 rounded-3xl p-6 backdrop-blur-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <input 
                    className="text-xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none focus:ring-0 p-0 w-full mb-1" 
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                  />
                  <p className="text-[11px] tracking-widest text-gray-500 uppercase font-mono">
                    {todayWorkoutId ? '✅ Registrado hoje' : 'Sessão atual — pendente'}
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-2xl">
                   <div className="w-20 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${progressPercent}%` }}></div>
                   </div>
                   <span className="text-[11px] font-bold font-mono text-emerald-600 dark:text-emerald-400">{Math.round(progressPercent)}%</span>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                {currentWorkout.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-3xl">
                    <Dumbbell className="mx-auto text-gray-300 mb-3" size={32} />
                    <p className="text-[13px] text-gray-500">Seu treino está vazio. Comece agora!</p>
                  </div>
                )}
                {currentWorkout.map((exercise, exIndex) => (
                  <div key={exIndex} className="bg-gray-50/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 flex justify-between items-center group">
                       <input 
                         className="font-bold text-[14px] text-gray-900 dark:text-white bg-transparent border-none outline-none focus:ring-0 p-0 w-full placeholder:text-gray-400" 
                         value={exercise.name}
                         placeholder="Ex: Supino Reto"
                         onChange={(e) => updateExerciseName(exIndex, e.target.value)}
                       />
                       <button onClick={() => removeExercise(exIndex)} className="text-gray-400 hover:text-red-500 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1">
                         <Trash2 size={14} />
                       </button>
                    </div>
                    
                    <div className="px-4 py-3">
                      <div className="grid grid-cols-[30px_1fr_1fr_40px] gap-4 mb-2 px-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">#</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase text-center">Carga (kg)</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase text-center">Reps</span>
                        <span className="w-4"></span>
                      </div>
                      
                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="grid grid-cols-[30px_1fr_1fr_40px] gap-4 items-center py-1.5 px-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                          <span className="text-[11px] font-mono text-gray-400">{setIndex + 1}</span>
                          <input 
                            type="number" 
                            className="min-w-0 w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg py-2 text-center text-[13px] outline-none" 
                            value={set.weight || ''} 
                            placeholder="0"
                            onChange={(e) => updateSet(exIndex, setIndex, 'weight', e.target.value)} 
                          />
                          <input 
                            type="number" 
                            className="min-w-0 w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg py-2 text-center text-[13px] outline-none" 
                            value={set.reps || ''} 
                            placeholder="0"
                            onChange={(e) => updateSet(exIndex, setIndex, 'reps', e.target.value)} 
                          />
                          <div className="flex justify-center group/set">
                            <button 
                              onClick={() => removeSet(exIndex, setIndex)}
                              className="text-gray-300 hover:text-red-500 transition-colors p-1"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <button 
                        onClick={() => addSet(exIndex)}
                        className="mt-3 w-full py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-dashed border-gray-200 dark:border-white/10 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-all"
                      >
                        + Adicionar Série
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {currentWorkout.length > 0 && (
                <button 
                  onClick={handleSaveWorkout}
                  disabled={isSaving}
                  className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-[13px] tracking-widest uppercase shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? 'Salvando...' : <><Save size={16} /> Salvar Sessão</>}
                </button>
              )}
            </div>
          </div>

          {/* COLUNA DIREITA: HISTÓRICO */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8 mt-10 lg:mt-0">
            <div className="bg-white/50 dark:bg-[#111111]/80 border border-gray-200 dark:border-white/10 rounded-3xl p-6 backdrop-blur-md">
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex justify-between items-center text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-4"
              >
                <span className="flex items-center gap-2 font-mono"><Calendar size={12} /> Histórico ({savedWorkouts.length})</span>
                {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              
              {showHistory && (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 hide-scrollbar">
                  {savedWorkouts.length === 0 && (
                    <p className="text-center text-[11px] text-gray-400 italic py-4">Nenhum treino salvo.</p>
                  )}
                  {savedWorkouts.slice().reverse().map(w => {
                    const isToday = w.id === todayWorkoutId;
                    return (
                      <div key={w.id} className={`group border rounded-2xl p-4 transition-all ${isToday ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-gray-50 dark:bg-white/[0.02] border-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/5'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-[13px] font-bold text-gray-900 dark:text-white">
                              {w.name}
                            </h4>
                            <p className="text-[10px] font-mono text-gray-400 mt-0.5">{formatDate(w.date)}</p>
                          </div>
                          <button 
                            onClick={() => handleDeleteWorkout(w.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(w.exercises || []).map((ex, i) => (
                            <span key={i} className="text-[9px] bg-white dark:bg-white/10 px-2 py-0.5 rounded-md text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-transparent">
                              {ex.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
