import React, { useState, useEffect, useRef } from 'react';
import { PhoneAppId, PhoneFileItem } from '../types';
import { AndroidSettingsApp } from './AndroidSettingsApp';
import { AndroidFilesApp } from './AndroidFilesApp';
import { AndroidGoogleApp } from './AndroidGoogleApp';
import { AndroidChromeApp } from './AndroidChromeApp';
import { AndroidPlayStoreApp } from './AndroidPlayStoreApp';
import { AndroidLineApp } from './AndroidLineApp';
import { PhoneCalculatorApp } from './apps/PhoneCalculatorApp';
import { PhoneCameraApp } from './apps/PhoneCameraApp';
import { PhoneNotesApp } from './apps/PhoneNotesApp';
import { PhoneMusicApp } from './apps/PhoneMusicApp';
import { PhoneCustomAppRunner } from './apps/PhoneCustomAppRunner';
import { PhoneSystemManager } from '../services/phoneSystemManager';
import { 
  Wifi, 
  Battery, 
  Circle, 
  Square, 
  Triangle, 
  Search, 
  Mic, 
  Camera, 
  Maximize2, 
  Minimize2,
  Calendar,
  Sparkles,
  Volume2,
  Fingerprint,
  Lock,
  Unlock,
  ShieldCheck,
  Power,
  Briefcase
} from 'lucide-react';

interface AndroidPhoneSystemProps {
  renderDogAI: () => React.ReactNode;
  onOpenDogAISettingsModal: () => void;
  onInjectPromptIntoDogAI?: (prompt: string) => void;
  storageUsedMB: number;
}

export const AndroidPhoneSystem: React.FC<AndroidPhoneSystemProps> = ({
  renderDogAI,
  onOpenDogAISettingsModal,
  onInjectPromptIntoDogAI,
  storageUsedMB,
}) => {
  // User explicitly requested: "I need it is like a phone and it can rill insteal things"
  // Default directly to authentic phone chassis mode and home screen
  const [activeApp, setActiveApp] = useState<PhoneAppId | 'home'>('home');
  const [installedApps, setInstalledApps] = useState(() => PhoneSystemManager.getInstance().getInstalledApps());
  const [launcherTab, setLauncherTab] = useState<'personal' | 'work'>('personal');
  const [currentTime, setCurrentTime] = useState<string>('12:00');
  const [currentDate, setCurrentDate] = useState<string>('11月1日 星期日');
  const [isPhoneFrameMode, setIsPhoneFrameMode] = useState<boolean>(true); // Default to Phone Frame!
  const [isScreenLocked, setIsScreenLocked] = useState<boolean>(false);
  const [batteryLevel, setBatteryLevel] = useState<number>(94);
  const [volumeLevel, setVolumeLevel] = useState<number>(70);
  const [showVolumeHUD, setShowVolumeHUD] = useState<boolean>(false);
  const [recentApps, setRecentApps] = useState<PhoneAppId[]>(['dog_ai', 'files', 'settings']);
  const [showRecentsView, setShowRecentsView] = useState<boolean>(false);
  const [chromeUrl, setChromeUrl] = useState<string>('https://zh.wikipedia.org/wiki/Android');

  const volumeHUDTimerRef = useRef<any>(null);

  // Update clock every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      setCurrentDate(now.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric', weekday: 'short' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const refreshInstalledApps = () => {
    setInstalledApps(PhoneSystemManager.getInstance().getInstalledApps());
  };

  const handleLaunchApp = (appId: PhoneAppId) => {
    refreshInstalledApps();
    setActiveApp(appId);
    setShowRecentsView(false);
    setRecentApps(prev => [appId, ...prev.filter(id => id !== appId)]);
  };

  const handleSendFileToDogAI = (file: PhoneFileItem) => {
    const snippet = `汪！主人在資料夾中選擇了【${file.name}】（格式: ${file.docFormat?.toUpperCase() || file.category}）：
內容預覽：
${file.content.slice(0, 500)}...
請狗僕人為主人詳細解析這份文件！`;
    if (onInjectPromptIntoDogAI) {
      onInjectPromptIntoDogAI(snippet);
    }
    setActiveApp('dog_ai');
  };

  const handleSendPhotoToDogAI = (photoName: string, photoDataUrl: string) => {
    const prompt = `汪！主人剛剛用相機拍攝了一張照片【${photoName}】，照片已存入手機相簿（資料夾 ➜ 圖片）！
請狗僕人為主人描述與分析這張相片！🐶`;
    if (onInjectPromptIntoDogAI) {
      onInjectPromptIntoDogAI(prompt);
    }
    setActiveApp('dog_ai');
  };

  const handleSearchGoogleWithDogAI = (query: string) => {
    if (onInjectPromptIntoDogAI) {
      onInjectPromptIntoDogAI(`主人在 Google 搜尋了：「${query}」，請狗僕人回答！`);
    }
    setActiveApp('dog_ai');
  };

  // Hardware Volume Buttons handling
  const triggerVolumeHUD = (newVol: number) => {
    setVolumeLevel(Math.min(100, Math.max(0, newVol)));
    setShowVolumeHUD(true);
    if (volumeHUDTimerRef.current) clearTimeout(volumeHUDTimerRef.current);
    volumeHUDTimerRef.current = setTimeout(() => {
      setShowVolumeHUD(false);
    }, 2000);
  };

  const handleVolumeUp = () => triggerVolumeHUD(volumeLevel + 10);
  const handleVolumeDown = () => triggerVolumeHUD(volumeLevel - 10);
  const handlePowerToggle = () => setIsScreenLocked(prev => !prev);

  // Pre-installed + dynamically installed apps by Dog AI or Play Store
  const homeScreenApps = installedApps.map(app => ({
    id: app.id as PhoneAppId,
    name: app.name,
    subtitle: app.subtitle,
    icon: app.icon,
    iconUrl: app.iconUrl,
    bg: app.bg,
    badge: app.badge,
    category: app.category,
    isWorkProfile: app.isWorkProfile || ['dog_ai', 'files', 'google', 'chrome', 'line', 'play_store', 'settings'].includes(app.id),
  }));

  const activeCustomApp = installedApps.find(a => a.id === activeApp);

  return (
    <div className="flex h-screen w-full bg-[#07090e] text-slate-100 overflow-hidden items-center justify-center relative select-none">
      {/* Background Ambience / Desk Wallpaper */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#151828_0%,#08090f_70%,#040507_100%)] pointer-events-none" />

      {/* Outer Floating Desktop Controls */}
      <div className="absolute top-4 right-5 z-50 flex items-center gap-2 bg-[#12141c]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 text-xs text-slate-300 shadow-xl">
        <button
          onClick={() => setIsPhoneFrameMode(!isPhoneFrameMode)}
          className="flex items-center gap-1.5 hover:text-white transition"
          title={isPhoneFrameMode ? '展開為全螢幕平板視圖' : '切換為實體手機邊框'}
        >
          {isPhoneFrameMode ? (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>全螢幕視圖</span>
            </>
          ) : (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>實體手機框</span>
            </>
          )}
        </button>
      </div>

      {/* Main Smartphone Shell Container */}
      <div className="relative flex items-center justify-center">
        {/* Physical Hardware Buttons on Exterior Frame (Left side: Volume Up / Down) */}
        {isPhoneFrameMode && (
          <div className="absolute -left-[14px] top-32 flex flex-col gap-3 z-30">
            {/* Volume Up */}
            <button
              onClick={handleVolumeUp}
              className="w-2.5 h-12 rounded-l-md bg-gradient-to-r from-slate-600 to-slate-500 hover:from-cyan-400 hover:to-cyan-500 active:translate-x-0.5 transition shadow-md"
              title="實體音量鍵 (+)"
            />
            {/* Volume Down */}
            <button
              onClick={handleVolumeDown}
              className="w-2.5 h-12 rounded-l-md bg-gradient-to-r from-slate-600 to-slate-500 hover:from-cyan-400 hover:to-cyan-500 active:translate-x-0.5 transition shadow-md"
              title="實體音量鍵 (-)"
            />
          </div>
        )}

        {/* Physical Hardware Buttons on Exterior Frame (Right side: Power / Lock Button) */}
        {isPhoneFrameMode && (
          <div className="absolute -right-[14px] top-36 z-30">
            <button
              onClick={handlePowerToggle}
              className="w-2.5 h-16 rounded-r-md bg-gradient-to-l from-slate-600 to-slate-500 hover:from-rose-400 hover:to-rose-500 active:-translate-x-0.5 transition shadow-md"
              title="實體電源 / 螢幕鎖定鍵"
            />
          </div>
        )}

        {/* The Phone Body */}
        <div 
          className={`flex flex-col overflow-hidden transition-all duration-300 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative ${
            isPhoneFrameMode 
              ? 'w-[410px] h-[860px] max-h-[94vh] rounded-[52px] border-[12px] border-[#1f212a] ring-1 ring-slate-700/60 bg-black'
              : 'w-full h-full bg-[#0b0c10]'
          }`}
        >
          {/* Top Speaker Grill Slit */}
          {isPhoneFrameMode && (
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 z-50 w-16 h-1 rounded-full bg-slate-800 pointer-events-none" />
          )}

          {/* Android Punch-Hole Camera with Reflection */}
          {isPhoneFrameMode && (
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center pointer-events-none">
              <div className="w-3.5 h-3.5 rounded-full bg-[#0b0c10] border border-slate-800/80 flex items-center justify-center shadow-inner">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900 ring-1 ring-blue-500/30" />
              </div>
            </div>
          )}

          {/* Realistic Android Volume Slider HUD Overlay */}
          {showVolumeHUD && (
            <div className="absolute top-24 right-3 z-50 bg-black/85 backdrop-blur-md px-2 py-3 rounded-2xl border border-white/20 shadow-2xl flex flex-col items-center gap-2 animate-fadeIn">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <div className="w-1.5 h-24 bg-slate-800 rounded-full overflow-hidden flex flex-col justify-end">
                <div
                  className="w-full bg-gradient-to-t from-cyan-500 to-blue-400 rounded-full transition-all duration-200"
                  style={{ height: `${volumeLevel}%` }}
                />
              </div>
              <span className="text-[9px] font-mono text-slate-300">{volumeLevel}%</span>
            </div>
          )}

          {/* ===================== ANDROID LOCK SCREEN ===================== */}
          {isScreenLocked ? (
            <div className="h-full flex flex-col justify-between p-6 bg-gradient-to-b from-[#090b12] via-[#05060a] to-black relative z-40">
              <div className="pt-10 text-center space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dog OS 15 · 已安全鎖定</span>
                </div>
                <h1 className="text-6xl font-light text-white font-mono tracking-tight">{currentTime}</h1>
                <p className="text-sm text-cyan-300 font-medium">{currentDate}</p>
              </div>

              {/* Lock Screen Notification Cards */}
              <div className="space-y-2.5 max-w-xs mx-auto w-full">
                <div 
                  onClick={() => {
                    setIsScreenLocked(false);
                    setActiveApp('dog_ai');
                  }}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/30 backdrop-blur-md shadow-xl cursor-pointer hover:bg-slate-900 transition"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">🐶</span>
                    <span className="text-xs font-bold text-amber-300">Dog AI 狗僕人</span>
                    <span className="text-[10px] text-slate-500 ml-auto font-mono">剛剛</span>
                  </div>
                  <p className="text-xs text-slate-300">汪！主人，我是您的離線 AI 僕人，所有系統權限與檔案都準備就緒，隨時聽候吩咐！</p>
                </div>

                <div 
                  onClick={() => {
                    setIsScreenLocked(false);
                    setActiveApp('line');
                  }}
                  className="p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-md shadow-xl cursor-pointer hover:bg-slate-900 transition"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">💬</span>
                    <span className="text-xs font-bold text-emerald-400">LINE (企業通訊)</span>
                    <span className="text-[10px] text-slate-500 ml-auto font-mono">5分鐘前</span>
                  </div>
                  <p className="text-xs text-slate-300">ARP-1 防護矩陣已啟動，安全檢查無異狀。</p>
                </div>
              </div>

              {/* Unlock Action Button */}
              <div className="flex flex-col items-center pb-6 space-y-2">
                <button
                  onClick={() => setIsScreenLocked(false)}
                  className="w-16 h-16 rounded-full bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-xl transition active:scale-90 animate-pulse"
                  title="輕觸指紋辨識以解鎖"
                >
                  <Fingerprint className="w-8 h-8" />
                </button>
                <span className="text-[11px] text-slate-400 font-medium">輕觸指紋或點擊解鎖螢幕</span>
              </div>
            </div>
          ) : (
            /* ===================== ACTIVE UNLOCKED PHONE SYSTEM ===================== */
            <>
              {/* Android Status Bar */}
              <div className="h-8 px-5 bg-[#101218]/95 backdrop-blur-md border-b border-slate-800/60 flex items-center justify-between text-[11px] font-mono select-none shrink-0 z-40 text-slate-300 pt-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white tracking-wider">{currentTime}</span>
                  {launcherTab === 'work' && (
                    <span className="flex items-center gap-1 text-[9px] text-blue-300 font-semibold px-1 rounded bg-blue-950/70 border border-blue-800/50">
                      <Briefcase className="w-2.5 h-2.5" />
                      <span>工作</span>
                    </span>
                  )}
                  <span className="text-[9px] text-emerald-400 font-semibold px-1 rounded bg-emerald-950/60 border border-emerald-800/40">
                    Android 15 Work OS
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Wifi className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] font-bold">5G</span>
                  </span>

                  <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold">
                    <span>{batteryLevel}%</span>
                    <Battery className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                  </span>
                </div>
              </div>

              {/* App View Area */}
              <div className="flex-1 min-h-0 relative overflow-hidden bg-[#0e1017]">
                {/* Recent Apps Multitasking View */}
                {showRecentsView && (
                  <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-300 mb-4 pb-2 border-b border-slate-800">
                        <span className="font-bold">最近執行的應用程式 (Recent Apps)</span>
                        <button 
                          onClick={() => setRecentApps([])}
                          className="text-[10px] text-rose-400 hover:text-rose-300"
                        >
                          全部清除
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        {recentApps.map(appId => {
                          const info = homeScreenApps.find(a => a.id === appId);
                          if (!info) return null;
                          return (
                            <div
                              key={appId}
                              onClick={() => handleLaunchApp(appId)}
                              className="p-3.5 rounded-2xl bg-[#181a24] border border-slate-700/80 hover:border-cyan-500 cursor-pointer transition flex flex-col items-center justify-center text-center group shadow-xl"
                            >
                              <div className={`w-12 h-12 rounded-2xl ${info.bg} flex items-center justify-center text-2xl mb-2 shadow-md group-hover:scale-105 transition-transform`}>
                                {info.icon}
                              </div>
                              <span className="text-xs font-bold text-white">{info.name}</span>
                              <span className="text-[10px] text-slate-400">{info.subtitle}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={() => setShowRecentsView(false)}
                        className="px-6 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
                      >
                        返回桌面
                      </button>
                    </div>
                  </div>
                )}

                {/* 1. Android Home Screen */}
                {activeApp === 'home' && (
                  <div className="h-full flex flex-col justify-between p-4 bg-gradient-to-b from-[#121522] via-[#0d0f17] to-[#07080c] select-none overflow-y-auto">
                    {/* Home Widget: Time, Date & Dog Servant Greeting */}
                    <div className="space-y-3 pt-1">
                      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-cyan-950/40 border border-slate-800/80 shadow-2xl backdrop-blur-md flex items-center justify-between">
                        <div>
                          <h2 className="text-3xl font-extrabold text-white tracking-tight">{currentTime}</h2>
                          <p className="text-xs text-amber-400 font-medium flex items-center gap-1.5 mt-0.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {currentDate}
                          </p>
                          <p className="text-[11px] text-slate-300 mt-2 flex items-center gap-1.5">
                            <span>🐶</span>
                            <span>狗僕人忠誠待命：汪！主人隨時吩咐！</span>
                          </p>
                        </div>
                        <div 
                          onClick={() => handleLaunchApp('dog_ai')}
                          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/20 cursor-pointer hover:scale-105 transition-transform shrink-0"
                          title="開啟 Dog AI"
                        >
                          🐶
                        </div>
                      </div>

                      {/* Google Quick Search Widget on Home Screen */}
                      <div 
                        onClick={() => handleLaunchApp('google')}
                        className="p-3 rounded-full bg-[#1b1d26] border border-slate-700/80 shadow-xl flex items-center gap-2.5 cursor-pointer hover:border-slate-600 transition"
                      >
                        <Search className="w-4 h-4 text-blue-400 shrink-0 ml-1" />
                        <span className="text-xs text-slate-400 flex-1">在 Google 或手機搜尋...</span>
                        <Mic className="w-4 h-4 text-red-400 shrink-0" />
                        <Camera 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLaunchApp('camera');
                          }}
                          className="w-4 h-4 text-amber-400 shrink-0 mr-1 hover:scale-110" 
                        />
                      </div>
                    </div>

                    {/* Android Enterprise Launcher Tabs: 個人 vs 工作 💼 */}
                    <div className="py-2">
                      <div className="flex border-b border-slate-800/80 mb-3 bg-[#151722]/80 rounded-2xl p-1 gap-1">
                        <button
                          onClick={() => setLauncherTab('personal')}
                          className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-xl transition ${
                            launcherTab === 'personal'
                              ? 'bg-slate-800 text-white shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          個人 (Personal)
                        </button>
                        <button
                          onClick={() => setLauncherTab('work')}
                          className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 ${
                            launcherTab === 'work'
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Briefcase className="w-3.5 h-3.5 text-amber-300" />
                          <span>工作 (Work 💼)</span>
                        </button>
                      </div>

                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-1 flex items-center justify-between">
                        <span>
                          {launcherTab === 'work' ? '工作設定檔應用 (Managed Apps)' : `手機應用程式 (${homeScreenApps.length} APPS)`}
                        </span>
                        <span className="text-cyan-400 font-mono text-[10px]">
                          {launcherTab === 'work' ? 'EMM ENFORCED' : 'PLAY PROTECT VERIFIED'}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-y-4 gap-x-2">
                        {homeScreenApps
                          .filter(app => launcherTab === 'personal' || app.isWorkProfile)
                          .map(app => (
                            <div
                              key={app.id}
                              onClick={() => handleLaunchApp(app.id)}
                              className="flex flex-col items-center text-center cursor-pointer group"
                            >
                              <div className={`w-13 h-13 rounded-2xl ${app.bg} flex items-center justify-center text-2xl shadow-xl group-hover:scale-110 transition-transform relative overflow-hidden`}>
                                {app.iconUrl ? (
                                  <img 
                                    src={app.iconUrl} 
                                    alt={app.name} 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                  />
                                ) : (
                                  <span>{app.icon}</span>
                                )}
                                {/* Official Android Work Profile Briefcase Badge */}
                                {launcherTab === 'work' && (
                                  <div className="absolute bottom-0 right-0 p-0.5 rounded-tl-md bg-blue-600 text-white shadow">
                                    <Briefcase className="w-2.5 h-2.5" />
                                  </div>
                                )}
                                {app.badge && launcherTab === 'personal' && (
                                  <span className="absolute -top-1.5 -right-1.5 text-[8px] font-mono px-1 py-0.2 rounded-full bg-slate-900 border border-slate-700 text-cyan-300 font-bold max-w-[50px] truncate">
                                    {app.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-semibold text-white mt-1.5 group-hover:text-cyan-300 transition-colors line-clamp-1 max-w-[72px]">
                                {app.name}
                              </span>
                            </div>
                          ))}
                      </div>

                      {launcherTab === 'work' && (
                        <div className="mt-3 p-2 rounded-xl bg-blue-950/40 border border-blue-900/50 text-[10px] text-blue-300 text-center font-mono flex items-center justify-center gap-1.5">
                          <Briefcase className="w-3 h-3 text-blue-400" />
                          <span>受管的 Android 工作資料夾 · 由 Google Play EMM 原則保護</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Dock */}
                    <div className="p-3 rounded-3xl bg-[#14161f]/80 border border-slate-800 backdrop-blur-md flex items-center justify-around shadow-2xl">
                      {['line', 'files', 'google', 'camera', 'dog_ai'].map(appId => {
                        const app = homeScreenApps.find(a => a.id === appId) || homeScreenApps[0];
                        return (
                          <button
                            key={app.id}
                            onClick={() => handleLaunchApp(app.id)}
                            className="p-1.5 rounded-2xl hover:bg-slate-800 transition flex flex-col items-center hover:scale-110"
                            title={app.name}
                          >
                            <span className="text-2xl">{app.icon}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Dog AI App */}
                {activeApp === 'dog_ai' && (
                  <div className="h-full flex flex-col">
                    {renderDogAI()}
                  </div>
                )}

                {/* 3. Files App (Pictures & Documents with Word, Excel, PPT, PDF) */}
                {activeApp === 'files' && (
                  <AndroidFilesApp
                    onBack={() => setActiveApp('home')}
                    onSendToDogAI={handleSendFileToDogAI}
                  />
                )}

                {/* 4. Settings App */}
                {activeApp === 'settings' && (
                  <AndroidSettingsApp
                    onBack={() => setActiveApp('home')}
                    onOpenDogAISettings={onOpenDogAISettingsModal}
                  />
                )}

                {/* 5. Google App (Real Web Search with Live Engine) */}
                {activeApp === 'google' && (
                  <AndroidGoogleApp
                    onBack={() => setActiveApp('home')}
                    onSearchWithDogAI={handleSearchGoogleWithDogAI}
                    onOpenInChrome={(url) => {
                      setChromeUrl(url);
                      setActiveApp('chrome');
                    }}
                  />
                )}

                {/* 6. Chrome Browser App (Real Web Viewer & Reader) */}
                {activeApp === 'chrome' && (
                  <AndroidChromeApp
                    initialUrl={chromeUrl}
                    onBack={() => setActiveApp('home')}
                    onSendToDogAI={prompt => {
                      if (onInjectPromptIntoDogAI) onInjectPromptIntoDogAI(prompt);
                      setActiveApp('dog_ai');
                    }}
                  />
                )}

                {/* 7. Google Play Store App */}
                {activeApp === 'play_store' && (
                  <AndroidPlayStoreApp
                    onBack={() => setActiveApp('home')}
                    onOpenApp={handleLaunchApp}
                  />
                )}

                {/* 8. LINE App (Company LINE) */}
                {activeApp === 'line' && (
                  <AndroidLineApp
                    onBack={() => setActiveApp('home')}
                    onSendToDogAI={prompt => {
                      if (onInjectPromptIntoDogAI) onInjectPromptIntoDogAI(prompt);
                      setActiveApp('dog_ai');
                    }}
                  />
                )}

                {/* 9. REAL WORKING CALCULATOR APP */}
                {activeApp === 'calculator' && (
                  <PhoneCalculatorApp
                    onBack={() => setActiveApp('home')}
                  />
                )}

                {/* 10. REAL WORKING CAMERA APP (Saves to Phone Pictures!) */}
                {activeApp === 'camera' && (
                  <PhoneCameraApp
                    onBack={() => setActiveApp('home')}
                    onOpenPicturesFolder={() => setActiveApp('files')}
                    onSendPhotoToDogAI={handleSendPhotoToDogAI}
                  />
                )}

                {/* 11. REAL WORKING NOTES APP (Exports to Phone Documents!) */}
                {activeApp === 'notes' && (
                  <PhoneNotesApp
                    onBack={() => setActiveApp('home')}
                    onSendToDogAI={prompt => {
                      if (onInjectPromptIntoDogAI) onInjectPromptIntoDogAI(prompt);
                      setActiveApp('dog_ai');
                    }}
                    onOpenFileFolder={() => setActiveApp('files')}
                  />
                )}

                {/* 12. REAL WORKING HI-FI MUSIC PLAYER */}
                {activeApp === 'music' && (
                  <PhoneMusicApp
                    onBack={() => setActiveApp('home')}
                  />
                )}

                {/* 13. REAL INTERACTIVE CUSTOM APPS (Games, Timers, Utilities) */}
                {activeApp !== 'home' && 
                 activeApp !== 'dog_ai' && 
                 activeApp !== 'line' && 
                 activeApp !== 'files' && 
                 activeApp !== 'settings' && 
                 activeApp !== 'google' && 
                 activeApp !== 'chrome' && 
                 activeApp !== 'play_store' && 
                 activeApp !== 'calculator' && 
                 activeApp !== 'camera' && 
                 activeApp !== 'notes' && 
                 activeApp !== 'music' && 
                 activeCustomApp && (
                  <PhoneCustomAppRunner
                    app={activeCustomApp}
                    onBack={() => setActiveApp('home')}
                    onSendToDogAI={prompt => {
                      if (onInjectPromptIntoDogAI) onInjectPromptIntoDogAI(prompt);
                      setActiveApp('dog_ai');
                    }}
                  />
                )}
              </div>

              {/* ===================== ANDROID NAVIGATION BAR (3-BUTTONS) ===================== */}
              <div className="h-11 bg-[#0f1015] border-t border-slate-800/80 px-8 flex items-center justify-around shrink-0 z-40 select-none">
                {/* Back Button */}
                <button
                  onClick={() => {
                    if (activeApp !== 'home') {
                      setActiveApp('home');
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-white transition flex items-center justify-center cursor-pointer active:scale-90"
                  title="返回上一層 (Back)"
                >
                  <Triangle className="w-4 h-4 -rotate-90 fill-slate-400/40 hover:fill-white" />
                </button>

                {/* Home Button */}
                <button
                  onClick={() => setActiveApp('home')}
                  className={`p-2 transition flex items-center justify-center cursor-pointer active:scale-90 ${
                    activeApp === 'home' ? 'text-amber-400 scale-110' : 'text-slate-400 hover:text-white'
                  }`}
                  title="返回桌面 (Home)"
                >
                  <Circle className={`w-4 h-4 ${activeApp === 'home' ? 'fill-amber-400' : 'fill-slate-400/40 hover:fill-white'}`} />
                </button>

                {/* Recents Multitasking Button */}
                <button
                  onClick={() => setShowRecentsView(!showRecentsView)}
                  className="p-2 text-slate-400 hover:text-white transition flex items-center justify-center cursor-pointer active:scale-90"
                  title="最近執行的應用程式 (Overview / Recents)"
                >
                  <Square className="w-4 h-4 fill-slate-400/40 hover:fill-white" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
