import React, { useState } from 'react';
import { ArrowLeft, Search, Mic, Camera, Globe, ExternalLink, ArrowRight, RotateCw, Sparkles, Check, ChevronRight } from 'lucide-react';

interface AndroidGoogleAppProps {
  onBack: () => void;
  onSearchWithDogAI?: (query: string) => void;
  onOpenInChrome?: (url: string) => void;
}

interface RealSearchResult {
  title: string;
  link: string;
  snippet: string;
  domain?: string;
}

export const AndroidGoogleApp: React.FC<AndroidGoogleAppProps> = ({ 
  onBack, 
  onSearchWithDogAI,
  onOpenInChrome,
}) => {
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([
    '台灣今日即時新聞',
    'Android 15 新功能',
    'Dog AI',
    '維基百科 世界地圖',
  ]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [liveSummary, setLiveSummary] = useState<string | null>(null);
  const [liveResults, setLiveResults] = useState<RealSearchResult[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const executeRealGoogleSearch = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    setIsSearchingLive(true);
    setSearchError(null);
    setQuery(trimmed);

    // Update search history
    setSearchHistory(prev => [trimmed, ...prev.filter(item => item !== trimmed).slice(0, 5)]);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      });

      if (!res.ok) {
        throw new Error(`搜尋請求失敗 (${res.status})`);
      }

      const data = await res.json();
      setLiveSummary(data.summary || null);
      setLiveResults(data.results || []);
    } catch (err: any) {
      console.warn('Real search error:', err);
      setSearchError('網路搜尋逾時，為您提供官方 Google 搜尋直達連結。');
      setLiveResults([
        {
          title: `${trimmed} - Google 官方即時搜尋`,
          link: `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`,
          snippet: `在 Google 官方搜尋引擎查看「${trimmed}」的所有最新網頁、圖片與最新資訊。`,
          domain: 'google.com',
        },
        {
          title: `${trimmed} - 維基百科 (Wikipedia)`,
          link: `https://zh.wikipedia.org/wiki/${encodeURIComponent(trimmed)}`,
          snippet: `查詢維基百科關於「${trimmed}」的完整歷史與知識庫。`,
          domain: 'wikipedia.org',
        },
      ]);
    } finally {
      setIsSearchingLive(false);
    }
  };

  const handleOpenLink = (url: string) => {
    if (onOpenInChrome) {
      onOpenInChrome(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#17181c] text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1e1f25] border-b border-slate-800 shrink-0">
        <button onClick={onBack} className="p-1 rounded-full hover:bg-slate-700/60 text-slate-300">
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Real Google Wordmark Logo */}
        <div 
          className="flex items-center gap-0.5 font-bold text-lg tracking-tight cursor-pointer" 
          onClick={() => {
            setLiveResults(null);
            setLiveSummary(null);
            setQuery('');
          }}
        >
          <span className="text-blue-500 font-extrabold text-xl">G</span>
          <span className="text-red-500 font-extrabold text-xl">o</span>
          <span className="text-amber-500 font-extrabold text-xl">o</span>
          <span className="text-blue-500 font-extrabold text-xl">g</span>
          <span className="text-emerald-500 font-extrabold text-xl">l</span>
          <span className="text-red-500 font-extrabold text-xl">e</span>
          <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-mono font-semibold">
            REAL ENGINE
          </span>
        </div>

        <button 
          onClick={() => handleOpenLink(query ? `https://www.google.com/search?q=${encodeURIComponent(query)}` : 'https://www.google.com')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition"
          title="在外部瀏覽器開啟 Google 官網"
        >
          <span>Google 官網</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        {/* Search Bar Input */}
        <div className="w-full max-w-lg mb-4">
          <form
            onSubmit={e => {
              e.preventDefault();
              executeRealGoogleSearch(query);
            }}
            className="flex items-center bg-[#242630] border border-slate-700 hover:border-blue-500 focus-within:border-blue-500 rounded-full px-4 py-2.5 shadow-xl transition-all"
          >
            <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="在 Google 搜尋或輸入網址..."
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-xs text-slate-500 hover:text-white mr-2"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              disabled={isSearchingLive || !query.trim()}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-full text-xs font-bold transition flex items-center gap-1 shrink-0"
            >
              {isSearchingLive ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>搜尋</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Search Results View */}
        {liveResults !== null ? (
          <div className="w-full max-w-lg space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
              <span className="font-mono text-[11px] text-cyan-400">
                即時真實搜尋結果：約 {liveResults.length} 筆
              </span>
              <button
                onClick={() => {
                  setLiveResults(null);
                  setLiveSummary(null);
                }}
                className="text-xs text-blue-400 hover:underline"
              >
                返回搜尋主頁
              </button>
            </div>

            {/* AI Grounded Summary */}
            {liveSummary && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/30 text-xs text-slate-200 leading-relaxed shadow-lg space-y-1.5">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Google 智慧摘要 (AI Overview)</span>
                </div>
                <p className="whitespace-pre-line text-slate-300">{liveSummary}</p>
              </div>
            )}

            {/* Result Cards */}
            <div className="space-y-3">
              {liveResults.map((result, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#1d1f27] border border-slate-800 hover:border-slate-700 transition space-y-1.5 shadow-md group"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="truncate max-w-[220px] text-cyan-400">
                      {result.domain || 'google.com'}
                    </span>
                    <span className="text-[10px] text-slate-500">即時網頁</span>
                  </div>

                  <h3
                    onClick={() => handleOpenLink(result.link)}
                    className="text-sm font-bold text-blue-400 group-hover:text-blue-300 hover:underline cursor-pointer transition leading-snug"
                  >
                    {result.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {result.snippet}
                  </p>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenLink(result.link)}
                      className="px-3 py-1 rounded-full bg-blue-600/30 hover:bg-blue-600/60 text-blue-300 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>在 Chrome 瀏覽器開啟</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    {onSearchWithDogAI && (
                      <button
                        onClick={() => onSearchWithDogAI(`請狗僕人為主人解讀這篇 Google 搜尋結果：【${result.title}】\n網址：${result.link}\n內容摘要：${result.snippet}`)}
                        className="px-3 py-1 rounded-full bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <span>🐶 請狗僕人解讀</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Default Google Home Screen */
          <div className="w-full max-w-lg space-y-6 text-center pt-4">
            {/* Quick Filter Categories */}
            <div className="flex justify-center gap-2 text-xs">
              {['全部網頁', '圖片', '新聞', '財經', '學術'].map((tab, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const currentQ = query || '熱門科技新聞';
                    executeRealGoogleSearch(currentQ);
                  }}
                  className={`px-3 py-1.5 rounded-full font-medium transition ${
                    idx === 0 ? 'bg-blue-600 text-white' : 'bg-[#22242c] text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Quick Search Chips */}
            <div className="text-left space-y-2">
              <span className="text-xs text-slate-400 font-semibold px-1">熱門搜尋與歷史探索：</span>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => executeRealGoogleSearch(item)}
                    className="px-3 py-1.5 rounded-xl bg-[#20222a] border border-slate-800 hover:border-blue-500/60 text-xs text-slate-300 hover:text-white transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Search className="w-3 h-3 text-slate-500" />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Real Search Engine Notice */}
            <div className="p-4 rounded-2xl bg-[#1b1c23] border border-slate-800 text-left space-y-2 text-xs text-slate-300 shadow-lg">
              <div className="flex items-center gap-2 font-bold text-white text-xs">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>真實網路搜尋核心 (Real Web Grounding)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                本系統串接即時 Google 搜尋與全球公開網路索引，輸入任何最新時事、人名、公司、技術或百科問題，皆會即時檢索真實網際網路並提供即時摘要。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
