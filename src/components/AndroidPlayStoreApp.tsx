import React, { useState, useEffect } from 'react';
import { PhoneAppId, InstalledAppItem } from '../types';
import { PhoneSystemManager } from '../services/phoneSystemManager';
import { 
  ArrowLeft, 
  Search, 
  Star, 
  Download, 
  Check, 
  ShieldCheck, 
  Briefcase, 
  Trash2, 
  RotateCcw, 
  Sparkles, 
  X, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Layers,
  Filter
} from 'lucide-react';

interface AndroidPlayStoreAppProps {
  onBack: () => void;
  onOpenApp?: (appId: PhoneAppId) => void;
}

export const AndroidPlayStoreApp: React.FC<AndroidPlayStoreAppProps> = ({ onBack, onOpenApp }) => {
  const manager = PhoneSystemManager.getInstance();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isWorkProfileMode, setIsWorkProfileMode] = useState<boolean>(false);
  const [storeApps, setStoreApps] = useState<InstalledAppItem[]>([]);
  const [installedApps, setInstalledApps] = useState<InstalledAppItem[]>(() => manager.getInstalledApps());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedApp, setSelectedApp] = useState<InstalledAppItem | null>(null);

  // Install State Tracker: appId -> { status: 'idle' | 'pending' | 'downloading' | 'verifying' | 'installing' | 'done', progress: number }
  const [installProgress, setInstallProgress] = useState<Record<string, { status: string; progress: number }>>({});

  const refreshInstalledApps = () => {
    setInstalledApps(manager.getInstalledApps());
  };

  // Fetch apps from server endpoint (/api/play-store/search)
  const fetchPlayStoreApps = async (query = '', category = 'all') => {
    setIsLoading(true);
    try {
      let url = `/api/play-store/search?q=${encodeURIComponent(query)}`;
      if (category && category !== 'all') {
        url += `&category=${encodeURIComponent(category)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.apps)) {
          setStoreApps(data.apps);
        }
      }
    } catch (err) {
      console.warn('Failed to load Google Play apps:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayStoreApps('', activeCategory);
  }, [activeCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPlayStoreApps(searchQuery, activeCategory);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchPlayStoreApps('', activeCategory);
  };

  const handleStartInstall = (app: InstalledAppItem) => {
    const appId = app.id;
    // Step 1: Pending
    setInstallProgress(prev => ({
      ...prev,
      [appId]: { status: 'pending', progress: 5 },
    }));

    // Step 2: Downloading
    setTimeout(() => {
      setInstallProgress(prev => ({
        ...prev,
        [appId]: { status: 'downloading', progress: 35 },
      }));
    }, 400);

    setTimeout(() => {
      setInstallProgress(prev => ({
        ...prev,
        [appId]: { status: 'downloading', progress: 75 },
      }));
    }, 800);

    // Step 3: Google Play Protect scanning
    setTimeout(() => {
      setInstallProgress(prev => ({
        ...prev,
        [appId]: { status: 'verifying', progress: 90 },
      }));
    }, 1200);

    // Step 4: Installing
    setTimeout(() => {
      setInstallProgress(prev => ({
        ...prev,
        [appId]: { status: 'installing', progress: 98 },
      }));
    }, 1600);

    // Step 5: Completed & register with PhoneSystemManager
    setTimeout(() => {
      manager.installApp({
        ...app,
        installedAt: new Date().toISOString().slice(0, 10),
      });
      refreshInstalledApps();
      setInstallProgress(prev => ({
        ...prev,
        [appId]: { status: 'done', progress: 100 },
      }));
    }, 2000);
  };

  const handleUninstall = (appId: string) => {
    if (confirm('確定要從 Android 手機工作系統中卸載此應用程式嗎？')) {
      manager.uninstallApp(appId);
      refreshInstalledApps();
      setInstallProgress(prev => {
        const next = { ...prev };
        delete next[appId];
        return next;
      });
    }
  };

  const isInstalled = (appId: string) => installedApps.some(a => a.id === appId);

  // Filter apps according to Work Profile toggle
  const displayApps = isWorkProfileMode
    ? storeApps.filter(a => a.isWorkProfile || a.category === '商務與工作' || a.category === '實用工具')
    : storeApps;

  return (
    <div className="flex flex-col h-full bg-[#111216] text-white font-sans select-none overflow-hidden relative">
      {/* ===================== TOP GOOGLE PLAY APP BAR ===================== */}
      <div className="p-3 bg-[#181920] border-b border-slate-800 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={onBack} 
            className="p-1 rounded-full hover:bg-slate-800 text-slate-300 transition active:scale-95"
            title="返回桌面"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 font-bold text-sm">
            <span className="text-xl">▶️</span>
            <span className="text-white">Google Play 商店</span>
            <span className="text-[10px] text-cyan-400 font-mono px-1 rounded bg-cyan-950/60 border border-cyan-800/40">
              10,000+ 軟體庫
            </span>
          </div>
        </div>

        {/* Work Profile EMM Switch */}
        <button
          onClick={() => setIsWorkProfileMode(!isWorkProfileMode)}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition ${
            isWorkProfileMode
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
          title="切換 Android Enterprise 工作設定檔應用"
        >
          <Briefcase className="w-3.5 h-3.5 text-amber-300" />
          <span>工作設定檔</span>
        </button>
      </div>

      {/* ===================== GOOGLE PLAY LIVE SEARCH BAR ===================== */}
      <div className="px-3 py-2 bg-[#14151b] border-b border-slate-800/80 shrink-0">
        <form onSubmit={handleSearchSubmit} className="flex items-center bg-[#1e202a] rounded-full px-3 py-1.5 border border-slate-700/80 focus-within:border-cyan-400 transition shadow-inner">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜尋 Google Play 逾萬款應用與遊戲 (例如: Spotify, Slack, 象棋...)"
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 outline-none"
          />
          {searchQuery && (
            <button type="button" onClick={handleClearSearch} className="p-0.5 text-slate-400 hover:text-white mr-1">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="submit"
            className="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition shadow"
          >
            搜尋
          </button>
        </form>
      </div>

      {/* ===================== CATEGORY CHIPS ===================== */}
      <div className="flex border-b border-slate-800 bg-[#16171e] px-3 gap-1.5 overflow-x-auto text-xs shrink-0 py-2 scrollbar-none">
        {[
          { id: 'all', label: '全部推薦' },
          { id: '商務與工作', label: '工作協作 💼' },
          { id: '社群通訊', label: '社群通訊 💬' },
          { id: '影音娛樂', label: '影音音樂 🎧' },
          { id: '實用工具', label: '系統工具 ⚡' },
          { id: '熱門遊戲', label: '遊戲精選 🎮' },
          { id: '教育學習', label: '教育學習 📚' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
            }}
            className={`px-3 py-1 rounded-full font-semibold transition shrink-0 text-xs ${
              activeCategory === cat.id
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800/70 text-slate-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ===================== PLAY PROTECT BANNER ===================== */}
      <div className="bg-[#121b18] border-b border-emerald-950 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-emerald-400 shrink-0">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Play Protect 認證 · 無發現有害應用程式</span>
        </div>
        <span className="text-[10px] text-slate-400">已安裝 ({installedApps.length})</span>
      </div>

      {/* ===================== APPS FEED / CATALOG ===================== */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono">正在向 Google Play 官方索引查詢軟體庫...</p>
          </div>
        ) : displayApps.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <p className="text-sm">未找到符合條件的應用程式</p>
            <button
              onClick={() => handleClearSearch()}
              className="text-xs text-cyan-400 hover:underline"
            >
              重設搜尋關鍵字
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayApps.map(app => {
              const installed = isInstalled(app.id);
              const progress = installProgress[app.id];

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className="p-3.5 rounded-2xl bg-[#181a24] hover:bg-[#1e202d] border border-slate-800/80 cursor-pointer transition flex items-center justify-between group shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                    {/* App Icon */}
                    <div className="w-13 h-13 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden relative shadow">
                      {app.iconUrl ? (
                        <img 
                          src={app.iconUrl} 
                          alt={app.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          onError={e => {
                            // Fallback to emoji
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-2xl">{app.icon}</span>
                      )}
                      {app.isWorkProfile && (
                        <div className="absolute bottom-0 right-0 p-0.5 rounded-tl bg-blue-600 text-white" title="Android Enterprise Work Profile">
                          <Briefcase className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {/* App Metadata */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-xs text-white truncate">{app.name}</h3>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{app.developer || app.subtitle}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                        <span className="flex items-center text-amber-400 font-bold">
                          <Star className="w-2.5 h-2.5 fill-amber-400 mr-0.5" />
                          {app.rating || '4.6'}
                        </span>
                        <span>· {app.size}</span>
                        {app.downloads && <span>· {app.downloads}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Install / Open Button */}
                  <div className="shrink-0" onClick={e => e.stopPropagation()}>
                    {installed ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            if (onOpenApp) onOpenApp(app.id);
                          }}
                          className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
                        >
                          開啟
                        </button>
                        <button
                          onClick={() => handleUninstall(app.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400"
                          title="解除安裝"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : progress && progress.status !== 'done' ? (
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono mb-1">
                          {progress.status === 'pending' && <span>等待中...</span>}
                          {progress.status === 'downloading' && <span>下載中 {progress.progress}%</span>}
                          {progress.status === 'verifying' && <span>Play Protect 掃描中...</span>}
                          {progress.status === 'installing' && <span>正在安裝...</span>}
                        </div>
                        <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                            style={{ width: `${progress.progress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartInstall(app)}
                        className="px-4 py-1.5 rounded-full bg-[#1b2234] hover:bg-emerald-600 hover:text-white text-emerald-400 border border-emerald-500/40 text-xs font-bold transition active:scale-95 shadow"
                      >
                        安裝
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===================== APP DETAILS MODAL ===================== */}
      {selectedApp && (
        <div className="absolute inset-0 z-50 bg-[#0e1017] flex flex-col overflow-y-auto animate-fadeIn select-text">
          {/* Top Bar */}
          <div className="p-3 bg-[#161720] border-b border-slate-800 flex items-center justify-between shrink-0 select-none">
            <button
              onClick={() => setSelectedApp(null)}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-slate-300">應用程式詳細資訊</span>
            <div className="w-6" />
          </div>

          <div className="p-5 space-y-5 flex-1">
            {/* Header info */}
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden shadow-2xl">
                {selectedApp.iconUrl ? (
                  <img src={selectedApp.iconUrl} alt={selectedApp.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">{selectedApp.icon}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-base font-extrabold text-white leading-tight">{selectedApp.name}</h1>
                <p className="text-xs text-emerald-400 font-medium mt-1">{selectedApp.developer}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{selectedApp.category}</p>
                {selectedApp.packageId && (
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">{selectedApp.packageId}</p>
                )}
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 divide-x divide-slate-800 text-center py-2 border-y border-slate-800 text-xs">
              <div>
                <span className="flex items-center justify-center text-amber-400 font-bold">
                  {selectedApp.rating || '4.6'} <Star className="w-3 h-3 fill-amber-400 ml-0.5" />
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                  {selectedApp.ratingCount || '10萬+'} 則評論
                </span>
              </div>
              <div>
                <span className="font-bold text-white">{selectedApp.size}</span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">檔案大小</span>
              </div>
              <div>
                <span className="font-bold text-white">{selectedApp.downloads || '1000萬+'}</span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">次下載</span>
              </div>
            </div>

            {/* Big Install or Open CTA Button */}
            <div>
              {isInstalled(selectedApp.id) ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (onOpenApp) onOpenApp(selectedApp.id);
                      setSelectedApp(null);
                    }}
                    className="flex-1 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl transition active:scale-98"
                  >
                    開啟應用程式
                  </button>
                  <button
                    onClick={() => handleUninstall(selectedApp.id)}
                    className="px-4 py-3 rounded-full bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-300 font-bold text-xs transition"
                  >
                    解除安裝
                  </button>
                </div>
              ) : installProgress[selectedApp.id] && installProgress[selectedApp.id].status !== 'done' ? (
                <div className="space-y-2 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex justify-between text-xs text-emerald-400 font-mono">
                    <span>{installProgress[selectedApp.id].status}</span>
                    <span>{installProgress[selectedApp.id].progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                      style={{ width: `${installProgress[selectedApp.id].progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleStartInstall(selectedApp)}
                  className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl transition active:scale-98 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>立即安裝 (Install)</span>
                </button>
              )}
            </div>

            {/* Screenshots Gallery if available */}
            {selectedApp.screenshots && selectedApp.screenshots.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300">螢幕截圖</h4>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {selectedApp.screenshots.map((s, idx) => (
                    <img key={idx} src={s} alt="screenshot" className="h-44 rounded-xl border border-slate-800 object-cover shrink-0" />
                  ))}
                </div>
              </div>
            )}

            {/* About this app */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300">關於此應用程式</h4>
              <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                {selectedApp.description}
              </p>
            </div>

            {/* Play Protect and Enterprise Safety verification card */}
            <div className="p-3.5 rounded-2xl bg-[#141820] border border-emerald-900/60 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Google Play Protect 官方安全驗證</span>
              </div>
              <p className="text-[11px] text-slate-400">
                此應用程式已通過 Google Play Protect 深度病毒、惡意軟體及權限審查，且完全相容於 Android 15 Enterprise Work Profile。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
