import React, { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  tilt: number;
}

export default function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = ["#2563EB", "#7C3AED", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];
    const count = 75;
    const generated: Particle[] = [];

    for (let i = 0; i < count; i++) {
      generated.push({
        id: i,
        x: Math.random() * 100, // percentage width
        y: -10, // start above screen
        size: Math.random() * 8 + 6, // size in pixels
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 2, // delay in seconds
        duration: Math.random() * 3 + 2, // speed in seconds
        tilt: Math.random() * 360 // random tilt angle
      });
    }

    setParticles(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm opacity-90 animate-fall"
          style={{
            left: `${p.x}%`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size * 1.5}px`,
            backgroundColor: p.color,
            transform: `rotate(${p.tilt}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            animationIterationCount: "infinite"
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% {
            top: -5%;
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            top: 105%;
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
        }
      `}</style>
    </div>
  );
}
