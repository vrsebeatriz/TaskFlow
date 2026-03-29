import { useEffect, useState } from "react";
import { 
  CheckSquare, 
  LayoutDashboard, 
  ClipboardList, 
  Timer, 
  LogOut, 
  Plus 
} from "lucide-react";

// Componentes Core
import KanbanBoard from "./components/KanbanBoard";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CreateTaskModal } from "./components/CreateTaskModal";
import { EditTaskModal } from "./components/EditTaskModal";
import { ToastProvider, useToast } from "./components/Toast";
import { AdvancedPomodoro } from "./components/AdvancedPomodoro";

// Componentes de Estatísticas
import { DashboardStats } from "./components/DashboardStats";
import { StatsOverview } from "./components/StatsOverview";
import { AnimatedCharts, ProductivityChart } from "./components/AnimatedCharts";

// Serviços e Tipos
import { tasksService } from "./services/api";
import type { Task, TaskDraft } from "./types";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState("kanban");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user, logout } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (user) loadTasks();
  }, [user]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const data = await tasksService.getAllTasks();
      setTasks(data);
    } catch (error) {
      addToast("Erro ao sincronizar tarefas.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskMove = async (taskId: number, newStatus: Task["status"]) => {
    try {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      await tasksService.updateTask(taskId, { status: newStatus });
    } catch (error) {
      addToast("Erro ao salvar movimento.", "error");
      loadTasks();
    }
  };

  const handleAddTask = async (taskData: TaskDraft) => {
    try {
      const newTask = await tasksService.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      setIsCreateModalOpen(false);
      addToast("Tarefa criada!", "success");
    } catch (error) {
      addToast("Erro ao criar tarefa.", "error");
    }
  };

  const handleUpdateTask = async (taskId: number, updates: Partial<TaskDraft>) => {
    try {
      const updated = await tasksService.updateTask(taskId, updates);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updated } : t));
      setEditingTask(null);
      addToast("Tarefa atualizada!", "success");
    } catch (error) {
      addToast("Erro ao editar.", "error");
    }
  };

  const handleDeleteTask = async (taskId: number): Promise<boolean> => {
    try {
      await tasksService.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setEditingTask(null);
      addToast("Tarefa excluída.", "info");
      return true;
    } catch (error) {
      addToast("Erro ao excluir.", "error");
      return false;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row gap-6 p-6 md:p-10 relative overflow-x-visible">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-80 flex flex-col gap-6 shrink-0">
        <div className="glass-panel p-6 flex flex-col gap-8 h-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/20">
              <CheckSquare className="text-white" size={22} />
            </div>
            <span className="font-black text-xl tracking-tighter text-gradient">TaskFlow</span>
          </div>

          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 ${
                activeTab === 'dashboard' 
                  ? 'bg-white/20 text-white border border-white/25' 
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <LayoutDashboard size={20} /> Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('kanban')} 
              className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 ${
                activeTab === 'kanban' 
                  ? 'bg-white/20 text-white border border-white/25' 
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <ClipboardList size={20} /> Kanban
            </button>
            <button 
              onClick={() => setActiveTab('pomodoro')} 
              className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 ${
                activeTab === 'pomodoro' 
                  ? 'bg-white/20 text-white border border-white/25' 
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Timer size={20} /> Pomodoro
            </button>
          </nav>

          <button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="mt-4 flex items-center justify-center gap-2 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-2xl font-semibold transition-all border border-white/20 hover:border-white/30"
          >
            <Plus size={20} /> Nova Tarefa
          </button>

          <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                {user.name.charAt(0)}
              </div>
              <span className="text-xs font-medium text-white/70 truncate">{user.name}</span>
            </div>
            <button onClick={logout} className="text-white/40 hover:text-white/80 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col gap-6 min-w-0 overflow-x-visible">
        <header className="flex flex-col gap-1 px-1">
          <p className="text-white/50 text-xs font-bold tracking-[0.2em] uppercase">Overview</p>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">
            {activeTab === 'kanban' ? 'Quadro de Tarefas' : activeTab === 'dashboard' ? 'Performance' : 'Timer'}
          </h2>
        </header>

        {/* Ajuste de Padding e Scroll para evitar o corte */}
        <section className="flex-1 overflow-y-auto overflow-x-visible px-1 py-2 custom-scrollbar">
          <div key={activeTab} className="animate-container fade-transition animate-in">
            {isLoading ? (
              <div className="h-full flex items-center justify-center min-h-[400px]">
                <div className="text-white/50 animate-pulse font-mono tracking-widest text-sm uppercase">
                  Sincronizando...
                </div>
              </div>
            ) : activeTab === 'kanban' ? (
              <div className="kanban-board-container overflow-x-visible">
                <KanbanBoard 
                  tasks={tasks} 
                  onTaskMove={handleTaskMove} 
                  onEditTask={setEditingTask} 
                />
              </div>
            ) : activeTab === 'pomodoro' ? (
              <div className="glass-panel h-full p-6 md:p-8">
                <AdvancedPomodoro />
              </div>
            ) : activeTab === 'dashboard' ? (
              <div className="flex flex-col gap-8 px-2 pb-10">
                <DashboardStats tasks={tasks} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="glass-panel p-6">
                    <h3 className="text-xs font-bold text-white/60 mb-6 uppercase tracking-wider">
                      Distribuição
                    </h3>
                    <ProductivityChart tasks={tasks} />
                  </div>
                  
                  <div className="glass-panel p-6">
                    <h3 className="text-xs font-bold text-white/60 mb-6 uppercase tracking-wider">
                      Status
                    </h3>
                    <StatsOverview tasks={tasks} />
                  </div>
                </div>

                <div className="glass-panel p-6">
                  <h3 className="text-xs font-bold text-white/60 mb-6 uppercase tracking-wider">
                    Eficiência
                  </h3>
                  <AnimatedCharts tasks={tasks} />
                </div>
              </div>
            ) : (
              <div className="glass-panel p-10 h-full flex items-center justify-center border-dashed border-2 border-white/10 text-white/40 italic text-center">
                Selecione uma opção no menu lateral.
              </div>
            )}
          </div>
        </section>
      </main>

      <CreateTaskModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onAdd={handleAddTask} />
      {editingTask && <EditTaskModal isOpen={true} onClose={() => setEditingTask(null)} task={editingTask} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} />}
    </div>
  );
}

export default App;