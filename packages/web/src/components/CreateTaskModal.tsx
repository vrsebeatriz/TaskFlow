import { useEffect, useState, type FormEvent } from "react";
import { X, Calendar, Flag, Zap, Clock, Sparkles, Trash2, AlertTriangle } from "lucide-react";
import type { Task, TaskDraft } from "../types";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (taskData: TaskDraft) => void | Promise<void>;
  editingTask?: Task | null;
  onUpdate?: ((task: Task) => void | Promise<void>) | null;
  onDelete?: ((taskId: number) => Promise<boolean>) | null;
}

const priorityOptions = [
  { value: "low", label: "Baixa", color: "bg-emerald-500", dotClassName: "bg-emerald-500" },
  { value: "medium", label: "Média", color: "bg-amber-400", dotClassName: "bg-amber-400" },
  { value: "high", label: "Alta", color: "bg-red-500", dotClassName: "bg-red-500" },
] as const;

const categoryOptions = [
  { value: "work", label: "Trabalho", color: "bg-blue-500" },
  { value: "personal", label: "Pessoal", color: "bg-purple-500" },
  { value: "learning", label: "Estudo", color: "bg-emerald-500" },
  { value: "health", label: "Saúde", color: "bg-amber-400" },
] as const;

const getPriorityLabel = (priority: TaskDraft["priority"]) => {
  return priorityOptions.find(option => option.value === priority)?.label ?? priority;
};

const getCategoryLabel = (category: string) => {
  return categoryOptions.find(option => option.value === category)?.label ?? category;
};

export function CreateTaskModal({
  isOpen,
  onClose,
  onAdd,
  editingTask = null,
  onUpdate = null,
  onDelete = null,
}: CreateTaskModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    description: "",
    priority: "medium" as TaskDraft["priority"],
    dueDate: "",
    category: "work",
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);

  const isEditMode = Boolean(editingTask);
  const isBusy = isSubmitting || isDeleting;

  const resetForm = () => {
    setFormData({ description: "", priority: "medium", dueDate: "", category: "work" });
    setStep(1);
    setIsDeleteConfirmVisible(false);
  };

  const handleClose = () => {
    setIsDeleteConfirmVisible(false);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setIsAnimating(false);
      setIsDeleteConfirmVisible(false);
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      setIsAnimating(true);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (editingTask) {
      const taskContent = editingTask.content || editingTask.description || "";
      setFormData({
        description: taskContent,
        priority: editingTask.priority || "medium",
        dueDate: editingTask.dueDate || "",
        category: editingTask.category || "work",
      });
      setStep(1);
      setIsDeleteConfirmVisible(false);
    } else {
      resetForm();
    }
  }, [isOpen, editingTask]);

  if (!isOpen) return null;

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.description.trim()) return;
    setIsSubmitting(true);

    try {
      if (editingTask && onUpdate) {
        const updatedTask: Task = {
          ...editingTask,
          content: formData.description.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          dueDate: formData.dueDate || undefined,
          category: formData.category,
        };
        await onUpdate(updatedTask);
      } else {
        await onAdd({
          description: formData.description.trim(),
          priority: formData.priority,
          dueDate: formData.dueDate || undefined,
          category: formData.category,
        });
      }
      resetForm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingTask || !onDelete) return;
    setIsDeleting(true);
    try {
      const deleted = await onDelete(editingTask.id);
      if (deleted) {
        resetForm();
        onClose();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />

      <div
        className={`
          relative bg-[#0A0A0A] rounded-xl shadow-2xl
          max-w-md w-full transform transition-all duration-500
          ${isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"}
          border border-white/10
        `}
      >
        <div className="relative p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-xl">
                <Sparkles className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-[13px] font-mono font-bold uppercase tracking-[0.2em] text-white">
                  {isEditMode ? "Editar Task" : "Nova Task"}
                </h2>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">Passo {step} de 3</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isBusy}
              className="p-2 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          <div className="mt-4">
            <div className="w-full bg-white/5 rounded-full h-1">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-[0.15em] text-gray-400 mb-3">
                  O que precisa ser feito?
                </label>
                <textarea
                  value={formData.description}
                  onChange={event => setFormData({ ...formData, description: event.target.value })}
                  placeholder="Descreva sua task..."
                  rows={4}
                  className="w-full px-4 py-3 border border-white/10 bg-white/[0.02] rounded-md focus:border-blue-500 focus:bg-white/[0.04] transition-all duration-200 text-gray-200 text-[13px] resize-none outline-none font-sans"
                  required
                  autoFocus
                  disabled={isBusy}
                />
              </div>

              <button
                type="button"
                onClick={nextStep}
                disabled={!formData.description.trim() || isBusy}
                className="w-full bg-blue-600 text-white font-bold tracking-[0.2em] text-[11px] uppercase py-3 px-4 transition-all duration-200 hover:bg-blue-500 disabled:opacity-50 font-sans"
              >
                Continuar
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-[0.15em] text-gray-400 mb-3 flex items-center">
                  <Flag className="h-3 w-3 mr-2" />
                  Prioridade
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {priorityOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: option.value })}
                      disabled={isBusy}
                      className={`
                        p-3 rounded-md border transition-all duration-200 disabled:opacity-50
                        ${
                          formData.priority === option.value
                            ? `border-${option.color.replace('bg-', '')} ${option.color} text-[#111] font-bold`
                            : "border-white/10 bg-white/[0.02] text-gray-400 hover:bg-white/[0.04] hover:text-white"
                        }
                      `}
                    >
                      <div className="text-center font-sans text-[11px] uppercase tracking-wider">
                        <span className={`mb-2 inline-flex h-2 w-2 rounded-full ${formData.priority === option.value ? 'bg-[#111]' : option.dotClassName}`} />
                        <div>{option.label}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-[0.15em] text-gray-400 mb-3 flex items-center">
                  <Zap className="h-3 w-3 mr-2" />
                  Categoria
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {categoryOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: option.value })}
                      disabled={isBusy}
                      className={`
                        p-3 rounded-md border transition-all duration-200 disabled:opacity-50
                        ${
                          formData.category === option.value
                            ? `border-${option.color.replace('bg-', '')} ${option.color} text-[#111] font-bold`
                            : "border-white/10 bg-white/[0.02] text-gray-400 hover:bg-white/[0.04] hover:text-white"
                        }
                      `}
                    >
                      <div className="text-center font-sans text-[11px] uppercase tracking-wider">
                        {option.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={isBusy}
                  className="flex-1 py-3 px-4 border border-white/20 text-white hover:bg-white/5 text-[11px] font-bold tracking-[0.2em] uppercase transition-colors font-sans"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={isBusy}
                  className="flex-1 bg-blue-600 text-white font-bold tracking-[0.2em] text-[11px] uppercase py-3 px-4 transition-all hover:bg-blue-500 disabled:opacity-50 font-sans"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-[0.15em] text-gray-400 mb-3 flex items-center">
                  <Calendar className="h-3 w-3 mr-2" />
                  Data de Vencimento
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={event => setFormData({ ...formData, dueDate: event.target.value })}
                    disabled={isBusy}
                    className="w-full pl-10 pr-4 py-3 border border-white/10 bg-white/[0.02] rounded-md focus:border-blue-500 focus:bg-white/[0.04] transition-all duration-200 text-gray-200 text-[13px] outline-none font-sans"
                  />
                </div>
              </div>

              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/10">
                <h4 className="text-[11px] font-mono text-gray-500 uppercase tracking-widest mb-2">Preview</h4>
                <p className="text-gray-200 text-[13px] font-sans">{formData.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 text-[10px] font-mono uppercase tracking-widest">
                    {getPriorityLabel(formData.priority)}
                  </span>
                  {formData.category && (
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 text-[10px] font-mono uppercase tracking-widest">
                      {getCategoryLabel(formData.category)}
                    </span>
                  )}
                  {formData.dueDate && (
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 text-[10px] font-mono uppercase tracking-widest">
                      {new Date(formData.dueDate).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </div>

              {isEditMode && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-md bg-red-500/10 border border-red-500/20 p-2 text-red-400">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold text-red-400 uppercase tracking-widest">Zona de Perigo</h4>
                        <p className="mt-1 text-[11px] text-gray-500 font-sans">
                          A exclusão não pode ser desfeita.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDeleteConfirmVisible(prev => !prev)}
                      disabled={!onDelete || isBusy}
                      className="inline-flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Excluir
                    </button>
                  </div>

                  {isDeleteConfirmVisible && (
                    <div className="mt-4 border-t border-red-500/20 pt-4">
                      <p className="text-[11px] text-gray-400 font-sans">
                        Tem certeza que deseja excluir esta task?
                      </p>
                      <div className="mt-3 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setIsDeleteConfirmVisible(false)}
                          disabled={isBusy}
                          className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:bg-white/10 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={!onDelete || isBusy}
                          className="flex-1 rounded-md bg-red-500 px-3 py-2 text-[10px] font-bold tracking-widest uppercase text-[#111] hover:bg-red-400 transition-colors"
                        >
                          {isDeleting ? "Excluindo..." : "Confirmar"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={isBusy}
                  className="flex-1 py-3 px-4 border border-white/20 text-white hover:bg-white/5 text-[11px] font-bold tracking-[0.2em] uppercase transition-colors font-sans rounded-none"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={isBusy}
                  className="flex-1 bg-blue-600 text-white font-bold tracking-[0.2em] text-[11px] uppercase py-3 px-4 transition-all hover:bg-blue-500 disabled:opacity-50 font-sans rounded-none"
                >
                  {isSubmitting ? "..." : isEditMode ? "Salvar Task" : "Criar Task"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
