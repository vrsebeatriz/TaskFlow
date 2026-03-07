import React, { useState } from 'react';
import { Plus, Filter, Search, Calendar, Flag } from 'lucide-react';
import { TaskCard } from './TaskCard';

interface Task {
  id: number;
  description: string;
  content: string;
  priority: string;
  status: string;
  dueDate?: string;
  category?: string;
  createdAt?: string;
}

interface TaskDashboardProps {
  tasks: Task[];
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
  onAddTask: () => void;
  onUpdateTask?: (id: number, updates: Partial<Task>) => void; // Adicione se necessário
}

export function TaskDashboard({ tasks, onComplete, onDelete, onAddTask }: TaskDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filteredTasks = tasks
    .filter(task => {
      if (filter === 'all') return true;
      return task.status === filter;
    })
    .filter(task => {
      if (priorityFilter === 'all') return true;
      return task.priority === priorityFilter;
    })
    .filter(task =>
      task.description.toLowerCase().includes(search.toLowerCase()) ||
      task.content.toLowerCase().includes(search.toLowerCase())
    );

  // Agrupar tasks por prioridade para estatísticas
  const priorityStats = {
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Minhas Tasks</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {tasks.length} tasks no total • {filteredTasks.length} filtradas
          </p>
        </div>
        
        <button
          onClick={onAddTask}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Task</span>
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Filtro de Status */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {(['all', 'pending', 'completed'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === filterType 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {filterType === 'all' && 'Todas'}
                {filterType === 'pending' && 'Pendentes'}
                {filterType === 'completed' && 'Concluídas'}
              </button>
            ))}
          </div>

          {/* Filtro de Prioridade */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {(['all', 'high', 'medium', 'low'] as const).map((priority) => (
              <button
                key={priority}
                onClick={() => setPriorityFilter(priority)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  priorityFilter === priority 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {priority === 'all' && 'Todas'}
                {priority === 'high' && 'Alta'}
                {priority === 'medium' && 'Média'}
                {priority === 'low' && 'Baixa'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Flag className="h-4 w-4 text-red-500 mx-auto mb-1" />
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Alta Prioridade</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">{priorityStats.high}</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <Flag className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Média Prioridade</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">{priorityStats.medium}</div>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <Flag className="h-4 w-4 text-green-500 mx-auto mb-1" />
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Baixa Prioridade</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">{priorityStats.low}</div>
        </div>
      </div>

      {/* Lista de Tasks */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📝</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              {tasks.length === 0 ? 'Nenhuma task criada ainda' : 'Nenhuma task encontrada'}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
              {search || filter !== 'all' || priorityFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca' 
                : 'Comece criando sua primeira task'
              }
            </p>
            {tasks.length === 0 && (
              <button
                onClick={onAddTask}
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Criar sua primeira task
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={onComplete}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}