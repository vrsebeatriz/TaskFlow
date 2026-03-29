import { useEffect, useState } from "react";
import { 
  CheckSquare, 
  LayoutDashboard, 
  ClipboardList, 
  Timer, 
  LogOut, 
  Plus 
} from "lucide-react";

// Componentes
import KanbanBoard from "./components/KanbanBoard";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginModal } from "./components/LoginModal";
import { RegisterModal } from "./components/RegisterModal";
import { CreateTaskModal } from "./components/CreateTaskModal";
import { EditTaskModal } from "./components/EditTaskModal";
import { ToastProvider, useToast } from "./components/Toast";
import { AdvancedPomodoro } from "./components/AdvancedPomodoro";

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
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState("kanban");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user, logout } = useAuth();
  const { addToast } = useToast();

  // --- CARREGAMENTO ---
  useEffect(() => {
    if (user) {
      loadTasks();
    } else {
      setTasks([]);
      setIsLoading(false);
    }
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

  // --- AÇÕES DE TAREFAS ---
  
  // Função para Arrastar ou Mover Rápido
  const handleTaskMove = async (taskId: number, newStatus: Task["status"]) => {
    try {
      // Atualização Otimista (move na tela antes de salvar)
      const originalTasks = [...tasks];
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

      await tasksService.updateTask(taskId, { status: newStatus });
    } catch (error: any) {
      if (error.response?.status === 404) {
        addToast("Tarefa não encontrada no banco. Sincronizando...", "error");
      } else {
        addToast("Erro ao salvar movimento.", "error");
      }
      loadTasks(); // Reverte para o estado real do banco
    }
  };

  const handleAddTask = async (taskData: TaskDraft) => {
    try {
      const newTask = await tasksService.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      setIsCreateModalOpen(false);
      addToast("Tarefa criada com sucesso!", "success");
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
      addToast("Erro ao editar tarefa.", "error");
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

  // --- RENDERS CONDICIONAIS ---
  if (!user) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="glass-panel p-10 text-center max-w-sm w-full">
        <CheckSquare className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gradient mb-6">TaskFlow Pro</h1>
        <p className="text-slate-400 text-sm mb-8">Faça login para gerenciar suas tarefas.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="w-full py-3 bg-cyan-600 rounded-xl font-bold hover:bg-cyan-500 transition-all"
        >
          Entrar no Sistema
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row gap-6 p-6 md:p-10">
      
      {/* SIDEBAR LATERAL */}
      <aside className="w-full md:w-64 flex flex-col gap-6">
        <div className="glass-panel p-6 flex flex-col gap-8 h-full border-cyan-500/10">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <CheckSquare className="text-white" size={24} />
            </div>
            <span className="font-black text-xl tracking-tighter italic text-gradient uppercase">TaskFlow</span>
          </div>

          {/* Navegação */}
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-white/10 text-cyan-400 border border-white/10' : 'text-slate-500 hover:bg-white/5'}`}
            >
              <LayoutDashboard size={20} /> Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('kanban')} 
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'kanban' ? 'bg-white/10 text-cyan-400 border border-white/10' : 'text-slate-500 hover:bg-white/5'}`}
            >
              <ClipboardList size={20} /> Kanban
            </button>
            <button 
              onClick={() => setActiveTab('pomodoro')} 
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'pomodoro' ? 'bg-white/10 text-cyan-400 border border-white/10' : 'text-slate-500 hover:bg-white/5'}`}
            >
              <Timer size={20} /> Pomodoro
            </button>
          </nav>

          {/* Botão Nova Tarefa */}
          <button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="mt-4 flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all shadow-lg"
          >
            <Plus size={20} /> Nova Tarefa
          </button>

          {/* User & Logout */}
          <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-[10px] font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-slate-300 truncate">{user.name}</span>
            </div>
            <button onClick={logout} className="text-slate-500 hover:text-red-400 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col gap-6">
        <header>
          <h2 className="text-3xl font-bold text-gradient uppercase tracking-tight">
            {activeTab === 'kanban' ? 'Quadro de Tarefas' : activeTab === 'dashboard' ? 'Dashboard Geral' : 'Timer de Foco'}
          </h2>
        </header>

        <section className="flex-1">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-cyan-400 animate-pulse font-mono tracking-widest">SINCRO_DATA...</div>
            </div>
          ) : activeTab === 'kanban' ? (
            <KanbanBoard 
              tasks={tasks} 
              onTaskMove={handleTaskMove} 
              onEditTask={setEditingTask} 
            />
          ) : activeTab === 'pomodoro' ? (
            <div className="glass-panel h-full p-6 md:p-8">
              <AdvancedPomodoro />
            </div>
          ) : (
            <div className="glass-panel p-10 h-full flex items-center justify-center border-dashed border-2 text-slate-600 italic">
               Dashboard em desenvolvimento para Beatriz...
            </div>
          )}
        </section>
      </main>

      {/* MODAIS */}
      <CreateTaskModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onAdd={handleAddTask} 
      />

      {editingTask && (
        <EditTaskModal 
          isOpen={true} 
          onClose={() => setEditingTask(null)} 
          task={editingTask} 
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}

export default App;
