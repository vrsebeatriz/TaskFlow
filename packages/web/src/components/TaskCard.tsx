import { memo } from 'react';
import { Calendar, Tag, ChevronRight } from 'lucide-react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onToggle: (id: number) => void;
  isDragging?: boolean;
  isClone?: boolean;
}

const priorityColors = {
  high: 'border-red-500/50 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
  medium: 'border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
  low: 'border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
} as const;

const TaskCard = memo(function TaskCard({
  task,
  isDragging = false,
  isClone = false,
}: TaskCardProps) {
  const isElevated = isDragging || isClone;

  return (
    <div
      className={[
        'glass-panel border p-5',
        'transition-[transform,border-color,box-shadow,background-color,opacity] duration-200 ease-out',
        'transform-gpu will-change-transform',
        priorityColors[task.priority],
        isElevated
          ? 'scale-[1.015] border-white/20 shadow-[0_20px_50px_rgba(2,6,23,0.42)]'
          : 'hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_14px_32px_rgba(2,6,23,0.28)]',
        isDragging ? 'pointer-events-none' : '',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <h4 className="text-lg font-semibold text-slate-100 tracking-tight line-clamp-2">
          {task.description}
        </h4>
        <ChevronRight className="text-slate-600 shrink-0" size={20} />
      </div>

      <div className="flex items-center justify-between gap-2 text-xs text-slate-400 border-t border-white/5 pt-4">
        <div className="flex min-w-0 items-center gap-3">
          {task.dueDate && (
            <span className="flex items-center gap-1.5 shrink-0">
              <Calendar size={14} className="text-cyan-400" />
              {new Date(task.dueDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
          <span className="flex min-w-0 items-center gap-1.5 uppercase tracking-wider font-medium text-slate-500">
            <Tag size={14} className="shrink-0" />
            <span className="truncate">{task.category}</span>
          </span>
        </div>

        <div
          className={`h-3 w-3 shrink-0 rounded-full ${priorityColors[task.priority]} border-2 border-current`}
        />
      </div>
    </div>
  );
});

export default TaskCard;
