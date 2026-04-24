import { useState, useEffect } from 'react';
import { dietService } from '../services/api';
import { useToast } from './Toast';
import { Trash2, Utensils, Calendar, ChevronDown, ChevronUp, X } from 'lucide-react';

interface DietDashboardProps {
  searchQuery?: string;
}

export function DietDashboard({ searchQuery = "" }: DietDashboardProps) {
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [newMeal, setNewMeal] = useState({ name: '', calories: '', protein: '', carbs: '', fats: '' });
  
  const { addToast } = useToast();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handler = () => setIsAdding(true);
    window.addEventListener('lifeos:add-diet', handler);
    return () => window.removeEventListener('lifeos:add-diet', handler);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await dietService.getAll();
      setMeals(data);
    } catch (error) {
      addToast("Erro ao carregar dieta.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = async () => {
    if (!newMeal.name) {
      addToast("O que você comeu?", "error");
      return;
    }
    try {
      const meal = await dietService.create({ 
        ...newMeal, 
        date: new Date().toISOString() 
      });
      setMeals([meal, ...meals]);
      setNewMeal({ name: '', calories: '', protein: '', carbs: '', fats: '' });
      setIsAdding(false);
      addToast("Refeição registrada!", "success");
    } catch (error) {
      addToast("Erro ao salvar.", "error");
    }
  };

  const handleDeleteMeal = async (id: number) => {
    try {
      await dietService.delete(id);
      setMeals(meals.filter(m => m.id !== id));
      addToast("Removido.", "info");
    } catch (error) {
      addToast("Erro ao excluir.", "error");
    }
  };

  const isToday = (dateStr: string | undefined) => {
    if (!dateStr) return false;
    try {
      return dateStr.startsWith(today);
    } catch {
      return false;
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-mono text-sm">Carregando Dieta...</div>;

  const filteredMeals = meals.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const todayMeals = filteredMeals.filter(m => isToday(m.date));
  const pastMeals = filteredMeals.filter(m => !isToday(m.date));

  const groupedPast: Record<string, any[]> = {};
  pastMeals.forEach(m => {
    const dateKey = m.date ? m.date.split('T')[0] : 'sem-data';
    if (!groupedPast[dateKey]) groupedPast[dateKey] = [];
    groupedPast[dateKey].push(m);
  });

  const sortedDates = Object.keys(groupedPast).sort((a, b) => b.localeCompare(a));

  const totals = todayMeals.reduce((acc, m) => ({
    cal: acc.cal + (Number(m.calories) || 0),
    prot: acc.prot + (Number(m.protein) || 0),
    carb: acc.carb + (Number(m.carbs) || 0),
    fat: acc.fat + (Number(m.fats) || 0)
  }), { cal: 0, prot: 0, carb: 0, fat: 0 });

  return (
    <div className="animate-in fade-in zoom-in duration-500">
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-10 items-start">
        
        {/* COLUNA ESQUERDA: REFEIÇÕES DE HOJE */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">Hoje</h3>
            <span className="text-[11px] font-mono text-gray-400">{todayMeals.length} refeições</span>
          </div>

          {isAdding && (
            <div className="mb-6 bg-white/80 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-xl animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Nova Refeição</h3>
                  <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white"><X size={18} /></button>
                </div>
                <div className="space-y-3">
                  <input 
                    autoFocus
                    className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-3 text-[14px] outline-none text-gray-900 dark:text-white placeholder:text-gray-400" 
                    placeholder="O que você comeu?" 
                    value={newMeal.name}
                    onChange={e => setNewMeal({...newMeal, name: e.target.value})}
                  />
                  <div className="grid grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Kcal</label>
                      <input type="number" className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl px-3 py-3 text-[14px] text-center outline-none text-gray-900 dark:text-white" placeholder="0" value={newMeal.calories} onChange={e => setNewMeal({...newMeal, calories: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Prot</label>
                      <input type="number" className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl px-3 py-3 text-[14px] text-center outline-none text-gray-900 dark:text-white" placeholder="0" value={newMeal.protein} onChange={e => setNewMeal({...newMeal, protein: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Carb</label>
                      <input type="number" className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl px-3 py-3 text-[14px] text-center outline-none text-gray-900 dark:text-white" placeholder="0" value={newMeal.carbs} onChange={e => setNewMeal({...newMeal, carbs: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Gord</label>
                      <input type="number" className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl px-3 py-3 text-[14px] text-center outline-none text-gray-900 dark:text-white" placeholder="0" value={newMeal.fats} onChange={e => setNewMeal({...newMeal, fats: e.target.value})} />
                    </div>
                  </div>
                  <button 
                    onClick={handleAddMeal}
                    className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-[13px] shadow-md"
                  >
                    Adicionar
                  </button>
                </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayMeals.length === 0 && (
              <p className="col-span-full text-center text-[12px] text-gray-400 italic py-12 bg-white/30 dark:bg-white/[0.01] border border-dashed border-gray-200 dark:border-white/5 rounded-3xl">Nenhuma refeição registrada hoje.</p>
            )}
            {todayMeals.map(meal => (
              <div key={meal.id} className="bg-white/50 dark:bg-[#111111]/80 border border-gray-200 dark:border-white/10 rounded-2xl p-5 backdrop-blur-md flex justify-between items-center group transition-all hover:bg-gray-50 dark:hover:bg-[#161616]">
                 <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400">
                      <Utensils size={18} />
                    </div>
                    <div>
                       <h4 className="text-[15px] font-bold text-gray-900 dark:text-white">{meal.name}</h4>
                       <p className="text-[11px] text-gray-500 font-mono mt-1">{meal.calories} kcal • P: {meal.protein}g • C: {meal.carbs}g • G: {meal.fats}g</p>
                    </div>
                 </div>
                 <button onClick={() => handleDeleteMeal(meal.id)} className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2">
                   <Trash2 size={16} />
                 </button>
              </div>
            ))}
          </div>
        </div>

        {/* COLUNA DIREITA: RESUMO E HISTÓRICO */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8 mt-10 lg:mt-0">
          <div className="bg-white/50 dark:bg-[#111111]/80 border border-gray-200 dark:border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-6 text-center">Macros Totais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100/50 dark:bg-white/5 rounded-2xl p-4 text-center border border-transparent dark:border-white/5">
                 <p className="text-[9px] font-mono text-gray-400 uppercase mb-1">Kcal</p>
                 <p className="text-[20px] font-bold text-gray-900 dark:text-white">{totals.cal}</p>
              </div>
              <div className="bg-gray-100/50 dark:bg-white/5 rounded-2xl p-4 text-center border border-transparent dark:border-white/5">
                 <p className="text-[9px] font-mono text-gray-400 uppercase mb-1">Prot</p>
                 <p className="text-[20px] font-bold text-orange-400">{totals.prot}g</p>
              </div>
              <div className="bg-gray-100/50 dark:bg-white/5 rounded-2xl p-4 text-center border border-transparent dark:border-white/5">
                 <p className="text-[9px] font-mono text-gray-400 uppercase mb-1">Carbs</p>
                 <p className="text-[20px] font-bold text-blue-400">{totals.carb}g</p>
              </div>
              <div className="bg-gray-100/50 dark:bg-white/5 rounded-2xl p-4 text-center border border-transparent dark:border-white/5">
                 <p className="text-[9px] font-mono text-gray-400 uppercase mb-1">Gord</p>
                 <p className="text-[20px] font-bold text-yellow-400">{totals.fat}g</p>
              </div>
            </div>
          </div>

          <div className="bg-white/50 dark:bg-[#111111]/80 border border-gray-200 dark:border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex justify-between items-center text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-4"
            >
              <span className="flex items-center gap-2 font-mono"><Calendar size={12} /> Histórico</span>
              {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            {showHistory && (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 hide-scrollbar">
                {sortedDates.length === 0 && (
                  <p className="text-center text-[11px] text-gray-400 italic py-4">Nenhum registro anterior.</p>
                )}
                {sortedDates.map(date => (
                  <div key={date} className="border-l border-gray-200 dark:border-white/10 pl-4 py-1">
                    <p className="text-[11px] font-bold text-gray-900 dark:text-white mb-2 font-mono">{date}</p>
                    <div className="space-y-1">
                      {groupedPast[date].map(m => (
                        <div key={m.id} className="text-[12px] text-gray-500 flex justify-between">
                          <span>{m.name}</span>
                          <span className="font-mono text-[10px]">{m.calories} kcal</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
