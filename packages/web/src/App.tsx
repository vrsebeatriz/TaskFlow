import { useEffect, useState } from "react";
import { CheckSquare } from "lucide-react";
import { Header } from "./components/Header";
import { DashboardStats } from "./components/DashboardStats";
import { TaskCard } from "./components/TaskCard";
import { CreateTaskModal } from "./components/CreateTaskModal";
import { FloatingActionButton } from "./components/FloatingActionButton";
import { ToastProvider, useToast } from "./components/Toast";
import { KanbanBoard } from "./components/KanbanBoard";
import { AnimatedCharts, ProductivityChart } from "./components/AnimatedCharts";
import { AdvancedPomodoro } from "./components/AdvancedPomodoro";
import { StatsOverview } from "./components/StatsOverview";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginModal } from "./components/LoginModal";
import { RegisterModal } from "./components/RegisterModal";
import { tasksService } from "./services/api";
import type { Task, TaskDraft } from "./types";

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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { user, loading: authLoading, logout } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (user) {
      void loadTasks();
      return;
    }

    setTasks([]);
    setIsLoading(false);
    setLoadError(null);
  }, [user]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const tasksFromApi = await tasksService.getAllTasks() as Task[];
      const formattedTasks: Task[] = tasksFromApi.map((task: Task) => ({
        ...task,
        content: task.description,
        category: task.category || "work",
      }));

      setTasks(formattedTasks);
      setLoadError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar tasks";
      console.error("Erro ao carregar tasks:", error);
      setTasks([]);
      setLoadError(message);
      addToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async (taskData: TaskDraft) => {
    try {
      const newTaskFromApi = await tasksService.createTask(taskData) as Task;
      const newTask: Task = {
        ...newTaskFromApi,
        content: newTaskFromApi.description,
        category: taskData.category || "work",
      };

      setTasks(prev => [newTask, ...prev]);
      setLoadError(null);
      addToast("Task criada com sucesso! 🎉", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao criar task";
      console.error("Erro ao criar task:", error);
      addToast(message, "error");
    }
  };

  const handleComplete = async (id: number) => {
    try {
      const updatedTask = await tasksService.completeTask(id) as Task;

      setTasks(prev =>
        prev.map(task =>
          task.id === id
            ? {
                ...task,
                status: "completed",
                completedAt: updatedTask.completedAt,
              }
            : task
        )
      );

      addToast("Task concluída! 🎊", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao marcar task como concluída";
      console.error("Erro ao completar task:", error);
      addToast(message, "error");
    }
  };

  const handleTaskMove = async (taskId: number, newStatus: Task["status"]) => {
    try {
      await tasksService.updateTask(taskId, { status: newStatus });
      setTasks(prev => prev.map(task => (task.id === taskId ? { ...task, status: newStatus } : task)));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar status da task";
      console.error("Erro ao mover task:", error);
      addToast(message, "error");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await tasksService.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
      addToast("Task removida", "info");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao remover task";
      console.error("Erro ao deletar task:", error);
      addToast(message, "error");
    }
  };

  const handleUpdateTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
  };

  const Dashboard = ({
    onComplete,
    onDelete,
    tasks,
  }: {
    onComplete: (id: number) => void;
    onDelete: (id: number) => void;
    tasks: Task[];
  }) => {
    return (
      <div className="space-y-8">
        <DashboardStats tasks={tasks} />
        <div className="grid grid-cols-1 items-start lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <AnimatedCharts tasks={tasks} />
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Últimas Tasks
              </h3>
              <div className="space-y-4">
                {tasks.slice(0, 4).map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={onComplete}
                    onDelete={onDelete}
                  />
                ))}
                {tasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>Nenhuma task encontrada</p>
                    <p className="text-sm mt-1">Crie sua primeira task usando o botão abaixo</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1 space-y-8 self-start">
            <StatsOverview tasks={tasks} />
            <ProductivityChart tasks={tasks} />
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    {
      id: "dashboard",
      label: "📊 Dashboard",
      component: <Dashboard onComplete={handleComplete} onDelete={handleDelete} tasks={tasks} />,
    },
    {
      id: "kanban",
      label: "📋 Kanban",
      component: (
        <KanbanBoard
          tasks={tasks}
          onAdd={handleAddTask}
          onTaskMove={handleTaskMove}
          onDelete={handleDelete}
          onUpdateTasks={handleUpdateTasks}
        />
      ),
    },
    {
      id: "pomodoro",
      label: "⏰ Foco",
      component: <AdvancedPomodoro />,
    },
  ];

  const activeTabComponent = tabs.find(tab => tab.id === activeTab)?.component;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg inline-block mb-6">
            <CheckSquare className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            TaskFlow Pro
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            Organize suas tasks de forma inteligente
          </p>
          <div className="space-y-4">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Entrar
            </button>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cadastrar
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Header user={user} onLogout={logout} />

      <div className="pt-20 pb-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-2xl p-1 shadow-lg mb-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200
                  ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-transparent"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[600px]">
            {loadError && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                {loadError}
              </div>
            )}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando tasks...</span>
              </div>
            ) : (
              activeTabComponent
            )}
          </div>
        </div>
      </div>

      <FloatingActionButton onClick={() => setIsTaskModalOpen(true)} />

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onAdd={handleAddTask}
      />

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

export default App;
