import { TrendingUp, CheckCircle, Clock, List, AlertTriangle } from "lucide-react";
import type { Task } from "../types";

interface StatsOverviewProps {
  tasks: Task[];
}

export function StatsOverview({ tasks }: StatsOverviewProps) {
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === "completed").length;
  const pending = total - completed;
  const highPriority = tasks.filter(task => task.priority === "high").length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === "completed") return false;
    return new Date(task.dueDate) < new Date();
  }).length;

  const statCards = [
    {
      icon: List,
      label: "Total",
      value: total,
      color: "bg-white/10 text-white/80",
      description: "Tasks totais",
    },
    {
      icon: CheckCircle,
      label: "Concluídas",
      value: completed,
      color: "bg-white/10 text-white/80",
      description: "Tasks finalizadas",
    },
    {
      icon: Clock,
      label: "Pendentes",
      value: pending,
      color: "bg-white/10 text-white/80",
      description: "Em andamento",
    },
    {
      icon: AlertTriangle,
      label: "Atrasadas",
      value: overdueTasks,
      color: "bg-white/10 text-white/80",
      description: "Fora do prazo",
    },
  ];

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp className="h-5 w-5 text-white/60" />
        <h3 className="text-lg font-semibold text-white">Estatísticas em Tempo Real</h3>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-white/50 mb-2">
          <span>Progresso Geral</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-white/40 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/30 mt-1">
          <span>{completed} concluídas</span>
          <span>{pending} pendentes</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
            <div className={`inline-flex p-2 rounded-lg ${stat.color} mb-2`}>
              <stat.icon className="h-4 w-4" />
            </div>
            <div className="text-xl font-bold text-white">{stat.value}</div>
            <div className="text-xs font-medium text-white/70">{stat.label}</div>
            <div className="text-xs text-white/40 mt-1">{stat.description}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-white/50">Prioridade Alta</div>
            <div className="font-semibold text-white">{highPriority}</div>
          </div>
          <div className="text-center">
            <div className="text-white/50">Taxa de Conclusão</div>
            <div className="font-semibold text-white">{Math.round(progress)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}