import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

type TimerMode = 'work' | 'break';

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [showSettings, setShowSettings] = useState(false);
  
  // Configurações personalizáveis
  const [settings, setSettings] = useState({
    workTime: 25, // minutos
    breakTime: 5, // minutos
  });

  const workTimeSeconds = settings.workTime * 60;
  const breakTimeSeconds = settings.breakTime * 60;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      const newMode = mode === 'work' ? 'break' : 'work';
      const newTime = newMode === 'work' ? workTimeSeconds : breakTimeSeconds;
      
      setMode(newMode);
      setTimeLeft(newTime);
      setIsRunning(false);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, workTimeSeconds, breakTimeSeconds]);

  useEffect(() => {
    const newTime = mode === 'work' ? workTimeSeconds : breakTimeSeconds;
    setTimeLeft(newTime);
  }, [settings, mode, workTimeSeconds, breakTimeSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    const newTime = mode === 'work' ? workTimeSeconds : breakTimeSeconds;
    setTimeLeft(newTime);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    const newTime = newMode === 'work' ? workTimeSeconds : breakTimeSeconds;
    setTimeLeft(newTime);
  };

  const progress = 100 - (timeLeft / (mode === 'work' ? workTimeSeconds : breakTimeSeconds)) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Pomodoro Timer</h3>
        <button
          onClick={() => setShowSettings(true)}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Config
        </button>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Configurações do Timer</h4>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 text-gray-500 hover:text-gray-700 rounded text-lg"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempo de Trabalho (minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.workTime}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    workTime: Math.max(1, Math.min(60, parseInt(e.target.value) || 25))
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempo de Descanso (minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.breakTime}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    breakTime: Math.max(1, Math.min(30, parseInt(e.target.value) || 5))
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => switchMode('work')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            mode === 'work' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Trabalho ({settings.workTime}min)
        </button>
        <button
          onClick={() => switchMode('break')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            mode === 'break' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Descanso ({settings.breakTime}min)
        </button>
      </div>

      <div className="relative mb-6">
        <div className="w-48 h-48 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={mode === 'work' ? '#3b82f6' : '#10b981'}
              strokeWidth="3"
              strokeDasharray={`${progress * 2.827} 282.7`}
            />
          </svg>
          <div className="absolute text-center">
            <div className="text-3xl font-bold text-gray-900">
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-gray-600 capitalize">
              {mode === 'work' ? 'Trabalhando' : 'Descansando'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {settings.workTime}min / {settings.breakTime}min
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-3">
        <button
          onClick={toggleTimer}
          className={`p-3 rounded-full ${
            isRunning 
              ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
              : 'bg-green-500 text-white hover:bg-green-600'
          } transition-colors`}
        >
          {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        
        <button
          onClick={resetTimer}
          className="p-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-600 text-center">
          Configuração atual: <strong>{settings.workTime}min</strong> trabalho •{' '}
          <strong>{settings.breakTime}min</strong> descanso
        </div>
      </div>
    </div>
  );
}
