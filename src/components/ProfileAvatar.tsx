import React from "react";

interface ProfileAvatarProps {
  avatar: string;
  frame: string;
  size?: "sm" | "md" | "lg";
}

export default function ProfileAvatar({ 
  avatar, 
  frame, 
  size = "md" 
}: ProfileAvatarProps) {
  const sizeClasses = {
    sm: {
      container: "w-9 h-9",
      emoji: "text-lg",
      defaultSvg: "w-8 h-8",
    },
    md: {
      container: "w-12 h-12",
      emoji: "text-2xl",
      defaultSvg: "w-10 h-10",
    },
    lg: {
      container: "w-16 h-16",
      emoji: "text-4xl",
      defaultSvg: "w-14 h-14",
    }
  }[size];

  const getAvatarContent = () => {
    switch (avatar) {
      case "einstein":
        return <span className={sizeClasses.emoji} role="img" aria-label="Albert Einstein">🔬</span>;
      case "curie":
        return <span className={sizeClasses.emoji} role="img" aria-label="Marie Curie">⚗️</span>;
      case "ramanujan":
        return <span className={sizeClasses.emoji} role="img" aria-label="Ramanujan">📐</span>;
      default:
        return (
          <svg className={`${sizeClasses.defaultSvg} text-blue-600 dark:text-blue-400 absolute bottom-0`} viewBox="0 0 64 64" fill="currentColor">
            <circle cx="32" cy="24" r="14" fill="#FDBA74" />
            <path d="M18 64c0-8.5 7.5-14 14-14s14 5.5 14 14H18z" fill="#3B82F6" />
            <path d="M32 6c-8 0-14 5-14 12 0 4 3 6 3 6s2-5 5-5c4 0 3 3 6 3s2-3 6-3c3 0 5 5 5 5s3-2 3-6c0-7-6-12-14-12z" fill="#1E293B" />
          </svg>
        );
    }
  };

  const getFrameClasses = () => {
    switch (frame) {
      case "golden":
        return "border-amber-400 ring-2 ring-amber-400/30 shadow-[0_0_12px_rgba(245,158,11,0.6)] bg-amber-50 dark:bg-amber-950/20 animate-pulse";
      case "neon":
        return "border-blue-400 ring-2 ring-blue-400/30 shadow-[0_0_12px_rgba(96,165,250,0.6)] bg-blue-50 dark:bg-blue-950/20";
      case "cosmic":
        return "border-purple-400 ring-2 ring-purple-400/30 shadow-[0_0_15px_rgba(167,139,250,0.6)] bg-purple-50 dark:bg-purple-950/20";
      default:
        return "border-zinc-200 dark:border-zinc-800 bg-blue-50/50 dark:bg-blue-950/20";
    }
  };

  return (
    <div className={`relative ${sizeClasses.container} rounded-full overflow-hidden flex items-center justify-center border-2 ${getFrameClasses()} transition-all duration-300 shrink-0`}>
      {getAvatarContent()}
    </div>
  );
}
