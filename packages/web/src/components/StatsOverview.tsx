import React from 'react';
import { TrendingUp, CheckCircle, Clock, List, AlertTriangle } from 'lucide-react';

interface Task {
  id: number;
  description: string;
  priority: string;
  status: string;
  dueDate?: string;
}

interface StatsOverviewProps {
  tasks: Task[];
}

export function StatsOverview({ tasks }: StatsOverviewProps) {
  // Calcular estatísticas baseadas nas tasks
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === 'completed').length;
  const pending = total - completed;
  const highPriority = tasks.filter(task => task.priority === 'high').length;
  
  const progress = total > 0 ? (completed / total) * 100 : 0;

  // Tasks atrasadas
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === 'completed') return false;
    return new Date(task.dueDate) < new Date();
  }).length;

  const statCards = [
    {
      icon: List,
      label: 'Total',
      value: total,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
      description: 'Tasks totais'
    },
    {
      icon: CheckCircle,
      label: 'Concluídas',
      value: completed,
      color: 'text-green-500 bg-green-50 dark:bg-green-900/20',
      description: 'Tasks finalizadas'
    },
    {
      icon: Clock,
      label: 'Pendentes',
      value: pending,
      color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
      description: 'Em andamento'
    },
    {
      icon: AlertTriangle,
      label: 'Atrasadas',
      value: overdueTasks,
      color: 'text-red-500 bg-red-50 dark:bg-red-900/20',
      description: 'Fora do prazo'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Estatísticas em Tempo Real</h3>
      </div>

      {/* Barra de Progresso Geral */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progresso Geral</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{completed} concluídas</span>
          <span>{pending} pendentes</span>
        </div>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className={`inline-flex p-2 rounded-lg ${stat.color} mb-2`}>
              <stat.icon className="h-4 w-4" />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{stat.label}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.description}</div>
          </div>
        ))}
      </div>

      {/* Informações Adicionais */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-gray-600 dark:text-gray-400">Prioridade Alta</div>
            <div className="font-semibold text-gray-900 dark:text-white">{highPriority}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 dark:text-gray-400">Taxa de Conclusão</div>
            <div className="font-semibold text-gray-900 dark:text-white">{Math.round(progress)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}