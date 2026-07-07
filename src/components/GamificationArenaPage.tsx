import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Trophy, 
  Flame, 
  Share2, 
  Zap, 
  Award, 
  Users, 
  Volume2, 
  Copy, 
  Check, 
  Play, 
  Clock, 
  Compass, 
  Activity, 
  Gift,
  Calendar,
  Sparkles,
  Search,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SubjectType } from "../types";

interface GamificationArenaPageProps {
  onAddNotification: (title: string, message: string, type: "motivation" | "new-question" | "test-series" | "achievement" | "system") => void;
  userXP: number;
  onAddXP: (amount: number) => void;
  onLaunchRandomTest: (count: number, isDaily: boolean) => void;
  username: string;
}

const BADGES = [
  { id: "streak_7", title: "7-Day Streak 🔥", desc: "Unlock consistency by logging in 7 days in a row.", xp: 150, progress: 100, isUnlocked: true, icon: "🔥" },
  { id: "solved_1000", title: "1000 Solved Qs ⚡", desc: "Demonstrate relentless work ethic by clearing 1000 mock questions.", xp: 500, progress: 42, isUnlocked: false, icon: "⚡" },
  { id: "phys_master", title: "Physics Master 🧪", desc: "Acheive over 85% average accuracy on Physics chapters.", xp: 300, progress: 90, isUnlocked: true, icon: "🧪" },
  { id: "chem_master", title: "Chemistry Master ⚗️", desc: "Perfect your chemistry mock metrics above 85% average.", xp: 300, progress: 65, isUnlocked: false, icon: "⚗️" },
  { id: "math_master", title: "Math Master ∑", desc: "Solve calculus and geometry with absolute math mastery.", xp: 300, progress: 100, isUnlocked: true, icon: "∑" },
  { id: "early_bird", title: "Early Bird 🚀", desc: "Complete an active JEE mock exam before 8:00 AM.", xp: 100, progress: 100, isUnlocked: true, icon: "🚀" },
  { id: "night_owl", title: "Night Owl 🌙", desc: "Log core study sessions after midnight hours.", xp: 100, progress: 20, isUnlocked: false, icon: "🌙" }
];

const LEADERBOARD = [
  { rank: 1, name: "Aarav Sharma", score: 480, time: "3m 42s", avatar: "👨‍🎓" },
  { rank: 2, name: "Isha Patel", score: 480, time: "4m 12s", avatar: "👩‍🔬" },
  { rank: 3, name: "Rahul Verma", score: 420, time: "3m 15s", avatar: "👨‍💻" },
  { rank: 4, name: "Neha Sen", score: 420, time: "4m 05s", avatar: "👩‍🚀" }
];

const LIVE_FEEDS = [
  "Rohan J. just completed a Physics Rotational Motion test!",
  "Ananya S. reached Level 15 in Study Companion!",
  "Siddharth unlocked the 'Math Master' golden badge!",
  "Nishant just logged a 12-day study streak!",
  "Pooja cleared 4 organic mistakes in Mistake Book."
];

export default function GamificationArenaPage({
  onAddNotification,
  userXP,
  onAddXP,
  onLaunchRandomTest,
  username
}: GamificationArenaPageProps) {
  const [activeTab, setActiveTab] = useState<"challenge" | "badges" | "battle" | "spin" | "events">("challenge");
  const [copiedBattleLink, setCopiedBattleLink] = useState(false);
  const [selectedBattleSubject, setSelectedBattleSubject] = useState<SubjectType>("Physics");
  
  // Daily Spin Wheel States
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  const [hasSpunToday, setHasSpunToday] = useState(false);

  // Community Live Ticker state
  const [feedIndex, setFeedIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFeedIndex(prev => (prev + 1) % LIVE_FEEDS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleStartDailyChallenge = () => {
    onAddNotification("Daily Challenge Started 🏆", "Loading today's 5 high-yield previous year questions. Good luck!", "system");
    onLaunchRandomTest(5, true);
  };

  const handleGenerateBattleLink = () => {
    setCopiedBattleLink(true);
    onAddNotification("Link Created 🔗", "1v1 Quiz Battle link generated! Send it to your friend.", "system");
    setTimeout(() => setCopiedBattleLink(false), 2500);
  };

  const handleSpinWheel = () => {
    if (isSpinning || hasSpunToday) return;
    setIsSpinning(true);
    
    // Simulate wheel rotation
    setTimeout(() => {
      const rewards = ["+100 XP", "Laser Goggles 🕶️", "+250 XP", "Study Tree decoration", "Double XP Booster", "+50 XP"];
      const chosen = rewards[Math.floor(Math.random() * rewards.length)];
      setSpinResult(chosen);
      setIsSpinning(false);
      setHasSpunToday(true);

      if (chosen.includes("XP")) {
        const val = parseInt(chosen.replace(/\D/g, ""));
        onAddXP(val);
      }
      onAddNotification("Daily Spin Reward! 🎁", `Congratulations! You won: ${chosen}! Check your inventory or XP balance.`, "achievement");
    }, 2800);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 select-text text-left">
      
      {/* 11. LIVE COMMUNITY GLOBAL TICKER BANNER */}
      <div className="bg-zinc-950 text-white rounded-2xl p-3 px-5 flex items-center justify-between border border-zinc-800 shadow-lg overflow-hidden shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Live Feed</span>
        </div>
        
        {/* Sliding animation text */}
        <div className="flex-1 text-center truncate mx-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={feedIndex}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              className="text-xs font-medium text-zinc-300"
            >
              {LIVE_FEEDS[feedIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="hidden sm:flex items-center gap-3.5 text-[10px] font-mono text-zinc-400">
          <span>Active Solvers: <strong>1,424</strong></span>
          <span>•</span>
          <span>Tests Running: <strong>318</strong></span>
        </div>
      </div>

      {/* Navigation Headers for Arena Subsections */}
      <div className="flex border-b border-zinc-150 dark:border-zinc-800 overflow-x-auto select-none no-scrollbar">
        {[
          { id: "challenge", name: "Daily Challenge 🏆", color: "text-amber-500" },
          { id: "badges", name: "Achievements 🎖️", color: "text-blue-500" },
          { id: "battle", name: "1v1 battles ⚔️", color: "text-purple-500" },
          { id: "spin", name: "Daily Spin 🎡", color: "text-teal-500" },
          { id: "events", name: "Events 🎄", color: "text-rose-500" }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`pb-3 px-5 font-extrabold text-xs transition-all relative whitespace-nowrap cursor-pointer ${
              activeTab === item.id ? "text-zinc-950 dark:text-white" : "text-zinc-400 hover:text-zinc-600"
            }`}
          >
            <span>{item.name}</span>
            {activeTab === item.id && (
              <motion.div layoutId="arena-line" className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600" />
            )}
          </button>
        ))}
      </div>

      {/* CORE DISPLAY WINDOWS */}
      <AnimatePresence mode="wait">
        
        {/* SECTION 1: DAILY CHALLENGE */}
        {activeTab === "challenge" && (
          <motion.div
            key="challenge"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left/Center columns: Active challenge card */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest font-mono">Section 1 • Daily 5-Q Series</span>
                    <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">Active Daily Challenge</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 px-3 py-1 rounded-xl">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>+100 XP Reward</span>
                  </div>
                </div>

                {/* Promotional details */}
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3.5">
                  <div className="text-2xl mt-0.5">📅</div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-xs text-zinc-950 dark:text-white">Rotational Mechanics Blitz</h4>
                    <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                      Five selected high-yield questions on mechanics from JEE Main & Advanced previous year papers. Perfect score triggers a <strong>+50 XP Perfect Score Bonus</strong>!
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-2">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150/60 dark:border-zinc-850/60">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase block mb-0.5">Duration</span>
                    <span className="font-extrabold text-xs text-zinc-800 dark:text-white">10 Minutes</span>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150/60 dark:border-zinc-850/60">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase block mb-0.5">Questions</span>
                    <span className="font-extrabold text-xs text-zinc-800 dark:text-white">5 Single-Correct</span>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150/60 dark:border-zinc-850/60">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase block mb-0.5">Difficulty</span>
                    <span className="font-extrabold text-xs text-amber-600 dark:text-amber-400">Medium Rotating</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-semibold">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <span>Countdown to next reset: <strong>16h 40m</strong></span>
                </div>
                
                <button
                  onClick={handleStartDailyChallenge}
                  className="py-3 px-6 bg-gradient-to-tr from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm shadow-orange-500/10 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Unlock Challenge</span>
                </button>
              </div>
            </div>

            {/* Right column: Daily Leaderboard list */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
              <h4 className="font-extrabold text-xs text-zinc-950 dark:text-white mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Today's Leaderboard</span>
              </h4>

              <div className="space-y-2.5">
                {LEADERBOARD.map((usr, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-xl border border-zinc-150/60 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950/20 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-zinc-400 w-4">#{usr.rank}</span>
                      <span className="text-xl shrink-0">{usr.avatar}</span>
                      <div className="text-left">
                        <span className="font-extrabold text-xs text-zinc-800 dark:text-zinc-200 block truncate max-w-[100px]">{usr.name}</span>
                        <span className="text-[9px] text-zinc-400 font-mono font-bold">{usr.time}</span>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+{usr.score} XP</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* SECTION 4: ACHIEVEMENTS & BADGES GALLERY */}
        {activeTab === "badges" && (
          <motion.div
            key="badges"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between pb-2">
              <h3 className="font-extrabold text-sm text-zinc-950 dark:text-white">Achievements Gallery</h3>
              <span className="text-[10px] font-bold text-zinc-400 uppercase font-mono bg-zinc-100 dark:bg-zinc-800 px-3.5 py-1 rounded-xl">Unlocks: 4 / 7</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {BADGES.map(badge => (
                <div 
                  key={badge.id}
                  className={`p-4 rounded-3xl border text-left flex gap-4 transition-all relative group ${
                    badge.isUnlocked 
                      ? "bg-white dark:bg-zinc-900 border-zinc-150 dark:border-zinc-800" 
                      : "bg-zinc-50/50 dark:bg-zinc-950/20 border-zinc-200/50 dark:border-zinc-850/50 opacity-60"
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 flex items-center justify-center text-2xl shrink-0">
                    {badge.icon}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-extrabold text-xs text-zinc-950 dark:text-white truncate">{badge.title}</h4>
                      {badge.isUnlocked && (
                        <button
                          onClick={() => onAddNotification("Badge Shared!", `You shared your ${badge.title} achievement card!`, "system")}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer transition-all bg-transparent border-none"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-normal font-medium">{badge.desc}</p>
                    
                    {/* Progress tracking */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[8px] font-bold text-zinc-400 uppercase">
                        <span>Progress</span>
                        <span className="font-mono">{badge.progress}%</span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full" style={{ width: `${badge.progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SECTION 7: 1v1 QUIZ BATTLES */}
        {activeTab === "battle" && (
          <motion.div
            key="battle"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Configure game link */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest font-mono">Section 7 • Peer battles</span>
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">1v1 Quiz Battles Generator</h3>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Battle Subject</label>
                  <select 
                    value={selectedBattleSubject}
                    onChange={(e) => setSelectedBattleSubject(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-extrabold outline-none"
                  >
                    <option value="Physics">Physics Mechanics</option>
                    <option value="Chemistry">Chemistry Reactions</option>
                    <option value="Mathematics">Mathematics Calculus</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Question Count</label>
                  <select className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-extrabold outline-none">
                    <option value="5">5 MCQ Questions</option>
                    <option value="10">10 MCQ Questions</option>
                  </select>
                </div>
              </div>

              {/* Share link block */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-150/60 dark:border-zinc-850/60 space-y-3">
                <span className="text-[9px] text-zinc-400 font-extrabold uppercase block leading-none">Share invitation Link with classmate</span>
                <div className="flex gap-2.5">
                  <input 
                    type="text" 
                    readOnly 
                    value={`https://testify.app/join-battle/room-${Math.random().toString(36).substr(2, 6).toUpperCase()}?sub=${selectedBattleSubject}`}
                    className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-zinc-500 select-all outline-none"
                  />
                  <button
                    onClick={handleGenerateBattleLink}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {copiedBattleLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedBattleLink ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated Victory records on Right */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h4 className="font-extrabold text-xs text-zinc-950 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                <span>Battle History & Points</span>
              </h4>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150/60 dark:border-zinc-850/60 rounded-2xl flex items-center justify-between text-left">
                <div>
                  <span className="text-[8px] font-black text-purple-600 uppercase tracking-widest block">Classroom Rating</span>
                  <span className="font-extrabold text-sm text-zinc-950 dark:text-white">1,420 RP</span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block">Ratio</span>
                  <span className="font-extrabold text-sm text-emerald-600">80% Victory rate</span>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { vs: "Divyansh K.", res: "Victory 🏆", rp: "+25 RP", color: "text-emerald-500 bg-emerald-50" },
                  { vs: "Siddharth B.", res: "Defeat 😞", rp: "-10 RP", color: "text-rose-500 bg-rose-50" }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl border border-zinc-150 dark:border-zinc-850 flex items-center justify-between text-left text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-zinc-800 dark:text-zinc-200">vs {item.vs}</span>
                      <span className="text-[10px] text-zinc-400 block font-medium">Topic: Mechanics</span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-[10px] block text-zinc-600 dark:text-zinc-300">{item.res}</span>
                      <span className="text-[9px] font-mono font-bold text-zinc-400">{item.rp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* SECTION 12: DAILY SPIN WHEEL */}
        {activeTab === "spin" && (
          <motion.div
            key="spin"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto"
          >
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest font-mono">Section 12 • Free Daily Reward</span>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">Daily Spin Wheel</h3>
            </div>

            {/* Wheel Canvas Mock Render */}
            <div className="relative w-44 h-44 rounded-full border-4 border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-950">
              <motion.div
                animate={isSpinning ? { rotate: 1440 } : {}}
                transition={isSpinning ? { duration: 2.8, ease: "easeInOut" } : {}}
                className="absolute inset-0 w-full h-full flex items-center justify-center rounded-full"
              >
                {/* 2D Segment mock representation */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 rounded-full" />
                <span className="text-4xl">🎡</span>
              </motion.div>

              {/* Spinner Center Arrow */}
              <div className="absolute top-1 z-15 text-2xl text-rose-500">▼</div>

              {/* Spin completion badge details */}
              <AnimatePresence>
                {spinResult && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 bg-white/95 dark:bg-zinc-950/95 flex flex-col items-center justify-center p-3"
                  >
                    <span className="text-4xl mb-1">🎁</span>
                    <h5 className="font-extrabold text-xs text-zinc-900 dark:text-white">Wheel Claimed</h5>
                    <p className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{spinResult}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-[11px] text-zinc-400 max-w-xs font-medium">
              Take one free spin every 24 hours to win bonus study materials, premium frames, rare tree decor, or double XP boosters!
            </p>

            <button
              onClick={handleSpinWheel}
              disabled={isSpinning || hasSpunToday}
              className="py-3 px-8 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {isSpinning ? "Spinning Wheel..." : hasSpunToday ? "Come Back Tomorrow" : "Spin Free Wheel"}
            </button>
          </motion.div>
        )}

        {/* SECTION 13: SEASONAL TIMED EVENTS */}
        {activeTab === "events" && (
          <motion.div
            key="events"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl" />

            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest font-mono">Section 13 • Seasonal events</span>
                  <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">Active Seasonal Event</h3>
                </div>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-500/10 px-3 py-1 rounded-xl">Event Sprint active</span>
              </div>

              {/* Event card details */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-150/60 dark:border-zinc-850/60 flex flex-col md:flex-row gap-5 items-center justify-between">
                <div className="space-y-1.5 flex-1 text-left">
                  <span className="text-3xl">🎆</span>
                  <h4 className="font-extrabold text-xs text-zinc-900 dark:text-white">New Year JEE Marathon Week</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                    Solve at least 25 Chemistry and 25 Math PYQ equations this week. Unlocking this event grants an exclusive, limited-edition <strong className="text-zinc-600 dark:text-zinc-300">New Year Marathon 🎆</strong> display badge card.
                  </p>
                </div>

                <div className="text-left md:text-right shrink-0">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase block">Time Remaining</span>
                  <span className="font-mono font-extrabold text-xs text-zinc-800 dark:text-zinc-100 block">4d 18h 35m</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
