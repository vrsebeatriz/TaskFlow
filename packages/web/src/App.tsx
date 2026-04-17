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
  Activity
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

// Auth
import { LoginModal } from "./components/LoginModal";
import { RegisterModal } from "./components/RegisterModal";

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
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(true);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { user, logout } = useAuth() as any;
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

  if (!user) {
    return (
      <div className="flex min-h-screen bg-[#000000] text-gray-300 font-sans items-center justify-center relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)", backgroundSize: "32px 32px", maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)" }}></div>
        
        <div className="z-10 text-center space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30">
              <Activity className="h-6 w-6 text-blue-400" />
            </div>
            <h1 className="text-3xl font-manrope font-bold text-gray-100 tracking-tight">TaskFlow Pro</h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-manrope font-semibold text-gray-200">Acesse sua conta</h2>
            <p className="text-[13px] text-gray-500 font-mono tracking-widest uppercase">Gerencie suas tarefas com eficiência</p>
          </div>

          <div className="flex flex-col gap-4 mt-8 max-w-xs mx-auto">
            <button 
              onClick={() => { setIsLoginModalOpen(true); setIsRegisterModalOpen(false); }}
              className="w-full bg-blue-600 text-white font-bold tracking-[0.2em] text-[11px] uppercase py-4 px-6 hover:bg-blue-500 transition-colors"
            >
              Fazer Login
            </button>
            <button 
              onClick={() => { setIsRegisterModalOpen(true); setIsLoginModalOpen(false); }}
              className="w-full border border-white/20 text-gray-300 font-bold tracking-[0.2em] text-[11px] uppercase py-4 px-6 hover:bg-white/5 transition-colors"
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
    <div className="flex h-screen bg-[#000000] overflow-hidden text-slate-300 font-sans">
      
      {/* SIDEBAR */}
      <aside className="hidden lg:flex flex-col flex-shrink-0 bg-[#0A0A0A] w-64 h-full border-r border-white/10 z-30">
        <div className="flex h-16 border-b border-white/10 px-6 items-center gap-3">
          <CheckSquare className="text-white" size={20} />
          <span className="text-sm font-medium tracking-tight text-white font-manrope">TaskFlow Pro</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6 hide-scrollbar">
          <div>
            <p className="px-3 text-xs font-medium text-gray-500 mb-2 font-mono uppercase tracking-wider">Overview</p>
            <div className="space-y-0.5">
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'dashboard' 
                    ? 'bg-white/10 text-gray-100' 
                    : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
                }`}
              >
                <LayoutDashboard size={16} />
                <span className="text-[13px] font-medium">Dashboard</span>
              </button>
              <button 
                onClick={() => setActiveTab('kanban')} 
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'kanban' 
                    ? 'bg-white/10 text-gray-100' 
                    : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
                }`}
              >
                <ClipboardList size={16} />
                <span className="text-[13px] font-medium">Kanban Board</span>
              </button>
              <button 
                onClick={() => setActiveTab('pomodoro')} 
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'pomodoro' 
                    ? 'bg-white/10 text-gray-100' 
                    : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
                }`}
              >
                <Timer size={16} />
                <span className="text-[13px] font-medium">Pomodoro Timer</span>
              </button>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-600 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white uppercase font-mono">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-gray-200 truncate">{user.name}</p>
              <p className="text-[11px] text-gray-500 truncate">Workspace User</p>
            </div>
            <button onClick={logout} className="text-gray-500 hover:text-red-400 transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#000000] relative">
        <header className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-white/10 bg-[#000000]/90 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-2 text-[13px] text-gray-400 font-mono">
            <span className="hover:text-gray-100 cursor-pointer transition-colors">Workspace</span>
            <span>/</span>
            <span className="text-gray-100 font-medium">
              {activeTab === 'kanban' ? 'Kanban' : activeTab === 'dashboard' ? 'Dashboard' : 'Timer'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="group relative inline-flex items-center gap-2 bg-blue-600 px-4 py-2 text-[11px] font-bold tracking-[0.2em] text-white transition-all hover:bg-blue-500 font-sans uppercase rounded-none"
            >
              <Plus size={14} className="relative z-10 transition-transform duration-300 group-hover:rotate-90" />
              <span className="relative z-10 hidden sm:inline">Nova Tarefa</span>
            </button>
            <div className="hidden sm:flex items-center bg-white/[0.03] border border-white/10 rounded-md px-3 py-1.5 focus-within:border-white/20 transition-all w-64 group">
              <Search className="text-gray-500 mr-2" size={14} />
              <input className="bg-transparent border-none outline-none text-[13px] text-gray-200 w-full placeholder:text-gray-600" placeholder="Search tasks..." type="text" />
              <span className="text-[10px] font-medium text-gray-500 border border-white/10 rounded px-1.5 py-0.5">/</span>
            </div>
            <button className="w-8 h-8 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center hover:bg-white/[0.05] transition-colors relative">
              <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#000000]"></span>
              <Bell className="text-gray-400" size={14} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 hide-scrollbar relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 animate-in">
            <div>
              <h1 className="text-2xl tracking-tight text-gray-100 font-medium mb-1 font-manrope">
                {activeTab === 'kanban' ? 'Task Board' : activeTab === 'dashboard' ? 'Performance Insights' : 'Focus Timer'}
              </h1>
              <div className="flex items-center gap-2 text-[13px] text-gray-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                System operating normally
              </div>
            </div>
          </div>

          <div key={activeTab} className="animate-in min-h-full flex flex-col">
            {isLoading ? (
              <div className="h-full flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500 animate-pulse font-mono tracking-widest text-sm uppercase">
                  Loading data...
                </div>
              </div>
            ) : activeTab === 'kanban' ? (
              <div className="h-full">
                <KanbanBoard 
                  tasks={tasks} 
                  onTaskMove={handleTaskMove} 
                  onEditTask={setEditingTask} 
                />
              </div>
            ) : activeTab === 'pomodoro' ? (
              <div className="rounded-xl border border-white/10 bg-[#0A0A0A] p-6 lg:p-10 h-full min-h-[500px]">
                <AdvancedPomodoro />
              </div>
            ) : activeTab === 'dashboard' ? (
              <div className="flex flex-col gap-6 pb-10">
                <DashboardStats tasks={tasks} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-white/10 bg-white/[0.01] p-6 flex flex-col">
                    <h3 className="text-sm font-medium text-gray-100 mb-6 font-manrope">Task Distribution</h3>
                    <div className="flex-1">
                      <ProductivityChart tasks={tasks} />
                    </div>
                  </div>
                  
                  <div className="rounded-xl border border-white/10 bg-white/[0.01] p-6 flex flex-col">
                    <h3 className="text-sm font-medium text-gray-100 mb-6 font-manrope">Status Overview</h3>
                    <div className="flex-1">
                      <StatsOverview tasks={tasks} />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.01] p-6">
                  <h3 className="text-sm font-medium text-gray-100 mb-6 font-manrope">Weekly Efficiency</h3>
                  <AnimatedCharts tasks={tasks} />
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