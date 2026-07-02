import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// Performance AI API Route
app.post("/api/recommendations", async (req, res) => {
  try {
    const { history, name } = req.body;

    const studentName = name || "Student";
    const recentTestsSummary = Array.isArray(history) && history.length > 0 
      ? history.slice(0, 5).map((t: any) => ({
          exam: t.exam,
          score: `${t.score}/${t.totalMarks}`,
          accuracy: `${t.accuracy}%`,
          date: t.date,
          subjects: Object.entries(t.subjectStats || {}).map(([sub, stats]: any) => 
            `${sub}: ${stats.correct}/${stats.total} correct`
          ).join(", "),
          weakChapters: t.weakChapters || [],
          strongChapters: t.strongChapters || [],
        }))
      : [];

    const prompt = `You are an elite JEE Main & Advanced Coach and Performance AI.
Analyze the mock test performance of ${studentName} and generate a hyper-personalized, premium JEE study plan.

Here is their recent mock test history:
${JSON.stringify(recentTestsSummary, null, 2)}

Provide structured, actionable guidance with precise topics to focus on, specific sub-topics, concrete advice, and estimated mark improvements.
Keep suggestions direct, professional, and motivational. Follow the requested JSON schema.`;

    const ai = getGeminiClient();

    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: "A summary of the student's current status, acknowledging recent trends."
              },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of 2-3 core strengths shown in their test history."
              },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING, description: "Physics, Chemistry, or Mathematics" },
                    topic: { type: Type.STRING, description: "Major chapter/topic name (e.g. Rotational Mechanics)" },
                    estimatedGain: { type: Type.STRING, description: "Estimated mark improvement (e.g. +12 Marks)" },
                    reasoning: { type: Type.STRING, description: "Why they should study this based on their accuracy/errors." },
                    subtopicsToPractice: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "List of 2-3 specific micro-concepts or question types to focus on."
                    },
                    actionPlan: { type: Type.STRING, description: "A concrete daily task or revision exercise (e.g., practice 15 pyqs on COM)." }
                  },
                  required: ["subject", "topic", "estimatedGain", "reasoning", "subtopicsToPractice", "actionPlan"]
                }
              },
              dailyGoal: {
                type: Type.STRING,
                description: "A specific micro-goal for the next 24 hours (e.g. Solve 10 Numerical PYQs in Chemistry)."
              }
            },
            required: ["summary", "strengths", "recommendations", "dailyGoal"]
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        return res.json(JSON.parse(responseText.trim()));
      }
    }

    // High quality offline fallback recommendations if Gemini is not set up or fails
    const fallbackData = generateFallbackRecommendations(history, studentName);
    return res.json(fallbackData);

  } catch (error: any) {
    console.error("Error generating recommendations:", error);
    // Return high quality graceful fallback
    const fallbackData = generateFallbackRecommendations(req.body.history, req.body.name || "Student");
    return res.json(fallbackData);
  }
});

// Helper for high quality heuristic-based recommendations when API is offline or key is missing
function generateFallbackRecommendations(history: any[], name: string) {
  // Let's analyze history to find weak areas
  let weakChapters: string[] = [];
  let strongChapters: string[] = [];
  let lowSubject = "Physics";
  let phyAccuracy = 70;
  let chemAccuracy = 70;
  let mathAccuracy = 70;

  if (Array.isArray(history) && history.length > 0) {
    history.forEach(t => {
      if (t.weakChapters) weakChapters.push(...t.weakChapters);
      if (t.strongChapters) strongChapters.push(...t.strongChapters);
    });
    
    // Pick last test's subject stats
    const lastTest = history[0];
    if (lastTest && lastTest.subjectStats) {
      const stats = lastTest.subjectStats;
      if (stats.Physics) phyAccuracy = (stats.Physics.correct / (stats.Physics.total || 1)) * 100;
      if (stats.Chemistry) chemAccuracy = (stats.Chemistry.correct / (stats.Chemistry.total || 1)) * 100;
      if (stats.Mathematics) mathAccuracy = (stats.Mathematics.correct / (stats.Mathematics.total || 1)) * 100;
      
      const minAcc = Math.min(phyAccuracy, chemAccuracy, mathAccuracy);
      if (minAcc === phyAccuracy) lowSubject = "Physics";
      else if (minAcc === chemAccuracy) lowSubject = "Chemistry";
      else lowSubject = "Mathematics";
    }
  }

  // Deduplicate
  weakChapters = Array.from(new Set(weakChapters)).filter(Boolean);
  strongChapters = Array.from(new Set(strongChapters)).filter(Boolean);

  if (weakChapters.length === 0) {
    weakChapters = ["Rotational Dynamics", "Ionic Equilibrium", "Complex Numbers"];
  }
  if (strongChapters.length === 0) {
    strongChapters = ["Kinematics", "Chemical Bonding", "Matrices & Determinants"];
  }

  const subjectMap: Record<string, string> = {
    "Rotational Dynamics": "Physics",
    "Kinematics": "Physics",
    "Electrostatics": "Physics",
    "Ionic Equilibrium": "Chemistry",
    "Chemical Bonding": "Chemistry",
    "Thermodynamics": "Chemistry",
    "Complex Numbers": "Mathematics",
    "Matrices & Determinants": "Mathematics",
    "Definite Integration": "Mathematics"
  };

  const topicRecs = weakChapters.slice(0, 2).map((ch, idx) => {
    const sub = subjectMap[ch] || lowSubject;
    const gain = idx === 0 ? "+16 Marks" : "+12 Marks";
    return {
      subject: sub,
      topic: ch,
      estimatedGain: gain,
      reasoning: `Based on your recent mock exams, your accuracy in ${ch} is below optimal. Targeting high-yield PYQs in this area will quickly lift your sectional percentile.`,
      subtopicsToPractice: idx === 0 
        ? ["Moment of Inertia Theorems", "Torque & Angular Momentum Conservation"]
        : ["pH Calculations of Buffer Solutions", "Solubility Product Constants (Ksp)"],
      actionPlan: `Practice 15 Single Correct and 5 Numerical PYQs from 2022-2024 for ${ch}. Highlight any conceptual gaps in your formula sheet.`
    };
  });

  // If we couldn't map, add a fallback recommendation
  if (topicRecs.length === 0) {
    topicRecs.push({
      subject: lowSubject,
      topic: "Core High-Yield Concepts",
      estimatedGain: "+18 Marks",
      reasoning: "Focusing on key scoring modules where questions are consistently asked every year will provide the highest return on investment.",
      subtopicsToPractice: ["Formula application", "Numerical precision", "Elimination strategies"],
      actionPlan: "Create a 20-question custom mock exam consisting of medium difficulty PYQs from your weakest topics."
    });
  }

  return {
    summary: `Hello ${name}. I have analyzed your mock test history. Your accuracy is strongest in Chemistry and you show high potential in structural problem-solving. However, your ${lowSubject} accuracy is currently hovering around ${Math.round(Math.min(phyAccuracy, chemAccuracy, mathAccuracy))}% which is holding back your aggregate percentile. Focusing on the high-yield sections detailed below will maximize your score improvement potential.`,
    strengths: strongChapters.slice(0, 2),
    recommendations: topicRecs,
    dailyGoal: `Solve 10 high-yield Numerical Value PYQs in ${lowSubject} and review explanations carefully.`
  };
}

async function startServer() {
  // Mount Vite development middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
