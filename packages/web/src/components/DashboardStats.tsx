import { TrendingUp, CheckCircle, Clock, Target, Zap, AlertTriangle } from "lucide-react";
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
      label: "Total de Tarefas",
      value: total,
      subValue: "",
    },
    {
      icon: CheckCircle,
      label: "Concluídas",
      value: completed,
      subValue: "",
    },
    {
      icon: Clock,
      label: "Pendentes",
      value: pending,
      subValue: "",
    },
    {
      icon: TrendingUp,
      label: "Produtividade",
      value: `${productivity}%`,
      subValue: "",
    },
    {
      icon: Zap,
      label: "Alta Prioridade",
      value: highPriorityTasks,
      subValue: "",
    },
    {
      icon: AlertTriangle,
      label: "Atrasadas",
      value: overdueTasks,
      subValue: "",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-2">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="rounded-xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors"
        >
          <div className="flex items-center justify-between text-gray-400 mb-4">
            <span className="text-[13px] font-medium font-sans">{stat.label}</span>
            <stat.icon className="h-4 w-4 text-gray-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-medium tracking-tight text-gray-100 font-manrope">{stat.value}</span>
          </div>

          {stat.label === "Produtividade" && (
            <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${productivity}%` }}
              ></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}