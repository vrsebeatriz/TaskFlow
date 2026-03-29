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
  { value: "low", label: "Baixa", color: "from-green-400 to-green-500", dotClassName: "bg-green-200" },
  { value: "medium", label: "Média", color: "from-yellow-400 to-yellow-500", dotClassName: "bg-yellow-200" },
  { value: "high", label: "Alta", color: "from-red-400 to-red-500", dotClassName: "bg-red-200" },
] as const;

const categoryOptions = [
  { value: "work", label: "Trabalho", color: "from-blue-400 to-blue-500" },
  { value: "personal", label: "Pessoal", color: "from-purple-400 to-purple-500" },
  { value: "learning", label: "Estudo", color: "from-green-400 to-green-500" },
  { value: "health", label: "Saúde", color: "from-orange-400 to-orange-500" },
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
    if (!isOpen) {
      return;
    }

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

    if (!formData.description.trim()) {
      return;
    }

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
    if (!editingTask || !onDelete) {
      return;
    }

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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />

      <div
        className={`
          relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl
          max-w-md w-full transform transition-all duration-500
          ${isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"}
          border border-gray-200 dark:border-gray-700
        `}
      >
        <div className="relative p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isEditMode ? "Editar Task" : "Nova Task"}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Passo {step} de 3</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isBusy}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 transform hover:scale-110 disabled:opacity-50"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  O que precisa ser feito?
                </label>
                <textarea
                  value={formData.description}
                  onChange={event => setFormData({ ...formData, description: event.target.value })}
                  placeholder="Descreva sua task de forma clara e objetiva..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  required
                  autoFocus
                  disabled={isBusy}
                />
              </div>

              <button
                type="button"
                onClick={nextStep}
                disabled={!formData.description.trim() || isBusy}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:hover:scale-100"
              >
                Continuar
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Flag className="inline h-4 w-4 mr-2" />
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
                        p-3 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50
                        ${
                          formData.priority === option.value
                            ? `border-transparent bg-gradient-to-r ${option.color} text-white shadow-lg`
                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-500"
                        }
                      `}
                    >
                      <div className="text-center">
                        <span className={`mb-2 inline-flex h-3 w-3 rounded-full ${option.dotClassName}`} />
                        <div className="text-sm font-medium">{option.label}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Zap className="inline h-4 w-4 mr-2" />
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
                        p-3 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50
                        ${
                          formData.category === option.value
                            ? `border-transparent bg-gradient-to-r ${option.color} text-white shadow-lg`
                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-500"
                        }
                      `}
                    >
                      <div className="text-center">
                        <div className="text-sm font-medium">{option.label}</div>
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
                  className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={isBusy}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Calendar className="inline h-4 w-4 mr-2" />
                  Data de Vencimento
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={event => setFormData({ ...formData, dueDate: event.target.value })}
                    disabled={isBusy}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Preview da Task</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{formData.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      formData.priority === "high"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        : formData.priority === "medium"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    }`}
                  >
                    {getPriorityLabel(formData.priority)}
                  </span>
                  {formData.category && (
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        formData.category === "work"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          : formData.category === "personal"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                          : formData.category === "learning"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                      }`}
                    >
                      {getCategoryLabel(formData.category)}
                    </span>
                  )}
                  {formData.dueDate && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {new Date(formData.dueDate).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </div>

              {isEditMode && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-red-100 p-2 text-red-600 dark:bg-red-900/40 dark:text-red-300">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-700 dark:text-red-300">Excluir task</h4>
                        <p className="mt-1 text-sm text-red-600/80 dark:text-red-200/70">
                          A confirmação acontece aqui no modal, sem usar resposta nativa do navegador.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDeleteConfirmVisible(prev => !prev)}
                      disabled={!onDelete || isBusy}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-50 disabled:opacity-50 dark:border-red-800/60 dark:bg-red-950/20 dark:text-red-300 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </button>
                  </div>

                  {isDeleteConfirmVisible && (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-white/80 p-4 dark:border-red-900/40 dark:bg-black/20">
                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        Tem certeza que deseja excluir esta task? Essa ação não pode ser desfeita.
                      </p>
                      <div className="mt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setIsDeleteConfirmVisible(false)}
                          disabled={isBusy}
                          className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={!onDelete || isBusy}
                          className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 font-semibold text-white shadow-lg shadow-red-500/20 transition-all duration-200 hover:scale-[1.01] disabled:opacity-50"
                        >
                          {isDeleting ? "Excluindo..." : "Confirmar exclusão"}
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
                  className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={isBusy}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none"
                >
                  {isSubmitting ? "Salvando..." : isEditMode ? "Salvar Task" : "Criar Task"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
