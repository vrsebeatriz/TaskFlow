import { TrendingUp, CheckCircle, Clock, Target, Zap, Users } from "lucide-react";
import type { Task } from "../types";

interface DashboardStatsProps {
  tasks: Task[];
}

export function DashboardStats({ tasks }: DashboardStatsProps) {
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === "completed").length;
  const pending = total - completed;
  const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;

  const highPriorityTasks = tasks.filter(task => task.priority === "high").length;
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === "completed") return false;
    return new Date(task.dueDate) < new Date();
  }).length;

  const statCards = [
    {
      icon: Target,
      label: "Total Tasks",
      value: total,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-700 dark:text-blue-300",
    },
    {
      icon: CheckCircle,
      label: "Concluídas",
      value: completed,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-700 dark:text-green-300",
    },
    {
      icon: Clock,
      label: "Pendentes",
      value: pending,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-700 dark:text-orange-300",
    },
    {
      icon: TrendingUp,
      label: "Produtividade",
      value: `${productivity}%`,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-700 dark:text-purple-300",
    },
    {
      icon: Zap,
      label: "Alta Prioridade",
      value: highPriorityTasks,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      textColor: "text-red-700 dark:text-red-300",
    },
    {
      icon: Users,
      label: "Atrasadas",
      value: overdueTasks,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      textColor: "text-yellow-700 dark:text-yellow-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="
            bg-white dark:bg-gray-800 rounded-2xl p-4
            shadow-lg hover:shadow-xl transition-all duration-300
            transform hover:scale-105 border border-gray-100 dark:border-gray-700
            group
          "
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {stat.label}
              </p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
            <div
              className={`
                p-2 rounded-xl bg-gradient-to-r ${stat.color}
                transform group-hover:scale-110 group-hover:rotate-12
                transition-all duration-300 flex-shrink-0 ml-2
              `}
            >
              <stat.icon className="h-5 w-5 text-white" />
            </div>
          </div>

          {stat.label === "Produtividade" && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${productivity}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
