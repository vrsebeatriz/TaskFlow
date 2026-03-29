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
      iconBg: "bg-white/10",
      iconColor: "text-white/80",
      valueColor: "text-white",
    },
    {
      icon: CheckCircle,
      label: "Concluídas",
      value: completed,
      iconBg: "bg-white/10",
      iconColor: "text-white/80",
      valueColor: "text-white",
    },
    {
      icon: Clock,
      label: "Pendentes",
      value: pending,
      iconBg: "bg-white/10",
      iconColor: "text-white/80",
      valueColor: "text-white",
    },
    {
      icon: TrendingUp,
      label: "Produtividade",
      value: `${productivity}%`,
      iconBg: "bg-white/10",
      iconColor: "text-white/80",
      valueColor: "text-white",
    },
    {
      icon: Zap,
      label: "Alta Prioridade",
      value: highPriorityTasks,
      iconBg: "bg-white/10",
      iconColor: "text-white/80",
      valueColor: "text-white",
    },
    {
      icon: Users,
      label: "Atrasadas",
      value: overdueTasks,
      iconBg: "bg-white/10",
      iconColor: "text-white/80",
      valueColor: "text-white",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="
            glass-panel p-4
            transition-all duration-300
            transform hover:scale-[1.02]
            group cursor-pointer
          "
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-white/50 mb-1">
                {stat.label}
              </p>
              <p className={`text-2xl font-bold ${stat.valueColor}`}>{stat.value}</p>
            </div>
            <div
              className={`
                p-2 rounded-xl ${stat.iconBg}
                transform group-hover:scale-110 group-hover:rotate-6
                transition-all duration-300 flex-shrink-0 ml-2
              `}
            >
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
          </div>

          {stat.label === "Produtividade" && (
            <div className="mt-3">
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div
                  className="bg-white/40 h-1.5 rounded-full transition-all duration-1000"
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