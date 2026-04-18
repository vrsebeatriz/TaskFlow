import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Target,
  Settings,
  Coffee,
  TimerReset,
  X,
} from "lucide-react";
import Confetti from "react-confetti";

type ModeKey = "focus" | "short" | "long";

type PomodoroSettings = {
  focusTime: number;
  shortBreak: number;
  longBreak: number;
  sessionsUntilLongBreak: number;
};

const RING_CIRCUMFERENCE = 2 * Math.PI * 45;

export function AdvancedPomodoro() {
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [mode, setMode] = useState<ModeKey>("focus");
  const [sessions, setSessions] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [settings, setSettings] = useState<PomodoroSettings>({
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsUntilLongBreak: 4,
  });

  const modes: Record<
    ModeKey,
    {
      time: number;
      label: string;
      description: string;
      chipClassName: string;
      panelClassName: string;
      strokeFrom: string;
      strokeTo: string;
    }
  > = {
    focus: {
      time: settings.focusTime * 60,
      label: "Foco",
      description: "Bloco profundo para executar sem interrupções.",
      chipClassName: "border-blue-500 bg-blue-500/10 text-gray-900 dark:text-white shadow-lg",
      panelClassName: "border-blue-500/20 bg-blue-500/[0.02]",
      strokeFrom: "#3b82f6",
      strokeTo: "#2563eb",
    },
    short: {
      time: settings.shortBreak * 60,
      label: "Pausa Curta",
      description: "Recupere energia antes de voltar para a próxima entrega.",
      chipClassName: "border-emerald-500 bg-emerald-500/10 text-gray-900 dark:text-white shadow-lg",
      panelClassName: "border-emerald-500/20 bg-emerald-500/[0.02]",
      strokeFrom: "#10b981",
      strokeTo: "#059669",
    },
    long: {
      time: settings.longBreak * 60,
      label: "Pausa Longa",
      description: "Desacelere um pouco mais para manter consistência ao longo do dia.",
      chipClassName: "border-purple-500 bg-purple-500/10 text-gray-900 dark:text-white shadow-lg",
      panelClassName: "border-purple-500/20 bg-purple-500/[0.02]",
      strokeFrom: "#a855f7",
      strokeTo: "#7e22ce",
    },
  };

  useEffect(() => {
    let interval: number | undefined;

    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(currentTime => currentTime - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [isRunning, timeLeft]);

  useEffect(() => {
    setTimeLeft(modes[mode].time);
  }, [settings, mode]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        void audioContextRef.current.close();
      }
    };
  }, []);

  const getAudioContextConstructor = () => {
    const contextWindow = window as Window & typeof globalThis & {
      webkitAudioContext?: typeof AudioContext;
    };

    return window.AudioContext ?? contextWindow.webkitAudioContext ?? null;
  };

  const ensureAudioContext = async () => {
    const AudioContextConstructor = getAudioContextConstructor();

    if (!AudioContextConstructor) {
      return null;
    }

    if (!audioContextRef.current || audioContextRef.current.state === "closed") {
      audioContextRef.current = new AudioContextConstructor();
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    return audioContextRef.current;
  };

  const playAlarmTone = async () => {
    const audioContext = await ensureAudioContext();

    if (!audioContext) {
      return;
    }

    const tonePattern = [
      { offset: 0, duration: 0.18, frequency: 880 },
      { offset: 0.24, duration: 0.18, frequency: 740 },
      { offset: 0.48, duration: 0.26, frequency: 988 },
    ];

    tonePattern.forEach(({ offset, duration, frequency }) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const startTime = audioContext.currentTime + offset;
      const endTime = startTime + duration;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, startTime);

      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.18, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(startTime);
      oscillator.stop(endTime + 0.02);
    });
  };

  const handleTimerComplete = () => {
    setIsRunning(false);

    if (soundEnabled) {
      void playAlarmTone();
    }

    if (mode === "focus") {
      setSessions(currentSessions => {
        const nextSessions = currentSessions + 1;
        const nextMode: ModeKey =
          nextSessions > 0 && nextSessions % settings.sessionsUntilLongBreak === 0
            ? "long"
            : "short";

        setMode(nextMode);
        setTimeLeft(modes[nextMode].time);
        return nextSessions;
      });

      setShowConfetti(true);
      window.setTimeout(() => setShowConfetti(false), 4200);
      return;
    }

    setMode("focus");
    setTimeLeft(modes.focus.time);
  };

  const startTimer = () => {
    if (soundEnabled) {
      void ensureAudioContext();
    }

    setIsRunning(true);
  };

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

  const handleSoundToggle = () => {
    const nextValue = !soundEnabled;

    setSoundEnabled(nextValue);

    if (nextValue) {
      void ensureAudioContext();
    }
  };

  const testSound = () => {
    void playAlarmTone();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressRatio = modes[mode].time === 0 ? 0 : 1 - timeLeft / modes[mode].time;
  const progressOffset = RING_CIRCUMFERENCE * (1 - progressRatio);
  const totalFocusedMinutes = sessions * settings.focusTime;

  return (
    <div className="w-full min-h-full flex flex-col">
      {showConfetti && <Confetti recycle={false} numberOfPieces={180} />}

      <div className="flex-1 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)] min-h-full">
        <section className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] flex flex-col overflow-hidden transition-colors min-h-full">
          <div className="border-b border-gray-200 dark:border-white/10 p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30">
                    <Target className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-500">
                      Sistema de Foco
                    </p>
                    <h3 className="text-xl font-manrope font-bold text-gray-900 dark:text-gray-100">
                      Pomodoro
                    </h3>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSoundToggle}
                  className={`rounded-md border px-4 py-2 transition-all duration-200 font-sans ${
                    soundEnabled
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      : "border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:bg-white/10"
                  }`}
                >
                  <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    {soundEnabled ? "Som Ativo" : "Som Off"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={testSound}
                  className="rounded-md border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 px-4 py-2 text-gray-700 dark:text-gray-300 transition-all duration-200 hover:bg-gray-200 dark:bg-white/10"
                >
                  <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
                    <Volume2 className="h-4 w-4" />
                    Testar Som
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="rounded-md border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-blue-400 transition-all duration-200 hover:bg-blue-500/20"
                >
                  <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest font-sans">
                    <Settings className="h-4 w-4" />
                    Ajustar
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="grid gap-3 sm:grid-cols-3 mb-8">
              {(Object.keys(modes) as ModeKey[]).map(key => {
                const currentMode = modes[key];
                const isActive = mode === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => switchMode(key)}
                    className={[
                      "min-h-[100px] rounded-xl border p-4 text-left transition-all duration-200 flex flex-col justify-between gap-2",
                      isActive
                        ? currentMode.chipClassName
                        : "border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/[0.03] text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:border-white/20 hover:bg-white/[0.06]",
                    ].join(" ")}
                  >
                    <p className="text-[11px] font-mono font-bold uppercase tracking-widest">{currentMode.label}</p>
                    <p className={`text-[11px] font-sans leading-relaxed ${isActive ? "text-gray-900 dark:text-white/80" : "text-gray-500 dark:text-gray-500"}`}>
                      {currentMode.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="relative mx-auto flex w-full max-w-[320px] items-center justify-center flex-1 my-8">
              <div className="relative flex h-[280px] w-[280px] items-center justify-center rounded-full">
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="pomodoro-ring" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={modes[mode].strokeFrom} />
                      <stop offset="100%" stopColor={modes[mode].strokeTo} />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#pomodoro-ring)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={progressOffset}
                    className="transition-[stroke-dashoffset] duration-700 ease-out"
                  />
                </svg>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-500 mb-2">
                    {modes[mode].label}
                  </p>
                  <div className="text-6xl font-manrope font-bold tracking-tighter text-gray-900 dark:text-gray-100">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="mt-3 text-[11px] font-sans font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                    {isRunning ? "Rodando" : "Pausado"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-auto">
              {!isRunning ? (
                <button
                  type="button"
                  onClick={startTimer}
                  className="inline-flex items-center gap-3 rounded-md bg-blue-600 px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-gray-900 dark:text-white transition-all hover:bg-blue-500 font-sans"
                >
                  <Play className="h-4 w-4" />
                  Iniciar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={pauseTimer}
                  className="inline-flex items-center gap-3 rounded-md bg-amber-500 px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-[#111] transition-all hover:bg-amber-400 font-sans"
                >
                  <Pause className="h-4 w-4" />
                  Pausar
                </button>
              )}

              <button
                type="button"
                onClick={resetTimer}
                className="inline-flex items-center gap-3 rounded-md border border-gray-300 dark:border-white/20 bg-transparent px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:bg-white/5 font-sans"
              >
                <RotateCcw className="h-4 w-4" />
                Resetar
              </button>
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-6">
          <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-6 flex-1 hover:bg-gray-50 dark:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/20">
                <TimerReset className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-500">
                  Ritmo do dia
                </p>
                <h4 className="text-sm font-manrope font-bold text-gray-900 dark:text-gray-100">Métricas</h4>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.01] p-4 flex justify-between items-center">
                <p className="text-[11px] font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500">Blocos concluídos</p>
                <p className="text-xl font-manrope font-bold text-gray-900 dark:text-gray-100">{sessions}</p>
              </div>

              <div className="rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.01] p-4 flex justify-between items-center">
                <p className="text-[11px] font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500">Tempo focado</p>
                <p className="text-xl font-manrope font-bold text-gray-900 dark:text-gray-100">
                  {Math.floor(totalFocusedMinutes / 60)}h {totalFocusedMinutes % 60}m
                </p>
              </div>

              <div className="rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.01] p-4 flex justify-between items-center">
                <p className="text-[11px] font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500">Ciclo atual</p>
                <p className="text-xl font-manrope font-bold text-gray-900 dark:text-gray-100">{modes[mode].label}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-6 flex-1 hover:bg-gray-50 dark:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                <Coffee className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-500">
                  Setup atual
                </p>
                <h4 className="text-sm font-manrope font-bold text-gray-900 dark:text-gray-100">Configuração</h4>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.01] p-3 text-center">
                <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500">Foco</p>
                <p className="mt-1 text-lg font-manrope font-bold text-gray-900 dark:text-gray-100">{settings.focusTime}m</p>
              </div>
              <div className="rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.01] p-3 text-center">
                <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500">Curta</p>
                <p className="mt-1 text-lg font-manrope font-bold text-gray-900 dark:text-gray-100">{settings.shortBreak}m</p>
              </div>
              <div className="rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.01] p-3 text-center">
                <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500">Longa</p>
                <p className="mt-1 text-lg font-manrope font-bold text-gray-900 dark:text-gray-100">{settings.longBreak}m</p>
              </div>
              <div className="rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.01] p-3 text-center">
                <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500">Repete</p>
                <p className="mt-1 text-lg font-manrope font-bold text-gray-900 dark:text-gray-100">{settings.sessionsUntilLongBreak}x</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-50 dark:bg-[#000000]/80 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowSettings(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30">
                  <Settings className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-500">
                    Personalização
                  </p>
                  <h4 className="text-[13px] font-mono font-bold uppercase tracking-[0.2em] text-gray-900 dark:text-white mt-1">Opções do Timer</h4>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="rounded-md p-2 text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:bg-white/5 hover:text-gray-900 dark:text-white transition-colors border border-transparent hover:border-gray-200 dark:border-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-5 p-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-[0.15em] text-gray-600 dark:text-gray-400">Tempo de foco</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.focusTime}
                  onChange={event =>
                    setSettings(current => ({
                      ...current,
                      focusTime: Math.max(1, Math.min(60, parseInt(event.target.value, 10) || 25)),
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] rounded-md focus:border-blue-500 focus:bg-gray-50 dark:bg-white/[0.04] transition-all duration-200 text-gray-800 dark:text-gray-200 text-[13px] outline-none font-sans"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-[11px] font-mono uppercase tracking-[0.15em] text-gray-600 dark:text-gray-400">Pausa curta</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.shortBreak}
                    onChange={event =>
                      setSettings(current => ({
                        ...current,
                        shortBreak: Math.max(
                          1,
                          Math.min(30, parseInt(event.target.value, 10) || 5)
                        ),
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] rounded-md focus:border-blue-500 focus:bg-gray-50 dark:bg-white/[0.04] transition-all duration-200 text-gray-800 dark:text-gray-200 text-[13px] outline-none font-sans"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-mono uppercase tracking-[0.15em] text-gray-600 dark:text-gray-400">Pausa longa</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.longBreak}
                    onChange={event =>
                      setSettings(current => ({
                        ...current,
                        longBreak: Math.max(
                          1,
                          Math.min(60, parseInt(event.target.value, 10) || 15)
                        ),
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] rounded-md focus:border-blue-500 focus:bg-gray-50 dark:bg-white/[0.04] transition-all duration-200 text-gray-800 dark:text-gray-200 text-[13px] outline-none font-sans"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-[0.15em] text-gray-600 dark:text-gray-400">
                  Sessões até a pausa longa
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.sessionsUntilLongBreak}
                  onChange={event =>
                    setSettings(current => ({
                      ...current,
                      sessionsUntilLongBreak: Math.max(
                        1,
                        Math.min(10, parseInt(event.target.value, 10) || 4)
                      ),
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] rounded-md focus:border-blue-500 focus:bg-gray-50 dark:bg-white/[0.04] transition-all duration-200 text-gray-800 dark:text-gray-200 text-[13px] outline-none font-sans"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-white/5 text-[11px] font-bold tracking-[0.2em] uppercase transition-colors font-sans rounded-none"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-blue-600 text-white font-bold tracking-[0.2em] text-[11px] uppercase py-3 px-4 transition-all hover:bg-blue-500 font-sans rounded-none"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
