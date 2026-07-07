import { Question, SubjectType, TestConfig, ActiveTestState } from "../types";

export interface PyqFileMetadata {
  id: string;
  exam: "JEE Main" | "JEE Advanced";
  year: number;
  subject: SubjectType;
  chapter: string;
  topic: string;
  path: string;
  count: number;
}

export interface PyqManifest {
  files: PyqFileMetadata[];
}

// In-memory cache for loaded PYQ files
const pyqCache: Record<string, Question[]> = {};

// Fallback questions to ensure the app works 100% of the time, even if a fetch fails
const fallbackMockBank: Question[] = [];

/**
 * Fetch the PYQ manifest from assets
 */
export async function getPyqManifest(): Promise<PyqManifest> {
  try {
    const response = await fetch("/assets/pyqs/manifest.json");
    if (!response.ok) {
      throw new Error(`Failed to load manifest: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching PYQ manifest, using default dynamic generator:", error);
    // Return a default simulated manifest matching our pre-bundled files for offline insurance
    return {
      files: [
        {
          id: "file-001",
          exam: "JEE Main",
          year: 2024,
          subject: "Physics",
          chapter: "Rotational Dynamics",
          topic: "Moment of Inertia",
          path: "/assets/pyqs/jee_main_2024_physics_rotational.json",
          count: 4
        },
        {
          id: "file-002",
          exam: "JEE Main",
          year: 2024,
          subject: "Chemistry",
          chapter: "Chemical Bonding",
          topic: "Molecular Orbital Theory",
          path: "/assets/pyqs/jee_main_2024_chemistry_bonding.json",
          count: 4
        },
        {
          id: "file-003",
          exam: "JEE Main",
          year: 2024,
          subject: "Mathematics",
          chapter: "Matrices & Determinants",
          topic: "System of Linear Equations",
          path: "/assets/pyqs/jee_main_2024_maths_matrices.json",
          count: 4
        },
        {
          id: "file-004",
          exam: "JEE Advanced",
          year: 2025,
          subject: "Physics",
          chapter: "Electrostatics",
          topic: "Electric Potential",
          path: "/assets/pyqs/jee_advanced_2025_physics_electrostatics.json",
          count: 4
        },
        {
          id: "file-005",
          exam: "JEE Advanced",
          year: 2025,
          subject: "Chemistry",
          chapter: "Coordination Compounds",
          topic: "Isomerism",
          path: "/assets/pyqs/jee_advanced_2025_chemistry_coordination.json",
          count: 4
        },
        {
          id: "file-006",
          exam: "JEE Advanced",
          year: 2025,
          subject: "Mathematics",
          chapter: "Limits Continuity & Differentiability",
          topic: "L'Hopital's Rule",
          path: "/assets/pyqs/jee_advanced_2025_maths_limits.json",
          count: 4
        },
        {
          id: "file-007",
          exam: "JEE Main",
          year: 2026,
          subject: "Physics",
          chapter: "Modern Physics",
          topic: "Photoelectric Effect",
          path: "/assets/pyqs/jee_main_2026_physics_modern.json",
          count: 4
        },
        {
          id: "file-008",
          exam: "JEE Main",
          year: 2026,
          subject: "Chemistry",
          chapter: "Organic Chemistry",
          topic: "Hydrocarbons",
          path: "/assets/pyqs/jee_main_2026_chemistry_organic.json",
          count: 4
        },
        {
          id: "file-009",
          exam: "JEE Main",
          year: 2026,
          subject: "Mathematics",
          chapter: "Coordinate Geometry",
          topic: "Circles",
          path: "/assets/pyqs/jee_main_2026_maths_circles.json",
          count: 4
        },
        {
          id: "file-010",
          exam: "JEE Main",
          year: 2023,
          subject: "Physics",
          chapter: "Mixed Chapters (2015-2023)",
          topic: "Core Physics Concepts",
          path: "/assets/pyqs/jee_2015_2023_physics.json",
          count: 9
        },
        {
          id: "file-011",
          exam: "JEE Main",
          year: 2023,
          subject: "Chemistry",
          chapter: "Mixed Chapters (2015-2023)",
          topic: "Core Chemistry Concepts",
          path: "/assets/pyqs/jee_2015_2023_chemistry.json",
          count: 9
        },
        {
          id: "file-012",
          exam: "JEE Main",
          year: 2023,
          subject: "Mathematics",
          chapter: "Mixed Chapters (2015-2023)",
          topic: "Core Mathematics Concepts",
          path: "/assets/pyqs/jee_2015_2023_maths.json",
          count: 9
        },
        {
          id: "file-013",
          exam: "JEE Main",
          year: 2026,
          subject: "Physics",
          chapter: "Mixed Chapters (2000-2026)",
          topic: "Full Physics Syllabus PYQs",
          path: "/assets/pyqs/jee_2000_2026_physics.json",
          count: 28
        },
        {
          id: "file-014",
          exam: "JEE Main",
          year: 2026,
          subject: "Chemistry",
          chapter: "Mixed Chapters (2000-2026)",
          topic: "Full Chemistry Syllabus PYQs",
          path: "/assets/pyqs/jee_2000_2026_chemistry.json",
          count: 31
        },
        {
          id: "file-015",
          exam: "JEE Main",
          year: 2026,
          subject: "Mathematics",
          chapter: "Mixed Chapters (2000-2026)",
          topic: "Full Mathematics Syllabus PYQs",
          path: "/assets/pyqs/jee_2000_2026_maths.json",
          count: 22
        }
      ]
    };
  }
}

/**
 * Load a single PYQ JSON file with caching
 */
export async function loadPyqFile(path: string): Promise<Question[]> {
  if (pyqCache[path]) {
    return pyqCache[path];
  }

  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.statusText}`);
    }
    const questions: any[] = await response.json();
    
    // Map JSON questions structure to our App's Question type
    const mappedQuestions: Question[] = questions.map((q) => ({
      id: q.id,
      exam: q.exam,
      year: q.year,
      shift: q.shift || q.shiftSession || "",
      paper: q.paper || "",
      subject: q.subject as SubjectType,
      chapter: q.chapter,
      topic: q.topic,
      difficulty: q.difficulty as "Easy" | "Medium" | "Hard",
      questionText: q.questionText || q.question || "",
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || q.detailedSolution || "No explanation provided.",
      marks: q.marks || 4,
      negativeMarks: q.negativeMarks !== undefined ? q.negativeMarks : -1,
      tags: q.tags || [],
      questionType: q.questionType || "Single Correct"
    }));

    pyqCache[path] = mappedQuestions;
    return mappedQuestions;
  } catch (error) {
    console.error(`Error loading PYQ file at ${path}:`, error);
    return [];
  }
}

/**
 * Load all questions from all files in the manifest (lazy loaded, but parallelized)
 */
export async function loadAllPyqs(): Promise<Question[]> {
  const manifest = await getPyqManifest();
  const loadPromises = manifest.files.map((file) => loadPyqFile(file.path));
  const results = await Promise.all(loadPromises);
  return results.flat();
}

/**
 * Filter questions based on strict criteria
 */
export function filterQuestions(
  questions: Question[],
  filters: {
    exam?: "JEE Main" | "JEE Advanced" | "Mixed";
    year?: number;
    subject?: SubjectType | "All";
    chapter?: string;
    topic?: string;
    difficulty?: "Easy" | "Medium" | "Hard" | "Mixed";
    keyword?: string;
    formula?: string;
  }
): Question[] {
  return questions.filter((q) => {
    if (filters.exam && filters.exam !== "Mixed" && q.exam !== filters.exam) return false;
    if (filters.year && q.year !== filters.year) return false;
    if (filters.subject && filters.subject !== "All" && q.subject !== filters.subject) return false;
    if (filters.chapter && filters.chapter !== "All" && q.chapter !== filters.chapter) return false;
    if (filters.topic && q.topic.toLowerCase() !== filters.topic.toLowerCase()) return false;
    if (filters.difficulty && filters.difficulty !== "Mixed" && q.difficulty !== filters.difficulty) return false;
    
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      const textMatch = q.questionText.toLowerCase().includes(kw);
      const explanationMatch = q.explanation.toLowerCase().includes(kw);
      const tagMatch = q.tags.some((t) => t.toLowerCase().includes(kw));
      const topicMatch = q.topic.toLowerCase().includes(kw);
      if (!textMatch && !explanationMatch && !tagMatch && !topicMatch) return false;
    }

    if (filters.formula) {
      const f = filters.formula.toLowerCase();
      const textMatch = q.questionText.toLowerCase().includes(f);
      const explanationMatch = q.explanation.toLowerCase().includes(f);
      if (!textMatch && !explanationMatch) return false;
    }

    return true;
  });
}

/**
 * Assemble a specific Mock Test configuration dynamically
 */
export async function generatePyqTest(
  config: {
    title: string;
    exam: "JEE Main" | "JEE Advanced";
    type: "Full" | "Chapter-wise" | "Subject-wise" | "Mixed" | "Random" | "Weak-topic";
    year?: number;
    subject?: SubjectType;
    chapters?: string[];
    totalQuestions: number;
    timeLimit: number;
    weakChapters?: string[];
  }
): Promise<Question[]> {
  const allQuestions = await loadAllPyqs();
  let pool = allQuestions.filter((q) => q.exam === config.exam);

  if (config.type === "Chapter-wise" && config.chapters && config.chapters.length > 0) {
    pool = pool.filter((q) => config.chapters!.includes(q.chapter));
  } else if (config.type === "Subject-wise" && config.subject) {
    pool = pool.filter((q) => q.subject === config.subject);
  } else if (config.type === "Mixed" && config.chapters && config.chapters.length > 0) {
    pool = pool.filter((q) => config.chapters!.includes(q.chapter));
  } else if (config.type === "Weak-topic" && config.weakChapters && config.weakChapters.length > 0) {
    pool = pool.filter((q) => config.weakChapters!.includes(q.chapter));
  }

  if (config.year) {
    pool = pool.filter((q) => q.year === config.year);
  }

  // Shuffle and select
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, config.totalQuestions);

  // If pool was empty or too small, fallback gracefully
  if (selected.length === 0) {
    return allQuestions.slice(0, config.totalQuestions);
  }

  return selected;
}
