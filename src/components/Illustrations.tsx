import React from "react";

export function TrophyIllustration({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="50" fill="url(#glowGrad)" />
      {/* Trophy Base */}
      <path d="M40 95h40v6H40z" fill="#9CA3AF" rx="2" />
      <path d="M48 85h24v10H48z" fill="#4B5563" />
      <path d="M56 70h8v15h-8z" fill="#D97706" />
      {/* Trophy Bowl */}
      <path d="M30 30c0 24 12 40 30 40s30-16 30-40H30z" fill="url(#goldGrad)" />
      {/* Handles */}
      <path d="M30 38H22c-4 0-4 12 0 12h8M90 38h8c4 0 4 12 0 12h-8" stroke="#D97706" strokeWidth="4" strokeLinecap="round" />
      {/* Star detailing */}
      <path d="M60 40l3 6 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1 3-6z" fill="#FFF" opacity="0.9" />
    </svg>
  );
}

export function BrainIllustration({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#0891B2" />
        </linearGradient>
      </defs>
      {/* Left hemisphere (Analytical/Purple) */}
      <path d="M56 25C40 25 30 35 30 50c0 10 5 18 12 22-2 4-2 10 2 14s12 4 16-2c4 4 12 4 16 0" fill="url(#purpleGrad)" opacity="0.85" />
      {/* Right hemisphere (Creative/Cyan) */}
      <path d="M64 25C80 25 90 35 90 50c0 10-5 18-12 22 2 4 2 10-2 14s-12 4-16-2c-4 4-12 4-16 0" fill="url(#cyanGrad)" opacity="0.85" />
      {/* Central connection */}
      <path d="M57 35h6v45h-6z" fill="#FFF" opacity="0.5" />
      {/* Circuits */}
      <circle cx="45" cy="40" r="3" fill="#FFF" />
      <circle cx="75" cy="45" r="3" fill="#FFF" />
      <circle cx="38" cy="60" r="2.5" fill="#FFF" />
      <circle cx="82" cy="62" r="2.5" fill="#FFF" />
      <path d="M45 40l-5 5h-5M75 45l8 4v8" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function RocketIllustration({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="fireGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Jet Flame */}
      <path d="M54 85c-2 12 6 25 6 25s8-13 6-25h-12z" fill="url(#fireGrad)" />
      {/* Rocket Body */}
      <path d="M60 15c-12 18-12 45-12 65h24c0-20 0-47-12-65z" fill="url(#rocketGrad)" />
      <path d="M48 80h24v4H48z" fill="#EF4444" />
      {/* Fin Left */}
      <path d="M48 65c-10 10-14 20-14 20h14V65z" fill="#1E40AF" />
      {/* Fin Right */}
      <path d="M72 65c10 10 14 20 14 20H72V65z" fill="#1E40AF" />
      {/* Window */}
      <circle cx="60" cy="45" r="7" fill="#EBF5FF" stroke="#1D4ED8" strokeWidth="2.5" />
      {/* Glass Gleam */}
      <path d="M56 42a5 5 0 016 0" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function TargetIllustration({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#FEE2E2" />
      <circle cx="60" cy="60" r="40" fill="#FFF" />
      <circle cx="60" cy="60" r="30" fill="#FCA5A5" />
      <circle cx="60" cy="60" r="20" fill="#FFF" />
      <circle cx="60" cy="60" r="10" fill="#EF4444" />
      {/* Arrow */}
      <path d="M95 25L65 55" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
      <path d="M65 55l-2-6 8 8-6-2z" fill="#3B82F6" />
      {/* Arrow feathers */}
      <path d="M92 28l5-2-2 5M89 31l5-2-2 5" stroke="#3B82F6" strokeWidth="2" />
    </svg>
  );
}

export function AnalyticsIllustration({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="20" width="80" height="80" rx="12" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="2" />
      {/* Bar 1 */}
      <rect x="35" y="65" width="12" height="20" rx="2" fill="#60A5FA" />
      {/* Bar 2 */}
      <rect x="54" y="45" width="12" height="40" rx="2" fill="#3B82F6" />
      {/* Bar 3 */}
      <rect x="73" y="35" width="12" height="50" rx="2" fill="#7C3AED" />
      {/* Line trend */}
      <path d="M41 62l19-18 19-12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
      <circle cx="41" cy="62" r="3" fill="#10B981" />
      <circle cx="60" cy="44" r="3" fill="#10B981" />
      <circle cx="79" cy="32" r="3" fill="#10B981" />
    </svg>
  );
}

export function BooksIllustration({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bottom book */}
      <path d="M25 75h70v15H25z" fill="#3B82F6" rx="3" />
      <path d="M28 78h64v2H28z" fill="#1D4ED8" />
      <path d="M92 75v15M88 75v15" stroke="#FFF" strokeWidth="2" />
      {/* Middle book */}
      <path d="M30 55h60v15H30z" fill="#10B981" rx="3" />
      <path d="M33 58h54v2H33z" fill="#047857" />
      <path d="M87 55v15M83 55v15" stroke="#FFF" strokeWidth="2" />
      {/* Top book (titled slightly) */}
      <g transform="rotate(-8 60 40)">
        <path d="M35 35h50v15H35z" fill="#F59E0B" rx="3" />
        <path d="M38 38h44v2H38z" fill="#D97706" />
        <path d="M82 35v15M78 35v15" stroke="#FFF" strokeWidth="2" />
      </g>
    </svg>
  );
}

export function StudentIllustration({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#EEF2F6" />
      {/* Laptop outline */}
      <path d="M35 75h50v10H35z" fill="#64748B" rx="2" />
      <path d="M40 45h40v30H40z" fill="#475569" rx="3" />
      <path d="M43 48h34v24H43z" fill="#38BDF8" opacity="0.3" />
      {/* Student Head */}
      <circle cx="60" cy="35" r="10" fill="#FDBA74" />
      {/* Hair */}
      <path d="M50 35c0-12 20-12 20 0H50z" fill="#1E293B" />
      {/* Body */}
      <path d="M45 58c0-8 30-8 30 0v17H45V58z" fill="#3B82F6" rx="4" />
      {/* Glowing screen light */}
      <path d="M40 75L20 110h80L80 75" fill="url(#screenLight)" opacity="0.15" />
      <defs>
        <linearGradient id="screenLight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
