import React, { useState } from "react";
import { Calculator, X, Delete } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CalculatorProps {
  onClose?: () => void;
}

export default function ScientificCalculator({ onClose }: CalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [memory, setMemory] = useState<number>(0);
  const [shouldReset, setShouldReset] = useState(false);

  const handleNum = (num: string) => {
    if (display === "0" || shouldReset) {
      setDisplay(num);
      setShouldReset(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOp = (op: string) => {
    setDisplay(display + " " + op + " ");
    setShouldReset(false);
  };

  const handleClear = () => {
    setDisplay("0");
  };

  const handleBackspace = () => {
    if (display.length <= 1) {
      setDisplay("0");
    } else {
      setDisplay(display.slice(0, -1).trim() || "0");
    }
  };

  const handleEqual = () => {
    try {
      // Safely parse mathematical expressions with standard operators
      let formattedExpr = display
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/ln/g, "Math.log")
        .replace(/log/g, "Math.log10")
        .replace(/sin/g, "Math.sin")
        .replace(/cos/g, "Math.cos")
        .replace(/tan/g, "Math.tan")
        .replace(/π/g, "Math.PI")
        .replace(/e/g, "Math.E")
        .replace(/√/g, "Math.sqrt");

      // Check for unfinished operations
      if (/[\+\-\*\/]$/.test(formattedExpr.trim())) return;

      // Evaluate safely
      const result = new Function(`return (${formattedExpr})`)();
      
      if (result === undefined || isNaN(result)) {
        setDisplay("Error");
      } else {
        setDisplay(String(Number(result.toFixed(6))));
      }
      setShouldReset(true);
    } catch (e) {
      setDisplay("Error");
      setShouldReset(true);
    }
  };

  const handleFunc = (funcName: string) => {
    if (display === "0" || shouldReset) {
      setDisplay(`${funcName}(`);
      setShouldReset(false);
    } else {
      setDisplay(`${display}${funcName}(`);
    }
  };

  const handleConstant = (constName: string) => {
    if (display === "0" || shouldReset) {
      setDisplay(constName);
      setShouldReset(false);
    } else {
      setDisplay(display + constName);
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-4 overflow-hidden select-none text-zinc-800 dark:text-zinc-100 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-50">Virtual JEE Calculator</span>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Screen display */}
      <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl px-4 py-3 mb-4 text-right border border-zinc-100 dark:border-zinc-850">
        <div className="text-xs text-zinc-400 dark:text-zinc-500 font-mono overflow-x-auto whitespace-nowrap mb-1 h-4">
          {display.includes("Math.") ? display.replace(/Math\./g, "") : ""}
        </div>
        <div className="text-2xl font-mono font-medium overflow-x-auto whitespace-nowrap scrollbar-none select-text text-zinc-900 dark:text-white">
          {display}
        </div>
      </div>

      {/* Grid of keys */}
      <div className="grid grid-cols-5 gap-1.5 text-xs font-mono font-medium">
        {/* Row 1: Scientific Functions */}
        <button onClick={() => handleFunc("sin")} className="py-2.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">sin</button>
        <button onClick={() => handleFunc("cos")} className="py-2.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">cos</button>
        <button onClick={() => handleFunc("tan")} className="py-2.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">tan</button>
        <button onClick={() => handleFunc("ln")} className="py-2.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">ln</button>
        <button onClick={() => handleFunc("log")} className="py-2.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">log</button>

        {/* Row 2: Constants / Parentheses */}
        <button onClick={() => handleConstant("π")} className="py-2.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">π</button>
        <button onClick={() => handleConstant("e")} className="py-2.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">e</button>
        <button onClick={() => handleFunc("√")} className="py-2.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">√</button>
        <button onClick={() => handleNum("(")} className="py-2.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">(</button>
        <button onClick={() => handleNum(")")} className="py-2.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">)</button>

        {/* Row 3: Action Buttons + Division */}
        <button onClick={handleClear} className="py-2.5 rounded bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors col-span-2 font-semibold">C</button>
        <button onClick={handleBackspace} className="py-2.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center">
          <Delete className="w-4 h-4 text-zinc-500" />
        </button>
        <button onClick={() => handleNum("^")} className="py-2.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">xʸ</button>
        <button onClick={() => handleOp("÷")} className="py-2.5 rounded bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-bold text-blue-600 dark:text-blue-400">÷</button>

        {/* Numbers 7, 8, 9, Multiplication */}
        <button onClick={() => handleNum("7")} className="py-3 rounded bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-semibold">7</button>
        <button onClick={() => handleNum("8")} className="py-3 rounded bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-semibold">8</button>
        <button onClick={() => handleNum("9")} className="py-3 rounded bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-semibold">9</button>
        <button onClick={() => handleOp("-")} className="py-3 rounded bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-bold text-blue-600 dark:text-blue-400 text-sm">-</button>
        <button onClick={() => handleOp("×")} className="py-3 rounded bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-bold text-blue-600 dark:text-blue-400 text-sm">×</button>

        {/* Numbers 4, 5, 6, Addition */}
        <button onClick={() => handleNum("4")} className="py-3 rounded bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-semibold">4</button>
        <button onClick={() => handleNum("5")} className="py-3 rounded bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-semibold">5</button>
        <button onClick={() => handleNum("6")} className="py-3 rounded bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-semibold">6</button>
        <button onClick={() => handleOp("+")} className="py-3 rounded bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-bold text-blue-600 dark:text-blue-400 text-sm col-span-2">+</button>

        {/* Numbers 1, 2, 3, Decimal, Equal */}
        <button onClick={() => handleNum("1")} className="py-3 rounded bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-semibold">1</button>
        <button onClick={() => handleNum("2")} className="py-3 rounded bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-semibold">2</button>
        <button onClick={() => handleNum("3")} className="py-3 rounded bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-semibold">3</button>
        <button onClick={() => handleNum(".")} className="py-3 rounded bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-semibold">.</button>
        <button onClick={handleEqual} className="py-3 rounded bg-blue-600 text-white hover:bg-blue-700 font-bold text-sm row-span-2 flex items-center justify-center shadow-lg shadow-blue-500/10">=</button>

        {/* Zero, brackets */}
        <button onClick={() => handleNum("0")} className="py-3 rounded bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-semibold col-span-2">0</button>
        <button onClick={() => handleNum("00")} className="py-3 rounded bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-semibold col-span-2">00</button>
      </div>
    </div>
  );
}
