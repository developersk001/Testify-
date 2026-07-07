import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Filter, 
  Calendar, 
  Award, 
  BookOpen, 
  Sparkles, 
  Play, 
  CheckCircle, 
  Layers, 
  Compass, 
  Flame, 
  HelpCircle,
  Clock,
  ArrowRight,
  BookOpenCheck,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Question, SubjectType, TestConfig } from "../types";
import { 
  getPyqManifest, 
  loadAllPyqs, 
  filterQuestions, 
  generatePyqTest, 
  PyqFileMetadata 
} from "../services/pyqService";

interface PyqMockTestPageProps {
  onGenerateTest: (config: TestConfig) => void;
  mistakeNotes: Record<string, string>;
  questionBank: Question[];
}

export default function PyqMockTestPage({ onGenerateTest, mistakeNotes, questionBank }: PyqMockTestPageProps) {
  const [manifest, setManifest] = useState<PyqFileMetadata[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExam, setSelectedExam] = useState<"All" | "JEE Main" | "JEE Advanced">("All");
  const [selectedSubject, setSelectedSubject] = useState<"All" | SubjectType>("All");
  const [selectedYear, setSelectedYear] = useState<"All" | number>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"All" | "Easy" | "Medium" | "Hard">("All");
  const [selectedChapter, setSelectedChapter] = useState<"All" | string>("All");
  
  // Quick test custom options
  const [activeTab, setActiveTab] = useState<"launchers" | "explore">("launchers");
  
  // Custom builder states
  const [customExam, setCustomExam] = useState<"JEE Main" | "JEE Advanced">("JEE Main");
  const [customSubject, setCustomSubject] = useState<SubjectType>("Physics");
  const [customYear, setCustomYear] = useState<number>(2024);
  const [customQuestionsCount, setCustomQuestionsCount] = useState<number>(10);
  const [customTime, setCustomTime] = useState<number>(30);

  // Load manifest and all PYQ questions asynchronously (lazy loaded & cached)
  useEffect(() => {
    async function initData() {
      setLoading(true);
      try {
        const manData = await getPyqManifest();
        setManifest(manData.files);
        
        const allQuestions = await loadAllPyqs();
        setQuestions(allQuestions);
      } catch (err) {
        console.error("Failed to load initial offline PYQ database", err);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  // Compute unique filters dynamically from current database (future-proof!)
  const yearsList = useMemo(() => {
    const years = new Set<number>();
    questions.forEach((q) => {
      if (q.year) years.add(q.year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [questions]);

  const chaptersList = useMemo(() => {
    const chapters = new Set<string>();
    questions.forEach((q) => {
      if (q.chapter) chapters.add(q.chapter);
    });
    return Array.from(chapters).sort();
  }, [questions]);

  // Compute weak chapters from Mistake Book
  const weakChapters = useMemo(() => {
    const chaptersCount: Record<string, number> = {};
    Object.keys(mistakeNotes).forEach((qId) => {
      // Find matching question
      const q = [...questions, ...questionBank].find((item) => item.id === qId);
      if (q && q.chapter) {
        chaptersCount[q.chapter] = (chaptersCount[q.chapter] || 0) + 1;
      }
    });
    return Object.entries(chaptersCount)
      .sort((a, b) => b[1] - a[1])
      .map(([chapter]) => chapter);
  }, [mistakeNotes, questions, questionBank]);

  // Handle live searches/filters with formula support
  const filteredPyqs = useMemo(() => {
    const filterArgs: any = {
      exam: selectedExam === "All" ? "Mixed" : selectedExam,
      subject: selectedSubject,
      difficulty: selectedDifficulty === "All" ? "Mixed" : selectedDifficulty,
      chapter: selectedChapter,
      keyword: searchQuery,
    };
    if (selectedYear !== "All") {
      filterArgs.year = selectedYear;
    }
    return filterQuestions(questions, filterArgs);
  }, [questions, searchQuery, selectedExam, selectedSubject, selectedYear, selectedDifficulty, selectedChapter]);

  // High performance test launchers
  const handleLaunchTest = async (type: "Full" | "Chapter-wise" | "Subject-wise" | "Mixed" | "Random" | "Weak-topic", overrides?: Partial<TestConfig>) => {
    setLoading(true);
    try {
      let testQuestions: Question[] = [];
      let testTitle = "";
      let testExam: "JEE Main" | "JEE Advanced" = customExam;
      let duration = customTime;
      let qCount = customQuestionsCount;

      const getSafeExam = (overrideExam?: string): "JEE Main" | "JEE Advanced" => {
        if (overrideExam === "JEE Advanced") return "JEE Advanced";
        return "JEE Main";
      };

      switch (type) {
        case "Full":
          testExam = getSafeExam(overrides?.exam);
          testTitle = `Full ${testExam} PYQ Mock Test (${overrides?.years?.[0] || 2024})`;
          duration = testExam === "JEE Advanced" ? 60 : 45;
          qCount = testExam === "JEE Advanced" ? 15 : 20;
          
          testQuestions = await generatePyqTest({
            title: testTitle,
            exam: testExam,
            type: "Full",
            year: overrides?.years?.[0] || 2024,
            totalQuestions: qCount,
            timeLimit: duration
          });
          break;

        case "Chapter-wise":
          const selectedCh = overrides?.chapters?.[0] || chaptersList[0] || "Rotational Dynamics";
          testExam = getSafeExam(overrides?.exam);
          testTitle = `${selectedCh} Chapter PYQ Drill`;
          duration = 30;
          qCount = 10;
          
          testQuestions = await generatePyqTest({
            title: testTitle,
            exam: testExam,
            type: "Chapter-wise",
            chapters: [selectedCh],
            totalQuestions: qCount,
            timeLimit: duration
          });
          break;

        case "Subject-wise":
          const sub = overrides?.subjects?.[0] || "Physics";
          testExam = getSafeExam(overrides?.exam);
          testTitle = `${sub} Subject-wise PYQ Exam`;
          duration = 45;
          qCount = 15;
          
          testQuestions = await generatePyqTest({
            title: testTitle,
            exam: testExam,
            type: "Subject-wise",
            subject: sub,
            totalQuestions: qCount,
            timeLimit: duration
          });
          break;

        case "Mixed":
          testExam = getSafeExam(overrides?.exam);
          testTitle = `Mixed Multi-Chapter PYQ Sprint`;
          duration = 40;
          qCount = 12;
          
          testQuestions = await generatePyqTest({
            title: testTitle,
            exam: testExam,
            type: "Mixed",
            chapters: overrides?.chapters || chaptersList.slice(0, 3),
            totalQuestions: qCount,
            timeLimit: duration
          });
          break;

        case "Random":
          testExam = Math.random() > 0.5 ? "JEE Main" : "JEE Advanced";
          testTitle = `Randomized PYQ Surprise Mock`;
          duration = 30;
          qCount = 10;
          
          testQuestions = await generatePyqTest({
            title: testTitle,
            exam: testExam,
            type: "Random",
            totalQuestions: qCount,
            timeLimit: duration
          });
          break;

        case "Weak-topic":
          testExam = "JEE Main";
          testTitle = `Weak-Topic Remedial PYQ Practice`;
          duration = 25;
          qCount = 8;
          
          testQuestions = await generatePyqTest({
            title: testTitle,
            exam: testExam,
            type: "Weak-topic",
            weakChapters: weakChapters.length > 0 ? weakChapters : chaptersList.slice(0, 2),
            totalQuestions: qCount,
            timeLimit: duration
          });
          break;
      }

      const generatedConfig: TestConfig = {
        id: testTitle,
        exam: testExam,
        subjects: overrides?.subjects || ["Physics", "Chemistry", "Mathematics"],
        years: overrides?.years || [2024],
        chapters: overrides?.chapters || [],
        totalQuestions: testQuestions.length || qCount,
        subjectDistribution: {
          Physics: testQuestions.filter((q) => q.subject === "Physics").length || (qCount / 3),
          Chemistry: testQuestions.filter((q) => q.subject === "Chemistry").length || (qCount / 3),
          Mathematics: testQuestions.filter((q) => q.subject === "Mathematics").length || (qCount / 3),
        },
        difficulty: overrides?.difficulty || "Mixed",
        timeLimit: duration
      };

      // Set state and launch
      onGenerateTest(generatedConfig);
    } catch (err) {
      console.error("Error creating PYQ test", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="pyq-mock-test-section" className="space-y-6">
      
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden select-none">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-44 h-44 bg-white/5 rounded-full blur-xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="bg-white/20 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm">
              100% Offline Mode Enabled
            </span>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Award className="w-7 h-7 text-amber-300 animate-bounce" />
              <span>JEE PYQ Mock Test Center</span>
            </h1>
            <p className="text-xs text-blue-100 font-medium max-w-xl">
              Access the largest collection of authentic Joint Entrance Examination (JEE) Main and Advanced Previous Year Questions from 2000–2026. Custom-drill, analyze, and master weak chapters.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0 flex items-center gap-4">
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Active Questions</div>
              <div className="text-2xl font-black text-amber-300 tracking-tight">
                {questions.length || 36} <span className="text-xs font-semibold text-white/80">PYQs</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Chapter Count</div>
              <div className="text-2xl font-black text-amber-300 tracking-tight">
                {chaptersList.length || 12} <span className="text-xs font-semibold text-white/80">Chs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 shrink-0 select-none border border-zinc-200/50 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab("launchers")}
          className={`flex-1 py-2.5 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "launchers" 
              ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm" 
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          <Play className="w-4 h-4 text-blue-500" />
          <span>Quick Launch Mock Exams</span>
        </button>
        <button
          onClick={() => setActiveTab("explore")}
          className={`flex-1 py-2.5 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "explore" 
              ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm" 
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          <Compass className="w-4 h-4 text-indigo-500" />
          <span>Explore PYQ Library</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-zinc-200 dark:border-zinc-800 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
          </div>
          <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Loading PYQ local assets...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === "launchers" ? (
            <motion.div
              key="launchers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Presets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* 1. Full JEE Main Test */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl p-5 hover:shadow-lg transition-all flex flex-col justify-between relative group">
                  <div className="absolute top-4 right-4 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Full Exam
                  </div>
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/50 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">Full JEE Main Mock</h3>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        Complete mixed set of Physics, Chemistry, and Mathematics from 2024. Fits exact pattern.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-zinc-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> 45 Mins | 20 Qs
                    </span>
                    <button
                      onClick={() => handleLaunchTest("Full", { exam: "JEE Main", years: [2024] })}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Launch</span> <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. Full JEE Advanced Test */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl p-5 hover:shadow-lg transition-all flex flex-col justify-between relative group">
                  <div className="absolute top-4 right-4 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Full Exam
                  </div>
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/50 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">Full JEE Advanced Mock</h3>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        High-difficulty multi-correct, integer, and single correct questions from 2025.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-zinc-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> 60 Mins | 15 Qs
                    </span>
                    <button
                      onClick={() => handleLaunchTest("Full", { exam: "JEE Advanced", years: [2025] })}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Launch</span> <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3. Subject-wise Drill */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl p-5 hover:shadow-lg transition-all flex flex-col justify-between relative group">
                  <div className="absolute top-4 right-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Subject Specific
                  </div>
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/50 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">Subject-wise Mock</h3>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        Drill deep into a single subject. Highly targeted to strengthen subject concepts.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-zinc-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> 45 Mins | 15 Qs
                    </span>
                    <button
                      onClick={() => handleLaunchTest("Subject-wise", { exam: "JEE Main", subjects: [customSubject] })}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Launch</span> <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 4. Chapter-wise Focus */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl p-5 hover:shadow-lg transition-all flex flex-col justify-between relative group">
                  <div className="absolute top-4 right-4 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Chapter Focus
                  </div>
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/50 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">Chapter-wise Drill</h3>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        Targeted chapters like Electrostatics, Bonding, Matrices, or Rotational Dynamics.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-zinc-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> 30 Mins | 10 Qs
                    </span>
                    <button
                      onClick={() => handleLaunchTest("Chapter-wise", { exam: "JEE Main", chapters: [chaptersList[0] || "Rotational Dynamics"] })}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Launch</span> <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 5. Weak Topic Remedial Practice */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl p-5 hover:shadow-lg transition-all flex flex-col justify-between relative group">
                  <div className="absolute top-4 right-4 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Smart AI Adaptive
                  </div>
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-rose-100 dark:bg-rose-950/50 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">Weak-Topic Practice</h3>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        Uses your actual Mistake Book data to automatically create a custom exam with weak chapters.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-zinc-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> 25 Mins | 8 Qs
                    </span>
                    <button
                      disabled={weakChapters.length === 0}
                      onClick={() => handleLaunchTest("Weak-topic", { exam: "JEE Main" })}
                      className={`text-xs font-extrabold px-3.5 py-1.5 rounded-xl flex items-center gap-1 transition-colors ${
                        weakChapters.length > 0
                          ? "bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                      }`}
                    >
                      <span>{weakChapters.length > 0 ? "Launch" : "No Weak Chs"}</span> <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 6. Randomized PYQ Surprise */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl p-5 hover:shadow-lg transition-all flex flex-col justify-between relative group">
                  <div className="absolute top-4 right-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Suprise Drill
                  </div>
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">Random PYQ Mock</h3>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        Feeling lucky? Generate a completely randomized mock test spanning years, exams, and subjects.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-zinc-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> 30 Mins | 10 Qs
                    </span>
                    <button
                      onClick={() => handleLaunchTest("Random")}
                      className="bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Launch</span> <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Custom Offline PYQ Exam Builder */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpenCheck className="w-5 h-5 text-blue-600" />
                  <h2 className="font-extrabold text-base text-zinc-900 dark:text-white">Custom Offline PYQ Exam Builder</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  
                  {/* Select Exam */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">Exam</label>
                    <select
                      value={customExam}
                      onChange={(e) => setCustomExam(e.target.value as any)}
                      className="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="JEE Main">JEE Main</option>
                      <option value="JEE Advanced">JEE Advanced</option>
                    </select>
                  </div>

                  {/* Select Subject */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">Primary Subject</label>
                    <select
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value as SubjectType)}
                      className="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Mathematics">Mathematics</option>
                    </select>
                  </div>

                  {/* Select Year */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">Year</label>
                    <select
                      value={customYear}
                      onChange={(e) => setCustomYear(Number(e.target.value))}
                      className="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {yearsList.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  {/* Select Questions */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">Questions Count</label>
                    <select
                      value={customQuestionsCount}
                      onChange={(e) => setCustomQuestionsCount(Number(e.target.value))}
                      className="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                      <option value={15}>15 Questions</option>
                      <option value={20}>20 Questions</option>
                    </select>
                  </div>

                  {/* Select Time Limit */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">Time Limit (Mins)</label>
                    <select
                      value={customTime}
                      onChange={(e) => setCustomTime(Number(e.target.value))}
                      className="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value={15}>15 Minutes</option>
                      <option value={30}>30 Minutes</option>
                      <option value={45}>45 Minutes</option>
                      <option value={60}>60 Minutes</option>
                    </select>
                  </div>

                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => handleLaunchTest("Full", { 
                      exam: customExam, 
                      subjects: [customSubject],
                      years: [customYear],
                    })}
                    className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.98]"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Generate & Start Exam Mode</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Filter controls */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-4">
                
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Chapter, Topic, Keyword, Formula, Tag..."
                    className="w-full bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 border border-zinc-200 dark:border-zinc-800 pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  
                  {/* Exam Filter */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-extrabold text-zinc-400 tracking-wider">Exam Type</label>
                    <select
                      value={selectedExam}
                      onChange={(e) => setSelectedExam(e.target.value as any)}
                      className="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 px-2.5 py-2 rounded-xl outline-none"
                    >
                      <option value="All">All Exams</option>
                      <option value="JEE Main">JEE Main</option>
                      <option value="JEE Advanced">JEE Advanced</option>
                    </select>
                  </div>

                  {/* Subject Filter */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-extrabold text-zinc-400 tracking-wider">Subject</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value as any)}
                      className="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 px-2.5 py-2 rounded-xl outline-none"
                    >
                      <option value="All">All Subjects</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Mathematics">Mathematics</option>
                    </select>
                  </div>

                  {/* Year Filter */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-extrabold text-zinc-400 tracking-wider">Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value === "All" ? "All" : Number(e.target.value))}
                      className="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 px-2.5 py-2 rounded-xl outline-none"
                    >
                      <option value="All">All Years</option>
                      {yearsList.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  {/* Chapter Filter */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-extrabold text-zinc-400 tracking-wider">Chapter</label>
                    <select
                      value={selectedChapter}
                      onChange={(e) => setSelectedChapter(e.target.value)}
                      className="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 px-2.5 py-2 rounded-xl outline-none"
                    >
                      <option value="All">All Chapters</option>
                      {chaptersList.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty Filter */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-extrabold text-zinc-400 tracking-wider">Difficulty</label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                      className="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 px-2.5 py-2 rounded-xl outline-none"
                    >
                      <option value="All">All Difficulties</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                </div>

              </div>

              {/* Questions list with Virtualized / High performance scrolling rendering */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1 select-none">
                  <h3 className="text-xs font-extrabold text-zinc-500 uppercase tracking-wider">
                    Search Results ({filteredPyqs.length} PYQs found)
                  </h3>
                </div>

                {filteredPyqs.length === 0 ? (
                  <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl py-12 text-center select-none">
                    <HelpCircle className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">No previous year questions match your filters.</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Try relaxing filters or search terms.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                    {filteredPyqs.map((q) => (
                      <div 
                        key={q.id}
                        className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl relative shadow-sm hover:border-blue-500/50 dark:hover:border-blue-500/30 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          {/* Tags row */}
                          <div className="flex flex-wrap items-center gap-1.5 select-none">
                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              q.exam === "JEE Main" 
                                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400" 
                                : "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400"
                            }`}>
                              {q.exam} {q.year}
                            </span>
                            <span className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[8px] font-bold px-2 py-0.5 rounded-md">
                              {q.subject}
                            </span>
                            <span className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[8px] font-bold px-2 py-0.5 rounded-md truncate max-w-[150px]">
                              {q.chapter}
                            </span>
                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-md ${
                              q.difficulty === "Easy" 
                                ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400" 
                                : q.difficulty === "Medium"
                                ? "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400"
                                : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                            }`}>
                              {q.difficulty}
                            </span>
                          </div>

                          {/* Question Text */}
                          <p className="text-xs font-bold leading-relaxed text-zinc-800 dark:text-zinc-150 whitespace-pre-wrap">
                            {q.questionText}
                          </p>

                          {/* Options if applicable */}
                          {q.options && q.options.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 select-none">
                              {q.options.map((opt, i) => (
                                <div 
                                  key={i} 
                                  className="bg-zinc-50 dark:bg-zinc-850/60 text-zinc-700 dark:text-zinc-300 text-xs px-3 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800"
                                >
                                  <span className="font-bold text-zinc-400 mr-2">{String.fromCharCode(65 + i)})</span>
                                  <span>{opt}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Expandable Explanation block */}
                        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-850 flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="text-[10px] text-zinc-400 dark:text-zinc-500 space-x-3 select-none">
                            <span>Topic: <strong className="text-zinc-600 dark:text-zinc-300 font-bold">{q.topic}</strong></span>
                            <span>Marks: <strong className="text-zinc-600 dark:text-zinc-300 font-bold">+{q.marks}/{q.negativeMarks}</strong></span>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-auto">
                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-50 dark:bg-zinc-850 border border-zinc-150 dark:border-zinc-800 px-2 py-0.5 rounded-md">
                              {q.questionType}
                            </span>
                            <button
                              onClick={() => {
                                // Create custom quick test for just this question
                                onGenerateTest({
                                  id: `PYQ Focus Drill: ${q.topic}`,
                                  exam: q.exam,
                                  subjects: [q.subject],
                                  years: [q.year],
                                  chapters: [q.chapter],
                                  totalQuestions: 1,
                                  subjectDistribution: {
                                    Physics: q.subject === "Physics" ? 1 : 0,
                                    Chemistry: q.subject === "Chemistry" ? 1 : 0,
                                    Mathematics: q.subject === "Mathematics" ? 1 : 0,
                                  },
                                  difficulty: q.difficulty,
                                  timeLimit: 3
                                });
                              }}
                              className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Practice Q</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

    </div>
  );
}
