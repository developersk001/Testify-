import React, { useState } from "react";
import { 
  Sparkles, 
  Palette, 
  User, 
  ShoppingBag, 
  Check, 
  Flame, 
  Lock, 
  Info, 
  ShieldCheck, 
  CheckCircle,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface XpStorePageProps {
  userXP: number;
  onDeductXP: (amount: number) => boolean;
  onAddNotification: (title: string, message: string, type: "motivation" | "achievement" | "system") => void;
  activeTheme: "light" | "dark" | "blue" | "purple";
  onChangeTheme: (theme: "light" | "dark" | "blue" | "purple") => void;
  equippedAvatar: string;
  setEquippedAvatar: (avatar: string) => void;
  equippedFrame: string;
  setEquippedFrame: (frame: string) => void;
}

const STORE_AVATARS = [
  { id: "einstein", name: "Albert Einstein 🧪", cost: 300, desc: "Increase your calculation intuition with the master of relativity.", emoji: "🔬" },
  { id: "curie", name: "Marie Curie ☢️", cost: 300, desc: "Radiate focus while memorizing tricky organic reactions.", emoji: "⚗️" },
  { id: "ramanujan", name: "Ramanujan 📐", cost: 400, desc: "Solve infinite mathematical series with pure modular intuition.", emoji: "📐" }
];

const STORE_FRAMES = [
  { id: "golden", name: "Golden Fire Frame ✨", cost: 200, desc: "A prestigious golden flame ring surrounding your avatar.", emoji: "✨" },
  { id: "neon", name: "Neon Quantum ⚡", cost: 250, desc: "An electric blue animated outline symbolizing physical mechanics.", emoji: "⚡" },
  { id: "cosmic", name: "Celestial Void 🌌", cost: 300, desc: "A deep space, purple cosmic nebula swirling around.", emoji: "🌌" }
];

const STORE_THEMES = [
  { id: "blue", name: "Royal Sapphire Theme 🔵", cost: 250, desc: "Equip a rich cobalt sapphire design accent across panels.", value: "blue" },
  { id: "purple", name: "Amethyst Spark Theme 🟣", cost: 250, desc: "Apply a deep premium amethyst violet dashboard accent.", value: "purple" },
  { id: "dark", name: "Cosmic Twilight Theme 🌌", cost: 150, desc: "A comfortable, contrast-optimized dark workspace.", value: "dark" }
];

export default function XpStorePage({
  userXP,
  onDeductXP,
  onAddNotification,
  activeTheme,
  onChangeTheme,
  equippedAvatar,
  setEquippedAvatar,
  equippedFrame,
  setEquippedFrame
}: XpStorePageProps) {
  const [unlockedItems, setUnlockedItems] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("testify_unlocked_store_items");
      return saved ? JSON.parse(saved) : ["blue", "dark"]; // Seed free themes
    } catch {
      return ["blue", "dark"];
    }
  });

  const [activeTab, setActiveTab] = useState<"avatars" | "frames" | "themes">("avatars");
  const [showConfetti, setShowConfetti] = useState(false);

  const handlePurchase = (id: string, cost: number, type: "avatar" | "frame" | "theme", val?: string) => {
    const isUnlocked = unlockedItems.includes(id);
    
    if (isUnlocked) {
      // Just equip
      if (type === "avatar") {
        setEquippedAvatar(id);
        localStorage.setItem("testify_equipped_avatar", id);
      } else if (type === "frame") {
        setEquippedFrame(id);
        localStorage.setItem("testify_equipped_frame", id);
      } else if (type === "theme" && val) {
        onChangeTheme(val as any);
      }
      onAddNotification("Item Equipped", "Successfully equipped item to your JEE preparation profile card!", "system");
      return;
    }

    // Purchase flow
    if (onDeductXP(cost)) {
      const nextUnlocked = [...unlockedItems, id];
      setUnlockedItems(nextUnlocked);
      localStorage.setItem("testify_unlocked_store_items", JSON.stringify(nextUnlocked));
      
      if (type === "avatar") {
        setEquippedAvatar(id);
        localStorage.setItem("testify_equipped_avatar", id);
      } else if (type === "frame") {
        setEquippedFrame(id);
        localStorage.setItem("testify_equipped_frame", id);
      } else if (type === "theme" && val) {
        onChangeTheme(val as any);
      }

      // Explosion feedback
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);

      onAddNotification("Purchase Successful! 🎁", `You have unlocked and equipped the custom ${type}!`, "achievement");
    } else {
      onAddNotification("Insufficient XP", "Resolve more daily challenges or mock tests to gather enough XP balance!", "system");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 select-text text-left relative">
      
      {/* 2D Particle Explosion simulator overlay */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/20 backdrop-blur-xs z-50 pointer-events-none flex items-center justify-center"
          >
            <div className="text-center space-y-2.5">
              <span className="text-7xl animate-bounce block">✨🎉🎊✨</span>
              <h2 className="text-xl font-black text-white drop-shadow-md">XP Purchase Successful!</h2>
              <p className="text-xs text-zinc-200 drop-shadow-sm font-medium">Your profile layout has been updated with premium animations!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5 text-left">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest font-mono">Section 5 • Premium XP Shop</span>
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">Testify Premium XP Store</h3>
            <p className="text-[11px] text-zinc-500 leading-normal max-w-md font-medium">
              Spend your gathered mock exam score XP to unlock exclusive historical avatars, decorative custom frames, and immersive application themes.
            </p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/10 px-5 py-3 rounded-2xl text-left shrink-0">
            <span className="text-[9px] text-zinc-400 font-bold block uppercase tracking-wider mb-0.5">Your Current Balance</span>
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-5 h-5 fill-current" />
              <span className="font-mono font-black text-lg leading-none">{userXP} XP</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-zinc-100 dark:border-zinc-850 mt-6 gap-2">
          <button
            onClick={() => setActiveTab("avatars")}
            className={`pb-2.5 px-4 font-bold text-xs transition-all relative cursor-pointer ${activeTab === "avatars" ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 hover:text-zinc-600"}`}
          >
            Premium Avatars
            {activeTab === "avatars" && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600" />}
          </button>
          <button
            onClick={() => setActiveTab("frames")}
            className={`pb-2.5 px-4 font-bold text-xs transition-all relative cursor-pointer ${activeTab === "frames" ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 hover:text-zinc-600"}`}
          >
            Avatar Frames
            {activeTab === "frames" && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600" />}
          </button>
          <button
            onClick={() => setActiveTab("themes")}
            className={`pb-2.5 px-4 font-bold text-xs transition-all relative cursor-pointer ${activeTab === "themes" ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 hover:text-zinc-600"}`}
          >
            Custom Themes
            {activeTab === "themes" && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600" />}
          </button>
        </div>
      </div>

      {/* CORE CAROUSEL ITEM DISPLAY */}
      <AnimatePresence mode="wait">
        
        {/* TAB: AVATARS */}
        {activeTab === "avatars" && (
          <motion.div
            key="avatars"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {STORE_AVATARS.map(item => {
              const isUnlocked = unlockedItems.includes(item.id);
              const isEquipped = equippedAvatar === item.id;
              const canAfford = userXP >= item.cost;
              return (
                <div 
                  key={item.id}
                  className="p-5 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/10 to-orange-500/10 border border-orange-500/10 flex items-center justify-center text-2xl">
                        {item.emoji}
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded-lg">{item.cost} XP</span>
                    </div>

                    <h4 className="font-extrabold text-xs text-zinc-950 dark:text-white">{item.name}</h4>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">{item.desc}</p>
                  </div>

                  <button
                    onClick={() => handlePurchase(item.id, item.cost, "avatar")}
                    className={`mt-5 py-2.5 w-full rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
                      isEquipped 
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" 
                        : isUnlocked 
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200" 
                          : canAfford 
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" 
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                    }`}
                  >
                    {isEquipped ? "Selected Avatar" : isUnlocked ? "Equip Avatar" : `Unlock Avatar for ${item.cost} XP`}
                  </button>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* TAB: FRAMES */}
        {activeTab === "frames" && (
          <motion.div
            key="frames"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {STORE_FRAMES.map(item => {
              const isUnlocked = unlockedItems.includes(item.id);
              const isEquipped = equippedFrame === item.id;
              const canAfford = userXP >= item.cost;
              return (
                <div 
                  key={item.id}
                  className="p-5 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border border-purple-500/10 flex items-center justify-center text-2xl">
                        {item.emoji}
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded-lg">{item.cost} XP</span>
                    </div>

                    <h4 className="font-extrabold text-xs text-zinc-950 dark:text-white">{item.name}</h4>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">{item.desc}</p>
                  </div>

                  <button
                    onClick={() => handlePurchase(item.id, item.cost, "frame")}
                    className={`mt-5 py-2.5 w-full rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
                      isEquipped 
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" 
                        : isUnlocked 
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200" 
                          : canAfford 
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" 
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                    }`}
                  >
                    {isEquipped ? "Selected Frame" : isUnlocked ? "Equip Frame" : `Unlock Frame for ${item.cost} XP`}
                  </button>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* TAB: THEMES */}
        {activeTab === "themes" && (
          <motion.div
            key="themes"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {STORE_THEMES.map(item => {
              const isUnlocked = unlockedItems.includes(item.id);
              const isEquipped = activeTheme === item.value;
              const canAfford = userXP >= item.cost;
              return (
                <div 
                  key={item.id}
                  className="p-5 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 border border-teal-500/10 flex items-center justify-center text-xl">
                        🎨
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded-lg">{item.cost} XP</span>
                    </div>

                    <h4 className="font-extrabold text-xs text-zinc-950 dark:text-white">{item.name}</h4>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">{item.desc}</p>
                  </div>

                  <button
                    onClick={() => handlePurchase(item.id, item.cost, "theme", item.value)}
                    className={`mt-5 py-2.5 w-full rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
                      isEquipped 
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" 
                        : isUnlocked 
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200" 
                          : canAfford 
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" 
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                    }`}
                  >
                    {isEquipped ? "Active Theme" : isUnlocked ? "Apply Theme" : `Unlock Theme for ${item.cost} XP`}
                  </button>
                </div>
              );
            })}
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
