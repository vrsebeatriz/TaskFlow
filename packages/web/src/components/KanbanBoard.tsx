import React, { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult, DraggableLocation } from "@hello-pangea/dnd";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
import { CreateTaskModal } from "./CreateTaskModal";

// Tipos (mantenha os mesmos)
type Task = {
  id: string | number;
  content: string;
  description: string;
  priority: "low" | "medium" | "high";
  status?: "pending" | "inProgress" | "completed" | string;
  dueDate?: string;
  category?: string;
};

interface KanbanBoardProps {
  tasks?: Task[];
  onUpdateTasks?: (tasks: Task[]) => void;
}

type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

const defaultColumns = (): Record<string, Column> => ({
  todo: {
    id: "todo",
    title: "📝 To Do",
    tasks: [],
  },
  doing: {
    id: "doing",
    title: "⚡ Doing",
    tasks: [],
  },
  done: {
    id: "done",
    title: "✅ Done",
    tasks: [],
  },
});

// Função para reordenar a lista
const reorder = (list: Task[], startIndex: number, endIndex: number): Task[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// Função para mover entre colunas
const move = (
  source: Task[],
  destination: Task[],
  droppableSource: DraggableLocation,
  droppableDestination: DraggableLocation
) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result: Record<string, Task[]> = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks = [], onUpdateTasks }) => {
  const [columns, setColumns] = useState<Record<string, Column>>(defaultColumns());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Mapeamento de status para colunas
  const getStatusFromColumn = (columnId: string): string => {
    const statusMap: Record<string, string> = {
      todo: "pending",
      doing: "inProgress", 
      done: "completed"
    };
    return statusMap[columnId] || "pending";
  };

  // Atualizar colunas quando tasks mudam
  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      setColumns(defaultColumns());
      return;
    }

    const cols = defaultColumns();
    
    tasks.forEach(task => {
      // Garantir compatibilidade entre content e description
      const compatibleTask = {
        ...task,
        content: task.content || task.description || "Task sem nome",
        description: task.description || task.content || "Task sem nome"
      };

      const status = compatibleTask.status || "pending";
      if (status === "completed") {
        cols.done.tasks.push(compatibleTask);
      } else if (status === "inProgress") {
        cols.doing.tasks.push(compatibleTask);
      } else {
        cols.todo.tasks.push(compatibleTask);
      }
    });

    setColumns(cols);
  }, [tasks]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Se não houver destino ou se for o mesmo lugar, não faz nada
    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      // Reordenar na mesma coluna
      const items = reorder(
        columns[source.droppableId].tasks,
        source.index,
        destination.index
      );

      const newColumns = {
        ...columns,
        [source.droppableId]: {
          ...columns[source.droppableId],
          tasks: items,
        },
      };

      setColumns(newColumns);

      // Notificar o componente pai sobre as mudanças
      if (onUpdateTasks) {
        const allTasks = Object.values(newColumns).flatMap(col => col.tasks);
        onUpdateTasks(allTasks);
      }
    } else {
      // Mover entre colunas
      const movedResult = move(
        columns[source.droppableId].tasks,
        columns[destination.droppableId].tasks,
        source,
        destination
      );

      // Atualizar o status da task baseado na coluna de destino
      const movedTask = movedResult[destination.droppableId][destination.index];
      const updatedTask = {
        ...movedTask,
        status: getStatusFromColumn(destination.droppableId)
      };

      // Substituir a task movida pela versão atualizada
      movedResult[destination.droppableId][destination.index] = updatedTask;

      const newColumns = {
        ...columns,
        [source.droppableId]: {
          ...columns[source.droppableId],
          tasks: movedResult[source.droppableId],
        },
        [destination.droppableId]: {
          ...columns[destination.droppableId],
          tasks: movedResult[destination.droppableId],
        },
      };

      setColumns(newColumns);

      // Notificar o componente pai sobre as mudanças
      if (onUpdateTasks) {
        const allTasks = Object.values(newColumns).flatMap(col => col.tasks);
        onUpdateTasks(allTasks);
      }
    }
  };

  const handleAddTask = (taskData: any) => {
    if (!onUpdateTasks) return;

    const newTask: Task = {
      id: Date.now(),
      content: taskData.description,
      description: taskData.description,
      priority: taskData.priority,
      status: "pending",
      dueDate: taskData.dueDate,
      category: taskData.category
    };

    // Notificar o App.tsx para adicionar a nova task
    const currentTasks = Object.values(columns).flatMap(col => col.tasks);
    onUpdateTasks([newTask, ...currentTasks]);
    
    setIsCreateModalOpen(false);
  };

  const handleUpdateTask = (updatedTaskData: any) => {
    if (!editingTask || !onUpdateTasks) return;

    const updatedTask = {
      ...editingTask,
      content: updatedTaskData.description,
      description: updatedTaskData.description,
      priority: updatedTaskData.priority,
      dueDate: updatedTaskData.dueDate,
      category: updatedTaskData.category
    };

    // Atualizar no estado local do Kanban
    const newColumns = { ...columns };
    Object.keys(newColumns).forEach(columnId => {
      const column = newColumns[columnId];
      const taskIndex = column.tasks.findIndex(t => t.id === editingTask.id);
      if (taskIndex !== -1) {
        const updatedTasks = [...column.tasks];
        updatedTasks[taskIndex] = updatedTask;
        newColumns[columnId] = { ...column, tasks: updatedTasks };
      }
    });
    setColumns(newColumns);

    // Notificar o App.tsx sobre a atualização
    const allTasks = Object.values(newColumns).flatMap(col => col.tasks);
    onUpdateTasks(allTasks);

    setEditingTask(null);
  };

  const deleteTask = (taskId: string | number) => {
    if (!onUpdateTasks) return;

    const newColumns = { ...columns };
    Object.keys(newColumns).forEach(columnId => {
      const column = newColumns[columnId];
      newColumns[columnId] = {
        ...column,
        tasks: column.tasks.filter(t => t.id !== taskId)
      };
    });
    setColumns(newColumns);

    // Notificar o App.tsx sobre a exclusão
    const allTasks = Object.values(newColumns).flatMap(col => col.tasks);
    onUpdateTasks(allTasks);
  };

  const columnValues = useMemo(() => Object.values(columns), [columns]);

  // Função para formatar data
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  // Função para obter cor da categoria
  const getCategoryColor = (category: string) => {
    const categoryMap: Record<string, string> = {
      work: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      personal: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      learning: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      health: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
    };
    return categoryMap[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  };

  // Função para obter label da categoria
  const getCategoryLabel = (category: string) => {
    const categoryOptions = [
      { value: "work", label: "💼 Trabalho" },
      { value: "personal", label: "🏠 Pessoal" },
      { value: "learning", label: "📚 Estudo" },
      { value: "health", label: "💪 Saúde" }
    ];
    const found = categoryOptions.find(opt => opt.value === category);
    return found ? found.label : category;
  };

  // Função para obter o texto da task
  const getTaskText = (task: Task) => {
    return task.content || task.description || "Task sem nome";
  };

  return (
    <div className="p-6">
      {/* Modal para criar/editar tasks */}
      <CreateTaskModal 
        isOpen={isCreateModalOpen || !!editingTask}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTask(null);
        }}
        onAdd={handleAddTask}
        editingTask={editingTask}
        onUpdate={handleUpdateTask}
      />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Kanban Board</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {tasks.length} tasks totais • Arraste e solte para organizar
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
        >
          + Nova Task
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columnValues.map(column => (
            <div key={column.id} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">{column.title}</h3>
                <span className="bg-white dark:bg-gray-700 px-2 py-1 rounded-full text-sm text-gray-600 dark:text-gray-400">
                  {column.tasks.length}
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`
                      min-h-[200px] transition-all duration-200 rounded-lg p-2
                      ${snapshot.isDraggingOver 
                        ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300" 
                        : ""
                      }
                    `}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable 
                        key={String(task.id)} 
                        draggableId={String(task.id)} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`
                              group bg-white dark:bg-gray-700 rounded-xl p-4 mb-3 shadow-lg border-l-4 
                              transition-all duration-200 transform
                              ${snapshot.isDragging 
                                ? "rotate-3 shadow-2xl scale-105" 
                                : "hover:shadow-xl hover:scale-105"
                              }
                              ${
                                task.priority === "high" 
                                  ? "border-l-red-500" 
                                  : task.priority === "medium" 
                                  ? "border-l-yellow-500" 
                                  : "border-l-green-500"
                              }
                            `}
                          >
                            <div className="flex items-start justify-between">
                              <p className="text-gray-900 dark:text-white font-medium flex-1">
                                {getTaskText(task)}
                              </p>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 ml-2">
                                <button 
                                  onClick={() => setEditingTask(task)}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                >
                                  <Edit className="h-3 w-3 text-gray-400" />
                                </button>
                                <button 
                                  onClick={() => deleteTask(task.id)}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                >
                                  <Trash2 className="h-3 w-3 text-gray-400" />
                                </button>
                              </div>
                            </div>

                            {/* Metadados da Task */}
                            <div className="flex flex-wrap gap-2 mt-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                task.priority === "high" 
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" 
                                  : task.priority === "medium" 
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" 
                                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              }`}>
                                {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Média" : "Baixa"}
                              </span>
                              
                              {task.category && (
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                                  {getCategoryLabel(task.category)}
                                </span>
                              )}
                              
                              {task.dueDate && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {formatDate(task.dueDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {column.tasks.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p>Nenhuma task aqui</p>
                        <p className="text-sm">Arraste tasks para esta coluna</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};