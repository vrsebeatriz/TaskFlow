import { CheckCircle, Clock, List, AlertTriangle } from "lucide-react";
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
      color: "bg-white dark:bg-white/[0.02] text-gray-600 dark:text-gray-400",
      description: "Tarefas totais",
    },
    {
      icon: CheckCircle,
      label: "Concluídas",
      value: completed,
      color: "bg-emerald-500/10 text-emerald-400",
      description: "Tarefas finalizadas",
    },
    {
      icon: Clock,
      label: "Pendentes",
      value: pending,
      color: "bg-blue-500/10 text-blue-400",
      description: "Em andamento",
    },
    {
      icon: AlertTriangle,
      label: "Atrasadas",
      value: overdueTasks,
      color: "bg-red-500/10 text-red-400",
      description: "Fora do prazo",
    },
  ];

  return (
    <div className="flex flex-col flex-1">
      <div className="mb-6">
        <div className="flex justify-between text-[11px] font-mono uppercase tracking-[0.1em] text-gray-500 dark:text-gray-500 mb-2">
          <span>Progresso Geral</span>
          <span className="text-gray-700 dark:text-gray-300 font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-gray-600 mt-2">
          <span>{completed} concluídas</span>
          <span>{pending} pendentes</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
        {statCards.map((stat, index) => (
          <div key={index} className="text-center p-4 bg-white dark:bg-white/[0.02] rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:bg-white/[0.04] transition-colors">
            <div className={`inline-flex p-2 rounded-lg ${stat.color} mb-3`}>
              <stat.icon className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-manrope">{stat.value}</div>
            <div className="text-[11px] font-mono font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mt-1">{stat.label}</div>
            <div className="text-[10px] font-sans text-gray-600 mt-1">{stat.description}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center bg-gray-50 dark:bg-white/[0.01] p-4 pb-5 rounded-lg">
            <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500">Prioridade Alta</div>
            <div className="font-medium text-gray-800 dark:text-gray-200 mt-2 text-lg">{highPriority}</div>
          </div>
          <div className="text-center bg-gray-50 dark:bg-white/[0.01] p-4 pb-5 rounded-lg">
            <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500">Taxa de Conclusão</div>
            <div className="font-medium text-gray-800 dark:text-gray-200 mt-2 text-lg">{Math.round(progress)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}