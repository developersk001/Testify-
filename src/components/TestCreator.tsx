import React, { useState, useEffect, useMemo } from "react";
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  HelpCircle, 
  Sliders, 
  Layers, 
  Clock, 
  Search, 
  Sparkles, 
  BookOpen 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ExamType, SubjectType, DifficultyType, TestConfig, Question } from "../types";

interface TestCreatorProps {
  questionBank: Question[];
  onGenerateTest: (config: TestConfig) => void;
}

const STEPS = [
  "Exam Type",
  "Select Years",
  "Choose Subjects",
  "Question Count",
  "Distribution",
  "Difficulty",
  "Time Limit",
  "Select Chapters",
  "Final Preview"
];

const PRESETS = [
  {
    name: "Full JEE Main Mock",
    exam: "JEE Main" as ExamType,
    questions: 30,
    time: 60,
    desc: "A speedy full-syllabus mock test covering Physics, Chemistry, and Math equally."
  },
  {
    name: "JEE Advanced Challenge",
    exam: "JEE Advanced" as ExamType,
    questions: 15,
    time: 45,
    desc: "High difficulty multiple-correct and numerical questions from recent advanced papers."
  },
  {
    name: "Physics Speed Mock",
    exam: "JEE Main" as ExamType,
    questions: 15,
    time: 30,
    desc: "A custom 15-question Physics focus session to test mechanics & modern physics."
  }
];

export default function TestCreator({ questionBank, onGenerateTest }: TestCreatorProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Form State
  const [exam, setExam] = useState<ExamType>("JEE Main");
  const [selectedYears, setSelectedYears] = useState<number[]>([2023, 2024, 2025, 2026]);
  const [subjects, setSubjects] = useState<SubjectType[]>(["Physics", "Chemistry", "Mathematics"]);
  const [totalQuestions, setTotalQuestions] = useState<number>(15);
  const [subjectDist, setSubjectDist] = useState<Record<SubjectType, number>>({
    Physics: 5,
    Chemistry: 5,
    Mathematics: 5
  });
  const [difficulty, setDifficulty] = useState<DifficultyType>("Mixed");
  const [timeLimit, setTimeLimit] = useState<number>(30); // minutes
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [chapterSearch, setChapterSearch] = useState("");

  // Years array
  const yearsList = Array.from({ length: 27 }, (_, i) => 2026 - i); // 2000 to 2026

  // Chapter List computed from question bank
  const allChaptersBySubject = useMemo(() => {
    const map: Record<SubjectType, string[]> = {
      Physics: [],
      Chemistry: [],
      Mathematics: []
    };
    questionBank.forEach(q => {
      if (q.subject in map && !map[q.subject].includes(q.chapter)) {
        map[q.subject].push(q.chapter);
      }
    });
    return map;
  }, [questionBank]);

  // Sync subject distribution when total questions or selected subjects change
  useEffect(() => {
    if (subjects.length === 0) return;
    const baseCount = Math.floor(totalQuestions / subjects.length);
    const remainder = totalQuestions % subjects.length;

    const newDist = { Physics: 0, Chemistry: 0, Mathematics: 0 };
    subjects.forEach((sub, idx) => {
      newDist[sub] = baseCount + (idx < remainder ? 1 : 0);
    });
    setSubjectDist(newDist);
  }, [totalQuestions, subjects]);

  const handleYearToggle = (year: number) => {
    if (selectedYears.includes(year)) {
      if (selectedYears.length > 1) {
        setSelectedYears(selectedYears.filter(y => y !== year));
      }
    } else {
      setSelectedYears([...selectedYears, year]);
    }
  };

  const handleSubjectToggle = (sub: SubjectType) => {
    if (subjects.includes(sub)) {
      if (subjects.length > 1) {
        setSubjects(subjects.filter(s => s !== sub));
      }
    } else {
      setSubjects([...subjects, sub]);
    }
  };

  const handleDistChange = (sub: SubjectType, val: number) => {
    const currentVal = subjectDist[sub];
    const difference = val - currentVal;
    
    // Check if within bounds
    if (val < 0 || totalQuestions - difference < 0) return;

    // Adjust another selected subject to maintain total
    const otherSubs = subjects.filter(s => s !== sub);
    if (otherSubs.length === 0) return;

    const newDist = { ...subjectDist };
    newDist[sub] = val;

    // Distribute difference across other subjects
    let remainingAdjustment = difference;
    for (let i = 0; i < otherSubs.length; i++) {
      const oSub = otherSubs[i];
      if (newDist[oSub] >= remainingAdjustment) {
        newDist[oSub] -= remainingAdjustment;
        remainingAdjustment = 0;
        break;
      } else {
        remainingAdjustment -= newDist[oSub];
        newDist[oSub] = 0;
      }
    }

    if (remainingAdjustment === 0) {
      setSubjectDist(newDist);
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setExam(preset.exam);
    setTotalQuestions(preset.questions);
    setTimeLimit(preset.time);
    setIsCustomTime(false);
    setSelectedChapters([]);
    setSubjects(["Physics", "Chemistry", "Mathematics"]);
    // Fast track to final preview
    setCurrentStep(8);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = () => {
    const config: TestConfig = {
      id: "TEST-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      exam,
      years: selectedYears,
      subjects,
      totalQuestions,
      subjectDistribution: subjectDist,
      difficulty,
      timeLimit,
      chapters: selectedChapters
    };
    onGenerateTest(config);
  };

  // Filter chapters based on search
  const filteredChapters = useMemo(() => {
    const result: Record<SubjectType, string[]> = {
      Physics: [],
      Chemistry: [],
      Mathematics: []
    };
    
    (Object.keys(allChaptersBySubject) as SubjectType[]).forEach(sub => {
      result[sub] = allChaptersBySubject[sub].filter(ch => 
        ch.toLowerCase().includes(chapterSearch.toLowerCase()) &&
        subjects.includes(sub)
      );
    });
    return result;
  }, [allChaptersBySubject, chapterSearch, subjects]);

  const toggleChapter = (ch: string) => {
    if (selectedChapters.includes(ch)) {
      setSelectedChapters(selectedChapters.filter(c => c !== ch));
    } else {
      setSelectedChapters([...selectedChapters, ch]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 text-zinc-900 dark:text-zinc-100">
      
      {/* Header and Quick Presets */}
      {currentStep === 0 && (
        <div className="mb-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Create Custom Mock Test</h1>
            <p className="text-sm text-zinc-500">
              Configure every parameter of your practice session or pick a rapid preset below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRESETS.map((p, idx) => (
              <div 
                key={idx}
                onClick={() => applyPreset(p)}
                className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl p-4 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-all flex flex-col justify-between hover:shadow-md group"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Preset Mock</span>
                  </div>
                  <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-100 mb-1">{p.name}</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed mb-4">{p.desc}</p>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-t border-zinc-50 dark:border-zinc-800 pt-2.5">
                  <span>{p.questions} Qs • {p.time} Mins</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-1 transition-transform">Use →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Steps Progress Tracker */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mb-3">
          <span>STEP {currentStep + 1} OF {STEPS.length}</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold">{STEPS[currentStep]}</span>
        </div>
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden flex">
          {STEPS.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-full flex-1 transition-all duration-300 ${
                idx <= currentStep ? "bg-blue-600" : "bg-transparent"
              } ${idx > 0 ? "border-l border-white dark:border-zinc-950" : ""}`}
            />
          ))}
        </div>
      </div>

      {/* Main Form Box */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm min-h-[380px] flex flex-col justify-between">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            {/* STEP 1: Exam Selection */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold">Select Target Examination</h3>
                  <p className="text-xs text-zinc-500">Choose the scoring scheme, negative marking threshold, and pattern style.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {(["JEE Main", "JEE Advanced", "Mixed"] as ExamType[]).map((type) => (
                    <div
                      key={type}
                      onClick={() => setExam(type)}
                      className={`border-2 rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between h-32 hover:border-blue-500/50 ${
                        exam === type 
                          ? "border-blue-600 bg-blue-50/10 dark:bg-blue-950/10" 
                          : "border-zinc-150 dark:border-zinc-800 bg-transparent"
                      }`}
                    >
                      <span className="font-extrabold text-base">{type}</span>
                      <p className="text-[10px] text-zinc-500 leading-normal">
                        {type === "JEE Main" && "Single-correct, Numerical values. Standard +4/-1 scheme."}
                        {type === "JEE Advanced" && "Multi-correct, Numerical matrices. Intricate marking criteria."}
                        {type === "Mixed" && "Combined syllabus pattern. Excellent general-topic check."}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Years Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold">Select Year Ranges</h3>
                    <p className="text-xs text-zinc-500">Filter PYQs by exam release year.</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedYears(yearsList)}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Select All
                    </button>
                    <span className="text-zinc-300">|</span>
                    <button 
                      onClick={() => setSelectedYears([2023, 2024, 2025, 2026])}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Recent Only
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 max-h-56 overflow-y-auto pr-2">
                  {yearsList.map((year) => {
                    const isSelected = selectedYears.includes(year);
                    return (
                      <button
                        key={year}
                        onClick={() => handleYearToggle(year)}
                        className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-zinc-50 dark:bg-zinc-850 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100"
                        }`}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: Choose Subjects */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold">Choose Test Subjects</h3>
                  <p className="text-xs text-zinc-500">Include multiple subjects for a balanced mock or single subject for focal review.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {(["Physics", "Chemistry", "Mathematics"] as SubjectType[]).map((sub) => {
                    const isSelected = subjects.includes(sub);
                    return (
                      <div
                        key={sub}
                        onClick={() => handleSubjectToggle(sub)}
                        className={`border-2 rounded-2xl p-5 cursor-pointer transition-all flex items-center justify-between h-20 hover:border-blue-500/50 ${
                          isSelected 
                            ? "border-blue-600 bg-blue-50/10 dark:bg-blue-950/10" 
                            : "border-zinc-150 dark:border-zinc-800 bg-transparent"
                        }`}
                      >
                        <span className="font-extrabold text-sm">{sub}</span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-zinc-350"
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: Choose Question Count */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold">Configure Questions Count</h3>
                  <p className="text-xs text-zinc-500">Pick standard length or customize the size.</p>
                </div>
                <div className="space-y-6 pt-4">
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="5" 
                      max="90" 
                      step="5"
                      value={totalQuestions} 
                      onChange={(e) => setTotalQuestions(Number(e.target.value))}
                      className="flex-1 accent-blue-600"
                    />
                    <div className="w-16 text-center py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-mono font-extrabold rounded-lg text-sm">
                      {totalQuestions} Qs
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[10, 15, 30, 45, 60, 75, 90].map(count => (
                      <button
                        key={count}
                        onClick={() => setTotalQuestions(count)}
                        className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold border transition-all ${
                          totalQuestions === count
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-zinc-50 dark:bg-zinc-850 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100"
                        }`}
                      >
                        {count} Qs
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Distribution */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold">Review Subject-wise Distribution</h3>
                  <p className="text-xs text-zinc-500">Manually fine-tune the exact question count for each subject.</p>
                </div>
                <div className="space-y-4 pt-2">
                  {subjects.map((sub) => (
                    <div key={sub} className="flex items-center justify-between border border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/20">
                      <span className="font-bold text-sm text-zinc-700 dark:text-zinc-300">{sub}</span>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleDistChange(sub, subjectDist[sub] - 1)}
                          className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 active:scale-90 flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-mono font-extrabold text-sm">{subjectDist[sub]}</span>
                        <button 
                          onClick={() => handleDistChange(sub, subjectDist[sub] + 1)}
                          className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 active:scale-90 flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="text-xs text-right text-zinc-400 font-semibold pr-2">
                    Sum: {(Object.values(subjectDist) as number[]).reduce((a, b) => a + b, 0)} / {totalQuestions} Questions
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: Difficulty */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold">Select Difficulty Profile</h3>
                  <p className="text-xs text-zinc-500">Pick a specific level of challenge or keep a mixed structure.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                  {(["Easy", "Medium", "Hard", "Mixed"] as DifficultyType[]).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`py-4 rounded-2xl font-bold text-sm border transition-all ${
                        difficulty === diff
                          ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10"
                          : "bg-zinc-50 dark:bg-zinc-850 border-zinc-150 dark:border-zinc-800 hover:bg-zinc-100"
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 7: Time Limit */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold">Set Duration</h3>
                  <p className="text-xs text-zinc-500">Specify the duration of the countdown timer. The test submits automatically when it ends.</p>
                </div>
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[15, 30, 45, 60, 90, 120, 180].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => {
                          setTimeLimit(mins);
                          setIsCustomTime(false);
                        }}
                        className={`py-3 rounded-xl text-xs font-mono font-bold border transition-all ${
                          timeLimit === mins && !isCustomTime
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-zinc-50 dark:bg-zinc-850 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100"
                        }`}
                      >
                        {mins >= 60 ? `${mins / 60} Hr${mins > 60 ? "s" : ""}` : `${mins} Mins`}
                      </button>
                    ))}
                    <button
                      onClick={() => setIsCustomTime(true)}
                      className={`py-3 rounded-xl text-xs font-mono font-bold border transition-all ${
                        isCustomTime
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-zinc-50 dark:bg-zinc-850 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100"
                      }`}
                    >
                      Custom Mins
                    </button>
                  </div>

                  {isCustomTime && (
                    <div className="flex items-center gap-3 max-w-xs pt-2">
                      <input 
                        type="number"
                        min="5"
                        max="360"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(Math.max(5, Number(e.target.value)))}
                        className="flex-1 border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 px-3 py-2 rounded-xl text-xs font-mono"
                      />
                      <span className="text-xs text-zinc-500">Minutes</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 8: Select Chapters */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold">Select Syllabus Modules</h3>
                    <p className="text-xs text-zinc-500">Choose specific chapters to focus on, or leave empty for Full Syllabus.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const allChs: string[] = [];
                          subjects.forEach(sub => {
                            if (allChaptersBySubject[sub]) {
                              allChs.push(...allChaptersBySubject[sub]);
                            }
                          });
                          setSelectedChapters(allChs);
                        }}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg"
                      >
                        Select All Chapters
                      </button>
                      <button
                        onClick={() => setSelectedChapters([])}
                        className="text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:underline cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg"
                      >
                        Clear Selection
                      </button>
                    </div>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                        type="text"
                        placeholder="Search chapters..."
                        value={chapterSearch}
                        onChange={(e) => setChapterSearch(e.target.value)}
                        className="border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 pl-8 pr-3 py-1.5 rounded-xl text-xs max-w-xs focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 max-h-56 overflow-y-auto pr-2">
                  {subjects.map((sub) => {
                    const chList = filteredChapters[sub] || [];
                    if (chList.length === 0) return null;
                    return (
                      <div key={sub} className="space-y-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{sub}</span>
                        <div className="flex flex-wrap gap-2">
                          {chList.map(ch => {
                            const isSelected = selectedChapters.includes(ch);
                            return (
                              <button
                                key={ch}
                                onClick={() => toggleChapter(ch)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1 ${
                                  isSelected
                                    ? "bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400"
                                    : "bg-zinc-50 dark:bg-zinc-850 border-zinc-250 dark:border-zinc-800 hover:bg-zinc-100"
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3" />}
                                <span>{ch}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 9: Final Preview */}
            {currentStep === 8 && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold">Verify Mock Configuration</h3>
                  <p className="text-xs text-zinc-500">Confirm test metadata before generating questions.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border border-zinc-100 dark:border-zinc-800 p-5 rounded-3xl bg-zinc-50/20 dark:bg-zinc-950/10">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase">Exam Style</span>
                    <p className="font-bold text-sm">{exam}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase">Duration</span>
                    <p className="font-bold text-sm">{timeLimit} Minutes</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase">Difficulty</span>
                    <p className="font-bold text-sm">{difficulty}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase">Total Size</span>
                    <p className="font-bold text-sm">{totalQuestions} Questions</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase">Syllabus Scope</span>
                    <p className="font-bold text-sm truncate">
                      {selectedChapters.length === 0 ? "Full Syllabus" : `${selectedChapters.length} Chapters`}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase">Subject Balance</span>
                    <p className="font-bold text-sm truncate">
                      {subjects.map(s => `${s.charAt(0)}:${subjectDist[s] || 0}`).join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Action Controls */}
        <div className="flex items-center justify-between border-t border-zinc-50 dark:border-zinc-850 pt-5 mt-6">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold flex items-center gap-1.5 ${
              currentStep === 0 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:bg-zinc-50 dark:hover:bg-zinc-850"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {currentStep === STEPS.length - 1 ? (
            <button
              onClick={handleGenerate}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Mock Exam</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
