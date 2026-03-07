import React, { useState, useEffect } from "react";
import { X, Calendar, Flag, Zap, Clock, Sparkles } from "lucide-react";

export function CreateTaskModal({ isOpen, onClose, onAdd, editingTask = null, onUpdate = null }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    description: "",
    priority: "medium",
    dueDate: "",
    category: "work"
  });
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset form quando modal abre ou task de edição muda
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      
      if (editingTask) {
        // Modo edição - preencher com dados da task
        // Suporta tanto 'content' quanto 'description'
        const taskContent = editingTask.content || editingTask.description || "";
        setFormData({
          description: taskContent,
          priority: editingTask.priority || "medium",
          dueDate: editingTask.dueDate || "",
          category: editingTask.category || "work"
        });
        setStep(1);
      } else {
        // Modo criação - reset form
        setFormData({ description: "", priority: "medium", dueDate: "", category: "work" });
        setStep(1);
      }
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, editingTask]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.description.trim()) {
      if (editingTask && onUpdate) {
        // Modo edição - manter compatibilidade com ambos os nomes
        const updatedTask = {
          ...editingTask,
          content: formData.description, // Para KanbanBoard
          description: formData.description, // Para outras partes do app
          priority: formData.priority,
          dueDate: formData.dueDate,
          category: formData.category
        };
        onUpdate(updatedTask);
      } else {
        // Modo criação
        onAdd({
          description: formData.description.trim(),
          priority: formData.priority,
          dueDate: formData.dueDate || undefined,
          category: formData.category
        });
      }
      
      setFormData({ description: "", priority: "medium", dueDate: "", category: "work" });
      setStep(1);
      onClose();
    }
  };

  // ... (resto do código permanece igual)
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const priorityOptions = [
    { value: "low", label: "Baixa", color: "from-green-400 to-green-500", icon: "🟢" },
    { value: "medium", label: "Média", color: "from-yellow-400 to-yellow-500", icon: "🟡" },
    { value: "high", label: "Alta", color: "from-red-400 to-red-500", icon: "🔴" }
  ];

  const categoryOptions = [
    { value: "work", label: "💼 Trabalho", color: "from-blue-400 to-blue-500" },
    { value: "personal", label: "🏠 Pessoal", color: "from-purple-400 to-purple-500" },
    { value: "learning", label: "📚 Estudo", color: "from-green-400 to-green-500" },
    { value: "health", label: "💪 Saúde", color: "from-orange-400 to-orange-500" }
  ];

  const isEditMode = !!editingTask;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop com blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`
        relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl 
        max-w-md w-full transform transition-all duration-500
        ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
        border border-gray-200 dark:border-gray-700
      `}>
        {/* Header */}
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
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Passo {step} de 3
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 transform hover:scale-110"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Conteúdo do Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Passo 1: Descrição */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  O que precisa ser feito?
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descreva sua task de forma clara e objetiva..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  required
                  autoFocus
                />
              </div>
              
              <button
                type="button"
                onClick={nextStep}
                disabled={!formData.description.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:hover:scale-100"
              >
                Continuar
              </button>
            </div>
          )}

          {/* Passo 2: Prioridade e Categoria */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Flag className="inline h-4 w-4 mr-2" />
                  Prioridade
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {priorityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({...formData, priority: option.value})}
                      className={`
                        p-3 rounded-xl border-2 transition-all duration-200 transform hover:scale-105
                        ${formData.priority === option.value 
                          ? `border-transparent bg-gradient-to-r ${option.color} text-white shadow-lg` 
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-500'
                        }
                      `}
                    >
                      <div className="text-center">
                        <div className="text-lg mb-1">{option.icon}</div>
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
                  {categoryOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({...formData, category: option.value})}
                      className={`
                        p-3 rounded-xl border-2 transition-all duration-200 transform hover:scale-105
                        ${formData.category === option.value 
                          ? `border-transparent bg-gradient-to-r ${option.color} text-white shadow-lg` 
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-500'
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
                  className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Passo 3: Data e Finalização */}
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
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Preview da Task */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Preview da Task
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {formData.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    formData.priority === "high" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" :
                    formData.priority === "medium" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" :
                    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  }`}>
                    {formData.priority === "high" ? "Alta" : formData.priority === "medium" ? "Média" : "Baixa"}
                  </span>
                  {formData.category && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      formData.category === "work" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
                      formData.category === "personal" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" :
                      formData.category === "learning" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
                      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                    }`}>
                      {categoryOptions.find(cat => cat.value === formData.category)?.label || formData.category}
                    </span>
                  )}
                  {formData.dueDate && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {new Date(formData.dueDate).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {isEditMode ? "💾 Salvar Task" : "✨ Criar Task"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}