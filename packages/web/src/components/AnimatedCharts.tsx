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

    if (completedTasksWithDates.length === 0) {
      return 0;
    }

    const totalTime = completedTasksWithDates.reduce((acc, task) => {
      try {
        const created = new Date(task.createdAt!).getTime();
        const completed = new Date(task.completedAt!).getTime();

        if (isNaN(created) || isNaN(completed)) {
          return acc;
        }

        return acc + (completed - created);
      } catch {
        return acc;
      }
    }, 0);

    const averageTimeMs = totalTime / completedTasksWithDates.length;
    const averageTimeHours = averageTimeMs / (1000 * 60 * 60);

    if (averageTimeHours < 1) {
      const averageTimeMinutes = averageTimeMs / (1000 * 60);
      const roundedTime = Math.round(averageTimeMinutes * 10) / 10;
      return roundedTime / 60 / 24;
    }

    const roundedTime = Math.round(averageTimeHours * 10) / 10;
    return roundedTime / 24;
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

    let efficiency = 0;
    if (avgCompletionTime <= 0.1) {
      efficiency = 100;
    } else if (avgCompletionTime <= 1) {
      efficiency = 100 - avgCompletionTime * 50;
    } else {
      efficiency = Math.max(0, 50 - (avgCompletionTime - 1) * 50);
    }

    return Math.min(efficiency, 100);
  };

  const efficiencyScore = calculateEfficiencyScore();

  const formatTimeDisplay = () => {
    if (avgCompletionTime === 0) return "--";

    const totalHours = avgCompletionTime * 24;

    if (totalHours < 1) {
      const minutes = Math.round(totalHours * 60);
      return `${minutes}m`;
    }

    if (totalHours < 24) {
      return `${Math.round(totalHours * 10) / 10}h`;
    }

    return `${Math.round(avgCompletionTime * 10) / 10}d`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Produtividade</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {Math.round(completionRate)}%
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {completedTasks} de {totalTasks} tasks concluídas
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Para Hoje</h3>
            <Calendar className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {tasksForToday}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(tasksForToday / Math.max(totalTasks, 1)) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Tasks com vencimento para hoje
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Eficiência</h3>
            <Clock className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {formatTimeDisplay()}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${efficiencyScore}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {avgCompletionTime > 0
              ? `Tempo médio (${Math.round(efficiencyScore)}% eficiência)`
              : "Nenhuma task concluída ainda"}
          </p>
        </div>
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Distribuição de Tasks</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Concluídas</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {completedTasks} ({Math.round(completedPercentage)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${completedPercentage}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Em Progresso</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {inProgressTasks} ({Math.round(inProgressPercentage)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${inProgressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Pendentes</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {pendingTasks} ({Math.round(pendingPercentage)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${pendingPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
