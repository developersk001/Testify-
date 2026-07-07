import React, { useState, useEffect } from "react";
import { 
  Heart, 
  Droplet, 
  Sparkles, 
  Award, 
  Trophy, 
  Flame, 
  ShoppingBag,
  Info,
  Compass,
  ArrowRight,
  Smile,
  Shield,
  Palette
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CompanionTreePageProps {
  onAddNotification: (title: string, message: string, type: "motivation" | "achievement" | "system") => void;
  userXP: number;
  onDeductXP: (amount: number) => boolean;
}

const COMPANIONS = [
  { id: "robot", name: "Alpha Robot 🤖", emoji: "🤖", desc: "A logical machine designed to analyze physics & math formulas with sub-second precision." },
  { id: "owl", name: "Athena Owl 🦉", emoji: "🦉", desc: "A wise, nocturnal mentor specializing in chemical reactions and organic synthesis mechanics." },
  { id: "fox", name: "Foxy Catalyst 🦊", emoji: "🦊", desc: "An energetic guide focused on maximizing focus and breaking down tricky multiple correct questions." },
  { id: "astronaut", name: "Cosmo Pilot 👨‍🚀", emoji: "👨‍🚀", desc: "A space explorer pushing the limits of your JEE preparation to reach cosmic ranks." }
];

const STAGE_DETAILS = [
  { stage: "Seed 🌱", reqWater: 20, desc: "A tiny seed full of chemical and calculus potential.", color: "text-amber-600 bg-amber-50" },
  { stage: "Small Plant 🌿", reqWater: 50, desc: "Sprouting leaves reaching out for electromagnetism and math.", color: "text-emerald-500 bg-emerald-50" },
  { stage: "Healthy Tree 🌳", reqWater: 100, desc: "Strong trunk weathering any difficult mock test.", color: "text-teal-600 bg-teal-50" },
  { stage: "Blooming Tree 🌺", reqWater: 200, desc: "Adorned with bright flowers representing organic milestones.", color: "text-rose-500 bg-rose-50" },
  { stage: "Legendary Tree 🌸", reqWater: 9999, desc: "Fully evolved celestial structure covered in custom cherry blossoms and butterfly lights.", color: "text-purple-600 bg-purple-50" }
];

export default function CompanionTreePage({
  onAddNotification,
  userXP,
  onDeductXP
}: CompanionTreePageProps) {
  // Companion States
  const [selectedComp, setSelectedComp] = useState<string>(() => {
    return localStorage.getItem("testify_selected_companion") || "robot";
  });
  const [compLevel, setCompLevel] = useState<number>(() => {
    return Number(localStorage.getItem("testify_companion_level")) || 1;
  });
  const [compXP, setCompXP] = useState<number>(() => {
    return Number(localStorage.getItem("testify_companion_xp")) || 0;
  });
  const [compExpression, setCompExpression] = useState<"happy" | "studying" | "sleeping" | "celebrating">("happy");
  const [activeAccessory, setActiveAccessory] = useState<string>(() => {
    return localStorage.getItem("testify_companion_accessory") || "none";
  });

  // Tree States
  const [treeStageIndex, setTreeStageIndex] = useState<number>(() => {
    return Number(localStorage.getItem("testify_tree_stage_idx")) || 0;
  });
  const [waterAmount, setWaterAmount] = useState<number>(() => {
    return Number(localStorage.getItem("testify_tree_water")) || 0;
  });
  const [unlockedDecorations, setUnlockedDecorations] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("testify_tree_decorations");
      return saved ? JSON.parse(saved) : ["Soil Booster"];
    } catch {
      return ["Soil Booster"];
    }
  });

  // Watering animation state
  const [isWatering, setIsWatering] = useState(false);
  const [showGrowthCelebrate, setShowGrowthCelebrate] = useState(false);

  // Companion Motivation Quotes based on selected ID
  const currentComp = COMPANIONS.find(c => c.id === selectedComp) || COMPANIONS[0];

  const getCompanionDialogue = () => {
    if (compExpression === "studying") {
      return "Analyzing molecular vectors... Try working on a 15-minute Inorganic chemistry quiz now!";
    }
    if (compExpression === "sleeping") {
      return "Zzz... Recharge complete. Ready to blast through JEE Mechanics and calculus mock tests?";
    }
    if (compExpression === "celebrating") {
      return "Brilliant score! Your calculations are hyper-precise. Let's aim for 100% accuracy!";
    }
    switch (selectedComp) {
      case "owl":
        return "Greetings, Scholar! Inorganic chemistry is 90% structured recollection. Let's study Smart today.";
      case "fox":
        return "Hey! Speed is crucial for JEE Main, but negative marks are your worst enemy. Let's practice smart!";
      case "astronaut":
        return "Orbit locked onto IIT Bombay! Ready to fire physical chemistry rockets?";
      default:
        return "Beep boop! Systems active. Level 1 algorithm ready. Solved 0 mistakes in the Mistake Book today.";
    }
  };

  const handleCompanionChange = (id: string) => {
    setSelectedComp(id);
    localStorage.setItem("testify_selected_companion", id);
    onAddNotification("Companion Selected", `You are now accompanied by ${COMPANIONS.find(c => c.id === id)?.name}!`, "system");
  };

  const handleWaterTree = () => {
    if (isWatering) return;
    setIsWatering(true);

    // Play watering animation
    setTimeout(() => {
      setIsWatering(false);
      const nextWater = waterAmount + 10;
      setWaterAmount(nextWater);
      localStorage.setItem("testify_tree_water", String(nextWater));

      // Check for Growth Level up
      const currentLimit = STAGE_DETAILS[treeStageIndex].reqWater;
      if (nextWater >= currentLimit && treeStageIndex < STAGE_DETAILS.length - 1) {
        const nextStageIdx = treeStageIndex + 1;
        setTreeStageIndex(nextStageIdx);
        localStorage.setItem("testify_tree_stage_idx", String(nextStageIdx));
        setWaterAmount(0);
        localStorage.setItem("testify_tree_water", "0");
        setShowGrowthCelebrate(true);
        onAddNotification("Tree Evolved! 🌱", `Your study tree has grown into a ${STAGE_DETAILS[nextStageIdx].stage}! Keep studying to water it further.`, "achievement");
      }

      // Companion gains XP when tree is watered
      const nextCompXP = compXP + 15;
      if (nextCompXP >= 100) {
        setCompLevel(prev => {
          const nextLvl = prev + 1;
          localStorage.setItem("testify_companion_level", String(nextLvl));
          return nextLvl;
        });
        setCompXP(0);
        localStorage.setItem("testify_companion_xp", "0");
        setCompExpression("celebrating");
        onAddNotification("Companion Level Up! 🌟", `Your companion has leveled up! New accessories might be unlocked in the XP Shop.`, "achievement");
        setTimeout(() => setCompExpression("happy"), 4000);
      } else {
        setCompXP(nextCompXP);
        localStorage.setItem("testify_companion_xp", String(nextCompXP));
      }
    }, 1200);
  };

  const currentStage = STAGE_DETAILS[treeStageIndex];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 select-text text-left">
      
      {/* Upper Grid: Tree on Left, Companion on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* VIRTUAL STUDY TREE CARD */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-mono">Section 6 • Interactive Tree</span>
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">Virtual Study Companion Tree</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-3 py-1 rounded-xl">
                <Droplet className="w-3.5 h-3.5 fill-current" />
                <span>Water: {waterAmount}L</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed max-w-md">
              Every completed study session and solved question gives water. Missing multiple days causes leaves to shrink. Keep it hydrated to evolve your tree!
            </p>

            {/* Tree Stage Banner */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-150/60 dark:border-zinc-850/60">
              <div className="text-left">
                <span className="text-[9px] font-bold text-zinc-400 uppercase block leading-none mb-1">Current Evolutionary Phase</span>
                <span className="font-extrabold text-sm text-zinc-900 dark:text-white">{currentStage.stage}</span>
              </div>
              <p className="text-[10px] text-zinc-400 max-w-[200px] text-right font-medium leading-normal">{currentStage.desc}</p>
            </div>
          </div>

          {/* Core Visual Tree Box */}
          <div className="my-8 py-4 flex flex-col items-center justify-center relative min-h-[220px]">
            {/* Tree visual stage rendering */}
            <AnimatePresence mode="wait">
              <motion.div
                key={treeStageIndex}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                className="relative select-none text-center"
              >
                {/* Simulated 2D Tree Renderings */}
                {treeStageIndex === 0 && (
                  <div className="relative">
                    <span className="text-7xl block animate-bounce">🌱</span>
                    <div className="w-16 h-2 bg-amber-600/20 rounded-full mx-auto mt-2 blur-[1px]" />
                  </div>
                )}
                {treeStageIndex === 1 && (
                  <div className="relative">
                    <span className="text-8xl block">🌿</span>
                    <div className="w-20 h-2 bg-emerald-600/25 rounded-full mx-auto mt-2 blur-[1px]" />
                  </div>
                )}
                {treeStageIndex === 2 && (
                  <div className="relative">
                    <span className="text-8xl block">🌳</span>
                    <div className="w-24 h-2.5 bg-zinc-600/30 rounded-full mx-auto mt-2 blur-[1px]" />
                  </div>
                )}
                {treeStageIndex === 3 && (
                  <div className="relative">
                    <span className="text-8xl block">🌺</span>
                    <div className="w-24 h-2.5 bg-zinc-600/30 rounded-full mx-auto mt-2 blur-[1px]" />
                  </div>
                )}
                {treeStageIndex === 4 && (
                  <div className="relative">
                    <span className="text-9xl block relative">
                      🌸
                      <span className="absolute top-2 right-1.5 text-lg animate-pulse">🦋</span>
                      <span className="absolute bottom-4 -left-2 text-xl">🌺</span>
                    </span>
                    <div className="w-28 h-3 bg-indigo-600/20 rounded-full mx-auto mt-2 blur-[1px]" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Watering pouring effect overlay */}
            <AnimatePresence>
              {isWatering && (
                <motion.div 
                  initial={{ opacity: 0, y: -25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 25 }}
                  className="absolute inset-x-0 top-6 flex flex-col items-center justify-center pointer-events-none"
                >
                  <div className="text-3xl animate-bounce">💧</div>
                  <div className="text-[10px] font-extrabold text-blue-500 uppercase tracking-widest mt-1">Pouring Water...</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Evolutions Celebrate Modal */}
            <AnimatePresence>
              {showGrowthCelebrate && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 bg-white/95 dark:bg-zinc-950/95 flex flex-col items-center justify-center text-center p-4 z-20 rounded-2xl"
                >
                  <span className="text-5xl animate-spin mb-3">✨</span>
                  <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">Tree Evolutionary Leap!</h4>
                  <p className="text-[10px] text-zinc-500 max-w-xs mt-1 leading-normal">
                    Outstanding consistency! Your virtual companion tree has grown into the next evolutionary phase. Keep study sessions long to unlock flowers and lights.
                  </p>
                  <button
                    onClick={() => setShowGrowthCelebrate(false)}
                    className="mt-4 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-xl cursor-pointer"
                  >
                    Fantastic, Continue!
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Row */}
          <div className="space-y-3.5 border-t border-zinc-100 dark:border-zinc-850 pt-4.5">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-300">
              <span>Next Evolutionary Stage</span>
              <span className="font-mono text-zinc-400">{waterAmount}/{currentStage.reqWater} L</span>
            </div>
            
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (waterAmount / currentStage.reqWater) * 100)}%` }}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleWaterTree}
                disabled={isWatering}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm shadow-emerald-500/10"
              >
                <Droplet className="w-4 h-4 fill-current" />
                <span>Water Study Tree (+15 Comp XP)</span>
              </button>
            </div>
          </div>
        </div>

        {/* PERSONAL STUDY COMPANION CARD */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 pointer-events-none rounded-full blur-2xl" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest font-mono">Section 14 • Personal Companion</span>
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">Personal Study Companion</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-xl">
                <Award className="w-3.5 h-3.5" />
                <span>Level {compLevel}</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed max-w-md">
              Select an intelligent partner that levels up as you clear doubts, review mistakes, and score ranks. Keep them active by completing challenges!
            </p>

            {/* Expression controller selector */}
            <div className="grid grid-cols-4 gap-1.5 bg-zinc-50 dark:bg-zinc-950/50 p-1 rounded-xl border border-zinc-150/60 dark:border-zinc-850/60">
              <button 
                onClick={() => setCompExpression("happy")}
                className={`py-1 rounded-lg text-[10px] font-extrabold transition-all ${compExpression === "happy" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs" : "text-zinc-400 hover:text-zinc-600"}`}
              >
                Happy
              </button>
              <button 
                onClick={() => setCompExpression("studying")}
                className={`py-1 rounded-lg text-[10px] font-extrabold transition-all ${compExpression === "studying" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs" : "text-zinc-400 hover:text-zinc-600"}`}
              >
                Studying
              </button>
              <button 
                onClick={() => setCompExpression("sleeping")}
                className={`py-1 rounded-lg text-[10px] font-extrabold transition-all ${compExpression === "sleeping" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs" : "text-zinc-400 hover:text-zinc-600"}`}
              >
                Sleeping
              </button>
              <button 
                onClick={() => setCompExpression("celebrating")}
                className={`py-1 rounded-lg text-[10px] font-extrabold transition-all ${compExpression === "celebrating" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs" : "text-zinc-400 hover:text-zinc-600"}`}
              >
                Celebrate
              </button>
            </div>
          </div>

          {/* Companion Big Avatar & Dialogue bubble */}
          <div className="my-6 flex items-center justify-center gap-5 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950/20">
            {/* Avatar Frame */}
            <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 border border-blue-500/10 flex items-center justify-center shrink-0">
              <span className="text-6xl animate-bounce">{currentComp.emoji}</span>
              
              {/* Optional Accessory indicator badge */}
              {activeAccessory !== "none" && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
                  {activeAccessory} Equipped
                </span>
              )}
            </div>

            {/* Smart dialogue box */}
            <div className="flex-1 min-w-0 bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-150/60 dark:border-zinc-850 relative">
              <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-zinc-900 border-l border-b border-zinc-150 dark:border-zinc-850 rotate-45 hidden sm:block" />
              <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-0.5 font-mono">{currentComp.name}</span>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium italic leading-relaxed">
                "{getCompanionDialogue()}"
              </p>
            </div>
          </div>

          {/* Level Progress */}
          <div className="space-y-3.5 border-t border-zinc-100 dark:border-zinc-850 pt-4.5">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-300">
              <span>Companion Level Progress</span>
              <span className="font-mono text-zinc-400">{compXP}/100 XP</span>
            </div>
            
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${compXP}%` }}
              />
            </div>

            {/* Carousel List selection */}
            <div className="grid grid-cols-4 gap-2">
              {COMPANIONS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleCompanionChange(item.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedComp === item.id 
                      ? "border-blue-600 bg-blue-50/10 dark:bg-blue-950/20 shadow-xs" 
                      : "border-zinc-150 dark:border-zinc-850 bg-white dark:bg-zinc-900 hover:bg-zinc-50"
                  }`}
                >
                  <span className="text-2xl block mb-1">{item.emoji}</span>
                  <span className="text-[9px] font-extrabold text-zinc-500 block truncate">{item.id.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* LOWER ACCESSORIES SHOP INTEGRATED VIEW */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-4 mb-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest font-mono">Unlock Accessory items</span>
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">Companion Accessories Shop</h3>
          </div>
          <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-3 py-1 rounded-xl text-xs font-bold">
            <Sparkles className="w-4 h-4 fill-current" />
            <span>XP Balance: {userXP} XP</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Laser Goggles 🕶️", cost: 150, id: "goggles", desc: "Equip laser lens onto your companion to analyze equations faster.", emoji: "🕶️" },
            { name: "Studious Crown 👑", cost: 350, id: "crown", desc: "A prestigious royal dynamic crown for high-level study sessions.", emoji: "👑" },
            { name: "Wizard Hat 🎩", cost: 200, id: "hat", desc: "A custom purple wizard cap dedicated to inorganic chemical wizards.", emoji: "🎩" }
          ].map(item => {
            const isEquipped = activeAccessory === item.id;
            const canAfford = userXP >= item.cost;
            return (
              <div 
                key={item.id}
                className="p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950/20 flex flex-col justify-between"
              >
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10">{item.cost} XP</span>
                  </div>
                  <h4 className="font-extrabold text-xs text-zinc-950 dark:text-white">{item.name}</h4>
                  <p className="text-[10px] text-zinc-400 leading-normal">{item.desc}</p>
                </div>

                <button
                  onClick={() => {
                    if (isEquipped) {
                      setActiveAccessory("none");
                      localStorage.setItem("testify_companion_accessory", "none");
                    } else {
                      if (onDeductXP(item.cost)) {
                        setActiveAccessory(item.id);
                        localStorage.setItem("testify_companion_accessory", item.id);
                        onAddNotification("Accessory Equipped! 👑", `You successfully unlocked and equipped ${item.name}!`, "achievement");
                      } else {
                        onAddNotification("Insufficient XP", "Solve more mock test papers to earn enough XP for companion items!", "system");
                      }
                    }
                  }}
                  className={`mt-4 py-2 w-full rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
                    isEquipped 
                      ? "bg-rose-500 hover:bg-rose-600 text-white shadow-sm" 
                      : canAfford 
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" 
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                  }`}
                >
                  {isEquipped ? "Remove Item" : canAfford ? `Unlock & Equip for ${item.cost} XP` : `Need ${item.cost - userXP} More XP`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
