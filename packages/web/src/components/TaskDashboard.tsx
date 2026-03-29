import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';
import { Task } from '../types';

interface Props {
  tasks: Task[];
  onToggleTask: (id: number) => void;
}

const TaskDashboard: React.FC<Props> = ({ tasks, onToggleTask }) => {
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          As Minhas Tarefas
        </h1>
        <p className="text-slate-400 mt-1">Tens {pendingTasks.length} tarefas pendentes para hoje.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
            Em Foco
          </h2>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {pendingTasks.map(task => (
                <TaskCard key={task.id} task={task} onToggle={onToggleTask} />
              ))}
            </AnimatePresence>
          </div>
        </section>

        <section className="opacity-60 grayscale-[0.5] hover:grayscale-0 transition-all">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-500" />
            Concluídas
          </h2>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {completedTasks.map(task => (
                <TaskCard key={task.id} task={task} onToggle={onToggleTask} />
              ))}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TaskDashboard;