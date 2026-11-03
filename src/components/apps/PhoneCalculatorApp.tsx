import React, { useState } from 'react';
import { ArrowLeft, RotateCcw, Delete, History } from 'lucide-react';

interface PhoneCalculatorAppProps {
  onBack: () => void;
}

export const PhoneCalculatorApp: React.FC<PhoneCalculatorAppProps> = ({ onBack }) => {
  const [display, setDisplay] = useState<string>('0');
  const [expression, setExpression] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isNewNumber, setIsNewNumber] = useState<boolean>(true);

  const handleDigit = (digit: string) => {
    if (isNewNumber || display === '0') {
      setDisplay(digit);
      setIsNewNumber(false);
    } else {
      if (display.length < 14) {
        setDisplay(display + digit);
      }
    }
  };

  const handleDecimal = () => {
    if (isNewNumber) {
      setDisplay('0.');
      setIsNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperator = (op: string) => {
    setExpression(`${display} ${op} `);
    setIsNewNumber(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    setIsNewNumber(true);
  };

  const handleBackspace = () => {
    if (isNewNumber) return;
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setIsNewNumber(true);
    }
  };

  const handleToggleSign = () => {
    if (display === '0') return;
    if (display.startsWith('-')) {
      setDisplay(display.slice(1));
    } else {
      setDisplay('-' + display);
    }
  };

  const handlePercent = () => {
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setDisplay(String(val / 100));
      setIsNewNumber(true);
    }
  };

  const handleSquareRoot = () => {
    const val = parseFloat(display);
    if (val < 0) {
      setDisplay('Error');
      setIsNewNumber(true);
      return;
    }
    const res = Math.sqrt(val);
    const rounded = Math.round(res * 10000000) / 10000000;
    setHistory(prev => [`√(${val}) = ${rounded}`, ...prev.slice(0, 9)]);
    setDisplay(String(rounded));
    setIsNewNumber(true);
  };

  const handleEquals = () => {
    if (!expression) return;
    try {
      const fullExpr = `${expression}${display}`
        .replace(/×/g, '*')
        .replace(/÷/g, '/');
      
      // Safe arithmetic evaluator
      // eslint-disable-next-line no-new-func
      const result = Function(`'use strict'; return (${fullExpr})`)();
      const rounded = Math.round(result * 10000000) / 10000000;
      
      const record = `${expression}${display} = ${rounded}`;
      setHistory(prev => [record, ...prev.slice(0, 9)]);
      setDisplay(String(rounded));
      setExpression('');
      setIsNewNumber(true);
    } catch {
      setDisplay('Error');
      setIsNewNumber(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111216] text-white select-none overflow-hidden font-sans">
      {/* Top Bar */}
      <div className="p-3 bg-[#181920] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={onBack}
            className="p-1 rounded-full hover:bg-slate-700/60 text-slate-300 active:scale-95 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 font-bold text-sm">
            <span className="text-cyan-400">🔢</span>
            <span>計算機</span>
          </div>
        </div>

        <button 
          onClick={() => setShowHistory(!showHistory)}
          className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${
            showHistory ? 'bg-cyan-600/30 text-cyan-300' : 'text-slate-400 hover:text-white'
          }`}
          title="歷史紀錄"
        >
          <History className="w-4 h-4" />
          <span>紀錄</span>
        </button>
      </div>

      {/* History Drawer Overlay */}
      {showHistory && (
        <div className="p-3 bg-[#191a22] border-b border-slate-800 max-h-44 overflow-y-auto shrink-0 text-xs text-slate-300 space-y-1.5 animate-fadeIn">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
            <span>計算歷史 (最近 10 筆)</span>
            {history.length > 0 && (
              <button 
                onClick={() => setHistory([])}
                className="text-rose-400 hover:text-rose-300"
              >
                清除
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-slate-500 text-center py-2">尚無運算歷史</p>
          ) : (
            history.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => {
                  const parts = item.split('=');
                  if (parts[1]) {
                    setDisplay(parts[1].trim());
                    setIsNewNumber(true);
                  }
                }}
                className="p-1.5 rounded bg-slate-900/60 hover:bg-slate-800/80 cursor-pointer font-mono text-cyan-300 flex justify-between"
              >
                <span>{item}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Display Screen */}
      <div className="flex-1 p-5 flex flex-col justify-end items-end border-b border-slate-800/60 bg-gradient-to-b from-[#111216] to-[#151720]">
        <div className="text-sm font-mono text-slate-400 h-6 overflow-hidden text-right w-full">
          {expression}
        </div>
        <div className="text-4xl sm:text-5xl font-mono font-light text-white tracking-tight break-all text-right w-full mt-1">
          {display}
        </div>
      </div>

      {/* Keypad Grid */}
      <div className="p-3 bg-[#16171f] grid grid-cols-4 gap-2 shrink-0 pb-6">
        {/* Row 1 */}
        <button 
          onClick={handleClear}
          className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-rose-400 font-bold text-lg transition flex items-center justify-center shadow-sm"
        >
          AC
        </button>
        <button 
          onClick={handleSquareRoot}
          className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-cyan-400 font-semibold text-lg transition flex items-center justify-center shadow-sm"
        >
          √
        </button>
        <button 
          onClick={handlePercent}
          className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-cyan-400 font-semibold text-lg transition flex items-center justify-center shadow-sm"
        >
          %
        </button>
        <button 
          onClick={() => handleOperator('÷')}
          className="h-14 rounded-2xl bg-cyan-600/30 hover:bg-cyan-600/50 active:scale-95 text-cyan-300 font-bold text-xl transition flex items-center justify-center shadow-sm"
        >
          ÷
        </button>

        {/* Row 2 */}
        <button 
          onClick={() => handleDigit('7')}
          className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-700/60 active:scale-95 text-white font-medium text-xl transition flex items-center justify-center shadow-sm"
        >
          7
        </button>
        <button 
          onClick={() => handleDigit('8')}
          className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-700/60 active:scale-95 text-white font-medium text-xl transition flex items-center justify-center shadow-sm"
        >
          8
        </button>
        <button 
          onClick={() => handleDigit('9')}
          className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-700/60 active:scale-95 text-white font-medium text-xl transition flex items-center justify-center shadow-sm"
        >
          9
        </button>
        <button 
          onClick={() => handleOperator('×')}
          className="h-14 rounded-2xl bg-cyan-600/30 hover:bg-cyan-600/50 active:scale-95 text-cyan-300 font-bold text-xl transition flex items-center justify-center shadow-sm"
        >
          ×
        </button>

        {/* Row 3 */}
        <button 
          onClick={() => handleDigit('4')}
          className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-700/60 active:scale-95 text-white font-medium text-xl transition flex items-center justify-center shadow-sm"
        >
          4
        </button>
        <button 
          onClick={() => handleDigit('5')}
          className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-700/60 active:scale-95 text-white font-medium text-xl transition flex items-center justify-center shadow-sm"
        >
          5
        </button>
        <button 
          onClick={() => handleDigit('6')}
          className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-700/60 active:scale-95 text-white font-medium text-xl transition flex items-center justify-center shadow-sm"
        >
          6
        </button>
        <button 
          onClick={() => handleOperator('-')}
          className="h-14 rounded-2xl bg-cyan-600/30 hover:bg-cyan-600/50 active:scale-95 text-cyan-300 font-bold text-2xl transition flex items-center justify-center shadow-sm"
        >
          -
        </button>

        {/* Row 4 */}
        <button 
          onClick={() => handleDigit('1')}
          className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-700/60 active:scale-95 text-white font-medium text-xl transition flex items-center justify-center shadow-sm"
        >
          1
        </button>
        <button 
          onClick={() => handleDigit('2')}
          className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-700/60 active:scale-95 text-white font-medium text-xl transition flex items-center justify-center shadow-sm"
        >
          2
        </button>
        <button 
          onClick={() => handleDigit('3')}
          className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-700/60 active:scale-95 text-white font-medium text-xl transition flex items-center justify-center shadow-sm"
        >
          3
        </button>
        <button 
          onClick={() => handleOperator('+')}
          className="h-14 rounded-2xl bg-cyan-600/30 hover:bg-cyan-600/50 active:scale-95 text-cyan-300 font-bold text-xl transition flex items-center justify-center shadow-sm"
        >
          +
        </button>

        {/* Row 5 */}
        <button 
          onClick={handleToggleSign}
          className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-700/60 active:scale-95 text-slate-300 font-semibold text-base transition flex items-center justify-center shadow-sm"
        >
          +/-
        </button>
        <button 
          onClick={() => handleDigit('0')}
          className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-700/60 active:scale-95 text-white font-medium text-xl transition flex items-center justify-center shadow-sm"
        >
          0
        </button>
        <button 
          onClick={handleDecimal}
          className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-700/60 active:scale-95 text-white font-bold text-xl transition flex items-center justify-center shadow-sm"
        >
          .
        </button>
        <button 
          onClick={handleEquals}
          className="h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white font-bold text-2xl transition flex items-center justify-center shadow-lg shadow-cyan-500/20"
        >
          =
        </button>
      </div>
    </div>
  );
};
