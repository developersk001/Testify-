import React, { useMemo } from "react";
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
  Calendar
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

export default function Dashboard({
  onTabChange,
  userProfile,
  history,
  activeTest,
  onContinueActiveTest,
  onCreateRandomTest,
  onSelectHistoryTest
}: DashboardProps) {

  const [examTarget, setExamTarget] = React.useState<"main" | "advanced">(() => {
    return (localStorage.getItem("testify_exam_target") as "main" | "advanced") || "main";
  });

  const handleSetExamTarget = (target: "main" | "advanced") => {
    setExamTarget(target);
    localStorage.setItem("testify_exam_target", target);
  };

  const daysRemaining = useMemo(() => {
    const targetDate = examTarget === "main" ? new Date("2027-01-24") : new Date("2027-05-23");
    const diffTime = targetDate.getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [examTarget]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

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

  // Motivational Quotes list
  const quote = useMemo(() => {
    const quotes = [
      { text: "Your potential is unlimited. Every PYQ you solve today is a step closer to IIT.", author: "Testify Performance AI" },
      { text: "Success in JEE is the sum of small efforts, repeated day in and day out.", author: "Testify Performance AI" },
      { text: "The difference between ordinary and extraordinary is that little 'extra'. Push your boundaries.", author: "Testify Performance AI" },
      { text: "Work hard in silence, let your JEE rank make the noise.", author: "Testify Coach" }
    ];
    // Select based on day of month to keep stable per day
    const idx = new Date().getDate() % quotes.length;
    return quotes[idx];
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-zinc-900 dark:text-zinc-50">
      
      {/* Dynamic Greetings & Hero Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-100 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-4 bottom-0 opacity-10 dark:opacity-20 pointer-events-none">
            <StudentIllustration className="w-56 h-56" />
          </div>
          <div className="space-y-4 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized JEE PYQ Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {greeting}, <span className="text-blue-600 dark:text-blue-400">{userProfile.name}</span>!
            </h1>
            <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
              Ready to accelerate your preparation? Generate highly targeted mock tests from our deep catalog of Previous Year Questions.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <button 
              onClick={() => onTabChange("create-test")}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Mock Test</span>
            </button>
            <button 
              onClick={() => onTabChange("history")}
              className="px-5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-all flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              <span>View History</span>
            </button>
          </div>
        </div>

        {/* Countdown & Motivation card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/85 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">Countdown to Success</span>
              {/* Exam Target Selector */}
              <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                <button
                  onClick={() => handleSetExamTarget("main")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                    examTarget === "main"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  JEE Main
                </button>
                <button
                  onClick={() => handleSetExamTarget("advanced")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                    examTarget === "advanced"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  Advanced
                </button>
              </div>
            </div>

            {/* Countdown display */}
            <div className="flex items-baseline gap-2 mb-4 bg-blue-500/5 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100/50 dark:border-blue-950/40">
              <span className="text-4xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">
                {daysRemaining}
              </span>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                days left for {examTarget === "main" ? "JEE Main (Jan 24, 2027)" : "JEE Advanced (May 23, 2027)"}
              </span>
            </div>
          </div>
          
          <div className="my-4 border-t border-zinc-100 dark:border-zinc-800/50 pt-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block mb-2">Daily Motivation</span>
            <p className="text-sm font-medium italic text-zinc-600 dark:text-zinc-300 leading-relaxed">
              "{quote.text}"
            </p>
            <span className="text-xs text-zinc-400 block mt-2 font-mono">
              — {quote.author}
            </span>
          </div>

          <div className="border-t border-zinc-150/60 dark:border-zinc-800/80 pt-4 flex justify-between items-center text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Member since:</span>
            </div>
            <span className="font-semibold">{new Date(userProfile.joinedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Resume Active Test Banner */}
      {activeTest && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-200/50 dark:border-yellow-900/30 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" />
              <h3 className="font-bold text-yellow-800 dark:text-yellow-400">Ongoing Mock Test Found</h3>
            </div>
            <p className="text-sm text-yellow-700/90 dark:text-yellow-300/80">
              Your {activeTest.config.exam} test from earlier is saved and ready. Remaining time: <span className="font-mono font-bold">{Math.floor(activeTest.timeRemaining / 60)}m {activeTest.timeRemaining % 60}s</span>.
            </p>
          </div>
          <button 
            onClick={onContinueActiveTest}
            className="w-full sm:w-auto px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-yellow-500/10"
          >
            <span>Resume Test</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Quick Start Options */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all shadow-sm group">
            <div className="flex items-center justify-between pb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs bg-zinc-100 dark:bg-zinc-850 px-2 py-1 rounded font-medium">10 Questions</span>
            </div>
            <h3 className="font-bold text-base mb-1">Random Express Test</h3>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              No configurations needed. Generate a fast 10-question mixed high-yield PYQ mock test instantly.
            </p>
            <button 
              onClick={() => onCreateRandomTest(10, false)}
              className="w-full py-2 bg-zinc-50 hover:bg-blue-600 hover:text-white dark:bg-zinc-850 dark:hover:bg-blue-600 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 text-zinc-700 dark:text-zinc-300"
            >
              <span>Launch Express Mock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all shadow-sm group">
            <div className="flex items-center justify-between pb-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-purple-600">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="text-xs bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 px-2 py-1 rounded font-medium">Daily</span>
            </div>
            <h3 className="font-bold text-base mb-1">Daily PYQ Challenge</h3>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              Solve a curated set of 10 high-quality previous year questions picked specifically for today's goal.
            </p>
            <button 
              onClick={() => onCreateRandomTest(10, true)}
              className="w-full py-2 bg-zinc-50 hover:bg-purple-600 hover:text-white dark:bg-zinc-850 dark:hover:bg-purple-600 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 text-zinc-700 dark:text-zinc-300"
            >
              <span>Start Daily Challenge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all shadow-sm group">
            <div className="flex items-center justify-between pb-4">
              <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl text-cyan-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs bg-zinc-100 dark:bg-zinc-850 px-2 py-1 rounded font-medium">Auto-aggregated</span>
            </div>
            <h3 className="font-bold text-base mb-1">Mistake Book Review</h3>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              Re-practice questions you answered incorrectly in prior tests to systematically seal knowledge gaps.
            </p>
            <button 
              onClick={() => onTabChange("mistake-book")}
              className="w-full py-2 bg-zinc-50 hover:bg-cyan-600 hover:text-white dark:bg-zinc-850 dark:hover:bg-cyan-600 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 text-zinc-700 dark:text-zinc-300"
            >
              <span>Explore Mistakes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Numerical Stats Panels */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Performance Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold uppercase">Tests Taken</span>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-3xl font-extrabold tracking-tight">{stats.totalTests}</span>
              <span className="text-xs text-zinc-400">Mock papers</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold uppercase">Questions Solved</span>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-3xl font-extrabold tracking-tight">{stats.questionsSolved}</span>
              <span className="text-xs text-zinc-400">Total</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold uppercase">Average Accuracy</span>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">{stats.averageAccuracy}%</span>
              <span className="text-xs text-zinc-400">Correct answers</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold uppercase">Avg Score Percent</span>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-3xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">{stats.averageScorePercent}%</span>
              <span className="text-xs text-zinc-400">Aggregate</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm col-span-2 md:col-span-1">
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold uppercase">Hours Practiced</span>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-3xl font-extrabold tracking-tight text-purple-600 dark:text-purple-400">{stats.hoursPracticed}</span>
              <span className="text-xs text-zinc-400">Hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tests List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Recent Activity</h2>
          {history.length > 0 && (
            <button 
              onClick={() => onTabChange("history")}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline"
            >
              <span>View all mock history</span>
              <ArrowRight className="w-3" />
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-4">
            <TrophyIllustration className="w-24 h-24 text-zinc-300" />
            <h3 className="font-bold text-lg text-zinc-700 dark:text-zinc-300">No mock tests completed yet</h3>
            <p className="text-xs text-zinc-500 max-w-md leading-relaxed">
              Your test reports, scoring analytics, and weak chapter predictions will populate here as soon as you submit your first JEE Mock Exam.
            </p>
            <button 
              onClick={() => onTabChange("create-test")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Test</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.slice(0, 4).map((item) => (
              <div 
                key={item.id}
                onClick={() => onSelectHistoryTest(item)}
                className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl p-4 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all shadow-sm cursor-pointer flex flex-col justify-between gap-4 group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono tracking-wider text-zinc-400 font-bold uppercase">{item.config.exam} • {new Date(item.date).toLocaleDateString()}</span>
                    <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Custom Mock ({item.totalQuestions} Questions)
                    </h4>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-extrabold text-zinc-900 dark:text-white">
                      {item.score} <span className="text-xs text-zinc-400 font-normal">/ {item.totalMarks}</span>
                    </div>
                    <span className="text-[10px] font-medium text-zinc-500">{item.accuracy}% Accuracy</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs border-t border-zinc-50 dark:border-zinc-800/50 pt-3 text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Time Taken: {Math.floor(item.timeTaken / 60)}m {item.timeTaken % 60}s</span>
                  </div>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Review Analysis</span>
                    <ArrowRight className="w-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
