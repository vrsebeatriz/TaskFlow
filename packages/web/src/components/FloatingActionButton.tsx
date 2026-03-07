import React, { useState } from "react";
import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="
        fixed bottom-8 right-8 z-40
        bg-gradient-to-r from-blue-500 to-purple-600 
        hover:from-blue-600 hover:to-purple-700
        text-white p-4 rounded-2xl 
        shadow-2xl hover:shadow-2xl
        transition-all duration-300 
        transform hover:scale-110
        group
        animate-float
      "
    >
      <div className="flex items-center space-x-2">
        <Plus className={`h-6 w-6 transition-transform duration-300 ${isHovered ? 'rotate-90' : 'rotate-0'}`} />
        {isHovered && (
          <span className="
            text-sm font-semibold whitespace-nowrap
            animate-fade-in
          ">
            Nova Task
          </span>
        )}
      </div>
      
      {/* Efeito de brilho (não bloqueia clique) */}
      <div className="
        absolute inset-0 rounded-2xl 
        bg-gradient-to-r from-white/20 to-transparent
        opacity-0 group-hover:opacity-100
        transition-opacity duration-300
        pointer-events-none
      " />
    </button>
  );
}
