import React, { useState } from "react";
import { Check, Trash2, Flag, Edit3, Calendar, Star } from "lucide-react";

// Definir tipos
type Task = {
  id: number;
  description: string;
  priority: "low" | "medium" | "high";
  status: string;
  dueDate?: string;
  createdAt?: string;
  completedAt?: string;
};

interface TaskCardProps {
  task: Task;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit?: (id: number, updates: Partial<Task>) => void;
}

export function TaskCard({ task, onComplete, onDelete }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const priorityConfig = {
    low: {
      color: "from-green-400 to-green-500",
      badge: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      icon: "🟢",
    },
    medium: {
      color: "from-yellow-400 to-yellow-500",
      badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      icon: "🟡",
    },
    high: {
      color: "from-red-400 to-red-500",
      badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      icon: "🔴",
    },
  } as const;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed";

  return (
    <div
      className={`
        bg-white dark:bg-gray-800 rounded-2xl p-6 mb-4 
        shadow-lg hover:shadow-xl transition-all duration-300 
        transform hover:scale-[1.02] border-l-4
        ${task.status === "completed"
          ? "border-l-gray-300 opacity-75"
          : isOverdue
          ? "border-l-red-500 animate-pulse"
          : `border-l-${task.priority === "high" ? "red" : task.priority === "medium" ? "yellow" : "green"}-500`
        }
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between">
        {/* Checkbox Estilizado */}
        <button
          onClick={() => onComplete(task.id)}
          className={`
            mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center 
            transition-all duration-200 transform hover:scale-110
            ${task.status === "completed"
              ? "bg-gradient-to-r from-green-400 to-green-500 border-green-500 shadow-lg shadow-green-500/25"
              : "border-gray-300 dark:border-gray-600 hover:border-green-500 bg-white dark:bg-gray-700"
            }
          `}
        >
          {task.status === "completed" && <Check className="h-3 w-3 text-white" />}
        </button>

        {/* Conteúdo */}
        <div className="flex-1 mx-4">
          <p
            className={`
            text-lg font-semibold transition-all duration-200
            ${task.status === "completed" ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"}
            ${isHovered && task.status !== "completed" ? "text-blue-600 dark:text-blue-400" : ""}
          `}
          >
            {task.description}
          </p>

          {/* Tags e Metadados */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {/* Prioridade */}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${priorityConfig[task.priority].badge}`}>
              <Flag className="h-3 w-3 mr-1" />
              {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Média" : "Baixa"}
            </span>

            {/* Data de Vencimento */}
            {task.dueDate && (
              <span
                className={`
                inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${isOverdue ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"}
              `}
              >
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                {isOverdue && <span className="ml-1">⚠️</span>}
              </span>
            )}

            {/* Destaque */}
            {task.priority === "high" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 dark:from-orange-900/30 dark:to-yellow-900/30 dark:text-orange-300">
                <Star className="h-3 w-3 mr-1" />
                Importante
              </span>
            )}
          </div>

          {/* Detalhes Expandíveis */}
          {isExpanded && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl animate-slide-in">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">ID:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">#{task.id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Status:</span>
                  <span
                    className={`ml-2 capitalize ${task.status === "completed" ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}>
                    {task.status === "completed" ? "Concluída" : "Pendente"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className={`flex items-center space-x-2 transition-all duration-200 ${isHovered ? "opacity-100" : "opacity-70"}`}>
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all duration-200 transform hover:scale-110">
            <Edit3 className="h-4 w-4" />
          </button>

          <button onClick={() => onDelete(task.id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all duration-200 transform hover:scale-110">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
