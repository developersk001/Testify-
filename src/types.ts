export type ExamType = "JEE Main" | "JEE Advanced" | "Mixed";
export type SubjectType = "Physics" | "Chemistry" | "Mathematics";
export type DifficultyType = "Easy" | "Medium" | "Hard" | "Mixed";

export type QuestionType = 
  | "Single Correct" 
  | "Multiple Correct" 
  | "Numerical" 
  | "Assertion Reason" 
  | "Paragraph" 
  | "Matrix Match";

export interface Question {
  id: string;
  exam: "JEE Main" | "JEE Advanced";
  year: number;
  shift?: string;
  paper?: string;
  subject: SubjectType;
  chapter: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questionText: string;
  options?: string[]; // For MCQ, Multi-correct, Assertion-Reason, Matrix Match
  correctAnswer: string | string[]; // Single string for Single/Numerical, array for Multi-correct
  explanation: string;
  marks: number;
  negativeMarks: number;
  tags: string[];
  questionType: QuestionType;
  // Matrix specific structure if any (represented cleanly in text/options)
}

export interface TestConfig {
  id: string;
  exam: ExamType;
  years: number[];
  subjects: SubjectType[];
  totalQuestions: number;
  subjectDistribution: Record<SubjectType, number>;
  difficulty: DifficultyType;
  timeLimit: number; // in minutes
  chapters: string[];
  isRandom?: boolean;
}

export interface UserResponse {
  questionId: string;
  selectedAnswer?: string | string[]; // For single, multi, assertion-reason, matrix
  textAnswer?: string; // For numerical input
  isMarkedForReview: boolean;
  timeSpent: number; // in seconds
}

export interface ActiveTestState {
  config: TestConfig;
  questions: Question[];
  responses: Record<string, UserResponse>; // Map of questionId -> UserResponse
  currentQuestionIndex: number;
  timeRemaining: number; // in seconds
  startTime: number; // timestamp
  isSubmitted: boolean;
}

export interface SubjectStats {
  subject: SubjectType;
  total: number;
  attempted: number;
  correct: number;
  score: number;
  maxScore: number;
  accuracy: number;
}

export interface ChapterStats {
  chapter: string;
  subject: SubjectType;
  total: number;
  correct: number;
  accuracy: number;
}

export interface TestResult {
  id: string;
  date: string; // ISO string
  config: TestConfig;
  totalMarks: number;
  score: number;
  accuracy: number;
  percentile: number;
  predictedRank: number;
  timeTaken: number; // in seconds
  totalQuestions: number;
  attempted: number;
  skipped: number;
  correct: number;
  incorrect: number;
  negativeMarksIncurred: number;
  subjectStats: Record<SubjectType, SubjectStats>;
  chapterStats: Record<string, ChapterStats>;
  weakChapters: string[];
  strongChapters: string[];
  responses: Record<string, UserResponse>;
}

export interface UserProfile {
  name: string;
  joinedAt: string;
  streak: number;
  lastActiveDate?: string;
  dailyGoalMinutes: number;
  weeklyGoalTests: number;
  badges: string[];
  studyTimeSeconds: number;
}

export interface MistakeBookEntry {
  questionId: string;
  incorrectAttemptsCount: number;
  lastAttemptedDate: string;
  userNotes?: string;
}

export interface Bookmark {
  questionId: string;
  bookmarkedAt: string;
  notes?: string;
}

export interface RecommendationInsight {
  summary: string;
  strengths: string[];
  recommendations: Array<{
    subject: string;
    topic: string;
    estimatedGain: string;
    reasoning: string;
    subtopicsToPractice: string[];
    actionPlan: string;
  }>;
  dailyGoal: string;
}
