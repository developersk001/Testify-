import React, { useState, useMemo } from "react";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  Clock, 
  Info, 
  PlayCircle, 
  Check, 
  Sliders,
  Award,
  BookOpen,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TestResult, SubjectType } from "../types";

interface ChapterHeatMapPageProps {
  history: TestResult[];
  onAddNotification: (title: string, message: string, type: "motivation" | "achievement" | "system") => void;
  onTabChange: (tab: string) => void;
  onGenerateTestWithChapter: (subject: SubjectType, chapter: string) => void;
}

const DEFAULT_CHAPTERS: Array<{ name: string; subject: SubjectType; seededSolved: number; seededAccuracy: number }> = [
  // Physics
  { name: "Rotational Motion", subject: "Physics", seededSolved: 12, seededAccuracy: 42 },
  { name: "Electrostatics", subject: "Physics", seededSolved: 24, seededAccuracy: 88 },
  { name: "Thermodynamics & Heat", subject: "Physics", seededSolved: 15, seededAccuracy: 65 },
  { name: "Kinematics & Vectors", subject: "Physics", seededSolved: 30, seededAccuracy: 92 },
  { name: "Electromagnetic Induction", subject: "Physics", seededSolved: 8, seededAccuracy: 50 },
  { name: "Modern Physics", subject: "Physics", seededSolved: 40, seededAccuracy: 85 },
  
  // Chemistry
  { name: "Chemical Bonding", subject: "Chemistry", seededSolved: 18, seededAccuracy: 72 },
  { name: "Coordination Compounds", subject: "Chemistry", seededSolved: 14, seededAccuracy: 82 },
  { name: "Ionic Equilibrium", subject: "Chemistry", seededSolved: 10, seededAccuracy: 35 },
  { name: "Gaseous State", subject: "Chemistry", seededSolved: 22, seededAccuracy: 90 },
  { name: "Hydrocarbons", subject: "Chemistry", seededSolved: 25, seededAccuracy: 58 },
  { name: "Thermodynamics", subject: "Chemistry", seededSolved: 11, seededAccuracy: 61 },

  // Mathematics
  { name: "Definite Integration", subject: "Mathematics", seededSolved: 22, seededAccuracy: 48 },
  { name: "Matrices & Determinants", subject: "Mathematics", seededSolved: 35, seededAccuracy: 94 },
  { name: "Coordinate Geometry", subject: "Mathematics", seededSolved: 20, seededAccuracy: 70 },
  { name: "Limits & Continuity", subject: "Mathematics", seededSolved: 16, seededAccuracy: 66 },
  { name: "Probability", subject: "Mathematics", seededSolved: 14, seededAccuracy: 52 },
  { name: "Complex Numbers", subject: "Mathematics", seededSolved: 12, seededAccuracy: 75 }
];

export default function ChapterHeatMapPage({
  history,
  onAddNotification,
  onTabChange,
  onGenerateTestWithChapter
}: ChapterHeatMapPageProps) {
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | "All">("All");
  const [activeChapter, setActiveChapter] = useState<string | null>(null);

  // Compute dynamic performance map from history
  const chaptersWithStats = useMemo(() => {
    const map: Record<string, { solved: number; correct: number; total: number; accuracy: number }> = {};
    
    // Seed default first
    DEFAULT_CHAPTERS.forEach(ch => {
      const totalQuestions = ch.seededSolved;
      const correctQuestions = Math.round(ch.seededSolved * (ch.seededAccuracy / 100));
      map[ch.name] = {
        solved: totalQuestions,
        correct: correctQuestions,
        total: totalQuestions,
        accuracy: ch.seededAccuracy
      };
    });

    // Update with real history
    history.forEach(res => {
      Object.entries(res.chapterStats || {}).forEach(([chap, stats]) => {
        if (!map[chap]) {
          map[chap] = { solved: 0, correct: 0, total: 0, accuracy: 0 };
        }
        map[chap].solved += stats.total;
        map[chap].correct += stats.correct;
        map[chap].total += stats.total;
        map[chap].accuracy = Math.round((map[chap].correct / map[chap].total) * 100);
      });
    });

    return DEFAULT_CHAPTERS.map(ch => {
      const stats = map[ch.name] || { solved: 0, correct: 0, total: 0, accuracy: 0 };
      
      let status: "Mastered" | "Needs Practice" | "Weak" = "Needs Practice";
      let colorClass = "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950/10 dark:border-yellow-900/30";
      let textClass = "🟢";

      if (stats.accuracy >= 80) {
        status = "Mastered";
        colorClass = "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/10 dark:border-emerald-900/30";
        textClass = "🟢";
      } else if (stats.accuracy < 60) {
        status = "Weak";
        colorClass = "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/10 dark:border-rose-900/30";
        textClass = "🔴";
      } else {
        status = "Needs Practice";
        colorClass = "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/10 dark:border-amber-900/30";
        textClass = "🟡";
      }

      return {
        ...ch,
        solved: stats.solved,
        accuracy: stats.accuracy,
        status,
        colorClass,
        indicator: textClass
      };
    });
  }, [history]);

  const filteredChapters = useMemo(() => {
    if (selectedSubject === "All") return chaptersWithStats;
    return chaptersWithStats.filter(c => c.subject === selectedSubject);
  }, [chaptersWithStats, selectedSubject]);

  const currentChapterInfo = useMemo(() => {
    if (!activeChapter) return null;
    return chaptersWithStats.find(c => c.name === activeChapter) || null;
  }, [activeChapter, chaptersWithStats]);

  const handleLaunchTargetedTest = () => {
    if (!currentChapterInfo) return;
    onAddNotification("Generating Chapter Test 🎯", `Creating customized challenge on ${currentChapterInfo.name}...`, "system");
    onGenerateTestWithChapter(currentChapterInfo.subject, currentChapterInfo.name);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 select-text text-left">
      
      <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-850 pb-4 mb-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest font-mono">Section 3 • Dynamic Mastery Heat Map</span>
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">Chapter Mastery Heat Map</h3>
          </div>

          {/* Subject Filter tab buttons */}
          <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-850">
            {["All", "Physics", "Chemistry", "Mathematics"].map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub as any)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                  selectedSubject === sub 
                    ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs" 
                    : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-zinc-500 leading-relaxed max-w-2xl mb-6">
          Color indicators are generated from mock stats combined with your active test submission history. Red implies chapter revision is urgent, yellow implies practices are pending, green indicates strong concepts. Click any chapter box to launch a customized sub-test or check video suggestions.
        </p>

        {/* Legend block */}
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono mb-6 bg-zinc-50 dark:bg-zinc-950/40 p-3.5 rounded-2xl border border-zinc-150/60 dark:border-zinc-850/60">
          <span className="text-[9px] text-zinc-400 font-extrabold">Mastery Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-zinc-700 dark:text-zinc-300">🟢 Mastered (≥80%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-400" />
            <span className="text-zinc-700 dark:text-zinc-300">🟡 Needs Practice (60-79%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500" />
            <span className="text-zinc-700 dark:text-zinc-300">🔴 Weak (&lt;60%)</span>
          </div>
        </div>

        {/* Grid Box Layout of Chapters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredChapters.map(chap => (
            <div
              key={chap.name}
              onClick={() => setActiveChapter(chap.name)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] hover:shadow-sm text-left flex items-start justify-between ${chap.colorClass} ${
                activeChapter === chap.name ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900" : ""
              }`}
            >
              <div className="space-y-1.5 min-w-0">
                <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 font-mono">{chap.subject}</span>
                <h4 className="font-extrabold text-xs text-zinc-900 dark:text-white truncate">{chap.name}</h4>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="font-medium text-zinc-500">Accuracy:</span>
                  <span className="font-extrabold">{chap.accuracy}%</span>
                </div>
              </div>

              <span className="text-sm shrink-0">{chap.indicator}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DRAWER PANEL DETAIL WHEN CHAPTER IS SELECTED */}
      <AnimatePresence>
        {activeChapter && currentChapterInfo && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm text-left relative overflow-hidden"
          >
            <button
              onClick={() => setActiveChapter(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div className="flex items-start gap-3 border-b border-zinc-100 dark:border-zinc-850 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-xl shrink-0">
                  📚
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">{currentChapterInfo.subject} Details</span>
                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">{currentChapterInfo.name}</h3>
                </div>
              </div>

              {/* Statistics Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150/60 dark:border-zinc-850/60">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Solved Qs</span>
                  <span className="font-extrabold text-sm text-zinc-800 dark:text-white">{currentChapterInfo.solved} Questions</span>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150/60 dark:border-zinc-850/60">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Accuracy Rate</span>
                  <span className="font-extrabold text-sm text-zinc-800 dark:text-white">{currentChapterInfo.accuracy}% Correct</span>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150/60 dark:border-zinc-850/60">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Est. Time / Question</span>
                  <span className="font-extrabold text-sm text-zinc-800 dark:text-white">102 Seconds</span>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150/60 dark:border-zinc-850/60">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Chapter Status</span>
                  <span className="font-extrabold text-sm text-zinc-800 dark:text-white">{currentChapterInfo.status}</span>
                </div>
              </div>

              {/* Suggested Revision Videos */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 leading-none">Suggested Revision Masterclasses</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { title: "One-Shot Revision Masterclass", author: "Physics Wallah Core Library", duration: "1h 45m" },
                    { title: "Top 20 PYQ Walkthroughs", author: "Vedantu JEE Channel Pro", duration: "55 mins" }
                  ].map((vid, idx) => (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-xl border border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <PlayCircle className="w-5 h-5 text-red-500" />
                        <div className="text-left">
                          <h5 className="font-bold text-[11px] text-zinc-900 dark:text-white">{vid.title}</h5>
                          <span className="text-[9px] text-zinc-400">{vid.author}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-semibold">{vid.duration}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 border-t border-zinc-100 dark:border-zinc-850 pt-5">
                <button
                  onClick={handleLaunchTargetedTest}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-blue-500/10"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Start Customized 5-Question Test</span>
                </button>
                <button
                  onClick={() => setActiveChapter(null)}
                  className="px-5 py-3 rounded-xl border border-zinc-250 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50"
                >
                  Close Details
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
