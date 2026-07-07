import React, { useState, useMemo } from "react";
import { 
  Sparkles, 
  Calendar as CalendarIcon, 
  Clock, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  Zap, 
  User, 
  ChevronRight,
  Info,
  BrainCircuit,
  Settings,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TestResult } from "../types";

interface AiCoachCalendarPageProps {
  history: TestResult[];
  onAddNotification: (title: string, message: string, type: "motivation" | "achievement" | "system") => void;
  onTabChange: (tab: string) => void;
}

const WEAK_RECOMMENDATIONS: Record<string, string[]> = {
  "Rotational Motion": [
    "Revise Torque equations and Moment of Inertia of composite bodies.",
    "Practice conservation of angular momentum PYQs from 2021-2024.",
    "Avoid immediate calculation steps on collision problems; write formula relations first."
  ],
  "Electrostatics": [
    "Review Gauss's Law integrations on cylindrical/spherical shells.",
    "Resolve electric potential dipole configuration doubts.",
    "Practice multiple correct assertion-reasoning questions."
  ],
  "Integration": [
    "Brush up on definite integration properties like King's and Queen's rules.",
    "Go through standard substitution formats for algebraic quotients.",
    "Take a 15-minute mock blitz specifically on integration."
  ],
  "Thermodynamics": [
    "Master cyclic indicator diagrams and work done calculations.",
    "Review standard chemical enthalpy changes and Hess's law.",
    "Revise Carnot engine efficiency and entropy formulas."
  ],
  "General": [
    "Solve at least 10 Physics PYQs every morning to build mechanical intuition.",
    "Log mistakes immediately to your Mistake Book to reinforce memory.",
    "Attempt a Chemistry mock test series; Inorganic chapters are ready for scoring."
  ]
};

export default function AiCoachCalendarPage({
  history,
  onAddNotification,
  onTabChange
}: AiCoachCalendarPageProps) {
  const [dailyHours, setDailyHours] = useState<number>(6);
  const [targetDate, setTargetDate] = useState<string>("2027-01-24");
  const [rebuildCount, setRebuildCount] = useState<number>(0);
  const [activePlanTab, setActivePlanTab] = useState<"today" | "week" | "calendar">("today");

  // Determine weak chapters from test history dynamically
  const detectedWeakChapters = useMemo(() => {
    const counts: Record<string, { total: number; correct: number }> = {};
    history.forEach(res => {
      Object.entries(res.chapterStats || {}).forEach(([chap, stats]) => {
        if (!counts[chap]) counts[chap] = { total: 0, correct: 0 };
        counts[chap].total += stats.total;
        counts[chap].correct += stats.correct;
      });
    });

    const weak: string[] = [];
    Object.entries(counts).forEach(([chap, val]) => {
      const accuracy = (val.correct / val.total) * 100;
      if (accuracy < 60) {
        weak.push(chap);
      }
    });

    // Fallback weak chapters if history is empty
    if (weak.length === 0) {
      return ["Rotational Motion", "Definite Integration", "Chemical Bonding", "Ionic Equilibrium"];
    }
    return weak.slice(0, 4);
  }, [history]);

  // Burnout predictor level calculation
  const burnoutRisk = useMemo(() => {
    if (history.length > 5) return "Moderate (65% Intensity)";
    if (history.length > 2) return "Low (30% Intensity)";
    return "Minimal (10% Intensity)";
  }, [history]);

  // Recommended Priority Topics list
  const priorities = useMemo(() => {
    return detectedWeakChapters.map(chap => {
      const recs = WEAK_RECOMMENDATIONS[chap] || WEAK_RECOMMENDATIONS["General"];
      return {
        chapter: chap,
        reason: "Accuracy dropped below 60% in recent mock reviews.",
        tips: recs
      };
    });
  }, [detectedWeakChapters]);

  // Calendar scheduler generation based on weak chapters and selected study hours
  const calendarDays = useMemo(() => {
    const days = [];
    const chaptersToSchedule = [
      ...detectedWeakChapters,
      "Electrostatics",
      "Thermodynamics & Heat",
      "Coordination Compounds",
      "Matrices & Determinants",
      "Newton's Laws of Motion",
      "Chemical Kinetics",
      "Limit & Continuity",
      "Electromagnetic Induction"
    ];

    const todayDate = new Date();
    for (let i = 0; i < 7; i++) {
      const futureDate = new Date();
      futureDate.setDate(todayDate.getDate() + i);
      const dayName = futureDate.toLocaleDateString("en-US", { weekday: "long" });
      const dateStr = futureDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      const primaryCh = chaptersToSchedule[i % chaptersToSchedule.length];
      const secondaryCh = chaptersToSchedule[(i + 2) % chaptersToSchedule.length];

      days.push({
        dayName,
        dateStr,
        primary: primaryCh,
        secondary: secondaryCh,
        duration: Math.ceil(dailyHours * 0.65),
        secDuration: Math.floor(dailyHours * 0.35),
        isDone: i === 0 && history.length > 0 // Simulate completed if has history
      });
    }
    return days;
  }, [detectedWeakChapters, dailyHours, rebuildCount]);

  const handleRegenerate = () => {
    setRebuildCount(prev => prev + 1);
    onAddNotification("Plan Regenerated 🔄", "Smart calendar successfully recalculated against your updated weak chapter indices!", "system");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 select-text text-left">
      
      {/* 2. AI STUDY COACH PROFILE & RECOMMENDATION CARDS */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Coach avatar section */}
          <div className="md:w-56 shrink-0 flex flex-col items-center text-center p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150/60 dark:border-zinc-850/60 justify-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-3xl mb-3.5 shadow-sm animate-pulse">
              🧠
            </div>
            <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">AI Coach Jarvis</h4>
            <p className="text-[10px] text-zinc-400 font-medium">Testify Core Advisor</p>
            
            <div className="mt-4 w-full pt-4 border-t border-zinc-150 dark:border-zinc-850 space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-400 font-medium">Burnout Risk:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{burnoutRisk}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-400 font-medium">Status:</span>
                <span className="font-bold text-emerald-500 flex items-center gap-1">
                  <Activity className="w-3 h-3 animate-ping" />
                  Analyzing
                </span>
              </div>
            </div>
          </div>

          {/* Core coach feedback chat bubble card */}
          <div className="flex-1 space-y-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest font-mono">Section 2 • Intelligent Mentorship</span>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">AI Coach Insights & Burnout Analytics</h3>
            </div>

            {/* Smart chatbot-style card advice */}
            <div className="p-4 rounded-2xl border border-blue-100/60 dark:border-blue-900/40 bg-blue-50/15 dark:bg-blue-950/10 space-y-3 relative">
              <div className="absolute top-3 right-3 text-sm">💡</div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed">
                "Hi there! Analyzing your JEE prep patterns. I noticed repeated accuracy drops in <strong className="text-zinc-900 dark:text-white">{detectedWeakChapters.slice(0, 2).join(" & ")}</strong>. To hit the 99th percentile, prioritize correcting errors in your Mistake Book rather than rushing to solve fresh test papers."
              </p>
              
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[9px] font-extrabold shadow-sm">Recommend Focus</span>
                <span className="text-[10px] text-zinc-400 font-semibold">Spend 45 minutes reviewing Rotational Motion Formulas.</span>
              </div>
            </div>

            {/* Priority weak chapters bento widgets */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 leading-none">Personalized Study Tips & Priorities</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {priorities.slice(0, 2).map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-xl border border-zinc-150 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <h5 className="font-bold text-xs text-zinc-900 dark:text-white">{item.chapter}</h5>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-normal font-medium">{item.reason}</p>
                    <ul className="text-[10px] text-zinc-500 space-y-1 pl-3.5 list-disc font-medium leading-normal">
                      {item.tips.slice(0, 2).map((tip, tIdx) => (
                        <li key={tIdx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 8. SMART REVISION CALENDAR CONTROL PANEL */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-850 pb-4 mb-4">
          <div className="space-y-0.5 text-left">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest font-mono">Section 8 • Dynamic Scheduler</span>
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">Smart Revision Calendar Engine</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm shadow-blue-500/10"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate Calendar Plan</span>
            </button>
          </div>
        </div>

        {/* Input Settings Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150/60 dark:border-zinc-850/60 mb-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Available Study Hours / Day</label>
            <div className="flex items-center gap-2.5">
              <input 
                type="range" 
                min="2" 
                max="14" 
                value={dailyHours} 
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="flex-1 accent-blue-600 cursor-pointer"
              />
              <span className="w-12 text-center font-mono font-extrabold text-xs text-zinc-950 dark:text-white bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-1 rounded-lg shadow-sm">
                {dailyHours} Hrs
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Target exam countdown</label>
            <input 
              type="date" 
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Primary Scheduler Focus</label>
            <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <BrainCircuit className="w-4 h-4 text-purple-500" />
              <span>Weakeness-Prioritized Spacing</span>
            </div>
          </div>
        </div>

        {/* Tab Selector for Calendar View */}
        <div className="flex border-b border-zinc-100 dark:border-zinc-850 mb-5">
          <button
            onClick={() => setActivePlanTab("today")}
            className={`pb-2.5 px-4 font-bold text-xs transition-all relative cursor-pointer ${activePlanTab === "today" ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 hover:text-zinc-600"}`}
          >
            Today's Revision Agenda
            {activePlanTab === "today" && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600" />}
          </button>
          <button
            onClick={() => setActivePlanTab("week")}
            className={`pb-2.5 px-4 font-bold text-xs transition-all relative cursor-pointer ${activePlanTab === "week" ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 hover:text-zinc-600"}`}
          >
            Weekly Roadmap
            {activePlanTab === "week" && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600" />}
          </button>
        </div>

        {/* Tab Display Screens */}
        <AnimatePresence mode="wait">
          {activePlanTab === "today" && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-2xl bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/35 flex items-start gap-3.5">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-xs text-zinc-950 dark:text-white">Today's Core Goal: {calendarDays[0].primary}</h4>
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                    Allocate {calendarDays[0].duration} hours. Read revision theory notes, review your Mistake Book logs, and finish a short 5-question generate test on the chapters below.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-2.5">
                  <span className="text-[8px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">Revision Session 1 (Core Theory)</span>
                  <div className="flex items-center justify-between">
                    <h5 className="font-extrabold text-xs text-zinc-950 dark:text-white">{calendarDays[0].primary}</h5>
                    <span className="text-[10px] font-mono font-bold text-zinc-400">{calendarDays[0].duration} Hours recommended</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-medium">Focus heavily on resolving the weak topics suggested by Jarvis Study Coach above.</p>
                </div>

                <div className="p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-2.5">
                  <span className="text-[8px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md">Revision Session 2 (Active Recall)</span>
                  <div className="flex items-center justify-between">
                    <h5 className="font-extrabold text-xs text-zinc-950 dark:text-white">{calendarDays[0].secondary}</h5>
                    <span className="text-[10px] font-mono font-bold text-zinc-400">{calendarDays[0].secDuration} Hours recommended</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-medium">Try solving 5 to 10 random questions on this chapter inside the Question Library.</p>
                </div>
              </div>
            </motion.div>
          )}

          {activePlanTab === "week" && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-3"
            >
              {calendarDays.map((day, idx) => (
                <div 
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    idx === 0 
                      ? "border-blue-500 bg-blue-50/5 dark:bg-blue-950/10 shadow-xs" 
                      : "border-zinc-150 dark:border-zinc-850 bg-white dark:bg-zinc-950/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 flex flex-col items-center justify-center font-bold text-zinc-500">
                      <span className="text-[8px] leading-none text-zinc-400">{day.dayName.slice(0, 3).toUpperCase()}</span>
                      <span className="text-[10px] leading-none mt-0.5 font-extrabold text-zinc-700 dark:text-zinc-300">{day.dateStr.split(" ")[1]}</span>
                    </div>

                    <div className="text-left space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-zinc-950 dark:text-white">{day.primary}</span>
                        {idx === 0 && <span className="bg-blue-600 text-white text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase">Today</span>}
                      </div>
                      <p className="text-[10px] text-zinc-400 font-medium">Secondary Topic: <strong className="text-zinc-600 dark:text-zinc-300">{day.secondary}</strong></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <div className="text-left sm:text-right font-mono">
                      <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 block">{day.duration + day.secDuration} Hours Total</span>
                      <span className="text-[9px] text-zinc-400 block">Revision Target time</span>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${day.isDone ? "bg-emerald-600 border-emerald-600 text-white" : "border-zinc-300"}`}>
                      {day.isDone && <CheckCircle className="w-3.5 h-3.5 fill-current text-white" />}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
