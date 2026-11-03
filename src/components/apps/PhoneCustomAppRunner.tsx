import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, CheckCircle2, ShieldCheck, Sparkles, Briefcase, ExternalLink, RefreshCw } from 'lucide-react';
import { InstalledAppItem } from '../../types';

interface PhoneCustomAppRunnerProps {
  app: InstalledAppItem;
  onBack: () => void;
  onSendToDogAI?: (prompt: string) => void;
}

export const PhoneCustomAppRunner: React.FC<PhoneCustomAppRunnerProps> = ({
  app,
  onBack,
  onSendToDogAI,
}) => {
  const isGame = app.category.includes('遊戲') || app.name.includes('遊戲') || app.name.includes('Game') || app.name.includes('Chess') || app.name.includes('棋');
  const isTimer = app.name.includes('計時') || app.name.includes('碼錶') || app.name.includes('鐘') || app.name.includes('Timer') || app.name.includes('Speed');
  const isMusic = app.name.includes('Spotify') || app.name.includes('Music') || app.name.includes('音樂');

  // Timer / Speedtest state
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [speedVal, setSpeedVal] = useState<number>(450);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
        setSpeedVal(Math.floor(400 + Math.random() * 250));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Mini Snake / Chess Game state
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([{ x: 5, y: 5 }, { x: 4, y: 5 }]);
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 8, y: 8 });
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const moveSnake = () => {
    setSnake(prev => {
      const head = { ...prev[0] };
      if (direction === 'UP') head.y -= 1;
      if (direction === 'DOWN') head.y += 1;
      if (direction === 'LEFT') head.x -= 1;
      if (direction === 'RIGHT') head.x += 1;

      // Wrap around grid
      if (head.x < 0) head.x = 11;
      if (head.x > 11) head.x = 0;
      if (head.y < 0) head.y = 11;
      if (head.y > 11) head.y = 0;

      // Check food
      const newSnake = [head, ...prev];
      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + 10);
        setFood({
          x: Math.floor(Math.random() * 12),
          y: Math.floor(Math.random() * 12),
        });
      } else {
        newSnake.pop();
      }
      return newSnake;
    });
  };

  useEffect(() => {
    if (isGame && isGameRunning) {
      const gameTimer = setInterval(moveSnake, 250);
      return () => clearInterval(gameTimer);
    }
  }, [isGame, isGameRunning, direction, food]);

  return (
    <div className="flex flex-col h-full bg-[#111217] text-white select-none overflow-hidden font-sans">
      {/* Top Header */}
      <div className="p-3 bg-[#181921] border-b border-slate-800 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="p-1 rounded-full hover:bg-slate-700/60 text-slate-300 transition active:scale-95"
            title="返回桌面"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 font-bold text-sm">
            {app.iconUrl ? (
              <img src={app.iconUrl} alt={app.name} className="w-6 h-6 rounded-lg object-cover" />
            ) : (
              <span>{app.icon}</span>
            )}
            <span className="truncate max-w-[170px]">{app.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {app.isWorkProfile && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-800/60">
              <Briefcase className="w-3 h-3" />
              <span>工作模式</span>
            </span>
          )}
          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
            <CheckCircle2 className="w-3 h-3" />
            <span>運行中</span>
          </span>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        {/* Interactive Mode 1: Game */}
        {isGame ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="flex justify-between w-full max-w-xs text-xs font-mono text-slate-300">
              <span>得分: <strong className="text-amber-400">{score}</strong></span>
              <button
                onClick={() => {
                  setSnake([{ x: 5, y: 5 }, { x: 4, y: 5 }]);
                  setScore(0);
                  setIsGameRunning(true);
                }}
                className="text-cyan-400 hover:underline"
              >
                重新開局
              </button>
            </div>

            {/* 12x12 Grid */}
            <div className="w-64 h-64 bg-slate-900 border-2 border-slate-700 rounded-2xl grid grid-cols-12 grid-rows-12 p-1 gap-0.5 shadow-2xl relative">
              {Array.from({ length: 144 }).map((_, idx) => {
                const x = idx % 12;
                const y = Math.floor(idx / 12);
                const isSnakeHead = snake[0].x === x && snake[0].y === y;
                const isSnakeBody = snake.slice(1).some(s => s.x === x && s.y === y);
                const isFoodCell = food.x === x && food.y === y;

                return (
                  <div
                    key={idx}
                    className={`rounded-sm transition-colors ${
                      isSnakeHead
                        ? 'bg-amber-400'
                        : isSnakeBody
                        ? 'bg-emerald-500'
                        : isFoodCell
                        ? 'bg-rose-500 animate-ping'
                        : 'bg-slate-800/20'
                    }`}
                  />
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => setDirection('UP')}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-sm font-bold active:scale-95"
              >
                ▲
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setDirection('LEFT')}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-sm font-bold active:scale-95"
                >
                  ◀
                </button>
                <button
                  onClick={() => setIsGameRunning(!isGameRunning)}
                  className="w-10 h-10 rounded-xl bg-amber-600 hover:bg-amber-500 flex items-center justify-center text-xs font-bold active:scale-95"
                >
                  {isGameRunning ? '⏸' : '▶'}
                </button>
                <button
                  onClick={() => setDirection('RIGHT')}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-sm font-bold active:scale-95"
                >
                  ▶
                </button>
              </div>
              <button
                onClick={() => setDirection('DOWN')}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-sm font-bold active:scale-95"
              >
                ▼
              </button>
            </div>
          </div>
        ) : isTimer ? (
          /* Interactive Mode 2: Stopwatch / Speedtest */
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="w-52 h-52 rounded-full border-4 border-cyan-500/40 flex flex-col items-center justify-center bg-slate-900/80 shadow-2xl relative">
              <span className="text-4xl font-mono font-bold text-cyan-400">
                {app.name.includes('Speed') ? `${speedVal} Mbps` : (
                  `${String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:${String(timerSeconds % 60).padStart(2, '0')}`
                )}
              </span>
              <span className="text-xs text-slate-400 font-mono mt-1">
                {app.name.includes('Speed') ? '5G 超高速網路測速中' : '毫秒精度運算中'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="px-6 py-2.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg flex items-center gap-1.5 active:scale-95 transition"
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isTimerRunning ? '暫停' : '開始測試 / 計時'}</span>
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(0);
                }}
                className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Interactive Mode 3: General Real Application Hub */
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-2xl overflow-hidden">
              {app.iconUrl ? (
                <img src={app.iconUrl} alt={app.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">{app.icon}</span>
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-white">{app.name}</h2>
              <p className="text-xs text-emerald-400 font-medium">{app.developer || app.subtitle}</p>
              <p className="text-[11px] text-slate-400 max-w-xs">{app.description}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-left w-full max-w-xs space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Android 套件:</span>
                <span className="text-emerald-400 font-mono">{app.packageId || 'com.android.app'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>記憶體大小:</span>
                <span className="text-cyan-400 font-mono">{app.size}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>安全審查:</span>
                <span className="text-emerald-400 font-mono">Play Protect 認證</span>
              </div>
            </div>

            {onSendToDogAI && (
              <button
                onClick={() => onSendToDogAI(`汪！主人剛剛開啟了從 Google Play 商店下載的【${app.name}】（類別: ${app.category}），請狗僕人為主人提供該應用的操作技巧與智慧建議！`)}
                className="px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>請 Dog AI 協助操作此應用 🐶</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
