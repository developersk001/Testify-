import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { 
  Plus, 
  Sparkles, 
  History, 
  Clock, 
  Trophy, 
  Target, 
  BarChart2, 
  Flame, 
  ArrowRight, 
  RotateCcw,
  BookOpen,
  Calendar,
  Share2,
  Copy,
  Check,
  ChevronRight,
  Bookmark,
  TrendingUp,
  Award
} from "lucide-react";
import { motion } from "motion/react";
import { UserProfile, TestResult, ActiveTestState } from "../types";
import { 
  TrophyIllustration, 
  StudentIllustration, 
  RocketIllustration, 
  BrainIllustration 
} from "./Illustrations";

interface DashboardProps {
  onTabChange: (tab: string) => void;
  userProfile: UserProfile;
  history: TestResult[];
  activeTest: ActiveTestState | null;
  onContinueActiveTest: () => void;
  onCreateRandomTest: (count?: number, isDailyChallenge?: boolean) => void;
  onSelectHistoryTest: (test: TestResult) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950 dark:bg-zinc-800 text-white text-[11px] p-2.5 rounded-xl shadow-lg border border-zinc-800 dark:border-zinc-700 space-y-1">
        <p className="font-extrabold">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-1.5 font-bold">
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.stroke }} 
            />
            <span className="text-zinc-300">{entry.name}:</span>
            <span style={{ color: entry.stroke }}>
              {entry.value}%
            </span>
            {entry.payload.rawScore && entry.name === "Score" && (
              <span className="text-zinc-400 font-mono">({entry.payload.rawScore})</span>
            )}
          </div>
        ))}
        {payload[0]?.payload.exam && (
          <p className="text-[9px] text-zinc-400 italic font-mono pt-0.5 border-t border-zinc-800 dark:border-zinc-700">
            {payload[0].payload.exam}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function Dashboard({
  onTabChange,
  userProfile,
  history,
  activeTest,
  onContinueActiveTest,
  onCreateRandomTest,
  onSelectHistoryTest
}: DashboardProps) {

  const [examTarget, setExamTarget] = useState<"main" | "advanced">(() => {
    return (localStorage.getItem("testify_exam_target") as "main" | "advanced") || "main";
  });

  const [jeeMainDate, setJeeMainDate] = useState<string>(() => {
    return localStorage.getItem("testify_jee_main_date") || "2027-01-24";
  });

  const [jeeAdvancedYear, setJeeAdvancedYear] = useState<number>(() => {
    return Number(localStorage.getItem("testify_jee_advanced_year")) || 2027;
  });

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  // SVG Chart Responsiveness setup
  const [chartWidth, setChartWidth] = useState(500);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setChartWidth(entry.contentRect.width || 500);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const handleSetExamTarget = (target: "main" | "advanced") => {
    setExamTarget(target);
    localStorage.setItem("testify_exam_target", target);
  };

  const daysRemaining = useMemo(() => {
    const targetDateStr = examTarget === "main" ? jeeMainDate : `${jeeAdvancedYear}-05-23`;
    const targetDate = new Date(targetDateStr);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [examTarget, jeeMainDate, jeeAdvancedYear]);

  const formattedTargetDate = useMemo(() => {
    try {
      const d = new Date(jeeMainDate);
      if (isNaN(d.getTime())) return jeeMainDate;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return jeeMainDate;
    }
  }, [jeeMainDate]);

  const fallbackCopy = (text: string, index: number) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.width = "2em";
      textArea.style.height = "2em";
      textArea.style.padding = "0";
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";
      textArea.style.background = "transparent";
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } else {
        // Fallback visual feedback anyway
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      }
    } catch (err) {
      console.warn("Fallback copy failed", err);
      // Fallback visual feedback anyway
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const handleCopyShare = (text: string, index: number) => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopiedIndex(index);
          setTimeout(() => {
            setCopiedIndex(null);
          }, 2000);
        })
        .catch((err) => {
          console.warn("Clipboard writeText failed, trying fallback", err);
          fallbackCopy(text, index);
        });
    } else {
      fallbackCopy(text, index);
    }
  };

  const stats = useMemo(() => {
    const totalTests = history.length;
    const questionsSolved = history.reduce((acc, t) => acc + t.attempted, 0);
    
    let totalAccuracySum = 0;
    let totalScoreSum = 0;
    let totalMaxScoreSum = 0;
    history.forEach(t => {
      totalAccuracySum += t.accuracy;
      totalScoreSum += t.score;
      totalMaxScoreSum += t.totalMarks;
    });

    const averageAccuracy = totalTests > 0 ? Math.round(totalAccuracySum / totalTests) : 0;
    const averageScorePercent = totalTests > 0 && totalMaxScoreSum > 0 
      ? Math.round((totalScoreSum / totalMaxScoreSum) * 100) 
      : 0;

    const hoursPracticed = (userProfile.studyTimeSeconds / 3600).toFixed(1);

    return {
      totalTests,
      questionsSolved,
      averageAccuracy,
      averageScorePercent,
      hoursPracticed
    };
  }, [history, userProfile]);

  // Level & XP calculation
  const calculatedLevel = useMemo(() => {
    return Math.floor(stats.questionsSolved / 50) + 12; // starts at lvl 12
  }, [stats.questionsSolved]);

  const calculatedXP = useMemo(() => {
    const currentLvlXP = (stats.questionsSolved * 60) % 3000;
    return currentLvlXP + 2350 > 3000 ? (currentLvlXP + 2350) % 3000 : currentLvlXP + 2350;
  }, [stats.questionsSolved]);

  const quote = useMemo(() => {
    const quotes = [
      { text: "Your potential is unlimited. Every PYQ you solve today is a step closer to IIT.", author: "Testify Performance AI" },
      { text: "Success in JEE is the sum of small efforts, repeated day in and day out.", author: "Testify Performance AI" },
      { text: "The difference between ordinary and extraordinary is that little 'extra'. Push your boundaries.", author: "Testify Performance AI" },
      { text: "Work hard in silence, let your JEE rank make the noise.", author: "Testify Coach" }
    ];
    const idx = new Date().getDate() % quotes.length;
    return quotes[idx];
  }, []);

  // Transform history data for Recharts LineChart
  const scoresOverTime = useMemo(() => {
    if (history.length === 0) {
      // Sample data when there is no history to show improvement path
      return [
        { name: "Mock 1", score: 45, accuracy: 50, date: "Sample 1", exam: "JEE Main", rawScore: "18/40" },
        { name: "Mock 2", score: 52, accuracy: 58, date: "Sample 2", exam: "JEE Main", rawScore: "21/40" },
        { name: "Mock 3", score: 60, accuracy: 65, date: "Sample 3", exam: "JEE Main", rawScore: "24/40" },
        { name: "Mock 4", score: 58, accuracy: 62, date: "Sample 4", exam: "JEE Main", rawScore: "23/40" },
        { name: "Mock 5", score: 70, accuracy: 74, date: "Sample 5", exam: "JEE Main", rawScore: "28/40" },
        { name: "Mock 6", score: 78, accuracy: 82, date: "Sample 6", exam: "JEE Main", rawScore: "31/40" }
      ];
    }

    // Sort history from oldest to newest (chronological order)
    const sortedHistory = [...history].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return sortedHistory.map((test, index) => {
      const percentage = test.totalMarks > 0 ? Math.round((test.score / test.totalMarks) * 100) : 0;
      const dateObj = new Date(test.date);
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      
      return {
        name: `Mock ${index + 1}`,
        score: percentage, // percentage score (0-100) for clean comparison across different total marks
        rawScore: `${test.score}/${test.totalMarks}`,
        accuracy: test.accuracy,
        date: formattedDate,
        exam: test.config.exam,
      };
    });
  }, [history]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-2 select-text text-zinc-900 dark:text-zinc-50">
      
      {/* 1. Welcome Greeting Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            Welcome back, {userProfile.name}! <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 font-medium">
            Stay consistent today. Success is closer than you think!
          </p>
        </div>

        {/* Customizable target triggers */}
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-100 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer border border-zinc-200 dark:border-zinc-800"
        >
          <Calendar className="w-4 h-4 text-blue-500" />
          <span>Set Exam Date</span>
        </button>
      </div>

      {/* Target Settings Box */}
      {showConfig && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">JEE Target Configurator</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Exam target:</span>
              <div className="flex gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg">
                <button
                  onClick={() => handleSetExamTarget("main")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                    examTarget === "main" ? "bg-blue-600 text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  JEE Main
                </button>
                <button
                  onClick={() => handleSetExamTarget("advanced")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                    examTarget === "advanced" ? "bg-blue-600 text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  Advanced
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              {examTarget === "main" ? (
                <>
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Main date:</span>
                  <input
                    type="date"
                    value={jeeMainDate}
                    onChange={(e) => {
                      setJeeMainDate(e.target.value);
                      localStorage.setItem("testify_jee_main_date", e.target.value);
                    }}
                    className="px-2.5 py-1 text-xs font-bold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </>
              ) : (
                <>
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Advanced year:</span>
                  <select
                    value={jeeAdvancedYear}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setJeeAdvancedYear(val);
                      localStorage.setItem("testify_jee_advanced_year", String(val));
                    }}
                    className="px-2 py-1 text-xs font-bold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {[2025, 2026, 2027, 2028, 2029, 2030].map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. Top Row Cards (Streak & Level) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Card: 7 Days Streak */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:border-zinc-200 dark:hover:border-zinc-750 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-orange-500/10 dark:bg-orange-500/15 rounded-xl flex items-center justify-center text-orange-500">
              <Flame className="w-6 h-6 fill-current animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white">{userProfile.streak} Days Streak</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Keep it up! Keep learning daily.</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </div>

        {/* Right Card: Level 12 Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:border-zinc-200 dark:hover:border-zinc-750 transition-all">
          <div className="flex-1 flex items-center gap-3.5 mr-4">
            <div className="w-11 h-11 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-xl flex items-center justify-center text-indigo-500">
              <Award className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white">Level {calculatedLevel}</h4>
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">{calculatedXP} / 3000 XP</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(calculatedXP / 3000) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
        </div>
      </div>

      {/* 3. Hero Banner Card */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-blue-500/10">
        {/* Background graphic flare overlays */}
        <div className="absolute -right-10 -top-10 w-44 h-44 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 opacity-15 dark:opacity-25 pointer-events-none">
          <RocketIllustration className="w-56 h-56" />
        </div>

        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
            <span>🚀 JEE {examTarget === "main" ? "Main" : "Advanced"} {examTarget === "main" ? new Date(jeeMainDate).getFullYear() || 2025 : jeeAdvancedYear}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Your Success, Our Mission
          </h2>
          <p className="text-blue-100/90 text-xs sm:text-sm leading-relaxed font-medium">
            Practice regularly, analyze your performance, and improve every day. Generate chapter-wise mock tests with real-time analytics.
          </p>

          <div className="pt-2">
            <button 
              onClick={() => onTabChange("create-test")}
              className="px-5 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Start Mock Test</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Carousel Dots indicators */}
        <div className="flex gap-1.5 mt-6 justify-start">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/35" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/35" />
        </div>
      </div>

      {/* 4. High-Level Stats Grid */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-zinc-100 dark:divide-zinc-800">
          
          {/* Col 1 */}
          <div className="p-3 text-center md:text-left flex flex-col justify-between">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Tests Taken</span>
            <div className="mt-2.5">
              <span className="text-3xl font-black tracking-tight">{stats.totalTests}</span>
              <span className="text-[10px] font-bold text-emerald-500 block mt-1">+{Math.min(12, stats.totalTests)} this week</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="p-3 text-center md:text-left flex flex-col justify-between pt-4 md:pt-3">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Qs Solved</span>
            <div className="mt-2.5">
              <span className="text-3xl font-black tracking-tight">{stats.questionsSolved}</span>
              <span className="text-[10px] font-bold text-emerald-500 block mt-1">+{Math.min(215, stats.questionsSolved)} this week</span>
            </div>
          </div>

          {/* Col 3 */}
          <div className="p-3 text-center md:text-left flex flex-col justify-between pt-4 md:pt-3">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Accuracy</span>
            <div className="mt-2.5">
              <span className="text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">{stats.averageAccuracy}%</span>
              <span className="text-[10px] font-bold text-emerald-500 block mt-1">+6% this week</span>
            </div>
          </div>

          {/* Col 4 */}
          <div className="p-3 text-center md:text-left flex flex-col justify-between pt-4 md:pt-3">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Best Streak</span>
            <div className="mt-2.5">
              <span className="text-3xl font-black tracking-tight">{userProfile.streak} Days</span>
              <span className="text-[10px] font-bold text-emerald-500 block mt-1">Keep it up!</span>
            </div>
          </div>

          {/* Col 5 */}
          <div className="p-3 text-center md:text-left flex flex-col justify-between pt-4 md:pt-3 col-span-2 md:col-span-1">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Estimated Rank</span>
            <div className="mt-2.5">
              <span className="text-3xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">1643<span className="text-xs text-zinc-400">/15k</span></span>
              <span className="text-[10px] font-bold text-indigo-500 block mt-1">Top 10.6%</span>
            </div>
          </div>

        </div>
      </div>

      {/* 5. Quick Actions Bento Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black tracking-tight">Quick Actions</h3>
          <button 
            onClick={() => onTabChange("create-test")}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Action 1: Mock Test */}
          <button 
            onClick={() => onTabChange("create-test")}
            className="p-4 bg-purple-500/10 dark:bg-purple-950/20 border border-purple-500/10 rounded-2xl flex flex-col items-start gap-3 hover:scale-[1.02] active:scale-95 transition-all text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-purple-950 dark:text-purple-300">Mock Test</h4>
              <p className="text-[10px] text-purple-700/80 dark:text-purple-400/80 mt-0.5">Solve full-length paper</p>
            </div>
          </button>

          {/* Action 2: Practice */}
          <button 
            onClick={() => onCreateRandomTest(10, false)}
            className="p-4 bg-blue-500/10 dark:bg-blue-950/20 border border-blue-500/10 rounded-2xl flex flex-col items-start gap-3 hover:scale-[1.02] active:scale-95 transition-all text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Target className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-blue-950 dark:text-blue-300">Practice</h4>
              <p className="text-[10px] text-blue-700/80 dark:text-blue-400/80 mt-0.5">Rapid 10-Q PYQ drill</p>
            </div>
          </button>

          {/* Action 3: Chapter Test */}
          <button 
            onClick={() => onTabChange("create-test")}
            className="p-4 bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/10 rounded-2xl flex flex-col items-start gap-3 hover:scale-[1.02] active:scale-95 transition-all text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-emerald-950 dark:text-emerald-300">Chapter Test</h4>
              <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">Zero-in on selected topics</p>
            </div>
          </button>

          {/* Action 4: Weak Areas */}
          <button 
            onClick={() => onTabChange("mistake-book")}
            className="p-4 bg-orange-500/10 dark:bg-orange-950/20 border border-orange-500/10 rounded-2xl flex flex-col items-start gap-3 hover:scale-[1.02] active:scale-95 transition-all text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-orange-950 dark:text-orange-300">Weak Areas</h4>
              <p className="text-[10px] text-orange-700/80 dark:text-orange-400/80 mt-0.5">Review mistake book log</p>
            </div>
          </button>

        </div>
      </div>

      {/* 6. Continue Learning Card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black tracking-tight">Continue Learning</h3>
          <button 
            onClick={() => onTabChange("revision")}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            {/* Atom/Physics symbol avatar */}
            <div className="w-12 h-12 bg-violet-600 rounded-2xl flex flex-col items-center justify-center text-white shrink-0 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-indigo-600 opacity-90" />
              <div className="relative z-10 flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5.5 h-5.5 animate-spin" style={{ animationDuration: '8s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(45 12 12)" />
                  <ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(-45 12 12)" />
                  <circle cx="12" cy="12" r="1.5" />
                </svg>
                <span className="text-[7.5px] font-black tracking-tighter mt-1 uppercase">PHYSICS</span>
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white truncate">Laws of Motion</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 max-w-sm bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full" style={{ width: "68%" }} />
                </div>
                <span className="text-[10px] font-mono font-extrabold text-zinc-500">68%</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => onCreateRandomTest(10, false)}
            className="px-4.5 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer shadow-xs border border-indigo-100/50 dark:border-indigo-950"
          >
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 7. Performance Overview Recharts Line Chart */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black tracking-tight">Performance Tracker</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {history.length === 0 
                ? "Showing mock improvement curve (Practice to see your real progress!)" 
                : "Real-time track of your percentage scores and accuracy across mock sessions"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Score %</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Accuracy %</span>
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs">
          <div className="w-full" style={{ height: "240px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={scoresOverTime}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#E5E7EB" 
                  className="dark:stroke-zinc-800"
                  vertical={false}
                />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }}
                  tickLine={false}
                  axisLine={false}
                  dx={-5}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  name="Score"
                  type="monotone"
                  dataKey="score"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  dot={{ stroke: '#3B82F6', strokeWidth: 2, r: 4, fill: '#FFFFFF' }}
                />
                <Line
                  name="Accuracy"
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  activeDot={{ r: 5 }}
                  dot={{ stroke: '#10B981', strokeWidth: 2, r: 3.5, fill: '#FFFFFF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 8. Active Test Resume Alert (if any active test found) */}
      {activeTest && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="font-extrabold text-amber-800 dark:text-amber-400">Ongoing Mock Test Saved</h3>
            </div>
            <p className="text-xs text-amber-700/90 dark:text-amber-300/80 font-medium">
              Your {activeTest.config.exam} test from earlier is saved and ready. Remaining time: <span className="font-mono font-bold">{Math.floor(activeTest.timeRemaining / 60)}m {activeTest.timeRemaining % 60}s</span>.
            </p>
          </div>
          <button 
            onClick={onContinueActiveTest}
            className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <span>Resume Test</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* 9. Premium WhatsApp & Share Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="flex justify-center items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.863-9.83.001-2.624-1.02-5.09-2.875-6.948-1.855-1.858-4.325-2.88-6.953-2.88-5.438 0-9.862 4.414-9.865 9.831-.001 2.016.524 3.987 1.522 5.717l-.991 3.616 3.7-.972zm11.367-7.46c-.08-.13-.292-.21-.61-.37-.317-.16-1.873-.925-2.163-1.03-.292-.105-.502-.16-.713.16-.21.32-.813.103-.996 1.246-.183.21-.365.24-.682.08-.318-.16-1.34-.493-2.554-1.578-.94-.84-1.575-1.88-1.759-2.19-.183-.32-.02-.49.14-.65.143-.14.317-.37.476-.56.16-.19.21-.32.318-.53.106-.21.053-.4-.027-.56-.08-.16-.713-1.714-.977-2.353-.257-.624-.52-.54-.713-.55-.183-.01-.397-.01-.61-.01-.21 0-.555.08-.846.4-.29.32-1.11 1.08-1.11 2.64 0 1.56 1.14 3.07 1.3 3.28.16.21 2.245 3.428 5.44 4.81.76.33 1.352.527 1.815.673.764.243 1.46.21 2.012.127.614-.09 1.873-.765 2.138-1.467.264-.7.264-1.3.185-1.427z"/>
              </svg>
            </span>
            <span className="text-zinc-400 dark:text-zinc-600">/</span>
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-500">
              <Share2 className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black tracking-tight text-zinc-900 dark:text-white">
            Join Community & Spread the Word
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Get instant updates on JEE notifications, daily practice sheets, hand-written notes, and rank-boosting tips. Share Testify with your friends to practice smart together!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-3.5 max-w-xl mx-auto">
          {/* WhatsApp Channel Link */}
          <a
            href="https://whatsapp.com/channel/0029Vb8N3QG89inbVgSzN80I"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-1/2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs sm:text-sm hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer text-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.863-9.83.001-2.624-1.02-5.09-2.875-6.948-1.855-1.858-4.325-2.88-6.953-2.88-5.438 0-9.862 4.414-9.865 9.831-.001 2.016.524 3.987 1.522 5.717l-.991 3.616 3.7-.972zm11.367-7.46c-.08-.13-.292-.21-.61-.37-.317-.16-1.873-.925-2.163-1.03-.292-.105-.502-.16-.713.16-.21.32-.813.103-.996 1.246-.183.21-.365.24-.682.08-.318-.16-1.34-.493-2.554-1.578-.94-.84-1.575-1.88-1.759-2.19-.183-.32-.02-.49.14-.65.143-.14.317-.37.476-.56.16-.19.21-.32.318-.53.106-.21.053-.4-.027-.56-.08-.16-.713-1.714-.977-2.353-.257-.624-.52-.54-.713-.55-.183-.01-.397-.01-.61-.01-.21 0-.555.08-.846.4-.29.32-1.11 1.08-1.11 2.64 0 1.56 1.14 3.07 1.3 3.28.16.21 2.245 3.428 5.44 4.81.76.33 1.352.527 1.815.673.764.243 1.46.21 2.012.127.614-.09 1.873-.765 2.138-1.467.264-.7.264-1.3.185-1.427z"/>
            </svg>
            <span>Join WhatsApp Channel</span>
          </a>

          {/* Spread the Word Share Button */}
          <button
            onClick={async () => {
              const shareText = `Boost your JEE preparation with Testify! Practice Chapter-wise and subject-wise high yield PYQ mock tests, track mistakes and analyze your prep status. Solved ${stats.questionsSolved} questions with ${stats.averageAccuracy}% accuracy across ${stats.totalTests} tests. Join me in the JEE grind! 🔥`;
              const shareUrl = window.location.origin;
              
              if (navigator.share) {
                try {
                  await navigator.share({
                    title: "Testify - JEE Preparation",
                    text: shareText,
                    url: shareUrl
                  });
                } catch (err) {
                  handleCopyShare(`${shareText} Try it here: ${shareUrl}`, 0);
                }
              } else {
                handleCopyShare(`${shareText} Try it here: ${shareUrl}`, 0);
              }
            }}
            className="w-full sm:w-1/2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs sm:text-sm hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{copiedIndex === 0 ? "Copied Share Link! 🎉" : "Share Testify App"}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
