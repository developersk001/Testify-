import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Heart, 
  Info, 
  Compass, 
  Tv,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FocusModePageProps {
  onAddNotification: (title: string, message: string, type: "motivation" | "achievement" | "system") => void;
  onAddXP: (amount: number) => void;
}

const AMBIENT_TRACKS = [
  { id: "rain", name: "Rain Forest 🌧️", desc: "Cozy thunderstorm rain loop for deep physics problems." },
  { id: "white", name: "White Noise 💨", desc: "A constant frequencies spectrum to cancel out external distractions." },
  { id: "space", name: "Cosmic Hum 🌌", desc: "A deep atmospheric space buzz perfect for long calculus solvers." }
];

export default function FocusModePage({
  onAddNotification,
  onAddXP
}: FocusModePageProps) {
  // Pomodoro states
  const [sessionMinutes, setSessionMinutes] = useState<number>(25);
  const [timeRemaining, setTimeRemaining] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);

  // Sound States
  const [activeTrack, setActiveTrack] = useState<string>("rain");
  const [isPlayingSound, setIsPlayingSound] = useState<boolean>(false);

  // Companion avatar choice
  const [selectedCompanion] = useState(() => {
    return localStorage.getItem("testify_selected_companion") || "robot";
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTimeRemaining(sessionMinutes * 60);
  }, [sessionMinutes]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setShowCompleteModal(true);
            onAddXP(50); // Reward for completing a session
            onAddNotification("Focus Session Done! 🎯", "Outstanding! You completed a Pomodoro study run. Claim +50 XP bonus!", "achievement");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeRemaining(sessionMinutes * 60);
  };

  const getCompanionExpression = () => {
    switch (selectedCompanion) {
      case "owl":
        return "🦉 Athena Owl: 'Focus is the catalyst of intellect. No notifications can distract us.'";
      case "fox":
        return "🦊 Foxy Catalyst: 'Stay sharp! We are crushing this Pomodoro sprint!'";
      case "astronaut":
        return "👨‍🚀 Cosmo Pilot: 'Space hum engaged. Fueling core rocket vectors.'";
      default:
        return "🤖 Alpha Robot: 'Background noise cancelled. Commencing calculus simulation.'";
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12 select-text text-left relative">
      
      <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-4 text-center max-w-md mx-auto">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono">Section 10 • Distraction-free Studying</span>
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">Immersive Focus Terminal</h3>
          </div>

          <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
            Configure your session timer, toggle soothing background white noise, and block notification popups to enter a highly productive study state.
          </p>

          {/* Core Big Countdown clock */}
          <div className="py-8 select-none">
            <div className="text-6xl font-mono font-black tracking-tight text-zinc-900 dark:text-white drop-shadow-sm">
              {formatTimer(timeRemaining)}
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mt-1.5 font-mono">Pomodoro Study Interval</span>
          </div>

          {/* Quick config options */}
          <div className="flex items-center justify-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-850/60 max-w-xs mx-auto">
            {[25, 45, 60].map(mins => (
              <button
                key={mins}
                onClick={() => {
                  if (!isRunning) setSessionMinutes(mins);
                }}
                disabled={isRunning}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                  sessionMinutes === mins 
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs" 
                    : "text-zinc-400 hover:text-zinc-600 disabled:opacity-50"
                }`}
              >
                {mins} Min
              </button>
            ))}
          </div>

          {/* Interactive controls */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`py-3 px-8 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-all ${
                isRunning 
                  ? "bg-rose-500 hover:bg-rose-600 text-white" 
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isRunning ? "Pause Session" : "Start Focus Run"}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-3 rounded-xl border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-50 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ambient Sound box integrated */}
        <div className="mt-8 border-t border-zinc-100 dark:border-zinc-850 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Soothing White Noise Controller</h4>
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
              <Volume2 className="w-4 h-4" />
              <span>Simulated Audio Loop</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {AMBIENT_TRACKS.map(track => {
              const isActive = activeTrack === track.id;
              const isPlayingThis = isActive && isPlayingSound;
              return (
                <div 
                  key={track.id}
                  onClick={() => {
                    setActiveTrack(track.id);
                    setIsPlayingSound(true);
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer text-left transition-all hover:scale-[1.01] ${
                    isActive 
                      ? "border-indigo-500 bg-indigo-50/15 dark:bg-indigo-950/20" 
                      : "border-zinc-150 dark:border-zinc-850 bg-white dark:bg-zinc-950/40"
                  }`}
                >
                  <h5 className="font-extrabold text-xs text-zinc-900 dark:text-white flex items-center justify-between">
                    <span>{track.name}</span>
                    {isPlayingThis && <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />}
                  </h5>
                  <p className="text-[9px] text-zinc-400 leading-normal mt-1 font-medium">{track.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-zinc-150/60 dark:border-zinc-850/60">
            <p className="text-[10px] text-zinc-400 font-medium italic">{getCompanionExpression()}</p>
            <button
              onClick={() => setIsPlayingSound(!isPlayingSound)}
              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 font-mono"
            >
              {isPlayingSound ? "Stop Noise" : "Play Noise"}
            </button>
          </div>
        </div>
      </div>

      {/* Completion Celebrate Modal */}
      <AnimatePresence>
        {showCompleteModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm text-center space-y-4 max-w-md mx-auto"
          >
            <span className="text-5xl animate-bounce block">🏆</span>
            <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">Focus Run Completed!</h3>
            <p className="text-[11px] text-zinc-400 leading-normal font-medium">
              You remained deeply locked and focused without distractions! Jarvis Study Coach awards you <strong>+50 XP points</strong> to celebrate your cognitive consistency.
            </p>
            <button
              onClick={() => setShowCompleteModal(false)}
              className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl cursor-pointer"
            >
              Claim Rewards
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
