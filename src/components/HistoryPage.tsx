import React, { useState, useMemo } from "react";
import { 
  Search, 
  Trash2, 
  RotateCcw, 
  Eye, 
  Download, 
  ArrowRight,
  Filter,
  Calendar,
  Clock,
  Sparkles
} from "lucide-react";
import { TestResult, ExamType } from "../types";

interface HistoryPageProps {
  history: TestResult[];
  onSelectResult: (result: TestResult) => void;
  onDeleteResult: (id: string) => void;
  onRetakeTest: (result: TestResult) => void;
}

export default function HistoryPage({
  history,
  onSelectResult,
  onDeleteResult,
  onRetakeTest
}: HistoryPageProps) {

  const [searchQuery, setSearchQuery] = useState("");
  const [examFilter, setExamFilter] = useState<ExamType | "All">("All");
  const [sortBy, setSortBy] = useState<"date" | "score" | "accuracy">("date");

  const filteredHistory = useMemo(() => {
    let list = [...history];

    // Query filter
    if (searchQuery.trim()) {
      list = list.filter(t => 
        t.config.exam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Exam Filter
    if (examFilter !== "All") {
      list = list.filter(t => t.config.exam === examFilter);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === "score") {
        return b.score - a.score;
      }
      if (sortBy === "accuracy") {
        return b.accuracy - a.accuracy;
      }
      return 0;
    });

    return list;
  }, [history, searchQuery, examFilter, sortBy]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6 text-zinc-900 dark:text-zinc-100">
      
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Test History</h1>
        <p className="text-sm text-zinc-500">Search and explore all your completed and submitted mock reports.</p>
      </div>

      {/* Control filters bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search by test ID or exam..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-xs outline-none focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select 
              value={examFilter} 
              onChange={(e) => setExamFilter(e.target.value as any)}
              className="bg-transparent font-semibold outline-none text-zinc-600 dark:text-zinc-300"
            >
              <option value="All">All Exams</option>
              <option value="JEE Main">JEE Main</option>
              <option value="JEE Advanced">JEE Advanced</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl px-3 py-1.5 text-xs">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-semibold outline-none text-zinc-600 dark:text-zinc-300"
            >
              <option value="date">Sort: Recent Date</option>
              <option value="score">Sort: High Score</option>
              <option value="accuracy">Sort: Highest Accuracy</option>
            </select>
          </div>
        </div>

      </div>

      {/* Table / List list */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-10 text-center rounded-3xl flex flex-col items-center justify-center space-y-3">
          <Eye className="w-16 h-16 text-zinc-300" />
          <h3 className="font-bold text-lg text-zinc-700 dark:text-zinc-300">No mock results found</h3>
          <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
            Try adjusting your search criteria, selecting another exam filter, or complete some tests to see items here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHistory.map((item) => (
            <div 
              key={item.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all flex flex-col justify-between gap-6 shadow-sm group relative"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold px-2 py-0.5 rounded-full uppercase">
                      {item.config.exam}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-semibold font-mono">{item.id}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-100 pt-1">
                    Mock Exam ({item.totalQuestions} Questions)
                  </h4>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-semibold">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{Math.floor(item.timeTaken / 60)}m {item.timeTaken % 60}s</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-extrabold text-zinc-900 dark:text-white font-mono">
                    {item.score} <span className="text-xs text-zinc-400 font-normal">/ {item.totalMarks}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600">{item.accuracy}% Accuracy</span>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="flex items-center justify-between border-t border-zinc-50 dark:border-zinc-800/80 pt-4 text-xs">
                <button 
                  onClick={() => onDeleteResult(item.id)}
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-850 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-950/20 text-zinc-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onRetakeTest(item)}
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 font-bold text-xs flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retake</span>
                  </button>
                  <button 
                    onClick={() => onSelectResult(item)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-blue-500/10"
                  >
                    <span>Analysis</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
