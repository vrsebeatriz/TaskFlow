import { TrendingUp, Calendar, Clock } from "lucide-react";
import type { Task } from "../types";

interface AnimatedChartsProps {
  tasks?: Task[];
}

export function AnimatedCharts({ tasks = [] }: AnimatedChartsProps) {
  const completedTasks = tasks.filter(task => task.status === "completed").length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const calculateAverageCompletionTime = () => {
    const completedTasksWithDates = tasks.filter(
      task => task.status === "completed" && task.createdAt && task.completedAt
    );

    if (completedTasksWithDates.length === 0) return 0;

    const totalTime = completedTasksWithDates.reduce((acc, task) => {
      try {
        const created = new Date(task.createdAt!).getTime();
        const completed = new Date(task.completedAt!).getTime();
        if (isNaN(created) || isNaN(completed)) return acc;
        return acc + (completed - created);
      } catch {
        return acc;
      }
    }, 0);

    const averageTimeMs = totalTime / completedTasksWithDates.length;
    const averageTimeHours = averageTimeMs / (1000 * 60 * 60);

    if (averageTimeHours < 1) {
      const averageTimeMinutes = averageTimeMs / (1000 * 60);
      return Math.round(averageTimeMinutes * 10) / 10 / 60 / 24;
    }
    return Math.round(averageTimeHours * 10) / 10 / 24;
  };

  const avgCompletionTime = calculateAverageCompletionTime();

  const tasksForToday = tasks.filter(task => {
    if (task.status === "completed" || !task.dueDate) return false;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return dueDate.toDateString() === today.toDateString();
  }).length;

  const calculateEfficiencyScore = () => {
    if (avgCompletionTime === 0) return 0;
    if (avgCompletionTime <= 0.1) return 100;
    if (avgCompletionTime <= 1) return 100 - avgCompletionTime * 50;
    return Math.max(0, 50 - (avgCompletionTime - 1) * 50);
  };

  const efficiencyScore = calculateEfficiencyScore();

  const formatTimeDisplay = () => {
    if (avgCompletionTime === 0) return "--";
    const totalHours = avgCompletionTime * 24;
    if (totalHours < 1) return `${Math.round(totalHours * 60)}m`;
    if (totalHours < 24) return `${Math.round(totalHours * 10) / 10}h`;
    return `${Math.round(avgCompletionTime * 10) / 10}d`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-white/[0.02] rounded-xl p-5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-medium text-gray-600 dark:text-gray-400 font-sans">Produtividade</h3>
          <TrendingUp className="h-4 w-4 text-gray-500 dark:text-gray-500" />
        </div>
        <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 font-manrope mb-4">
          {Math.round(completionRate)}%
        </div>
        <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden mb-2">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-[10px] font-mono text-gray-500 dark:text-gray-500 uppercase tracking-widest">
          {completedTasks} de {totalTasks} tarefas concluídas
        </p>
      </div>

      <div className="bg-white dark:bg-white/[0.02] rounded-xl p-5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-medium text-gray-600 dark:text-gray-400 font-sans">Para Hoje</h3>
          <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-500" />
        </div>
        <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 font-manrope mb-4">
          {tasksForToday}
        </div>
        <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden mb-2">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            style={{ width: `${(tasksForToday / Math.max(totalTasks, 1)) * 100}%` }}
          />
        </div>
        <p className="text-[10px] font-mono text-gray-500 dark:text-gray-500 uppercase tracking-widest">
          Tarefas com vencimento para hoje
        </p>
      </div>

      <div className="bg-white dark:bg-white/[0.02] rounded-xl p-5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-medium text-gray-600 dark:text-gray-400 font-sans">Eficiência</h3>
          <Clock className="h-4 w-4 text-gray-500 dark:text-gray-500" />
        </div>
        <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 font-manrope mb-4">
          {Math.round(efficiencyScore)}%
        </div>
        <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden mb-2">
          <div
            className="bg-purple-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
            style={{ width: `${efficiencyScore}%` }}
          />
        </div>
        <p className="text-[10px] font-mono text-gray-500 dark:text-gray-500 uppercase tracking-widest">
          {avgCompletionTime > 0
            ? `Tempo Médio: ${formatTimeDisplay()}`
            : "Nenhuma tarefa concluída ainda"}
        </p>
      </div>
    </div>
  );
}

interface ProductivityChartProps {
  tasks?: Task[];
}

export function ProductivityChart({ tasks = [] }: ProductivityChartProps) {
  const completedTasks = tasks.filter(task => task.status === "completed").length;
  const pendingTasks = tasks.filter(task => task.status === "pending").length;
  const inProgressTasks = tasks.filter(task => task.status === "inProgress").length;
  const totalTasks = tasks.length;

  const completedPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const inProgressPercentage = totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0;
  const pendingPercentage = totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 0;

  return (
    <div className="flex flex-col h-full justify-center space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-xs font-mono text-gray-700 dark:text-gray-300">Concluídas</span>
          <span className="text-xs font-mono text-emerald-400">
            {completedTasks} ({Math.round(completedPercentage)}%)
          </span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
            style={{ width: `${completedPercentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-xs font-mono text-gray-700 dark:text-gray-300">Em Progresso</span>
          <span className="text-xs font-mono text-amber-400">
            {inProgressTasks} ({Math.round(inProgressPercentage)}%)
          </span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400 rounded-full transition-all duration-1000"
            style={{ width: `${inProgressPercentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-xs font-mono text-gray-700 dark:text-gray-300">Pendentes</span>
          <span className="text-xs font-mono text-blue-400">
            {pendingTasks} ({Math.round(pendingPercentage)}%)
          </span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-1000"
            style={{ width: `${pendingPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
