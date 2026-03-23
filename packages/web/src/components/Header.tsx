import { useEffect, useState } from "react";
import { CheckSquare, Bell, User, LogOut, Settings } from "lucide-react";
import type { User as AppUser } from "../types";

interface HeaderProps {
  user: AppUser | null;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false);
    };

    if (showUserMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showUserMenu]);

  const handleLogout = () => {
    onLogout();
    setShowUserMenu(false);
  };

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${
          scrolled
            ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50"
            : "bg-transparent"
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 group">
            <div
              className="
                p-2 bg-gradient-to-r from-blue-500 to-purple-600
                rounded-xl shadow-lg transform group-hover:scale-110
                group-hover:rotate-12 transition-all duration-300
                animate-float
              "
            >
              <CheckSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1
                className="
                  text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600
                  bg-clip-text text-transparent
                "
              >
                TaskFlow Pro
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user ? `Olá, ${user.name}` : "Produtividade em outro nível"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              className="
                p-2 rounded-xl transition-all duration-200
                hover:bg-gray-100 dark:hover:bg-gray-800
                hover:scale-110 transform relative
                text-gray-600 dark:text-gray-400
                hover:text-blue-600 dark:hover:text-blue-400
              "
            >
              <Bell className="h-5 w-5" />
              <span
                className="
                  absolute -top-1 -right-1 w-3 h-3
                  bg-red-500 rounded-full animate-pulse
                "
              ></span>
            </button>

            <div className="relative">
              <button
                onClick={e => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                }}
                className="flex items-center space-x-3 p-2 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 group"
              >
                <div
                  className="
                    p-2 bg-gradient-to-r from-green-400 to-blue-500
                    rounded-xl text-white transform group-hover:scale-110 transition-all duration-200
                  "
                >
                  <User className="h-5 w-5" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.name || "Usuário"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email || "Carregando..."}
                  </p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-14 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-48 py-2 z-50 animate-in fade-in duration-200">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <button
                    className="
                      w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300
                      hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2
                    "
                  >
                    <Settings className="h-4 w-4" />
                    <span>Configurações</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="
                      w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400
                      hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2
                    "
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
