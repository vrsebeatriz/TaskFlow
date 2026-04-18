import { useEffect, useState } from "react";
import { 
  CheckSquare, 
  LayoutDashboard, 
  ClipboardList, 
  Timer, 
  LogOut, 
  Plus,
  Search,
  Bell,
  Activity,
  Calendar,
  AlertTriangle,
  X,
  Sun,
  Moon
} from "lucide-react";

// Componentes Core
import KanbanBoard from "./components/KanbanBoard";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CreateTaskModal } from "./components/CreateTaskModal";
import { EditTaskModal } from "./components/EditTaskModal";
import { ToastProvider, useToast } from "./components/Toast";
import { AdvancedPomodoro } from "./components/AdvancedPomodoro";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

// Componentes de Estatísticas
import { DashboardStats } from "./components/DashboardStats";
import { StatsOverview } from "./components/StatsOverview";
import { AnimatedCharts, ProductivityChart } from "./components/AnimatedCharts";

// Auth
import { LoginModal } from "./components/LoginModal";
import { RegisterModal } from "./components/RegisterModal";

// Serviços e Tipos
import { tasksService } from "./services/api";
import type { Task, TaskDraft } from "./types";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState("kanban");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(true);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const { user, logout } = useAuth() as any;
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();

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

  const filteredTasks = tasks.filter(task => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      (task.description && task.description.toLowerCase().includes(searchLower)) ||
      (task.category && task.category.toLowerCase().includes(searchLower)) ||
      (task.priority && task.priority.toLowerCase().includes(searchLower))
    );
  });

  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === "completed") return false;
    return new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
  });

  const todayTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === "completed") return false;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return dueDate.toDateString() === today.toDateString();
  });

  const notificationsCount = overdueTasks.length + todayTasks.length;

  if (!user) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#000000] text-gray-800 dark:text-gray-300 font-sans items-center justify-center relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-100" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)", backgroundSize: "32px 32px", maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)" }}></div>
        
        <div className="z-10 text-center space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30">
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-manrope font-bold text-gray-900 dark:text-gray-100 tracking-tight">TaskFlow Pro</h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-manrope font-semibold text-gray-800 dark:text-gray-200">Acesse sua conta</h2>
            <p className="text-[13px] text-gray-500 dark:text-gray-500 font-mono tracking-widest uppercase">Gerencie suas tarefas com eficiência</p>
          </div>

          <div className="flex flex-col gap-4 mt-8 max-w-xs mx-auto">
            <button 
              onClick={() => { setIsLoginModalOpen(true); setIsRegisterModalOpen(false); }}
              className="w-full bg-blue-600 text-white font-bold tracking-[0.2em] text-[11px] uppercase py-4 px-6 hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors shadow-md"
            >
              Fazer Login
            </button>
            <button 
              onClick={() => { setIsRegisterModalOpen(true); setIsLoginModalOpen(false); }}
              className="w-full border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold tracking-[0.2em] text-[11px] uppercase py-4 px-6 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Criar Conta
            </button>
          </div>
        </div>

        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
          onSwitchToRegister={() => {
            setIsLoginModalOpen(false);
            setIsRegisterModalOpen(true);
          }} 
        />
        <RegisterModal 
          isOpen={isRegisterModalOpen} 
          onClose={() => setIsRegisterModalOpen(false)} 
          onSwitchToLogin={() => {
            setIsRegisterModalOpen(false);
            setIsLoginModalOpen(true);
          }} 
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#000000] overflow-hidden text-gray-800 dark:text-slate-300 font-sans transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className="hidden lg:flex flex-col flex-shrink-0 bg-white dark:bg-[#0A0A0A] w-64 h-full border-r border-gray-200 dark:border-white/10 z-30 transition-colors duration-300">
        <div className="flex h-16 border-b border-gray-200 dark:border-white/10 px-6 items-center gap-3">
          <CheckSquare className="text-blue-600 dark:text-white" size={20} />
          <span className="text-sm font-medium tracking-tight text-gray-900 dark:text-white font-manrope">TaskFlow Pro</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6 hide-scrollbar">
          <div>
            <p className="px-3 text-xs font-medium text-gray-500 mb-2 font-mono uppercase tracking-wider">Visão Geral</p>
            <div className="space-y-0.5">
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'dashboard' 
                    ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-gray-100' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <LayoutDashboard size={16} />
                <span className="text-[13px] font-medium">Painel</span>
              </button>
              <button 
                onClick={() => setActiveTab('kanban')} 
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'kanban' 
                    ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-gray-100' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <ClipboardList size={16} />
                <span className="text-[13px] font-medium">Quadro Kanban</span>
              </button>
              <button 
                onClick={() => setActiveTab('pomodoro')} 
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'pomodoro' 
                    ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-gray-100' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <Timer size={16} />
                <span className="text-[13px] font-medium">Timer Pomodoro</span>
              </button>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-600 border border-transparent dark:border-white/10 flex items-center justify-center text-[10px] font-bold text-white uppercase font-mono">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-gray-900 dark:text-gray-200 truncate">{user.name}</p>
              <p className="text-[11px] text-gray-500 truncate">Membro da Equipe</p>
            </div>
            <button onClick={logout} className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-[#000000] relative transition-colors duration-300">
        <header className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-gray-200 dark:border-white/10 bg-white/90 dark:bg-[#000000]/90 backdrop-blur-xl sticky top-0 z-20 transition-colors duration-300">
          <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400 font-mono">
            <span className="hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer transition-colors">Espaço de Trabalho</span>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              {activeTab === 'kanban' ? 'Quadro' : activeTab === 'dashboard' ? 'Painel' : 'Timer'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="group relative inline-flex items-center gap-2 bg-blue-600 px-4 py-2 text-[11px] font-bold tracking-[0.2em] text-white transition-all hover:bg-blue-700 dark:hover:bg-blue-500 font-sans uppercase rounded-none shadow-sm"
            >
              <Plus size={14} className="relative z-10 transition-transform duration-300 group-hover:rotate-90" />
              <span className="relative z-10 hidden sm:inline">Nova Tarefa</span>
            </button>
            <div className="hidden sm:flex items-center bg-gray-100 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-md px-3 py-1.5 focus-within:border-blue-500 dark:focus-within:border-white/20 transition-all w-64 group relative">
              <Search className="text-gray-500 mr-2" size={14} />
              <input 
                className="bg-transparent border-none outline-none text-[13px] text-gray-900 dark:text-gray-200 w-full placeholder:text-gray-400 dark:placeholder:text-gray-600" 
                placeholder="Buscar tarefas..." 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery ? (
                <button onClick={() => setSearchQuery("")} className="absolute right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <X size={12} />
                </button>
              ) : (
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-white/10 rounded px-1.5 py-0.5">/</span>
              )}
            </div>
            
            <button 
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors relative"
            >
              {theme === "light" ? <Moon className="text-gray-600" size={14} /> : <Sun className="text-gray-400" size={14} />}
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors relative"
              >
                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white dark:border-[#000000] flex items-center justify-center text-[8px] font-bold text-white">
                    {notificationsCount}
                  </span>
                )}
                <Bell className={`text-gray-600 dark:text-gray-400 transition-colors ${isNotificationsOpen ? 'text-gray-900 dark:text-gray-200' : ''}`} size={14} />
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in duration-200">
                  <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] flex items-center justify-between">
                    <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">Notificações</h3>
                    <span className="text-[10px] font-mono text-gray-500">{notificationsCount} alertas</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto hide-scrollbar p-2">
                    {notificationsCount === 0 ? (
                      <div className="p-6 text-center text-gray-400 dark:text-gray-500">
                        <Bell className="mx-auto h-6 w-6 opacity-20 mb-2" />
                        <p className="text-[11px] font-mono uppercase tracking-widest">Nenhuma notificação</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {overdueTasks.map(task => (
                          <div key={`overdue-${task.id}`} className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-default border border-transparent hover:border-red-200 dark:hover:border-red-500/20 group">
                            <div className="flex items-start gap-3">
                              <div className="p-1.5 rounded-md bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 mt-0.5">
                                <AlertTriangle size={12} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-medium text-gray-900 dark:text-gray-200 truncate">{task.description}</p>
                                <p className="text-[10px] text-red-500 dark:text-red-400 mt-1">Atrasada</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {todayTasks.map(task => (
                          <div key={`today-${task.id}`} className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-default border border-transparent hover:border-blue-200 dark:hover:border-blue-500/20 group">
                            <div className="flex items-start gap-3">
                              <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 mt-0.5">
                                <Calendar size={12} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-medium text-gray-900 dark:text-gray-200 truncate">{task.description}</p>
                                <p className="text-[10px] text-blue-500 dark:text-blue-400 mt-1">Vence hoje</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 hide-scrollbar relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 animate-in">
            <div>
              <h1 className="text-2xl tracking-tight text-gray-900 dark:text-gray-100 font-medium mb-1 font-manrope">
                {activeTab === 'kanban' ? 'Quadro de Tarefas' : activeTab === 'dashboard' ? 'Desempenho' : 'Timer de Foco'}
              </h1>
              <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Sistema operando normalmente
              </div>
            </div>
          </div>

          <div key={activeTab} className="animate-in min-h-full flex flex-col">
            {isLoading ? (
               <div className="h-full flex items-center justify-center min-h-[400px]">
                 <div className="text-gray-400 dark:text-gray-500 animate-pulse font-mono tracking-widest text-sm uppercase">
                   Carregando dados...
                 </div>
               </div>
            ) : activeTab === 'kanban' ? (
              <div className="h-full">
                <KanbanBoard 
                  tasks={filteredTasks} 
                  onTaskMove={handleTaskMove} 
                  onEditTask={setEditingTask} 
                />
              </div>
            ) : activeTab === 'pomodoro' ? (
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] p-6 lg:p-10 h-full min-h-[500px] shadow-sm">
                <AdvancedPomodoro />
              </div>
            ) : activeTab === 'dashboard' ? (
              <div className="flex flex-col gap-6 pb-10">
                <DashboardStats tasks={filteredTasks} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.01] p-6 flex flex-col shadow-sm">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-6 font-manrope">Distribuição de Tarefas</h3>
                    <div className="flex-1">
                      <ProductivityChart tasks={filteredTasks} />
                    </div>
                  </div>
                  
                  <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.01] p-6 flex flex-col shadow-sm">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-6 font-manrope">Visão Geral de Status</h3>
                    <div className="flex-1">
                      <StatsOverview tasks={filteredTasks} />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.01] p-6 shadow-sm">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-6 font-manrope">Eficiência Semanal</h3>
                  <AnimatedCharts tasks={filteredTasks} />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <CreateTaskModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onAdd={handleAddTask} />
      {editingTask && <EditTaskModal isOpen={true} onClose={() => setEditingTask(null)} task={editingTask} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} />}
    </div>
  );
}

export default App;