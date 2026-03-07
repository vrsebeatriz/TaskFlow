import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Target, Settings } from "lucide-react";
import Confetti from "react-confetti";

type ModeKey = "focus" | "short" | "long";

export function AdvancedPomodoro() {
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [mode, setMode] = useState<ModeKey>("focus");
  const [sessions, setSessions] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isHoveringSound, setIsHoveringSound] = useState<boolean>(false);
  const [isHoveringSettings, setIsHoveringSettings] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Configurações personalizáveis
  const [settings, setSettings] = useState({
    focusTime: 25, // minutos
    shortBreak: 5, // minutos
    longBreak: 15, // minutos
    sessionsUntilLongBreak: 4
  });

  const modes: Record<ModeKey, { time: number; color: string; label: string }> = {
    focus: { time: settings.focusTime * 60, color: "from-red-400 to-red-500", label: "Foco" },
    short: { time: settings.shortBreak * 60, color: "from-green-400 to-green-500", label: "Pausa Curta" },
    long: { time: settings.longBreak * 60, color: "from-blue-400 to-blue-500", label: "Pausa Longa" }
  };

  useEffect(() => {
    let interval: number | undefined;
    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      handleTimerComplete();
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, timeLeft]);

  // Atualizar timer quando as configurações mudarem
  useEffect(() => {
    setTimeLeft(modes[mode].time);
  }, [settings, mode]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (soundEnabled && audioRef.current) {
      void audioRef.current.play();
    }

    if (mode === "focus") {
      const nextSessions = sessions + 1;
      setSessions(nextSessions);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

      const nextMode: ModeKey = nextSessions > 0 && nextSessions % settings.sessionsUntilLongBreak === 0 ? "long" : "short";
      setMode(nextMode);
      setTimeLeft(modes[nextMode].time);
    } else {
      setMode("focus");
      setTimeLeft(modes.focus.time);
    }
  };

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(modes[mode].time);
  };

  const switchMode = (newMode: ModeKey) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(modes[newMode].time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = 100 - (timeLeft / modes[mode].time) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <audio ref={audioRef} src="https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3" />
      
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          🍅 Pomodoro Timer
        </h3>
        <div className="flex items-center space-x-3">
          {/* Ícone de Áudio Melhorado */}
          <div className="relative">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              onMouseEnter={() => setIsHoveringSound(true)}
              onMouseLeave={() => setIsHoveringSound(false)}
              className={`
                p-3 rounded-xl transition-all duration-300 transform
                ${soundEnabled 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }
                ${isHoveringSound ? 'scale-110 shadow-lg' : 'scale-100 shadow-sm'}
                hover:shadow-lg
              `}
            >
              {soundEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </button>
            
            {/* Tooltip */}
            {isHoveringSound && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap z-10">
                {soundEnabled ? 'Som ativado' : 'Som desativado'}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900 dark:border-b-gray-700"></div>
              </div>
            )}
          </div>

          {/* Ícone de Configurações Melhorado */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(true)}
              onMouseEnter={() => setIsHoveringSettings(true)}
              onMouseLeave={() => setIsHoveringSettings(false)}
              className={`
                p-3 rounded-xl transition-all duration-300 transform
                bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400
                ${isHoveringSettings ? 'scale-110 shadow-lg rotate-12' : 'scale-100 shadow-sm rotate-0'}
                hover:shadow-lg
              `}
            >
              <Settings className="h-5 w-5" />
            </button>
            
            {/* Tooltip */}
            {isHoveringSettings && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap z-10">
                Configurações
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900 dark:border-b-gray-700"></div>
              </div>
            )}
          </div>

          {/* Contador de Sessões */}
          <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl px-3 py-2">
            <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
              {sessions}
            </span>
          </div>
        </div>
      </div>

      {/* Modal de Configurações */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">⚙️ Configurações</h4>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  🎯 Tempo de Foco
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.focusTime}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    focusTime: Math.max(1, Math.min(60, parseInt(e.target.value) || 25))
                  }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center font-semibold"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  minutos
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  🌿 Pausa Curta
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreak}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    shortBreak: Math.max(1, Math.min(30, parseInt(e.target.value) || 5))
                  }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center font-semibold"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  minutos
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  🌊 Pausa Longa
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.longBreak}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    longBreak: Math.max(1, Math.min(60, parseInt(e.target.value) || 15))
                  }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center font-semibold"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  minutos
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  🔄 Sessões até Pausa Longa
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.sessionsUntilLongBreak}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    sessionsUntilLongBreak: Math.max(1, Math.min(10, parseInt(e.target.value) || 4))
                  }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center font-semibold"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-8">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timer Circular */}
      <div className="relative mb-8">
        <div className="w-64 h-64 mx-auto rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-gray-200 dark:text-gray-600"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="3"
              strokeDasharray={`${progress * 2.827} 282.7`}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                {(() => {
                  const [fromClass, toClass] = modes[mode].color.split(' ');
                  return (
                    <>
                      <stop offset="0%" className={fromClass} />
                      <stop offset="100%" className={toClass} />
                    </>
                  );
                })()}
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {formatTime(timeLeft)}
            </div>
            {(() => {
              const [fromClass] = modes[mode].color.split(' ');
              const labelClass = fromClass.replace('from-', 'text-');
              return <div className={`text-sm font-medium ${labelClass}`}>{modes[mode].label}</div>;
            })()}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4 mb-6">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="bg-gradient-to-r from-green-400 to-green-500 text-white p-4 rounded-full hover:from-green-500 hover:to-green-600 transition-all duration-200 transform hover:scale-110 shadow-lg"
          >
            <Play className="h-6 w-6" />
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white p-4 rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 transform hover:scale-110 shadow-lg"
          >
            <Pause className="h-6 w-6" />
          </button>
        )}
        <button
          onClick={resetTimer}
          className="bg-gradient-to-r from-gray-400 to-gray-500 text-white p-4 rounded-full hover:from-gray-500 hover:to-gray-600 transition-all duration-200 transform hover:scale-110"
        >
          <RotateCcw className="h-6 w-6" />
        </button>
      </div>

      {/* Mode Selector - Corrigido (sem scale) */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {(Object.keys(modes) as ModeKey[]).map(key => {
          const config = modes[key];
          return (
            <button
              key={key}
              onClick={() => switchMode(key)}
              className={`
                py-2 px-1 rounded-xl transition-all duration-200 text-sm font-medium
                ${mode === key
                  ? `bg-gradient-to-r ${config.color} text-white shadow-lg font-bold`
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Session Stats */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          Estatísticas da Sessão
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Sessões:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">{sessions}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Tempo Focado:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {Math.floor(sessions * settings.focusTime / 60)}h {sessions * settings.focusTime % 60}m
            </span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          ⚙️ Configuração: {settings.focusTime}min foco • {settings.shortBreak}min pausa curta • {settings.longBreak}min pausa longa
        </div>
      </div>
    </div>
  );
}