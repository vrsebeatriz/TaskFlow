import React, { createContext, useContext, useState, ReactNode } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

// Definir tipos
type ToastType = {
  id: number;
  message: string;
  type: string;
};

type ToastContextType = {
  addToast: (message: string, type?: string) => void;
};

// Corrigir com tipos
const ToastContext = createContext<ToastContextType>({
  addToast: () => {}
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const addToast = (message: string, type: string = "info") => {
    const id = Date.now();
    const toast: ToastType = { id, message, type };
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-3">
        {toasts.map((toast) => (
          <Toast 
            key={toast.id} 
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)} 
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

function Toast({ message, type, onClose }: { 
  message: string; 
  type: string; 
  onClose: () => void; 
}) {
  const config: Record<string, any> = {
    success: {
      icon: CheckCircle,
      color: "from-green-400 to-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-800 dark:text-green-300",
      borderColor: "border-green-200 dark:border-green-800"
    },
    error: {
      icon: XCircle,
      color: "from-red-400 to-red-500",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      textColor: "text-red-800 dark:text-red-300",
      borderColor: "border-red-200 dark:border-red-800"
    },
    warning: {
      icon: AlertTriangle,
      color: "from-yellow-400 to-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      textColor: "text-yellow-800 dark:text-yellow-300",
      borderColor: "border-yellow-200 dark:border-yellow-800"
    },
    info: {
      icon: Info,
      color: "from-blue-400 to-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-800 dark:text-blue-300",
      borderColor: "border-blue-200 dark:border-blue-800"
    }
  };

  const currentConfig = config[type] || config.info;
  const Icon = currentConfig.icon;

  return (
    <div className={`
      ${currentConfig.bgColor} ${currentConfig.borderColor} ${currentConfig.textColor}
      border rounded-2xl p-4 shadow-lg 
      transform transition-all duration-300
      max-w-sm
    `}>
      <div className="flex items-start space-x-3">
        <div className={`p-2 bg-gradient-to-r ${currentConfig.color} rounded-xl`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/10 rounded-lg transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
