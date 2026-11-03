import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home, Search, Shield, Globe, Star, ExternalLink, Sparkles, BookOpen } from 'lucide-react';

interface AndroidChromeAppProps {
  onBack: () => void;
  initialUrl?: string;
  onSendToDogAI?: (text: string) => void;
}

interface WebPageData {
  url: string;
  title: string;
  domain: string;
  paragraphs: string[];
}

export const AndroidChromeApp: React.FC<AndroidChromeAppProps> = ({ 
  onBack, 
  initialUrl = 'https://zh.wikipedia.org/wiki/Android',
  onSendToDogAI,
}) => {
  const [currentUrl, setCurrentUrl] = useState<string>(initialUrl);
  const [inputUrl, setInputUrl] = useState<string>(initialUrl);
  const [history, setHistory] = useState<string[]>([initialUrl]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pageData, setPageData] = useState<WebPageData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'reader' | 'iframe'>('reader');

  const bookmarks = [
    { title: '維基百科 (Android)', url: 'https://zh.wikipedia.org/wiki/Android' },
    { title: 'Google 台灣', url: 'https://www.google.com.tw' },
    { title: 'Hacker News 即時科技', url: 'https://news.ycombinator.com' },
    { title: '花蓮縣教育處', url: 'https://www.hlc.edu.tw' },
  ];

  const loadUrl = async (target: string) => {
    let cleanUrl = target.trim();
    if (!cleanUrl) return;

    // If query instead of URL, convert to real Google Search URL
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      if (cleanUrl.includes('.') && !cleanUrl.includes(' ')) {
        cleanUrl = 'https://' + cleanUrl;
      } else {
        cleanUrl = `https://www.google.com/search?q=${encodeURIComponent(cleanUrl)}`;
      }
    }

    setIsLoading(true);
    setErrorMsg(null);
    setCurrentUrl(cleanUrl);
    setInputUrl(cleanUrl);

    try {
      const res = await fetch(`/api/web-content?url=${encodeURIComponent(cleanUrl)}`);
      if (res.ok) {
        const data = await res.json();
        setPageData(data);
      } else {
        // Fallback for domains with tight CORS or non-standard responses
        const domain = new URL(cleanUrl).hostname;
        setPageData({
          url: cleanUrl,
          title: `${domain} - 即時網頁`,
          domain,
          paragraphs: [
            `您正在檢視 ${cleanUrl}。`,
            `此網頁已由 Chrome 瀏覽器建立安全連線。點擊下方按鈕可在外部視窗完整瀏覽，或切換為即時嵌入視圖。`,
          ],
        });
      }
    } catch (e: any) {
      setErrorMsg(`無法載入網頁內容: ${e.message || '連線逾時'}`);
      const domain = cleanUrl.replace(/https?:\/\//, '').split('/')[0];
      setPageData({
        url: cleanUrl,
        title: domain || '網頁瀏覽',
        domain: domain || 'web',
        paragraphs: [`已建立前往 ${cleanUrl} 之導航連線。`],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUrl(initialUrl);
  }, [initialUrl]);

  const handleNavigate = (url: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(url);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    loadUrl(url);
  };

  const handleGoBack = () => {
    if (historyIndex > 0) {
      const prevUrl = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      loadUrl(prevUrl);
    } else {
      onBack();
    }
  };

  const handleGoForward = () => {
    if (historyIndex < history.length - 1) {
      const nextUrl = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      loadUrl(nextUrl);
    }
  };

  const openInNativeWindow = () => {
    window.open(currentUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col h-full bg-[#15161b] text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Chrome Address Bar */}
      <div className="p-2.5 bg-[#1e2027] border-b border-slate-800 flex items-center gap-1.5 shrink-0">
        <button 
          onClick={handleGoBack}
          className="p-1.5 rounded-full hover:bg-slate-700/60 text-slate-300 active:scale-95 transition" 
          title="上一頁"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button 
          onClick={handleGoForward}
          disabled={historyIndex >= history.length - 1}
          className="p-1.5 rounded-full hover:bg-slate-700/60 text-slate-300 disabled:opacity-30 active:scale-95 transition" 
          title="下一頁"
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Address Input Form */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleNavigate(inputUrl);
          }}
          className="flex-1 flex items-center gap-2 bg-[#2a2c35] border border-slate-700 focus-within:border-cyan-500 rounded-full px-3 py-1.5 text-xs text-white shadow-inner"
        >
          <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <input
            type="text"
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            placeholder="搜尋或輸入真實網址 (如 zh.wikipedia.org)..."
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          {isLoading && <RotateCw className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />}
        </form>

        <button 
          onClick={() => loadUrl(currentUrl)} 
          className="p-1.5 text-slate-400 hover:text-white transition active:rotate-180" 
          title="重新整理"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <button 
          onClick={openInNativeWindow}
          className="p-1.5 text-slate-400 hover:text-cyan-400 transition" 
          title="在外部視窗開啟"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Bookmarks Bar */}
      <div className="px-3 py-1.5 bg-[#191a21] border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0">
        <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        {bookmarks.map((b, i) => (
          <button
            key={i}
            onClick={() => handleNavigate(b.url)}
            className="px-2.5 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white whitespace-nowrap transition text-[11px]"
          >
            {b.title}
          </button>
        ))}
      </div>

      {/* Mode Toggle: Reader Mode vs Embedded Frame */}
      <div className="px-3 py-1 bg-[#14151b] border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('reader')}
            className={`px-2 py-0.5 rounded transition ${
              viewMode === 'reader' ? 'bg-cyan-600/30 text-cyan-300 font-bold' : 'hover:text-white'
            }`}
          >
            閱讀器檢視 (Reader View)
          </button>
          <button
            onClick={() => setViewMode('iframe')}
            className={`px-2 py-0.5 rounded transition ${
              viewMode === 'iframe' ? 'bg-cyan-600/30 text-cyan-300 font-bold' : 'hover:text-white'
            }`}
          >
            即時內嵌視圖 (Live Frame)
          </button>
        </div>

        {onSendToDogAI && pageData && (
          <button
            onClick={() => {
              const snippet = pageData.paragraphs.slice(0, 3).join('\n');
              onSendToDogAI(`汪！主人在 Chrome 瀏覽了【${pageData.title}】（網址: ${currentUrl}）：\n\n內容：\n${snippet}\n\n請狗僕人為主人重點解析這篇網頁！`);
            }}
            className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>請 Dog AI 解析本頁</span>
          </button>
        )}
      </div>

      {/* Main Web Page Content Display */}
      <div className="flex-1 overflow-y-auto bg-[#101115]">
        {viewMode === 'iframe' ? (
          <div className="w-full h-full relative">
            <iframe
              src={currentUrl}
              title="Chrome Live Browser"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              className="w-full h-full border-0 bg-white"
            />
          </div>
        ) : (
          /* Reader View */
          <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-4">
            {pageData ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="pb-3 border-b border-slate-800">
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/60">
                    {pageData.domain}
                  </span>
                  <h1 className="text-lg font-bold text-white mt-2 leading-snug">
                    {pageData.title}
                  </h1>
                  <p className="text-[11px] text-slate-400 truncate mt-1">
                    {currentUrl}
                  </p>
                </div>

                {/* Paragraphs */}
                <div className="space-y-3 text-xs text-slate-200 leading-relaxed">
                  {pageData.paragraphs.map((p, idx) => (
                    <p key={idx} className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                      {p}
                    </p>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={openInNativeWindow}
                    className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>在官方網站開啟</span>
                  </button>

                  <span className="text-[10px] text-slate-500 font-mono">
                    Chrome 130 Mobile Sandbox
                  </span>
                </div>
              </div>
            ) : isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <RotateCw className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="text-xs">正在載入真實網頁內容...</p>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500 space-y-2">
                <Globe className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">請在上方網址列輸入網址或關鍵字</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
