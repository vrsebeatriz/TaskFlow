import { CreateTaskModal } from "./CreateTaskModal";
import type { Task, TaskDraft } from "../types";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onUpdate: (taskId: number, updates: Partial<TaskDraft>) => Promise<void>;
  onDelete?: (taskId: number) => Promise<boolean>;
}

export function EditTaskModal({
  isOpen,
  onClose,
  task,
  onUpdate,
  onDelete,
}: EditTaskModalProps) {
  return (
    <CreateTaskModal
      isOpen={isOpen}
      onClose={onClose}
      onAdd={async () => {}}
      editingTask={task}
      onUpdate={updatedTask =>
        onUpdate(task.id, {
          description: updatedTask.description,
          priority: updatedTask.priority,
          dueDate: updatedTask.dueDate,
          category: updatedTask.category,
        })
      }
      onDelete={onDelete}
    />
  );
}
