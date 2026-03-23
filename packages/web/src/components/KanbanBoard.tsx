import { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult, type DraggableLocation } from "@hello-pangea/dnd";
import { Edit, Trash2, Calendar } from "lucide-react";
import { CreateTaskModal } from "./CreateTaskModal";
import type { Task, TaskDraft } from "../types";

interface KanbanBoardProps {
  tasks?: Task[];
  onAdd?: (taskData: TaskDraft) => Promise<void>;
  onTaskMove?: (taskId: number, newStatus: Task["status"]) => void;
  onDelete?: (taskId: number) => Promise<void> | void;
  onUpdateTasks?: (updatedTasks: Task[]) => void;
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

const reorder = (list: Task[], startIndex: number, endIndex: number): Task[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

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

export function KanbanBoard({
  tasks = [],
  onAdd,
  onTaskMove,
  onDelete,
  onUpdateTasks,
}: KanbanBoardProps) {
  const [columns, setColumns] = useState<Record<string, Column>>(defaultColumns());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const getStatusFromColumn = (columnId: string): Task["status"] => {
    const statusMap: Record<string, Task["status"]> = {
      todo: "pending",
      doing: "inProgress",
      done: "completed",
    };
    return statusMap[columnId] || "pending";
  };

  useEffect(() => {
    if (!tasks.length) {
      setColumns(defaultColumns());
      return;
    }

    const cols = defaultColumns();

    tasks.forEach(task => {
      const compatibleTask: Task = {
        ...task,
        content: task.content || task.description || "Task sem nome",
        description: task.description || task.content || "Task sem nome",
      };

      if (compatibleTask.status === "completed") {
        cols.done.tasks.push(compatibleTask);
      } else if (compatibleTask.status === "inProgress") {
        cols.doing.tasks.push(compatibleTask);
      } else {
        cols.todo.tasks.push(compatibleTask);
      }
    });

    setColumns(cols);
  }, [tasks]);

  const syncParentTasks = (nextColumns: Record<string, Column>) => {
    if (!onUpdateTasks) {
      return;
    }

    const allTasks = Object.values(nextColumns).flatMap(column => column.tasks);
    onUpdateTasks(allTasks);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
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
      syncParentTasks(newColumns);
      return;
    }

    const movedResult = move(
      columns[source.droppableId].tasks,
      columns[destination.droppableId].tasks,
      source,
      destination
    );

    const movedTask = movedResult[destination.droppableId][destination.index];
    movedResult[destination.droppableId][destination.index] = {
      ...movedTask,
      status: getStatusFromColumn(destination.droppableId),
    };

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
    syncParentTasks(newColumns);

    if (onTaskMove) {
      const updatedMovedTask = movedResult[destination.droppableId][destination.index];
      onTaskMove(Number(updatedMovedTask.id), getStatusFromColumn(destination.droppableId));
    }
  };

  const handleAddTask = async (taskData: TaskDraft) => {
    if (!onAdd) {
      return;
    }

    await onAdd(taskData);
    setIsCreateModalOpen(false);
  };

  const handleUpdateTask = (updatedTaskData: Task) => {
    if (!editingTask) {
      return;
    }

    const updatedTask: Task = {
      ...editingTask,
      ...updatedTaskData,
      content: updatedTaskData.description,
      description: updatedTaskData.description,
    };

    const newColumns = { ...columns };
    Object.keys(newColumns).forEach(columnId => {
      const column = newColumns[columnId];
      const taskIndex = column.tasks.findIndex(task => task.id === editingTask.id);

      if (taskIndex === -1) {
        return;
      }

      const updatedTasks = [...column.tasks];
      updatedTasks[taskIndex] = updatedTask;
      newColumns[columnId] = { ...column, tasks: updatedTasks };
    });

    setColumns(newColumns);
    syncParentTasks(newColumns);
    setEditingTask(null);
  };

  const deleteTask = (taskId: number) => {
    if (onDelete) {
      void onDelete(taskId);
    }
  };

  const columnValues = useMemo(() => Object.values(columns), [columns]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";

    try {
      return new Date(dateString).toLocaleDateString("pt-BR");
    } catch {
      return dateString;
    }
  };

  const getCategoryColor = (category: string) => {
    const categoryMap: Record<string, string> = {
      work: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      personal: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      learning: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      health: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    };
    return categoryMap[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  };

  const getCategoryLabel = (category: string) => {
    const categoryOptions = [
      { value: "work", label: "💼 Trabalho" },
      { value: "personal", label: "🏠 Pessoal" },
      { value: "learning", label: "📚 Estudo" },
      { value: "health", label: "💪 Saúde" },
    ];
    const found = categoryOptions.find(option => option.value === category);
    return found ? found.label : category;
  };

  const getTaskText = (task: Task) => {
    return task.content || task.description || "Task sem nome";
  };

  return (
    <div className="p-6">
      <CreateTaskModal
        isOpen={isCreateModalOpen || Boolean(editingTask)}
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
                      ${
                        snapshot.isDraggingOver
                          ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300"
                          : ""
                      }
                    `}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable key={String(task.id)} draggableId={String(task.id)} index={index}>
                        {(draggableProvided, draggableSnapshot) => (
                          <div
                            ref={draggableProvided.innerRef}
                            {...draggableProvided.draggableProps}
                            {...draggableProvided.dragHandleProps}
                            className={`
                              group bg-white dark:bg-gray-700 rounded-xl p-4 mb-3 shadow-lg border-l-4
                              transition-all duration-200 transform
                              ${
                                draggableSnapshot.isDragging
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

                            <div className="flex flex-wrap gap-2 mt-3">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  task.priority === "high"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                    : task.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                }`}
                              >
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
}
