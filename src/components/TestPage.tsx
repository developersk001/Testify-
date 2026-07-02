import React, { useState, useEffect, useRef } from "react";
import { 
  Maximize2, 
  Minimize2, 
  Calculator, 
  HelpCircle, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  Check, 
  RotateCcw,
  AlertTriangle,
  Layout,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ActiveTestState, Question, UserResponse } from "../types";
import ScientificCalculator from "./ScientificCalculator";

interface TestPageProps {
  activeTest: ActiveTestState;
  onUpdateActiveState: (state: ActiveTestState | ((prev: ActiveTestState) => ActiveTestState)) => void;
  onSubmitTest: () => void;
}

export default function TestPage({
  activeTest,
  onUpdateActiveState,
  onSubmitTest
}: TestPageProps) {
  const { config, questions, responses, currentQuestionIndex, timeRemaining } = activeTest;
  const currentQuestion = questions[currentQuestionIndex];

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [numericalInput, setNumericalInput] = useState("");
  const [showPalette, setShowPalette] = useState(true);

  useEffect(() => {
    setShowPalette(window.innerWidth >= 1024);
  }, []);

  const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);

  // Fullscreen controller
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Fullscreen error:", err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
    };
  }, []);

  // Timer Countdown loop
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setTimeout(() => {
      onUpdateActiveState(prev => {
        if (prev.timeRemaining <= 0) return prev;
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        };
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeRemaining]);

  // Autosave setup (triggered every 5 seconds)
  useEffect(() => {
    autoSaveInterval.current = setInterval(() => {
      localStorage.setItem("testify_active_test_session", JSON.stringify(activeTest));
    }, 5000);

    return () => {
      if (autoSaveInterval.current) clearInterval(autoSaveInterval.current);
    };
  }, [activeTest]);

  // Sync numerical text input with responses when current question changes
  useEffect(() => {
    if (currentQuestion && currentQuestion.questionType === "Numerical") {
      const resp = responses[currentQuestion.id];
      setNumericalInput(resp?.textAnswer || "");
    }
  }, [currentQuestionIndex]);

  // Keyboard Shortcuts (1, 2, 3, 4 for options; Arrow keys for navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcut if calculator or text input is active
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }

      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (["1", "2", "3", "4"].includes(e.key)) {
        const optionIdx = parseInt(e.key) - 1;
        onUpdateActiveState(prev => {
          const currentQ = prev.questions[prev.currentQuestionIndex];
          if (currentQ && currentQ.options && currentQ.options[optionIdx]) {
            const option = currentQ.options[optionIdx];
            const qId = currentQ.id;
            const currentResp = prev.responses[qId] || { questionId: qId, isMarkedForReview: false, timeSpent: 0 };
            let updatedAnswer: string | string[];

            if (currentQ.questionType === "Multiple Correct") {
              const existing = Array.isArray(currentResp.selectedAnswer) 
                ? [...currentResp.selectedAnswer] 
                : currentResp.selectedAnswer 
                  ? [currentResp.selectedAnswer as string] 
                  : [];
              if (existing.includes(option)) {
                updatedAnswer = existing.filter(o => o !== option);
              } else {
                updatedAnswer = [...existing, option];
              }
            } else {
              updatedAnswer = option;
            }

            return {
              ...prev,
              responses: {
                ...prev.responses,
                [qId]: {
                  ...currentResp,
                  selectedAnswer: updatedAnswer
                }
              }
            };
          }
          return prev;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAutoSubmit = () => {
    // Save state as final first
    onUpdateActiveState(prev => {
      const finalState = { ...prev, timeRemaining: 0, isSubmitted: true };
      localStorage.removeItem("testify_active_test_session");
      setTimeout(() => onSubmitTest(), 0);
      return finalState;
    });
  };

  const handleOptionSelect = (option: string) => {
    onUpdateActiveState(prev => {
      const currentQ = prev.questions[prev.currentQuestionIndex];
      const qId = currentQ.id;
      const currentResp = prev.responses[qId] || { questionId: qId, isMarkedForReview: false, timeSpent: 0 };

      let updatedAnswer: string | string[];

      if (currentQ.questionType === "Multiple Correct") {
        const existing = Array.isArray(currentResp.selectedAnswer) 
          ? [...currentResp.selectedAnswer] 
          : currentResp.selectedAnswer 
            ? [currentResp.selectedAnswer as string] 
            : [];
        if (existing.includes(option)) {
          updatedAnswer = existing.filter(o => o !== option);
        } else {
          updatedAnswer = [...existing, option];
        }
      } else {
        updatedAnswer = option;
      }

      const newResponses = {
        ...prev.responses,
        [qId]: {
          ...currentResp,
          selectedAnswer: updatedAnswer
        }
      };

      return {
        ...prev,
        responses: newResponses
      };
    });
  };

  const handleNumericalChange = (val: string) => {
    setNumericalInput(val);
    onUpdateActiveState(prev => {
      const currentQ = prev.questions[prev.currentQuestionIndex];
      const qId = currentQ.id;
      const currentResp = prev.responses[qId] || { questionId: qId, isMarkedForReview: false, timeSpent: 0 };

      const newResponses = {
        ...prev.responses,
        [qId]: {
          ...currentResp,
          textAnswer: val
        }
      };

      return {
        ...prev,
        responses: newResponses
      };
    });
  };

  const handleMarkForReview = () => {
    onUpdateActiveState(prev => {
      const currentQ = prev.questions[prev.currentQuestionIndex];
      const qId = currentQ.id;
      const currentResp = prev.responses[qId] || { questionId: qId, isMarkedForReview: false, timeSpent: 0 };

      const newResponses = {
        ...prev.responses,
        [qId]: {
          ...currentResp,
          isMarkedForReview: !currentResp.isMarkedForReview
        }
      };

      return {
        ...prev,
        responses: newResponses
      };
    });
  };

  const handleClearResponse = () => {
    onUpdateActiveState(prev => {
      const currentQ = prev.questions[prev.currentQuestionIndex];
      const qId = currentQ.id;
      const currentResp = prev.responses[qId];
      if (!currentResp) return prev;

      const newResponses = { ...prev.responses };
      delete newResponses[qId];

      if (currentQ.questionType === "Numerical") {
        setNumericalInput("");
      }

      return {
        ...prev,
        responses: newResponses
      };
    });
  };

  const handleNext = () => {
    onUpdateActiveState(prev => {
      if (prev.currentQuestionIndex < prev.questions.length - 1) {
        return {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1
        };
      }
      return prev;
    });
  };

  const handlePrev = () => {
    onUpdateActiveState(prev => {
      if (prev.currentQuestionIndex > 0) {
        return {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex - 1
        };
      }
      return prev;
    });
  };

  const handlePaletteSelect = (idx: number) => {
    onUpdateActiveState(prev => {
      return {
        ...prev,
        currentQuestionIndex: idx
      };
    });
    if (window.innerWidth < 1024) {
      setShowPalette(false);
    }
  };

  // Compute status for the Palette view
  const getQuestionStatus = (q: Question, idx: number) => {
    const resp = responses[q.id];
    const isCurrent = idx === currentQuestionIndex;

    if (isCurrent) return "current";
    if (resp?.isMarkedForReview) return "marked";
    
    const isAnswered = q.questionType === "Numerical" 
      ? !!resp?.textAnswer?.trim() 
      : (Array.isArray(resp?.selectedAnswer) ? resp.selectedAnswer.length > 0 : !!resp?.selectedAnswer);

    if (isAnswered) return "answered";
    if (resp) return "visited"; // opened but not answered
    return "not-visited";
  };

  // Timer formatting
  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const rSecs = secs % 60;
    
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${rSecs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`fixed inset-0 bg-zinc-50 dark:bg-zinc-950 z-50 flex flex-col font-sans ${isFullscreen ? "p-0" : ""}`}>
      
      {/* Top Test Banner */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-150 dark:border-zinc-800 px-6 py-4 flex items-center justify-between shadow-sm select-none">
        <div className="flex items-center gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{config.exam} Active Exam</span>
            <h2 className="text-base font-extrabold text-zinc-950 dark:text-white">Testify Online Mock Terminal</h2>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowPalette(!showPalette)}
            className={`px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showPalette 
                ? "bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-950/20" 
                : "bg-white dark:bg-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <Layout className="w-4 h-4" />
            <span className="hidden sm:inline">{showPalette ? "Hide Palette" : "Show Palette"}</span>
          </button>

          <button 
            onClick={() => setShowCalculator(!showCalculator)}
            className={`px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showCalculator 
                ? "bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-950/20" 
                : "bg-white dark:bg-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Virtual Calculator</span>
          </button>

          <button 
            onClick={toggleFullscreen}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* TIMER BOX */}
          <div className="bg-red-500/10 border border-red-200/50 dark:border-red-950/30 text-red-600 px-4 py-2 rounded-xl flex items-center gap-2 font-mono font-bold text-sm">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </header>

      {/* Main Sandbox Panel */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left side: Question Palette and Information */}
        {showPalette && (
          <aside className="w-full lg:w-80 bg-white dark:bg-zinc-900 border-b lg:border-b-0 lg:border-r border-zinc-150 dark:border-zinc-800/80 flex flex-col justify-between overflow-y-auto select-none p-5 fixed lg:relative inset-y-0 left-0 top-[73px] lg:top-0 bottom-0 z-30 lg:z-0 shadow-lg lg:shadow-none animate-fade-in">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-zinc-950 dark:text-white">Question Palette</h3>
                  <p className="text-[10px] text-zinc-500">Jump directly to any section by clicking.</p>
                </div>
                <button 
                  onClick={() => setShowPalette(false)}
                  className="lg:hidden p-1.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Grid of Palette */}
              <div className="grid grid-cols-5 gap-2.5">
                {questions.map((q, idx) => {
                  const status = getQuestionStatus(q, idx);
                  return (
                    <button
                      key={q.id}
                      onClick={() => handlePaletteSelect(idx)}
                      className={`w-11 h-11 rounded-xl text-xs font-bold font-mono transition-all border flex items-center justify-center relative ${
                        status === "current" && "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10 scale-105"
                      } ${
                        status === "answered" && "bg-emerald-500 border-emerald-500 text-white"
                      } ${
                        status === "marked" && "bg-purple-600 border-purple-600 text-white"
                      } ${
                        status === "visited" && "bg-zinc-100 border-zinc-250 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
                      } ${
                        status === "not-visited" && "bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-400"
                      }`}
                    >
                      <span>{idx + 1}</span>
                      {status === "marked" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white absolute bottom-1 right-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Guides */}
            <div className="border-t border-zinc-50 dark:border-zinc-800 pt-4 space-y-2 text-[10px] font-semibold text-zinc-500">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-emerald-500" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-purple-600" />
                  <span>Marked</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-zinc-100 dark:bg-zinc-850 border border-zinc-250 dark:border-zinc-800" />
                  <span>Visited</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-blue-600" />
                  <span>Current</span>
                </div>
              </div>
              <div className="text-[9px] text-zinc-400 font-medium pt-2 italic">
                * Shortcuts: [1,2,3,4] select options. [←/→] navigate.
              </div>
            </div>
          </aside>
        )}

        {/* Center: Question Workspace */}
        <main className="flex-1 bg-zinc-50 dark:bg-zinc-950 p-6 sm:p-8 overflow-y-auto relative flex flex-col justify-between">
          
          {/* Question Slider Row */}
          <div className="max-w-4xl mx-auto w-full mb-6 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-2xl p-4 shadow-sm space-y-3 animate-fade-in select-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">Question Navigator Slider</span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-mono font-extrabold">
                  Q. {currentQuestionIndex + 1} / {questions.length}
                </span>
              </div>
              
              <div className="hidden sm:flex items-center gap-3 text-[9px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-purple-600" />
                  <span>Marked</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-extrabold text-zinc-400 font-mono">1</span>
              <div className="flex-1 relative flex items-center py-2">
                {/* Visual Track behind the input */}
                <div className="absolute left-0 right-0 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full pointer-events-none flex justify-between px-1">
                  {questions.map((q, idx) => {
                    const status = getQuestionStatus(q, idx);
                    let dotColor = "bg-zinc-300 dark:bg-zinc-700";
                    if (status === "answered") dotColor = "bg-emerald-500";
                    else if (status === "marked") dotColor = "bg-purple-600";
                    else if (idx === currentQuestionIndex) dotColor = "bg-blue-600 scale-125";
                    
                    return (
                      <div 
                        key={q.id} 
                        className={`w-2 h-2 rounded-full -translate-y-[1px] transition-all duration-300 ${dotColor}`}
                      />
                    );
                  })}
                </div>

                <input 
                  type="range"
                  min="0"
                  max={questions.length - 1}
                  value={currentQuestionIndex}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    onUpdateActiveState(prev => ({
                      ...prev,
                      currentQuestionIndex: val
                    }));
                  }}
                  className="w-full h-4 appearance-none cursor-pointer bg-transparent relative z-10 opacity-40 hover:opacity-100 focus:outline-none accent-blue-600 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:border-none"
                />
              </div>
              <span className="text-[10px] font-extrabold text-zinc-400 font-mono">{questions.length}</span>
            </div>
          </div>

          {/* Question Card Wrapper with AnimatePresence */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.15 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-6 sm:p-8 shadow-sm max-w-4xl mx-auto w-full flex-1 mb-6"
            >
              
              {/* Header / Type Details */}
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
                    QUESTION {currentQuestionIndex + 1} OF {questions.length} • {currentQuestion.subject}
                  </span>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm">{currentQuestion.questionType}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-500 font-semibold">{currentQuestion.difficulty}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-right">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">Marks Weight</span>
                  <span className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400">+{currentQuestion.marks}</span>
                  {currentQuestion.negativeMarks !== 0 && (
                    <span className="text-xs font-mono font-extrabold text-red-600 dark:text-red-400">{currentQuestion.negativeMarks}</span>
                  )}
                </div>
              </div>

              {/* Question Body Text */}
              <div className="space-y-6 text-zinc-800 dark:text-zinc-100 leading-relaxed text-sm">
                <div className="whitespace-pre-line font-medium leading-relaxed">
                  {currentQuestion.questionText}
                </div>

                {/* Options lists based on Question Type */}
                {currentQuestion.questionType !== "Numerical" && currentQuestion.options && (
                  <div className="grid grid-cols-1 gap-3 pt-4">
                    {currentQuestion.options.map((opt, oIdx) => {
                      const resp = responses[currentQuestion.id];
                      let isChecked = false;

                      if (currentQuestion.questionType === "Multiple Correct") {
                        isChecked = Array.isArray(resp?.selectedAnswer) 
                          ? resp.selectedAnswer.includes(opt) 
                          : resp?.selectedAnswer === opt;
                      } else {
                        isChecked = resp?.selectedAnswer === opt;
                      }

                      return (
                        <div
                          key={oIdx}
                          onClick={() => handleOptionSelect(opt)}
                          className={`border rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-850/30 ${
                            isChecked 
                              ? "border-blue-600 bg-blue-50/10 dark:bg-blue-950/10" 
                              : "border-zinc-200 dark:border-zinc-800 bg-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-lg text-[10px] font-mono font-extrabold flex items-center justify-center ${
                              isChecked ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                            }`}>
                              {String.fromCharCode(65 + oIdx)}
                            </div>
                            <span className="text-xs font-medium">{opt}</span>
                          </div>

                          {/* Input graphic */}
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isChecked ? "bg-blue-600 border-blue-600 text-white" : "border-zinc-300"
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Numerical Response Box */}
                {currentQuestion.questionType === "Numerical" && (
                  <div className="pt-6 space-y-3 max-w-xs">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Write Numerical Value Answer</label>
                    <input
                      type="text"
                      placeholder="Enter final decimal/integer value (e.g., 2.47 or 5)"
                      value={numericalInput}
                      onChange={(e) => handleNumericalChange(e.target.value)}
                      className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 rounded-2xl text-sm font-mono font-bold focus:border-blue-500 outline-none shadow-inner"
                    />
                    <p className="text-[10px] text-zinc-400">Round off calculations to two decimal places where applicable.</p>
                  </div>
                )}
              </div>

            </motion.div>
          </AnimatePresence>

          {/* Action buttons (fixed base) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-150 dark:border-zinc-850 pt-5 max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 disabled:opacity-50 flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleMarkForReview}
                className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
                  responses[currentQuestion.id]?.isMarkedForReview 
                    ? "bg-purple-50 border-purple-500 text-purple-600 dark:bg-purple-950/20" 
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <Bookmark className="w-4 h-4 fill-current" />
                <span>Mark for Review</span>
              </button>
              <button
                onClick={handleClearResponse}
                className="px-4 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 text-xs font-bold text-zinc-500"
              >
                Clear Input
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-1"
                >
                  <span>Save & Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit Exam</span>
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Floating Scientific Calculator container */}
      <AnimatePresence>
        {showCalculator && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed bottom-20 right-6 z-50 cursor-move"
          >
            <ScientificCalculator onClose={() => setShowCalculator(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-sm w-full rounded-3xl p-6 shadow-2xl space-y-6 text-zinc-850 dark:text-zinc-100"
            >
              <div className="flex items-center gap-3 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-2xl">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="font-extrabold text-sm">Finish JEE Mock Exam?</h3>
              </div>

              <div className="space-y-2 text-xs text-zinc-500 leading-relaxed">
                <p>Are you sure you want to end your mock test? This will freeze your responses and generate your detailed performance scorecard.</p>
                <div className="border border-zinc-100 dark:border-zinc-800 p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/10 space-y-1">
                  <div className="flex justify-between">
                    <span>Total Questions:</span>
                    <span className="font-bold">{questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Answered:</span>
                    <span className="font-bold">
                      {Object.keys(responses).filter(id => {
                        const q = questions.find(qu => qu.id === id);
                        if (!q) return false;
                        return q.questionType === "Numerical" 
                          ? !!responses[id].textAnswer?.trim() 
                          : !!responses[id].selectedAnswer;
                      }).length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-850 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-850 font-bold text-xs"
                >
                  Go Back
                </button>
                <button
                  onClick={handleAutoSubmit}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10"
                >
                  Confirm Submit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
