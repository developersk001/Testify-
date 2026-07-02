import React, { useState, useEffect, useMemo } from "react";
import { BookOpen, Star, Sparkles, ArrowRight, Trash2, Edit3, Save, Eye, EyeOff } from "lucide-react";
import { Question } from "../types";
import { BooksIllustration } from "./Illustrations";

interface MistakeBookPageProps {
  questionBank: Question[];
  mistakeNotes: Record<string, string>;
  onDeleteMistake: (qId: string) => void;
  onUpdateMistakeNote: (qId: string, note: string) => void;
  onPracticeMistakes: (questions: Question[]) => void;
}

interface MistakeQuestionCardProps {
  q: Question;
  initialNote: string;
  onDeleteMistake: (qId: string) => void;
  onUpdateMistakeNote: (qId: string, note: string) => void;
  key?: React.Key;
}

function MistakeQuestionCard({ q, initialNote, onDeleteMistake, onUpdateMistakeNote }: MistakeQuestionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState(initialNote);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    setNoteText(initialNote);
  }, [initialNote]);

  const handleSave = () => {
    onUpdateMistakeNote(q.id, noteText);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm animate-fade-in">
      {/* Meta details */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-850 text-zinc-500 px-2 py-0.5 rounded-full">
              {q.subject} • {q.chapter}
            </span>
            <span className="text-[10px] text-zinc-400 font-bold font-mono">{q.id}</span>
          </div>
          <span className="text-xs font-semibold text-zinc-400 block pt-1">Topic: {q.topic}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-orange-50 dark:bg-orange-950/20 text-[10px] text-orange-600 font-extrabold uppercase">Mistake Saved</span>
          <button 
            onClick={() => onDeleteMistake(q.id)}
            className="p-1.5 text-zinc-400 hover:text-red-500 rounded hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question statement */}
      <p className="text-xs text-zinc-700 dark:text-zinc-200 whitespace-pre-line leading-relaxed font-medium bg-zinc-50/50 dark:bg-zinc-950/20 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
        {q.questionText}
      </p>

      {/* Toggle Solution Option (Hidden by Default) */}
      {showAnswer && (
        <div className="border border-zinc-100 dark:border-zinc-850 rounded-2xl p-4 bg-zinc-50/10 dark:bg-zinc-950/20 space-y-4">
          <div className="text-[10px] font-bold uppercase text-zinc-400 font-mono">Options & Solution:</div>
          {q.options ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map((opt, oIdx) => {
                const isCorrectOption = (
                  Array.isArray(q.correctAnswer)
                    ? q.correctAnswer.includes(opt)
                    : q.correctAnswer === opt
                );
                return (
                  <div 
                    key={oIdx} 
                    className={`border p-3 rounded-xl flex items-center justify-between text-xs font-semibold transition-all ${
                      isCorrectOption 
                        ? "border-emerald-500 bg-emerald-50/15 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold" 
                        : "border-zinc-150 dark:border-zinc-850 bg-zinc-50/20 dark:bg-zinc-950/10"
                    }`}
                  >
                    <div className="flex items-center gap-2">
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
          ) : (
            <div className="bg-emerald-500/5 border border-emerald-500/10 px-4 py-2 rounded-xl text-xs flex items-center gap-2">
              <span className="text-[10px] text-zinc-400 font-bold uppercase font-mono">Correct Numerical Value:</span>
              <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">{String(q.correctAnswer)}</span>
            </div>
          )}
        </div>
      )}

      {/* Row for toggle option */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all border ${
            showAnswer
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
              : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 border-zinc-200 dark:border-zinc-700"
          }`}
        >
          {showAnswer ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{showAnswer ? "Hide Solution" : "Show Options & Solution"}</span>
        </button>
      </div>

      {/* Notes box */}
      <div className="pt-2 border-t border-zinc-50 dark:border-zinc-800/60">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write down why you missed this, what formula you got wrong, etc..."
              className="w-full text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 rounded-2xl outline-none focus:border-blue-500 h-16"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Note</span>
              </button>
              <button
                onClick={() => {
                  setNoteText(initialNote);
                  setIsEditing(false);
                }}
                className="px-3 py-1.5 border border-zinc-200 rounded-lg text-[10px] font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4 bg-yellow-500/5 p-4 rounded-2xl border border-yellow-200/20">
            <div className="space-y-1 flex-1">
              <span className="text-[10px] font-bold uppercase text-yellow-800 dark:text-yellow-400">Review Note:</span>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 italic whitespace-pre-line">
                {initialNote || "No formula note added yet. Add a note to help you remember!"}
              </p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-zinc-500 hover:text-blue-600 rounded bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default function MistakeBookPage({
  questionBank,
  mistakeNotes,
  onDeleteMistake,
  onUpdateMistakeNote,
  onPracticeMistakes
}: MistakeBookPageProps) {
  
  const mistakeQuestions = useMemo(() => {
    const mistakeIds = Object.keys(mistakeNotes);
    return questionBank.filter(q => mistakeIds.includes(q.id));
  }, [questionBank, mistakeNotes]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6 text-zinc-900 dark:text-zinc-100">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Mistake Book</h1>
          <p className="text-sm text-zinc-500">Review, annotate, and practice questions you missed in previous tests.</p>
        </div>

        {mistakeQuestions.length > 0 && (
          <button
            onClick={() => onPracticeMistakes(mistakeQuestions)}
            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/15"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Practice {mistakeQuestions.length} Mistakes</span>
          </button>
        )}
      </div>

      {mistakeQuestions.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-12 text-center rounded-3xl flex flex-col items-center justify-center space-y-4">
          <BooksIllustration className="w-24 h-24" />
          <h3 className="font-bold text-lg text-zinc-700 dark:text-zinc-300">Your Mistake Book is clean!</h3>
          <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
            Awesome job. Any questions you answer incorrectly during mock tests are automatically saved here so you can review and practice them later.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {mistakeQuestions.map((q) => {
            const currentNote = mistakeNotes[q.id] || "";
            return (
              <MistakeQuestionCard 
                key={q.id}
                q={q}
                initialNote={currentNote}
                onDeleteMistake={onDeleteMistake}
                onUpdateMistakeNote={onUpdateMistakeNote}
              />
            );
          })}
        </div>
      )}

    </div>
  );
}
