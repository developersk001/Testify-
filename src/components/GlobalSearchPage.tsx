import React, { useState, useEffect, useMemo } from "react";
import { Search, Star, Bookmark, Filter, Calendar, BookOpen, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { Question } from "../types";

interface GlobalSearchPageProps {
  questionBank: Question[];
  onBookmarkQuestion: (qId: string) => void;
  bookmarkedQuestionIds: string[];
}

interface SearchQuestionCardProps {
  q: Question;
  isBookmarked: boolean;
  onBookmarkQuestion: (qId: string) => void;
  key?: React.Key;
}

function SearchQuestionCard({ q, isBookmarked, onBookmarkQuestion }: SearchQuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  // Reset answer show state if collapsed to preserve self-study focus
  useEffect(() => {
    if (!isExpanded) {
      setShowAnswer(false);
    }
  }, [isExpanded]);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 hover:border-zinc-250 dark:hover:border-zinc-700 transition-all space-y-4 shadow-sm">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-4 select-none">
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="space-y-1 cursor-pointer flex-1 group"
        >
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-850 text-zinc-500 px-2.5 py-0.5 rounded-full">
              {q.subject} • {q.chapter}
            </span>
            <span className="text-[10px] text-zinc-400 font-bold font-mono">{q.id}</span>
          </div>
          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 transition-colors block pt-1">
            Topic: {q.topic}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onBookmarkQuestion(q.id)}
            className={`p-2.5 rounded-xl border transition-all ${
              isBookmarked 
                ? "bg-amber-500/10 border-amber-500/30 text-amber-500" 
                : "border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-850"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isBookmarked ? "fill-current" : ""}`} />
          </button>

          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-500"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Always show truncated question statement */}
      <p 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed font-medium cursor-pointer ${
          isExpanded ? "" : "line-clamp-2"
        }`}
      >
        {q.questionText}
      </p>

      {/* Show full details when expanded */}
      {isExpanded && (
        <div className="border-t border-zinc-50 dark:border-zinc-800/80 pt-4 space-y-4">
          {/* Weight & info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] font-mono text-zinc-400 font-bold uppercase">
            <div className="space-y-0.5">
              <span>Difficulty</span>
              <p className="font-bold text-zinc-700 dark:text-zinc-200 text-xs">{q.difficulty}</p>
            </div>
            <div className="space-y-0.5">
              <span>Type</span>
              <p className="font-bold text-zinc-700 dark:text-zinc-200 text-xs">{q.questionType}</p>
            </div>
            <div className="space-y-0.5">
              <span>Marks</span>
              <p className="font-bold text-emerald-600 text-xs">+{q.marks}</p>
            </div>
            <div className="space-y-0.5">
              <span>Negative Marks</span>
              <p className="font-bold text-red-600 text-xs">{q.negativeMarks}</p>
            </div>
          </div>

          {/* Options list */}
          {q.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {q.options.map((opt, oIdx) => {
                const isCorrectOption = showAnswer && (
                  Array.isArray(q.correctAnswer)
                    ? q.correctAnswer.includes(opt)
                    : q.correctAnswer === opt
                );
                return (
                  <div 
                    key={oIdx} 
                    className={`border p-3.5 rounded-2xl flex items-center justify-between text-xs font-semibold transition-all ${
                      isCorrectOption 
                        ? "border-emerald-500 bg-emerald-50/15 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold" 
                        : "border-zinc-150 dark:border-zinc-850 bg-zinc-50/20 dark:bg-zinc-950/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-5 h-5 rounded text-[10px] font-mono font-bold flex items-center justify-center ${
                        isCorrectOption 
                          ? "bg-emerald-600 text-white" 
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                      }`}>
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {isCorrectOption && (
                      <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">
                        Correct Option
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Show Answer Toggle Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-50 dark:border-zinc-800/40">
            {q.questionType === "Numerical" && showAnswer && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 px-4 py-2 rounded-xl text-xs flex items-center gap-2">
                <span className="text-[10px] text-zinc-400 font-bold uppercase font-mono">Correct Numerical Value:</span>
                <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">{String(q.correctAnswer)}</span>
              </div>
            )}
            
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start transition-all border ${
                showAnswer
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                  : "bg-blue-600 border-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10"
              }`}
            >
              {showAnswer ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showAnswer ? "Hide Correct Answer" : "Reveal Correct Answer"}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function GlobalSearchPage({
  questionBank,
  onBookmarkQuestion,
  bookmarkedQuestionIds
}: GlobalSearchPageProps) {

  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("All");
  const [diffFilter, setDiffFilter] = useState<string>("All");

  const filteredQuestions = useMemo(() => {
    let list = [...questionBank];

    // Text search
    if (query.trim()) {
      const qLower = query.toLowerCase();
      list = list.filter(q => 
        q.id.toLowerCase().includes(qLower) ||
        q.questionText.toLowerCase().includes(qLower) ||
        q.chapter.toLowerCase().includes(qLower) ||
        q.topic.toLowerCase().includes(qLower)
      );
    }

    // Subject
    if (subjectFilter !== "All") {
      list = list.filter(q => q.subject === subjectFilter);
    }

    // Difficulty
    if (diffFilter !== "All") {
      list = list.filter(q => q.difficulty === diffFilter);
    }

    return list;
  }, [questionBank, query, subjectFilter, diffFilter]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6 text-zinc-900 dark:text-zinc-100">
      
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Question Library</h1>
        <p className="text-sm text-zinc-500 font-medium">Explore, filter, and study questions from the JEE PYQ master database.</p>
      </div>

      {/* Grid Filter control */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-4 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        
        {/* Input box */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search by ID, keyword, formula, chapter, topic..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-xs outline-none focus:border-blue-500"
          />
        </div>

        {/* Dropdowns filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-850 rounded-2xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select 
              value={subjectFilter} 
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-transparent font-semibold outline-none text-zinc-600 dark:text-zinc-300"
            >
              <option value="All">All Subjects</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Mathematics">Mathematics</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-850 rounded-2xl px-3 py-1.5 text-xs">
            <select 
              value={diffFilter} 
              onChange={(e) => setDiffFilter(e.target.value)}
              className="bg-transparent font-semibold outline-none text-zinc-600 dark:text-zinc-300"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

      </div>

      {/* List count */}
      <div className="text-xs font-mono font-bold text-zinc-400 pr-2">
        Matching Questions Found: {filteredQuestions.length}
      </div>

      {/* Grid of cards */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-12 text-center rounded-3xl flex flex-col items-center justify-center space-y-3">
          <BookOpen className="w-16 h-16 text-zinc-300" />
          <h3 className="font-bold text-lg text-zinc-700 dark:text-zinc-300">No questions found</h3>
          <p className="text-xs text-zinc-500 max-w-sm">
            Try adjusting your search query, choosing different subjects, or checking your spelling.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const isBookmarked = bookmarkedQuestionIds.includes(q.id);
            return (
              <SearchQuestionCard 
                key={q.id}
                q={q}
                isBookmarked={isBookmarked}
                onBookmarkQuestion={onBookmarkQuestion}
              />
            );
          })}
        </div>
      )}

    </div>
  );
}
