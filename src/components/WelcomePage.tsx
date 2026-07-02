import React, { useState } from "react";
import { Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { motion } from "motion/react";
import { StudentIllustration } from "./Illustrations";

interface WelcomePageProps {
  onNameSubmitted: (name: string) => void;
}

export default function WelcomePage({ onNameSubmitted }: WelcomePageProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a name or nickname.");
      return;
    }
    onNameSubmitted(name.trim());
  };

  return (
    <div className="fixed inset-0 bg-[#FAFAFA] dark:bg-zinc-950 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6 text-center select-none"
      >
        <div className="flex flex-col items-center gap-3">
          <StudentIllustration className="w-36 h-36" />
          
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Offline First Mock App</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white mt-1">Welcome to Testify</h1>
            <p className="text-xs text-zinc-500 max-w-sm">Premium unlimited JEE Main & Advanced mock test generation engine.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">What should we call you?</label>
            <input 
              type="text" 
              placeholder="Enter your name..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 rounded-2xl text-sm font-semibold outline-none focus:border-blue-500"
              maxLength={24}
              autoFocus
            />
            {error && (
              <span className="text-[10px] text-red-500 font-semibold pl-1">{error}</span>
            )}
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10 active:scale-95"
          >
            <span>Continue to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="border-t border-zinc-50 dark:border-zinc-850 pt-4 flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 font-semibold font-mono uppercase">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Practice 2000-2026 PYQs Offline</span>
        </div>
      </motion.div>
    </div>
  );
}
