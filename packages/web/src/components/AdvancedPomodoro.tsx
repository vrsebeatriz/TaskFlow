import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Target,
  Settings,
  Brain,
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      chipClassName: "from-cyan-500 to-blue-500 text-white shadow-[0_18px_40px_rgba(34,211,238,0.22)]",
      panelClassName: "border-cyan-500/20 bg-cyan-500/[0.08]",
      strokeFrom: "#22d3ee",
      strokeTo: "#3b82f6",
    },
    short: {
      time: settings.shortBreak * 60,
      label: "Pausa Curta",
      description: "Recupere energia antes de voltar para a próxima entrega.",
      chipClassName: "from-emerald-500 to-teal-500 text-white shadow-[0_18px_40px_rgba(16,185,129,0.22)]",
      panelClassName: "border-emerald-500/20 bg-emerald-500/[0.08]",
      strokeFrom: "#34d399",
      strokeTo: "#14b8a6",
    },
    long: {
      time: settings.longBreak * 60,
      label: "Pausa Longa",
      description: "Desacelere um pouco mais para manter consistência ao longo do dia.",
      chipClassName: "from-fuchsia-500 to-purple-500 text-white shadow-[0_18px_40px_rgba(168,85,247,0.22)]",
      panelClassName: "border-fuchsia-500/20 bg-fuchsia-500/[0.08]",
      strokeFrom: "#d946ef",
      strokeTo: "#8b5cf6",
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

  const handleTimerComplete = () => {
    setIsRunning(false);

    if (soundEnabled && audioRef.current) {
      void audioRef.current.play().catch(() => {});
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

    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressRatio = modes[mode].time === 0 ? 0 : 1 - timeLeft / modes[mode].time;
  const progressOffset = RING_CIRCUMFERENCE * (1 - progressRatio);
  const totalFocusedMinutes = sessions * settings.focusTime;

  return (
    <div className="w-full">
      {showConfetti && <Confetti recycle={false} numberOfPieces={180} />}

      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3"
      />

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <section className="glass-panel overflow-hidden border-white/10">
          <div className="border-b border-white/5 bg-white/[0.02] p-6 md:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-[0_18px_35px_rgba(34,211,238,0.22)]">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Focus System
                    </p>
                    <h3 className="text-2xl font-black tracking-tight text-slate-50">
                      Pomodoro
                    </h3>
                  </div>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-slate-400">
                  O relógio Pomodoro ajuda a organizar blocos de foco com pausas estratégicas,
                  melhorando a concentração e evitando desgaste ao longo do trabalho.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(current => !current)}
                  className={`rounded-2xl border px-4 py-3 transition-all duration-200 ${
                    soundEnabled
                      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
                      : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    {soundEnabled ? "Som Ativo" : "Som Off"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="rounded-2xl border border-cyan-400/25 bg-cyan-500/10 px-4 py-3 text-cyan-300 transition-all duration-200 hover:bg-cyan-500/15"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Settings className="h-4 w-4" />
                    Ajustar Ciclos
                  </span>
                </button>

                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-500/15 text-fuchsia-300">
                      <Brain className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                        Sessões
                      </p>
                      <p className="text-base font-bold text-slate-100">{sessions}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-6 md:p-8 xl:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] xl:items-center">
            <div className="min-w-0 space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-2 min-[1800px]:grid-cols-3">
                {(Object.keys(modes) as ModeKey[]).map(key => {
                  const currentMode = modes[key];
                  const isActive = mode === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => switchMode(key)}
                      className={[
                        "min-h-[138px] rounded-2xl border px-4 py-4 text-left transition-all duration-200",
                        isActive
                          ? `bg-gradient-to-r ${currentMode.chipClassName}`
                          : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]",
                      ].join(" ")}
                    >
                      <div className="flex h-full flex-col justify-between gap-3">
                        <p className="text-sm font-bold">{currentMode.label}</p>
                        <p
                          className={`text-xs leading-5 ${
                            isActive ? "text-white/85" : "text-slate-500"
                          }`}
                        >
                          {currentMode.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className={`rounded-[28px] border p-5 md:p-6 ${modes[mode].panelClassName}`}>
                <div className="grid gap-4 min-[1700px]:grid-cols-[minmax(0,1fr)_240px] min-[1700px]:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Estado Atual
                    </p>
                    <h4 className="mt-2 text-2xl font-bold text-slate-50">{modes[mode].label}</h4>
                    <p className="mt-1 text-sm text-slate-400">{modes[mode].description}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 min-[1700px]:self-start">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                      Próxima troca
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-200">
                      {mode === "focus"
                        ? `após ${settings.sessionsUntilLongBreak} blocos, pausa longa`
                        : "volta automaticamente para foco"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {!isRunning ? (
                  <button
                    type="button"
                    onClick={startTimer}
                    className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 text-sm font-bold text-white shadow-[0_18px_36px_rgba(16,185,129,0.25)] transition-all duration-200 hover:scale-[1.02]"
                  >
                    <Play className="h-5 w-5" />
                    Iniciar ciclo
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={pauseTimer}
                    className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-4 text-sm font-bold text-slate-950 shadow-[0_18px_36px_rgba(245,158,11,0.24)] transition-all duration-200 hover:scale-[1.02]"
                  >
                    <Pause className="h-5 w-5" />
                    Pausar ciclo
                  </button>
                )}

                <button
                  type="button"
                  onClick={resetTimer}
                  className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm font-bold text-slate-200 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08]"
                >
                  <RotateCcw className="h-5 w-5" />
                  Reiniciar
                </button>
              </div>
            </div>

            <div className="relative mx-auto flex w-full max-w-[320px] items-center justify-center xl:max-w-[300px] 2xl:max-w-[320px]">
              <div className="absolute inset-8 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="relative flex h-[260px] w-[260px] items-center justify-center rounded-full border border-white/10 bg-slate-950/45 shadow-[0_24px_60px_rgba(2,6,23,0.38)] sm:h-[290px] sm:w-[290px]">
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
                    stroke="rgba(148,163,184,0.16)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#pomodoro-ring)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={progressOffset}
                    className="transition-[stroke-dashoffset] duration-700 ease-out"
                  />
                </svg>

                <div className="relative z-10 flex w-[78%] flex-col items-center rounded-full border border-white/10 bg-slate-950/55 px-4 py-8 text-center backdrop-blur-xl sm:px-6 sm:py-10">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                    Timer
                  </p>
                  <div className="mt-4 text-4xl font-black tracking-tight text-slate-50 sm:text-5xl">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="mt-3 text-sm font-semibold text-slate-300">
                    {isRunning ? "Rodando agora" : "Pronto para começar"}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    {mode === "focus"
                      ? "Foco profundo"
                      : mode === "short"
                      ? "Respire e retorne"
                      : "Recarga estendida"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-1">
          <div className="glass-panel border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-300">
                <TimerReset className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Ritmo do dia
                </p>
                <h4 className="text-lg font-bold text-slate-50">Métricas da sessão</h4>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-slate-400">Blocos concluídos</p>
                <p className="mt-2 text-3xl font-black text-slate-50">{sessions}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-slate-400">Tempo focado</p>
                <p className="mt-2 text-2xl font-bold text-slate-50">
                  {Math.floor(totalFocusedMinutes / 60)}h {totalFocusedMinutes % 60}m
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-slate-400">Ciclo atual</p>
                <p className="mt-2 text-xl font-bold text-slate-50">{modes[mode].label}</p>
              </div>
            </div>
          </div>

          <div className="glass-panel border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
                <Coffee className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Configuração ativa
                </p>
                <h4 className="text-lg font-bold text-slate-50">Seu setup atual</h4>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Foco</p>
                <p className="mt-1 text-lg font-bold text-slate-100">{settings.focusTime} min</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Pausa curta</p>
                <p className="mt-1 text-lg font-bold text-slate-100">{settings.shortBreak} min</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Pausa longa</p>
                <p className="mt-1 text-lg font-bold text-slate-100">{settings.longBreak} min</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Longa a cada
                </p>
                <p className="mt-1 text-lg font-bold text-slate-100">
                  {settings.sessionsUntilLongBreak} sessões
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          />
          <div className="glass-panel relative z-10 w-full max-w-lg border-cyan-500/20 shadow-[0_0_60px_rgba(34,211,238,0.12)]">
            <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
                  <Settings className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Personalização
                  </p>
                  <h4 className="text-lg font-bold text-slate-50">Configurações do Timer</h4>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-5 p-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Tempo de foco</label>
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
                  className="w-full"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Pausa curta</label>
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
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Pausa longa</label>
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
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">
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
                  className="w-full"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="btn-secondary flex-1"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="btn-primary flex-1"
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
