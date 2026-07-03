import React, { useState, useEffect } from "react";
import { 
  Layout, 
  Home, 
  Sliders, 
  BookOpen, 
  History, 
  Settings as SettingsIcon, 
  Search, 
  ShieldAlert, 
  Sparkles, 
  BookOpenCheck,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  AlertCircle,
  ChevronLeft,
  Flame
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { 
  Question, 
  TestConfig, 
  ActiveTestState, 
  TestResult, 
  SubjectType 
} from "./types";
import { getQuestionBank } from "./data/questions";
import { LOGO_URL } from "./constants";

// Pages
import Dashboard from "./components/Dashboard";
import TestCreator from "./components/TestCreator";
import TestPage from "./components/TestPage";
import ResultPage from "./components/ResultPage";
import HistoryPage from "./components/HistoryPage";
import SettingsPage from "./components/SettingsPage";
import MistakeBookPage from "./components/MistakeBookPage";
import RevisionPage from "./components/RevisionPage";
import GlobalSearchPage from "./components/GlobalSearchPage";
import WelcomePage from "./components/WelcomePage";

export default function App() {
  // Authentication / Profile
  const [username, setUsername] = useState<string>("");
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  // Layout View State
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Questions Database
  const [questionBank, setQuestionBank] = useState<Question[]>([]);

  // User Data Store
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [mistakeNotes, setMistakeNotes] = useState<Record<string, string>>({});

  // Active testing states
  const [activeTest, setActiveTest] = useState<ActiveTestState | null>(null);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [showResumeBanner, setShowResumeBanner] = useState(false);

  // Sync State utility to keep LocalStorage securely updated
  const syncState = (
    nextUsername: string,
    nextHistory: TestResult[],
    nextBookmarks: string[],
    nextMistakes: Record<string, string>,
    nextActiveTest: ActiveTestState | null
  ) => {
    localStorage.setItem("testify_username", nextUsername);
    localStorage.setItem("testify_test_history", JSON.stringify(nextHistory));
    localStorage.setItem("testify_bookmarks", JSON.stringify(nextBookmarks));
    localStorage.setItem("testify_mistake_notes", JSON.stringify(nextMistakes));
    if (nextActiveTest) {
      localStorage.setItem("testify_active_test_session", JSON.stringify(nextActiveTest));
    } else {
      localStorage.removeItem("testify_active_test_session");
    }
  };

  // Initial configuration and local state load
  useEffect(() => {
    // Theme setup
    const savedTheme = localStorage.getItem("testify_theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }

    // Name setup
    const name = localStorage.getItem("testify_username");
    if (name) {
      setUsername(name);
      setIsFirstVisit(false);
    }

    // Question bank
    const qBank = getQuestionBank();
    setQuestionBank(qBank);

    // Load History, Bookmarks, Mistakes
    try {
      const historyStr = localStorage.getItem("testify_test_history");
      if (historyStr) setTestHistory(JSON.parse(historyStr));

      const bookmarksStr = localStorage.getItem("testify_bookmarks");
      if (bookmarksStr) setBookmarks(JSON.parse(bookmarksStr));

      const mistakesStr = localStorage.getItem("testify_mistake_notes");
      if (mistakesStr) setMistakeNotes(JSON.parse(mistakesStr));
    } catch (e) {
      console.error("Failed to parse local profile states:", e);
    }

    // Resumable Session check
    const activeSessionStr = localStorage.getItem("testify_active_test_session");
    if (activeSessionStr) {
      try {
        const session: ActiveTestState = JSON.parse(activeSessionStr);
        if (session && session.timeRemaining > 0 && !session.isSubmitted) {
          setActiveTest(session);
          setShowResumeBanner(true);
        }
      } catch (e) {}
    }
  }, []);

  // Sync Dark mode toggles
  const toggleDarkMode = () => {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    if (nextVal) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("testify_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("testify_theme", "light");
    }
  };

  const handleNameSubmitted = (name: string) => {
    setUsername(name);
    setIsFirstVisit(false);
    setCurrentView("dashboard");
    syncState(name, testHistory, bookmarks, mistakeNotes, activeTest);
  };

  // Generate Test Engine
  const handleGenerateTest = (config: TestConfig) => {
    // 1. Filter matching questions
    let pool = questionBank.filter(q => {
      // Exam Filter (If "Mixed", include all JEE Main and JEE Advanced)
      if (config.exam !== "Mixed" && q.exam !== config.exam) return false;
      // Subject Filter
      if (!config.subjects.includes(q.subject)) return false;
      // Years Filter
      if (config.years.length > 0 && !config.years.includes(q.year)) return false;
      // Chapters Filter
      if (config.chapters.length > 0 && !config.chapters.includes(q.chapter)) return false;
      // Difficulty Filter
      if (config.difficulty !== "Mixed" && q.difficulty !== config.difficulty) return false;
      return true;
    });

    // Fallback if pool is empty/too small - pull from general subject pool
    if (pool.length < config.totalQuestions) {
      pool = questionBank.filter(q => config.subjects.includes(q.subject));
    }

    // Shuffling utility
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, config.totalQuestions);

    // If still zero questions found, fallback to sample database entirety
    const finalQuestions = selectedQuestions.length > 0 ? selectedQuestions : questionBank.slice(0, config.totalQuestions);

    const testState: ActiveTestState = {
      config,
      questions: finalQuestions,
      responses: {},
      currentQuestionIndex: 0,
      timeRemaining: config.timeLimit * 60,
      startTime: Date.now(),
      isSubmitted: false
    };

    setActiveTest(testState);
    setShowResumeBanner(false);
    setCurrentView("active-test");
    syncState(username, testHistory, bookmarks, mistakeNotes, testState);
  };

  // Evaluation & Grading Logic
  const handleSubmitActiveTest = () => {
    if (!activeTest) return;

    const { config, questions, responses, timeRemaining } = activeTest;
    let score = 0;
    let correct = 0;
    let attempted = 0;
    let negativeMarksIncurred = 0;

    const subjectBreakdown: Record<SubjectType, any> = {
      Physics: { subject: "Physics", total: 0, attempted: 0, correct: 0, score: 0, maxScore: 0, accuracy: 0 },
      Chemistry: { subject: "Chemistry", total: 0, attempted: 0, correct: 0, score: 0, maxScore: 0, accuracy: 0 },
      Mathematics: { subject: "Mathematics", total: 0, attempted: 0, correct: 0, score: 0, maxScore: 0, accuracy: 0 }
    };

    // Initialize total questions per subject
    questions.forEach(q => {
      if (q.subject in subjectBreakdown) {
        subjectBreakdown[q.subject].total += 1;
        subjectBreakdown[q.subject].maxScore += q.marks;
      }
    });

    const currentMistakes = { ...mistakeNotes };

    questions.forEach(q => {
      const resp = responses[q.id];
      const isAnswered = q.questionType === "Numerical" 
        ? !!resp?.textAnswer?.trim() 
        : (Array.isArray(resp?.selectedAnswer) ? resp.selectedAnswer.length > 0 : !!resp?.selectedAnswer);

      if (isAnswered) {
        attempted++;
        if (q.subject in subjectBreakdown) {
          subjectBreakdown[q.subject].attempted += 1;
        }

        let isCorrect = false;

        if (q.questionType === "Multiple Correct" && Array.isArray(q.correctAnswer)) {
          const userAns = Array.isArray(resp.selectedAnswer) ? [...resp.selectedAnswer].sort() : [resp.selectedAnswer as string];
          const correctAns = [...q.correctAnswer].sort();
          isCorrect = JSON.stringify(userAns) === JSON.stringify(correctAns);
        } else if (q.questionType === "Numerical") {
          isCorrect = resp.textAnswer?.trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
        } else {
          isCorrect = resp.selectedAnswer === q.correctAnswer;
        }

        if (isCorrect) {
          correct++;
          score += q.marks;
          if (q.subject in subjectBreakdown) {
            subjectBreakdown[q.subject].correct += 1;
            subjectBreakdown[q.subject].score += q.marks;
          }
        } else {
          score += q.negativeMarks; // Negative weight e.g. -1 or -2
          negativeMarksIncurred += Math.abs(q.negativeMarks);
          if (q.subject in subjectBreakdown) {
            subjectBreakdown[q.subject].score += q.negativeMarks;
          }

          // Automatically append incorrect questions to Mistake notes with empty feedback
          if (!currentMistakes[q.id]) {
            currentMistakes[q.id] = "";
          }
        }
      }
    });

    // Complete subject breakdown accuracy calculations
    (Object.keys(subjectBreakdown) as SubjectType[]).forEach(sub => {
      const stats = subjectBreakdown[sub];
      stats.accuracy = stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0;
    });

    const totalMarks = questions.reduce((acc, q) => acc + q.marks, 0);
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const timeTaken = (config.timeLimit * 60) - timeRemaining;

    // Estimate relative percentile
    const scoreRatio = totalMarks > 0 ? (score / totalMarks) : 0;
    const percentile = Math.max(62.5, Math.min(99.95, Math.round(75 + scoreRatio * 24.5)));
    const predictedRank = Math.max(12, Math.round((100 - percentile) * 11000));

    // Construct Result structure
    const result: TestResult = {
      id: activeTest.config.id,
      config,
      date: new Date().toISOString(),
      score,
      totalMarks,
      accuracy,
      timeTaken,
      percentile,
      predictedRank,
      totalQuestions: questions.length,
      attempted,
      skipped: questions.length - attempted,
      correct,
      incorrect: attempted - correct,
      negativeMarksIncurred,
      responses,
      subjectStats: subjectBreakdown,
      chapterStats: {},
      weakChapters: [],
      strongChapters: []
    };

    const updatedHistory = [result, ...testHistory];
    setTestHistory(updatedHistory);
    setMistakeNotes(currentMistakes);

    // Reset session states
    setActiveTest(null);
    setSelectedResult(result);
    setCurrentView("result");
    syncState(username, updatedHistory, bookmarks, currentMistakes, null);
  };

  // Toggle/Manage Bookmarks
  const handleBookmarkQuestion = (qId: string) => {
    let nextBookmarks = [...bookmarks];
    if (nextBookmarks.includes(qId)) {
      nextBookmarks = nextBookmarks.filter(id => id !== qId);
    } else {
      nextBookmarks.push(qId);
    }
    setBookmarks(nextBookmarks);
    syncState(username, testHistory, nextBookmarks, mistakeNotes, activeTest);
  };

  // Manage Mistakes Notes
  const handleAddMistakeNote = (qId: string, notes: string) => {
    const nextMistakes = { ...mistakeNotes, [qId]: notes };
    setMistakeNotes(nextMistakes);
    syncState(username, testHistory, bookmarks, nextMistakes, activeTest);
  };

  const handleDeleteMistake = (qId: string) => {
    const nextMistakes = { ...mistakeNotes };
    delete nextMistakes[qId];
    setMistakeNotes(nextMistakes);
    syncState(username, testHistory, bookmarks, nextMistakes, activeTest);
  };

  // Direct Retake launcher
  const handleRetakeResult = (res: TestResult) => {
    handleGenerateTest(res.config);
  };

  // Revision Test Launcher
  const handleStartRevisionTest = (questions: Question[], title: string) => {
    if (questions.length === 0) return;

    const revisionConfig: TestConfig = {
      id: "REV-" + Math.random().toString(36).substr(2, 7).toUpperCase(),
      exam: "Mixed",
      years: [],
      subjects: ["Physics", "Chemistry", "Mathematics"],
      totalQuestions: questions.length,
      subjectDistribution: { Physics: 5, Chemistry: 5, Mathematics: 5 },
      difficulty: "Mixed",
      timeLimit: Math.max(10, questions.length * 2), // 2 mins per question
      chapters: []
    };

    const sessionState: ActiveTestState = {
      config: revisionConfig,
      questions,
      responses: {},
      currentQuestionIndex: 0,
      timeRemaining: revisionConfig.timeLimit * 60,
      startTime: Date.now(),
      isSubmitted: false
    };

    setActiveTest(sessionState);
    setCurrentView("active-test");
  };

  // Reset System Hard Reset
  const handleResetApp = () => {
    localStorage.clear();
    setUsername("");
    setIsFirstVisit(true);
    setTestHistory([]);
    setBookmarks([]);
    setMistakeNotes({});
    setActiveTest(null);
    setCurrentView("dashboard");
    window.location.reload();
  };

  if (isFirstVisit) {
    return (
      <WelcomePage 
        onNameSubmitted={handleNameSubmitted} 
      />
    );
  }

  // Navigation Panel Definitions
  const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "create-test", label: "Generate Test", icon: Sliders },
    { id: "revision", label: "Revision Terminal", icon: BookOpenCheck },
    { id: "mistake-book", label: "Mistake Book", icon: ShieldAlert },
    { id: "history", label: "Test History", icon: History },
    { id: "search-library", label: "Question Library", icon: Search },
    { id: "settings", label: "Settings", icon: SettingsIcon }
  ];

  const activeNavItem = NAV_ITEMS.find(n => n.id === currentView);
  const streakVal = testHistory.length > 0 ? Math.min(7, testHistory.length + 1) : 1;

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-zinc-950 flex flex-col font-sans transition-colors duration-200">
      
      {/* Resume Active Session Floating Banner */}
      {showResumeBanner && activeTest && currentView !== "active-test" && (
        <div className="bg-blue-600 text-white py-3 px-6 text-xs flex items-center justify-between font-medium sticky top-0 z-[40] animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 animate-pulse" />
            <span>You have an unsubmitted JEE mock exam in progress. Resume now?</span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                setShowResumeBanner(false);
                localStorage.removeItem("testify_active_test_session");
                setActiveTest(null);
              }}
              className="hover:underline font-semibold text-blue-200"
            >
              Dismiss
            </button>
            <button 
              onClick={() => {
                setShowResumeBanner(false);
                setCurrentView("active-test");
              }}
              className="bg-white text-blue-600 px-3.5 py-1 rounded-lg font-bold"
            >
              Resume Exam
            </button>
          </div>
        </div>
      )}

      {/* RENDER INTRUSIVE FULLSCREEN EXAM MODE */}
      {currentView === "active-test" && activeTest ? (
        <TestPage 
          activeTest={activeTest}
          onUpdateActiveState={(stateOrUpdater) => {
            setActiveTest((prev) => {
              if (!prev) return null;
              const nextState = typeof stateOrUpdater === "function" 
                ? stateOrUpdater(prev) 
                : stateOrUpdater;
              localStorage.setItem("testify_active_test_session", JSON.stringify(nextState));
              return nextState;
            });
          }}
          onSubmitTest={handleSubmitActiveTest}
        />
      ) : (
        /* STANDARD NAVIGATION LAYOUT */
        <div className="flex-1 flex flex-col md:flex-row">
          
          {/* Mobile Top Bar with menu trigger on far left and logo centered */}
          <div className="flex md:hidden items-center justify-center relative w-full h-14 bg-white dark:bg-zinc-900 border-b border-zinc-150 dark:border-zinc-800 px-4 shrink-0 select-none">
            {/* Menu button on the left */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="absolute left-4 p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Centered logo brand */}
            <div className="flex items-center gap-2">
              <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
                <img 
                  src={LOGO_URL} 
                  alt="Testify Logo" 
                  className="absolute inset-0 w-full h-full rounded-lg object-cover z-10"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm tracking-tighter">
                  T
                </div>
              </div>
              <span className="font-extrabold text-base tracking-tight text-zinc-950 dark:text-white">Testify</span>
            </div>

            {/* Right side daily streak badge for mobile */}
            <div className="absolute right-4 flex items-center gap-1 text-orange-500 font-bold text-xs bg-orange-500/10 dark:bg-orange-500/20 px-2.5 py-1 rounded-full border border-orange-500/10">
              <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
              <span>{streakVal}</span>
            </div>
          </div>

          {/* Desktop Left Rail (permanently visible on md+) */}
          <aside className="hidden md:flex md:w-64 bg-white dark:bg-zinc-900 md:border-r border-zinc-150 dark:border-zinc-800 flex-col justify-between p-5 shrink-0 select-none">
            <div className="space-y-6">
              
              {/* App logo brand for desktop */}
              <div className="hidden md:flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
                    <img 
                      src={LOGO_URL} 
                      alt="Testify Logo" 
                      className="absolute inset-0 w-full h-full rounded-lg object-cover z-10"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm tracking-tighter">
                      T
                    </div>
                  </div>
                  <span className="font-extrabold text-base tracking-tight text-zinc-950 dark:text-white">Testify</span>
                </div>
              </div>

              {/* Navigation Tabs (Desktop view) */}
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                      }}
                      className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/10 font-bold"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                {/* Theme Toggle Button inside the menu ("three line ke andar") */}
                <div className="pt-2 mt-2 border-t border-zinc-150 dark:border-zinc-800">
                  <button
                    onClick={toggleDarkMode}
                    className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      {darkMode ? (
                        <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <Moon className="w-4 h-4 text-blue-500 shrink-0" />
                      )}
                      <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">
                      {darkMode ? "Light" : "Dark"}
                    </span>
                  </button>
                </div>
              </nav>

            </div>

            {/* Profile rail info (Desktop view) */}
            <div className="border-t border-zinc-100 dark:border-zinc-850 pt-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold rounded-full flex items-center justify-center text-xs">
                {username.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 space-y-0.5 truncate select-none">
                <h5 className="font-bold text-xs truncate text-zinc-800 dark:text-zinc-100">{username}</h5>
                <span className="text-[10px] text-zinc-400 font-mono">JEE Main Aspirant</span>
              </div>
            </div>

          </aside>

          {/* Mobile Drawer (Left to Right slide-in with AnimatePresence) */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                {/* Backdrop overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="fixed inset-0 bg-black z-50 md:hidden"
                />

                {/* Left drawer panel */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "tween", ease: "easeInOut", duration: 0.25 }}
                  className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-zinc-900 z-50 md:hidden flex flex-col justify-between p-5 border-r border-zinc-150 dark:border-zinc-800 shadow-2xl"
                >
                  <div className="space-y-6">
                    {/* Header inside drawer */}
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-150 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
                          <img 
                            src={LOGO_URL} 
                            alt="Testify Logo" 
                            className="absolute inset-0 w-full h-full rounded-lg object-cover z-10"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm tracking-tighter">
                            T
                          </div>
                        </div>
                        <span className="font-extrabold text-base tracking-tight text-zinc-950 dark:text-white">Testify</span>
                      </div>
                      <button 
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors"
                        aria-label="Close menu"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Navigation Items inside mobile drawer */}
                    <nav className="space-y-1">
                      {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setCurrentView(item.id);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                              isActive
                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/10 font-bold"
                                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850"
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}

                      {/* Theme Toggle Button inside the mobile drawer */}
                      <div className="pt-2 mt-2 border-t border-zinc-150 dark:border-zinc-800">
                        <button
                          onClick={toggleDarkMode}
                          className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            {darkMode ? (
                              <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                            ) : (
                              <Moon className="w-4 h-4 text-blue-500 shrink-0" />
                            )}
                            <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                          </div>
                          <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">
                            {darkMode ? "Light" : "Dark"}
                          </span>
                        </button>
                      </div>
                    </nav>
                  </div>

                  {/* Profile info inside mobile drawer */}
                  <div className="border-t border-zinc-100 dark:border-zinc-850 pt-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold rounded-full flex items-center justify-center text-xs">
                      {username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 space-y-0.5 truncate select-none">
                      <h5 className="font-bold text-xs truncate text-zinc-800 dark:text-zinc-100">{username}</h5>
                      <span className="text-[10px] text-zinc-400 font-mono">JEE Main Aspirant</span>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Core Content frame */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 select-text">
            
            {/* Top Navigation Row */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
              {/* Back Navigation or Spacer */}
              <div>
                {currentView !== "dashboard" && currentView !== "active-test" ? (
                  <button
                    onClick={() => {
                      if (currentView === "result") {
                        setCurrentView("history");
                      } else {
                        setCurrentView("dashboard");
                      }
                    }}
                    className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 dark:hover:border-blue-500/50 transition-all active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}
              </div>

              {/* Desktop Streak Badge (Mobile is handled in top bar) */}
              <div className="hidden md:flex items-center">
                <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-extrabold text-xs bg-orange-500/10 dark:bg-orange-500/20 px-3.5 py-1.5 rounded-xl border border-orange-500/20 shadow-sm">
                  <Flame className="w-4 h-4 fill-current animate-pulse" />
                  <span>{streakVal} Day Streak</span>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                {currentView === "dashboard" && (
                  <Dashboard 
                    userProfile={{
                      name: username,
                      joinedAt: new Date().toISOString(),
                      streak: testHistory.length > 0 ? Math.min(7, testHistory.length + 1) : 1,
                      dailyGoalMinutes: 45,
                      weeklyGoalTests: 5,
                      badges: testHistory.length > 0 ? ["Pioneer", "First Mock Done"] : ["Aspirant"],
                      studyTimeSeconds: testHistory.reduce((acc, h) => acc + h.timeTaken, 0)
                    }}
                    history={testHistory}
                    activeTest={activeTest}
                    onTabChange={(tab) => {
                      if (tab === "generate-test" || tab === "create-test") {
                        setCurrentView("create-test");
                      } else {
                        setCurrentView(tab);
                      }
                    }}
                    onContinueActiveTest={() => setCurrentView("active-test")}
                    onCreateRandomTest={(count, isDaily) => {
                      const randomConfig: TestConfig = {
                        id: "RANDOM-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
                        exam: "Mixed",
                        years: [],
                        subjects: ["Physics", "Chemistry", "Mathematics"],
                        totalQuestions: count || 10,
                        subjectDistribution: { Physics: 3, Chemistry: 3, Mathematics: 4 },
                        difficulty: "Mixed",
                        timeLimit: isDaily ? 15 : 30,
                        chapters: []
                      };
                      handleGenerateTest(randomConfig);
                    }}
                    onSelectHistoryTest={(test) => {
                      setSelectedResult(test);
                      setCurrentView("result");
                    }}
                  />
                )}

                {currentView === "create-test" && (
                  <TestCreator 
                    questionBank={questionBank}
                    onGenerateTest={handleGenerateTest}
                  />
                )}

                {currentView === "result" && selectedResult && (
                  <ResultPage 
                    result={selectedResult}
                    onRetakeTest={() => handleRetakeResult(selectedResult)}
                    onBackToDashboard={() => setCurrentView("dashboard")}
                    onBookmarkQuestion={handleBookmarkQuestion}
                    onAddMistakeNote={handleAddMistakeNote}
                    bookmarkedQuestionIds={bookmarks}
                    mistakeNotes={mistakeNotes}
                  />
                )}

                {currentView === "history" && (
                  <HistoryPage 
                    history={testHistory}
                    onSelectResult={(res) => {
                      setSelectedResult(res);
                      setCurrentView("result");
                    }}
                    onDeleteResult={(id) => {
                      const next = testHistory.filter(h => h.id !== id);
                      setTestHistory(next);
                      syncState(username, next, bookmarks, mistakeNotes, activeTest);
                    }}
                    onRetakeTest={handleRetakeResult}
                  />
                )}

                {currentView === "settings" && (
                  <SettingsPage 
                    username={username}
                    onUpdateUsername={(name) => {
                      setUsername(name);
                      syncState(name, testHistory, bookmarks, mistakeNotes, activeTest);
                    }}
                    onResetApp={handleResetApp}
                    darkMode={darkMode}
                    onToggleDarkMode={toggleDarkMode}
                  />
                )}

                {currentView === "mistake-book" && (
                  <MistakeBookPage 
                    questionBank={questionBank}
                    mistakeNotes={mistakeNotes}
                    onDeleteMistake={handleDeleteMistake}
                    onUpdateMistakeNote={handleAddMistakeNote}
                    onPracticeMistakes={(questions) => handleStartRevisionTest(questions, "Mistake Redo Drill")}
                  />
                )}

                {currentView === "revision" && (
                  <RevisionPage 
                    questionBank={questionBank}
                    bookmarkedQuestionIds={bookmarks}
                    mistakeNotes={mistakeNotes}
                    testHistory={testHistory}
                    onStartRevisionTest={handleStartRevisionTest}
                  />
                )}

                {currentView === "search-library" && (
                  <GlobalSearchPage 
                    questionBank={questionBank}
                    onBookmarkQuestion={handleBookmarkQuestion}
                    bookmarkedQuestionIds={bookmarks}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Premium and beautiful footer */}
            <footer className="mt-6 pt-3 pb-1 border-t border-zinc-150/60 dark:border-zinc-800/50 text-center select-none">
              <p className="text-xs font-semibold tracking-wide text-zinc-400 dark:text-zinc-500 flex items-center justify-center gap-1.5">
                <span>Made with</span>
                <span className="text-rose-500 animate-pulse text-sm inline-block">❤️</span>
                <span>for JEE Aspirants</span>
              </p>
            </footer>
          </main>

        </div>
      )}

    </div>
  );
}
