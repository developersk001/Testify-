import React, { useState } from "react";
import { 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  User, 
  Award,
  Zap,
  Target
} from "lucide-react";
import { motion } from "motion/react";

interface WelcomePageProps {
  onNameSubmitted: (name: string) => void;
}

export default function WelcomePage({ onNameSubmitted }: WelcomePageProps) {
  const [usernameInput, setUsernameInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setError("Please provide a name or nickname.");
      return;
    }
    onNameSubmitted(usernameInput.trim());
  };

  return (
    <div className="fixed inset-0 bg-[#FAFAFA] dark:bg-zinc-950 z-[100] flex items-stretch overflow-hidden">
      
      {/* LEFT COLUMN: BRANDING & EXQUISITE VECTOR GRAPHIC */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 dark:bg-blue-950/35 relative p-12 flex-col justify-between overflow-hidden">
        {/* Background gradient flares */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-30 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center font-bold text-white text-base tracking-tighter border border-white/20">
            T
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">Testify</span>
          <span className="text-[9px] bg-white/20 text-white font-extrabold px-2 py-0.5 rounded-full font-mono">Offline-First</span>
        </div>

        {/* Central Graphic Focus */}
        <div className="relative z-10 flex flex-col items-center justify-center space-y-8 my-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md aspect-square bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 shadow-2xl overflow-hidden flex items-center justify-center relative group"
          >
            <img 
              src="/auth_illustration.jpg" 
              alt="Testify Learning Illustration" 
              className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          <div className="text-center space-y-2.5 max-w-sm">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Unleash Perfect Performance
            </h2>
            <p className="text-sm text-blue-100/80 leading-relaxed">
              Track your mock exam histories, bookmark complex problems, and curate your personalized mistake notebook on this device.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center gap-4 text-xs text-blue-200/60 font-semibold font-mono tracking-wider uppercase">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-blue-300" />
            <span>2026 JEE Syllabus Ready</span>
          </div>
          <span className="opacity-40">|</span>
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-blue-300" />
            <span>Precision Analysis</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: INTERACTIVE NAME ENTRY FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-12 md:p-16 overflow-y-auto bg-white dark:bg-zinc-950">
        
        <div className="max-w-md w-full mx-auto space-y-8">
          
          {/* Mobile brand header (hidden on desktop) */}
          <div className="flex lg:hidden items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-900">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm tracking-tighter">
                T
              </div>
              <span className="font-extrabold text-base tracking-tight text-zinc-950 dark:text-white">Testify</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Offline Ready</span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2 text-left">
            <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Personalized JEE Practice Panel</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
              Welcome to Testify
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Enter your display name below to begin your personalized mock exam practice journey. All metrics are persisted safely in your browser.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-2xl flex items-start gap-2 border border-red-100/80 dark:border-red-950/40">
              <span>{error}</span>
            </div>
          )}

          {/* NAME INPUT FORM */}
          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-500" />
                <span>Your Name or Nickname</span>
              </label>
              <input 
                type="text" 
                placeholder="e.g. Rahul Sharma, Sneha"
                value={usernameInput}
                onChange={(e) => {
                  setUsernameInput(e.target.value);
                  setError("");
                }}
                className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3.5 rounded-2xl text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-zinc-900 dark:text-white transition-all"
                maxLength={24}
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10 active:scale-95 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Feature Highlights Grid */}
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900 grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="mx-auto w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200">1000+ PYQs</p>
              <p className="text-[9px] text-zinc-400">JEE Standard Questions</p>
            </div>
            <div className="space-y-1">
              <div className="mx-auto w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Zap className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200">Instant Metrics</p>
              <p className="text-[9px] text-zinc-400">Analytical Performance</p>
            </div>
            <div className="space-y-1">
              <div className="mx-auto w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Target className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200">Mistake Book</p>
              <p className="text-[9px] text-zinc-400">Track and Retry Errors</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
