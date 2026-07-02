import { Question, SubjectType } from "../types";

// Premium JEE-style original questions to prevent copyright issues
export const sampleQuestions: Question[] = [
  // --- PHYSICS ---
  {
    id: "PHY-001",
    exam: "JEE Main",
    year: 2024,
    shift: "January 27, Shift 1",
    subject: "Physics",
    chapter: "Rotational Dynamics",
    topic: "Moment of Inertia",
    difficulty: "Medium",
    questionType: "Single Correct",
    questionText: "A solid sphere and a hollow cylinder, both of mass M and radius R, roll down an inclined plane of inclination θ without slipping. If they start from rest at the same height h, what is the ratio of their translational velocities when they reach the bottom of the incline (v_sphere / v_cylinder)?",
    options: [
      "√(10 / 7)",
      "√(14 / 10)",
      "√(10 / 14)",
      "√(5 / 3)"
    ],
    correctAnswer: "√(10 / 7)",
    explanation: "Using conservation of energy: mgh = 0.5 * m * v^2 * (1 + I / (m*R^2)). For solid sphere, I = (2/5)*m*R^2, so v_sphere^2 = (10/7)*gh. For hollow cylinder, I = m*R^2, so v_cylinder^2 = gh. Taking the ratio v_sphere / v_cylinder gives √(10/7).",
    marks: 4,
    negativeMarks: -1,
    tags: ["Rolling Motion", "Inclined Plane", "Conservation of Energy"]
  },
  {
    id: "PHY-002",
    exam: "JEE Advanced",
    year: 2025,
    paper: "Paper 1",
    subject: "Physics",
    chapter: "Electrostatics",
    topic: "Electric Dipole",
    difficulty: "Hard",
    questionType: "Multiple Correct",
    questionText: "An electric dipole of dipole moment p = q*d is placed at the origin oriented along the z-axis. A point charge Q is placed at a distance r along the equatorial plane (x-y plane). Which of the following statements are correct? (Neglect gravitational effects)",
    options: [
      "The electric field at the location of the point charge Q is oriented antiparallel to the dipole moment vector p.",
      "The torque acting on the dipole due to the charge Q has a magnitude of (q*Q*d) / (4πε₀ * r²).",
      "The potential energy of the dipole-charge system is zero.",
      "The force on the point charge Q acts perpendicular to the equatorial plane."
    ],
    correctAnswer: [
      "The electric field at the location of the point charge Q is oriented antiparallel to the dipole moment vector p.",
      "The potential energy of the dipole-charge system is zero."
    ],
    explanation: "At any point in the equatorial plane, the electric field due to a z-aligned dipole is parallel to the -z direction (antiparallel to p). The electric potential on the equatorial plane is zero, making the potential energy of the system U = Q*V = 0. Thus, option A and C are correct.",
    marks: 4,
    negativeMarks: -2,
    tags: ["Electric Field", "Equatorial Plane", "Potential Energy"]
  },
  {
    id: "PHY-003",
    exam: "JEE Main",
    year: 2023,
    shift: "April 15, Shift 2",
    subject: "Physics",
    chapter: "Modern Physics",
    topic: "Photoelectric Effect",
    difficulty: "Easy",
    questionType: "Numerical",
    questionText: "When light of frequency 2v₀ (where v₀ is the threshold frequency) is incident on a metal plate, the maximum velocity of emitted photoelectrons is v₁. When the frequency of incident radiation is increased to 5v₀, the maximum velocity of photoelectrons is v₂. Find the value of the ratio (v₂ / v₁).",
    correctAnswer: "2",
    explanation: "Einstein's Photoelectric Equation: K.E. = h*v - h*v₀. Case 1: 0.5 * m * v₁² = h*(2v₀) - h*v₀ = h*v₀. Case 2: 0.5 * m * v₂² = h*(5v₀) - h*v₀ = 4*h*v₀. Therefore, (v₂ / v₁)² = 4, which yields v₂ / v₁ = 2.",
    marks: 4,
    negativeMarks: 0,
    tags: ["Einstein Equation", "Threshold Frequency", "Kinetic Energy"]
  },
  {
    id: "PHY-004",
    exam: "JEE Advanced",
    year: 2024,
    paper: "Paper 2",
    subject: "Physics",
    chapter: "Kinematics",
    topic: "Projectile Motion",
    difficulty: "Medium",
    questionType: "Single Correct",
    questionText: "A projectile is launched from the ground at an angle of 45° with the horizontal. At the highest point of its trajectory, the projectile explodes into two fragments of equal mass. One fragment falls vertically downwards with zero initial velocity immediately after explosion. What is the horizontal distance from the launch point where the second fragment lands, in terms of the total range R of the unexploded projectile?",
    options: [
      "1.5 R",
      "2.0 R",
      "1.25 R",
      "1.75 R"
    ],
    correctAnswer: "1.5 R",
    explanation: "The center of mass must land at range R. The first fragment falls straight down from the highest point (at x = R/2), landing at R/2. By center of mass conservation: m * R = (m/2) * (R/2) + (m/2) * X₂. This simplifies to R = R/4 + X₂ / 2, leading to X₂ = 1.5 R.",
    marks: 3,
    negativeMarks: -1,
    tags: ["Explosion", "Center of Mass", "Trajectory"]
  },
  {
    id: "PHY-005",
    exam: "JEE Main",
    year: 2026,
    shift: "January 25, Shift 1",
    subject: "Physics",
    chapter: "Thermodynamics",
    topic: "Carnot Engine",
    difficulty: "Medium",
    questionType: "Assertion Reason",
    questionText: "Given below are two statements:\nStatement I: The efficiency of a Carnot engine working between temperatures T₁ (source) and T₂ (sink) can be 100% only if T₂ = 0 K.\nStatement II: Third law of thermodynamics states that absolute zero temperature (0 K) cannot be reached in a finite number of processes.\nIn light of the above statements, choose the correct answer:",
    options: [
      "Both Statement I and Statement II are true and Statement II is the correct explanation of Statement I.",
      "Both Statement I and Statement II are true but Statement II is NOT the correct explanation of Statement I.",
      "Statement I is true but Statement II is false.",
      "Statement I is false but Statement II is true."
    ],
    correctAnswer: "Both Statement I and Statement II are true but Statement II is NOT the correct explanation of Statement I.",
    explanation: "Statement I is true because efficiency η = 1 - T₂/T₁, which equals 1 only if T₂ = 0 K. Statement II is the Nernst-Simon statement of the Third Law, which is also true. However, Statement II does not explain the formula-based reasoning of Statement I.",
    marks: 4,
    negativeMarks: -1,
    tags: ["Carnot Efficiency", "Third Law", "Absolute Zero"]
  },

  // --- CHEMISTRY ---
  {
    id: "CHE-001",
    exam: "JEE Main",
    year: 2024,
    shift: "January 29, Shift 2",
    subject: "Chemistry",
    chapter: "Chemical Bonding",
    topic: "Molecular Orbital Theory",
    difficulty: "Medium",
    questionType: "Single Correct",
    questionText: "According to Molecular Orbital Theory (MOT), which of the following species is diamagnetic and has the shortest bond length?",
    options: [
      "O₂²⁻",
      "N₂",
      "O₂",
      "C₂²⁻"
    ],
    correctAnswer: "N₂",
    explanation: "N₂ has 14 electrons, electronic configuration exhibits zero unpaired electrons (diamagnetic), and has a triple bond (bond order = 3.0), which is the highest bond order and thus shortest bond length among the options.",
    marks: 4,
    negativeMarks: -1,
    tags: ["Bond Order", "Diamagnetism", "Bond Length"]
  },
  {
    id: "CHE-002",
    exam: "JEE Advanced",
    year: 2024,
    paper: "Paper 1",
    subject: "Chemistry",
    chapter: "Ionic Equilibrium",
    topic: "Buffer Solutions",
    difficulty: "Hard",
    questionType: "Numerical",
    questionText: "Calculate the pH of a solution obtained by mixing 100 mL of 0.2 M CH₃COOH with 100 mL of 0.1 M NaOH. (Given pKa of CH₃COOH = 4.74). Round off to two decimal places.",
    correctAnswer: "4.74",
    explanation: "Mixing 0.02 moles of CH₃COOH with 0.01 moles of NaOH neutralizes 0.01 moles of acid, creating 0.01 moles of sodium acetate (salt) and leaving 0.01 moles of unreacted CH₃COOH. This is an acidic buffer. pH = pKa + log([Salt]/[Acid]) = 4.74 + log(0.01/0.01) = 4.74 + 0 = 4.74.",
    marks: 4,
    negativeMarks: 0,
    tags: ["Acidic Buffer", "Neutralization", "Handerson Equation"]
  },
  {
    id: "CHE-003",
    exam: "JEE Advanced",
    year: 2025,
    paper: "Paper 2",
    subject: "Chemistry",
    chapter: "Organic Reaction Mechanism",
    topic: "Nucleophilic Substitution",
    difficulty: "Hard",
    questionType: "Multiple Correct",
    questionText: "Identify the correct statement(s) regarding the nucleophilic substitution reaction of (R)-2-bromobutane with sodium hydroxide in acetone/water solvent:",
    options: [
      "The reaction proceeds predominantly via the SN2 pathway with inversion of configuration.",
      "Doubling the concentration of sodium hydroxide doubles the rate of the reaction.",
      "Increasing the percentage of water in the solvent accelerates the rate if it shifts towards SN1.",
      "The product formed is a completely racemic mixture of butane-2-ol."
    ],
    correctAnswer: [
      "The reaction proceeds predominantly via the SN2 pathway with inversion of configuration.",
      "Doubling the concentration of sodium hydroxide doubles the rate of the reaction.",
      "Increasing the percentage of water in the solvent accelerates the rate if it shifts towards SN1."
    ],
    explanation: "Secondary alkyl halides with strong nucleophiles (OH-) in polar aprotic/mixed solvents predominantly undergo SN2 reactions, causing Walden inversion and showing second-order kinetics (rate depends on NaOH conc). If highly polar water shifts it to SN1, carbocation rate goes up.",
    marks: 4,
    negativeMarks: -2,
    tags: ["Walden Inversion", "SN2 Kinetics", "Solvent Effect"]
  },
  {
    id: "CHE-004",
    exam: "JEE Main",
    year: 2025,
    shift: "April 11, Shift 1",
    subject: "Chemistry",
    chapter: "Coordination Compounds",
    topic: "Crystal Field Theory",
    difficulty: "Medium",
    questionType: "Single Correct",
    questionText: "For the octahedral complex [CoF₆]³⁻, the crystal field stabilization energy (CFSE) and the spin-only magnetic moment are respectively (Co has atomic number 27):",
    options: [
      "-0.4 Δ₀, 4.90 BM",
      "-2.4 Δ₀ + 2P, 0 BM",
      "-0.4 Δ₀, 5.92 BM",
      "-1.8 Δ₀ + P, 1.73 BM"
    ],
    correctAnswer: "-0.4 Δ₀, 4.90 BM",
    explanation: "Co³⁺ has d⁶ configuration. F⁻ is a weak field ligand (high spin). Electron distribution in t2g and eg is t2g⁴ eg². CFSE = 4 * (-0.4 Δ₀) + 2 * (0.6 Δ₀) = -0.4 Δ₀. Number of unpaired electrons (n) = 4. Spin-only magnetic moment = √(4 * (4+2)) = √24 = 4.90 BM.",
    marks: 4,
    negativeMarks: -1,
    tags: ["High Spin Complex", "Spectrochemical Series", "Bohr Magneton"]
  },

  // --- MATHEMATICS ---
  {
    id: "MAT-001",
    exam: "JEE Main",
    year: 2024,
    shift: "April 8, Shift 1",
    subject: "Mathematics",
    chapter: "Matrices & Determinants",
    topic: "System of Linear Equations",
    difficulty: "Medium",
    questionType: "Single Correct",
    questionText: "For what values of λ and μ does the system of equations:\nx + y + z = 6\nx + 2y + 3z = 10\nx + 2y + λz = μ\nhave infinitely many solutions?",
    options: [
      "λ = 3, μ = 10",
      "λ = 3, μ ≠ 10",
      "λ ≠ 3, μ = 10",
      "λ = 2, μ = 8"
    ],
    correctAnswer: "λ = 3, μ = 10",
    explanation: "Subtracting Eq 2 from Eq 3: (λ - 3)z = μ - 10. For infinitely many solutions, the coefficient of z must be 0 and the constant on the right must be 0, yielding λ = 3 and μ = 10.",
    marks: 4,
    negativeMarks: -1,
    tags: ["Cramer Rule", "Infinite Solutions", "Linear Systems"]
  },
  {
    id: "MAT-002",
    exam: "JEE Advanced",
    year: 2023,
    paper: "Paper 1",
    subject: "Mathematics",
    chapter: "Calculus",
    topic: "Definite Integration",
    difficulty: "Hard",
    questionType: "Numerical",
    questionText: "Find the value of the integral: I = ∫ [from 0 to π] (x * sin(x)) / (1 + cos²(x)) dx. (Enter value in decimal, rounded to two decimal places, using π = 3.1416).",
    correctAnswer: "2.47",
    explanation: "Using properties of definite integrals (King's Rule): I = ∫ [from 0 to π] ((π-x) * sin(π-x)) / (1 + cos²(π-x)) dx = ∫ (π-x)*sin(x) / (1+cos²(x)) dx. Adding both: 2I = π * ∫ sin(x)/(1+cos²(x)) dx. Put cos(x) = t, 2I = π * ∫ [from -1 to 1] 1/(1+t²) dt = π * [arctan(t)] = π * (π/4 - (-π/4)) = π² / 2. Hence I = π² / 4 ≈ (3.14159)² / 4 = 2.4674 ≈ 2.47.",
    marks: 4,
    negativeMarks: 0,
    tags: ["King Rule", "Trigonometric Substitution", "Symmetry Integrals"]
  },
  {
    id: "MAT-003",
    exam: "JEE Advanced",
    year: 2025,
    paper: "Paper 2",
    subject: "Mathematics",
    chapter: "Complex Numbers",
    topic: "De Moivre Theorem",
    difficulty: "Hard",
    questionType: "Multiple Correct",
    questionText: "Let z₁ and z₂ be two complex numbers satisfying |z₁| = 1 and |z₂ - 3 - 4i| = 2. Which of the following statements are correct?",
    options: [
      "The maximum value of |z₁ - z₂| is 8.",
      "The minimum value of |z₁ - z₂| is 2.",
      "The maximum value of |z₂| is 7.",
      "The minimum value of |z₂| is 3."
    ],
    correctAnswer: [
      "The maximum value of |z₁ - z₂| is 8.",
      "The minimum value of |z₁ - z₂| is 2.",
      "The maximum value of |z₂| is 7.",
      "The minimum value of |z₂| is 3."
    ],
    explanation: "The locus of z₁ is a unit circle centered at origin. The locus of z₂ is a circle of radius 2 centered at (3, 4). The distance from origin to center of z₂'s circle is √(3²+4²) = 5. Maximum |z₂| = 5 + 2 = 7. Minimum |z₂| = 5 - 2 = 3. Max |z₁ - z₂| is along line of centers: 5 + 2 + 1 = 8. Min |z₁ - z₂| is 5 - 2 - 1 = 2. All choices are correct.",
    marks: 4,
    negativeMarks: -2,
    tags: ["Circle Locus", "Triangle Inequality", "Extremum Values"]
  },
  {
    id: "MAT-004",
    exam: "JEE Main",
    year: 2026,
    shift: "April 12, Shift 2",
    subject: "Mathematics",
    chapter: "Coordinate Geometry",
    topic: "Parabola",
    difficulty: "Medium",
    questionType: "Matrix Match",
    questionText: "Match the following equations of parabolas in Column I with their corresponding directrix equations in Column II:\n\nColumn I:\n(A) y² = 12x\n(B) x² = -8y\n(C) y² + 4x + 4 = 0\n(D) x² - 4x - 4y = 0\n\nColumn II:\n(p) y = 2\n(q) x = -3\n(r) x = 0\n(s) y = -2",
    options: [
      "A-q, B-p, C-r, D-s",
      "A-q, B-p, C-r, D-p",
      "A-r, B-s, C-q, D-p",
      "A-p, B-q, C-s, D-r"
    ],
    correctAnswer: "A-q, B-p, C-r, D-s",
    explanation: "(A) y²=12x (4a=12 => a=3), directrix x = -a => x = -3 (q).\n(B) x²=-8y (4a=8 => a=2), opening downwards, directrix y = a => y = 2 (p).\n(C) y²=-4(x+1) (4a=4 => a=1), shifted left by 1, directrix X = a => x+1 = 1 => x = 0 (r).\n(D) (x-2)² = 4(y+1) (4a=4 => a=1), shifted up/right, directrix Y = -a => y+1 = -1 => y = -2 (s).",
    marks: 4,
    negativeMarks: -1,
    tags: ["Conic Sections", "Directrix Equation", "Coordinate Shifting"]
  }
];

// Helper to retrieve active question bank (merging with localStorage custom imports)
export function getQuestionBank(): Question[] {
  try {
    const local = localStorage.getItem("testify_imported_questions");
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return [...sampleQuestions, ...parsed];
      }
    }
  } catch (e) {
    console.error("Failed to load imported questions from LocalStorage:", e);
  }
  return sampleQuestions;
}

// Import pipeline validation helper
export function validateAndImportQuestions(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return { success: false, count: 0, error: "Root element must be a JSON Array of questions." };
    }

    const validated: Question[] = [];
    const subjectsSet = new Set(["Physics", "Chemistry", "Mathematics"]);
    const examTypesSet = new Set(["JEE Main", "JEE Advanced"]);
    const diffsSet = new Set(["Easy", "Medium", "Hard"]);

    for (let i = 0; i < parsed.length; i++) {
      const q = parsed[i];
      if (!q.id || typeof q.id !== "string") {
        return { success: false, count: 0, error: `Item at index ${i} is missing a valid string 'id'.` };
      }
      if (!q.exam || !examTypesSet.has(q.exam)) {
        return { success: false, count: 0, error: `Item ID ${q.id} has invalid 'exam'. Must be 'JEE Main' or 'JEE Advanced'.` };
      }
      if (!q.subject || !subjectsSet.has(q.subject)) {
        return { success: false, count: 0, error: `Item ID ${q.id} has invalid 'subject'. Must be 'Physics', 'Chemistry', or 'Mathematics'.` };
      }
      if (typeof q.year !== "number" || q.year < 1990 || q.year > 2026) {
        return { success: false, count: 0, error: `Item ID ${q.id} has invalid 'year'. Must be a number between 1990 and 2026.` };
      }
      if (!q.chapter || typeof q.chapter !== "string") {
        return { success: false, count: 0, error: `Item ID ${q.id} has missing 'chapter'.` };
      }
      if (!q.topic || typeof q.topic !== "string") {
        return { success: false, count: 0, error: `Item ID ${q.id} has missing 'topic'.` };
      }
      if (!q.difficulty || !diffsSet.has(q.difficulty)) {
        return { success: false, count: 0, error: `Item ID ${q.id} has invalid 'difficulty'. Must be 'Easy', 'Medium', or 'Hard'.` };
      }
      if (!q.questionText || typeof q.questionText !== "string") {
        return { success: false, count: 0, error: `Item ID ${q.id} is missing 'questionText'.` };
      }
      if (!q.correctAnswer) {
        return { success: false, count: 0, error: `Item ID ${q.id} is missing 'correctAnswer'.` };
      }

      // Reconstruct clean object
      const cleanQuestion: Question = {
        id: q.id,
        exam: q.exam,
        year: q.year,
        shift: q.shift || "",
        paper: q.paper || "",
        subject: q.subject as SubjectType,
        chapter: q.chapter,
        topic: q.topic,
        difficulty: q.difficulty as "Easy" | "Medium" | "Hard",
        questionText: q.questionText,
        options: Array.isArray(q.options) ? q.options.map((o: any) => String(o)) : undefined,
        correctAnswer: Array.isArray(q.correctAnswer) 
          ? q.correctAnswer.map((a: any) => String(a)) 
          : String(q.correctAnswer),
        explanation: q.explanation || "No explanation provided.",
        marks: typeof q.marks === "number" ? q.marks : 4,
        negativeMarks: typeof q.negativeMarks === "number" ? q.negativeMarks : -1,
        tags: Array.isArray(q.tags) ? q.tags.map((t: any) => String(t)) : [],
        questionType: q.questionType || "Single Correct"
      };
      
      validated.push(cleanQuestion);
    }

    // Load existing custom, append, save
    const existingStr = localStorage.getItem("testify_imported_questions");
    let existing: Question[] = [];
    if (existingStr) {
      try { existing = JSON.parse(existingStr); } catch (e) {}
    }

    // Filter duplicates
    const existingIds = new Set(existing.map(e => e.id));
    const merged = [...existing];
    let addedCount = 0;

    validated.forEach(q => {
      if (!existingIds.has(q.id)) {
        merged.push(q);
        addedCount++;
      }
    });

    localStorage.setItem("testify_imported_questions", JSON.stringify(merged));
    return { success: true, count: addedCount };

  } catch (e: any) {
    return { success: false, count: 0, error: e.message || "Invalid JSON syntax." };
  }
}
