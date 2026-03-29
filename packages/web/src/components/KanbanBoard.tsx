import { useEffect, useMemo, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DraggableLocation,
  type DraggableProvided,
  type DraggableRubric,
  type DraggableStateSnapshot,
  type DropResult,
} from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { Task } from '../types';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove: (taskId: number, newStatus: Task['status']) => void;
  onEditTask: (task: Task) => void;
}

const columnOrder: Task['status'][] = ['pending', 'inProgress', 'completed'];

const columns: { id: Task['status']; title: string; color: string }[] = [
  { id: 'pending', title: 'Para Fazer', color: 'bg-cyan-500' },
  { id: 'inProgress', title: 'Em Curso', color: 'bg-purple-500' },
  { id: 'completed', title: 'Concluído', color: 'bg-emerald-500' },
];

const groupTasks = (tasks: Task[]) => {
  const grouped: Record<Task['status'], Task[]> = {
    pending: [],
    inProgress: [],
    completed: [],
  };

  for (const task of tasks) {
    grouped[task.status].push(task);
  }

  return grouped;
};

const flattenTasks = (grouped: Record<Task['status'], Task[]>) =>
  columnOrder.flatMap(status => grouped[status]);

const reorderGroupedTasks = (
  currentTasks: Task[],
  source: DraggableLocation,
  destination: DraggableLocation
) => {
  const grouped = groupTasks(currentTasks);
  const sourceId = source.droppableId as Task['status'];
  const destinationId = destination.droppableId as Task['status'];
  const sourceList = [...grouped[sourceId]];
  const destinationList = sourceId === destinationId ? sourceList : [...grouped[destinationId]];
  const [movedTask] = sourceList.splice(source.index, 1);

  if (!movedTask) {
    return currentTasks;
  }

  destinationList.splice(
    destination.index,
    0,
    sourceId === destinationId ? movedTask : { ...movedTask, status: destinationId }
  );

  grouped[sourceId] = sourceList;
  grouped[destinationId] = destinationList;

  return flattenTasks(grouped);
};

const getDraggableStyle = (
  style: React.CSSProperties | undefined,
  snapshot: DraggableStateSnapshot
): React.CSSProperties | undefined => {
  if (!style) {
    return undefined;
  }

  const nextStyle: React.CSSProperties = {
    ...style,
    willChange: 'transform',
    backfaceVisibility: 'hidden',
  };

  if (snapshot.isDropAnimating && snapshot.dropAnimation) {
    const duration = Math.min(snapshot.dropAnimation.duration, 180);
    nextStyle.transition = `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${duration}ms ease-out`;
  }

  return nextStyle;
};

function KanbanBoard({ tasks, onTaskMove, onEditTask }: KanbanBoardProps) {
  const [boardTasks, setBoardTasks] = useState<Task[]>(tasks);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  useEffect(() => {
    setBoardTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    document.body.classList.toggle('dragging-task', activeDragId !== null);

    return () => {
      document.body.classList.remove('dragging-task');
    };
  }, [activeDragId]);

  const tasksByColumn = useMemo(() => groupTasks(boardTasks), [boardTasks]);

  const renderDraggableTask = (
    task: Task,
    provided: DraggableProvided,
    snapshot: DraggableStateSnapshot,
    onClick?: () => void
  ) => (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={getDraggableStyle(provided.draggableProps.style, snapshot)}
      className={[
        'mb-4 select-none outline-none transform-gpu',
        snapshot.isDragging ? 'z-50 cursor-grabbing' : 'cursor-grab',
      ].join(' ')}
      onClick={snapshot.isDragging ? undefined : onClick}
    >
      <TaskCard
        task={task}
        onToggle={() => {}}
        isDragging={snapshot.isDragging}
        isClone={snapshot.isClone}
      />
    </div>
  );

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    setActiveDragId(null);

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    setBoardTasks(currentTasks => reorderGroupedTasks(currentTasks, source, destination));

    if (destination.droppableId !== source.droppableId) {
      onTaskMove(parseInt(draggableId, 10), destination.droppableId as Task['status']);
    }
  };

  return (
    <DragDropContext
      onDragStart={start => setActiveDragId(start.draggableId)}
      onDragEnd={onDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start overflow-x-hidden">
        {columns.map(column => (
          <div
            key={column.id}
            className="glass-panel flex min-h-[500px] flex-col overflow-hidden border-white/5 bg-white/[0.01] transition-[border-color,box-shadow,background-color] duration-200"
          >
            <div className="flex items-center justify-between border-b border-white/5 p-5">
              <div className="flex items-center gap-3">
                <div
                  className={`h-6 w-1.5 rounded-full ${column.color} shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
                />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-100">
                  {column.title}
                </h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-400">
                {tasksByColumn[column.id].length}
              </span>
            </div>

            <Droppable
              droppableId={column.id}
              renderClone={(provided, snapshot, rubric: DraggableRubric) => {
                const cloneTask = tasksByColumn[column.id][rubric.source.index];

                if (!cloneTask) {
                  return null;
                }

                return renderDraggableTask(cloneTask, provided, snapshot);
              }}
            >
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={[
                    'min-h-[200px] flex-1 p-4 transition-[background-color,padding] duration-150',
                    snapshot.isDraggingOver ? 'rounded-b-2xl bg-white/[0.04]' : '',
                    snapshot.draggingFromThisWith ? 'bg-white/[0.015]' : '',
                  ].join(' ')}
                >
                  {tasksByColumn[column.id].map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                      {(provided, snapshot) =>
                        renderDraggableTask(task, provided, snapshot, () => onEditTask(task))
                      }
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}

export default KanbanBoard;
