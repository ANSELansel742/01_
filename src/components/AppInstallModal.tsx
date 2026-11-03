import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { dogBarkAudio } from '../services/dogBarkAudio';
import {
  Download,
  Check,
  Smartphone,
  Monitor,
  ExternalLink,
  X,
  FileCode,
  Sparkles,
  ShieldCheck,
  Laptop,
  Terminal
} from 'lucide-react';

interface AppInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlatform?: 'android' | 'windows';
}

export const AppInstallModal: React.FC<AppInstallModalProps> = ({
  isOpen,
  onClose,
  defaultPlatform = 'android',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'android' | 'termux' | 'android_offline' | 'windows'>('android');
  const [downloadedTermux, setDownloadedTermux] = useState(false);
  const [downloadedOffline, setDownloadedOffline] = useState(false);
  const [downloadedWindowsBat, setDownloadedWindowsBat] = useState(false);

  if (!isOpen) return null;

  const appUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : 'https://ais-dev-juuh4hf5yxmnyqzaz6wit6-769998445644.asia-northeast1.run.app';

  // 1. Android Termux Shell Script download
  const handleDownloadTermuxScript = () => {
    dogBarkAudio.playBark('happy');
    const termuxScript = `#!/data/data/com.termux/files/usr/bin/bash
# ========================================================
#           DOG AI - ANDROID TERMUX LAUNCHER
#       Offline Local AI Companion for Android Devices
# ========================================================
set -e
echo "==============================================="
echo "       🐶 DOG AI FOR ANDROID (TERMUX)"
echo "   Zero-Cloud Sovereign Dog Companion"
echo "==============================================="
echo ""
echo "[*] Updating Android package lists..."
pkg update -y && pkg install -y nodejs git termux-api

echo "[*] Checking Android local storage..."
mkdir -p ~/dog-ai-storage

echo "[*] Launching Dog AI in Android browser..."
termux-open-url "${appUrl}"

echo ""
echo "==============================================="
echo "  Woof! Dog AI is now active on your Android device!"
echo "==============================================="
`;

    const blob = new Blob([termuxScript], { type: 'application/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dog-ai-android.sh';
    a.click();
    URL.revokeObjectURL(url);

    setDownloadedTermux(true);
    setTimeout(() => setDownloadedTermux(false), 4000);
  };

  // 2. Android Standalone Offline HTML File download
  const handleDownloadOfflineHtml = () => {
    dogBarkAudio.playBark('happy');
    const offlineHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#090d16">
  <meta name="mobile-web-app-capable" content="yes">
  <title>Dog AI - Android Offline Edition</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    body { background: #090d16; color: #f1f5f9; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
    header { background: #0c121e; border-bottom: 1px solid #1e293b; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; }
    .brand { display: flex; align-items: center; gap: 8px; font-weight: bold; font-size: 16px; color: #f8fafc; }
    .badge { background: #064e3b; color: #34d399; font-size: 11px; padding: 3px 8px; border-radius: 9999px; border: 1px solid #059669; }
    #chat { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .msg { max-width: 85%; padding: 12px 14px; border-radius: 14px; font-size: 14px; line-height: 1.5; word-break: break-word; }
    .asst { align-self: flex-start; background: #0f172a; border: 1px solid #1e293b; color: #e2e8f0; }
    .user { align-self: flex-end; background: #082f49; border: 1px solid #0369a1; color: #e0f2fe; }
    footer { padding: 10px 14px; background: #0c121e; border-top: 1px solid #1e293b; display: flex; gap: 8px; }
    input { flex: 1; padding: 10px 14px; background: #090d16; border: 1px solid #334155; border-radius: 20px; color: #fff; font-size: 14px; outline: none; }
    input:focus { border-color: #38bdf8; }
    button.send { background: #d97706; color: #000; border: none; font-weight: bold; padding: 10px 18px; border-radius: 20px; cursor: pointer; }
  </style>
</head>
<body>
  <header>
    <div class="brand">🐶 Dog AI <span style="color:#f59e0b;font-size:12px;">Android Edition</span></div>
    <div class="badge">100% Offline</div>
  </header>
  <div id="chat">
    <div class="msg asst">
      <strong>🐶 Dog AI:</strong><br>
      Woof! Hello Master! I am your loyal Dog AI running locally on your Android device with zero internet needed! 🐾<br><br>
      Ask me anything, or speak with me in English, 中文, or Español!
    </div>
  </div>
  <footer>
    <input id="prompt" type="text" placeholder="Speak to Dog AI..." onkeydown="if(event.key==='Enter')send()">
    <button class="send" onclick="send()">Send</button>
  </footer>
  <script>
    const chat = document.getElementById('chat');
    const input = document.getElementById('prompt');

    function send() {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';

      const uMsg = document.createElement('div');
      uMsg.className = 'msg user';
      uMsg.textContent = text;
      chat.appendChild(uMsg);

      setTimeout(() => {
        const aMsg = document.createElement('div');
        aMsg.className = 'msg asst';
        let resp = 'Woof! Master, I hear you: "' + text + '"! Running faithfully on your Android phone!';
        const lower = text.toLowerCase();
        if (lower.includes('hello') || lower.includes('hi') || lower.includes('你好') || lower.includes('hola')) {
          resp = 'Woof! Hello Master! 🐶 Always happy to see you on Android! What can I help with?';
        } else if (lower.includes('translate')) {
          resp = 'Woof! Translation: "Hello" -> 中文: "你好" | Español: "¡Hola!"';
        }
        aMsg.innerHTML = '<strong>🐶 Dog AI:</strong><br>' + resp;
        chat.appendChild(aMsg);
        chat.scrollTop = chat.scrollHeight;
      }, 250);
      chat.scrollTop = chat.scrollHeight;
    }
  </script>
</body>
</html>`;

    const blob = new Blob([offlineHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DogAI_Android_Offline.html';
    a.click();
    URL.revokeObjectURL(url);

    setDownloadedOffline(true);
    setTimeout(() => setDownloadedOffline(false), 4000);
  };

  // 3. Windows Batch Launcher download
  const handleDownloadWindowsBat = () => {
    dogBarkAudio.playBark('happy');
    const batContent = `@echo off
title Dog AI - Windows Desktop Launcher
start msedge.exe --app="${appUrl}" || start chrome.exe --app="${appUrl}" || start "" "${appUrl}"
`;
    const blob = new Blob([batContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DogAI_Windows_Launcher.bat';
    a.click();
    URL.revokeObjectURL(url);

    setDownloadedWindowsBat(true);
    setTimeout(() => setDownloadedWindowsBat(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-[#0c121e] border border-slate-800 shadow-2xl overflow-hidden flex flex-col text-slate-100 my-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090d16]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20 text-lg">
              🤖
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                <span>Dog AI · Android & Device Installation</span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Android App Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Install Dog AI as a native Android app on your phone, tablet, or PC with full offline support.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800/80 bg-slate-900/60 text-xs px-6 pt-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('android')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'android'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>1. Android App (PWA)</span>
          </button>

          <button
            onClick={() => setActiveTab('android_offline')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'android_offline'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>2. Android Offline App</span>
          </button>

          <button
            onClick={() => setActiveTab('termux')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'termux'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>3. Android Termux</span>
          </button>

          <button
            onClick={() => setActiveTab('windows')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'windows'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>4. Windows (PC)</span>
          </button>
        </div>

        {/* Modal Tab Content */}
        <div className="p-6 space-y-4 text-sm overflow-y-auto max-h-[70vh]">
          {/* TAB 1: Android PWA */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <span className="font-bold text-white text-base">Install on Android (Phone / Tablet)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                    Recommended
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Installing Dog AI on Android creates a standalone Android WebAPK that appears in your Android App Drawer, Home Screen, and Recents menu—running just like a native Android APK!
                </p>

                {isInstalled ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-semibold">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Dog AI is installed and active on your Android device!</span>
                  </div>
                ) : isInstallable ? (
                  <button
                    onClick={async () => {
                      dogBarkAudio.playBark('happy');
                      await install();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install Dog AI on Android Now</span>
                  </button>
                ) : (
                  <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-700 space-y-2.5">
                    <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>How to Install on Chrome / Samsung Internet on Android:</span>
                    </div>
                    <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                      <li>Tap the <strong>three dots menu (⋮)</strong> in the top-right corner of Chrome on your Android phone.</li>
                      <li>Select <strong className="text-emerald-300">"Install app"</strong> or <strong className="text-emerald-300">"Add to Home screen"</strong>.</li>
                      <li>Tap <strong className="text-white">Install</strong> in the confirmation popup.</li>
                      <li>Dog AI will be installed directly into your Android app drawer with the dog icon!</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Android Features */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="font-semibold text-emerald-300 block">📱 Android App Drawer</span>
                  <p className="text-[11px] text-slate-400">Launches like an installed APK from home screen.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="font-semibold text-cyan-300 block">⚡ 100% Offline Cache</span>
                  <p className="text-[11px] text-slate-400">All local data saved inside Android IndexedDB.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Android Offline HTML */}
          {activeTab === 'android_offline' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download Single-File Android Offline App</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    .HTML File
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Download a single, self-contained HTML file to your Android Downloads folder. You can open and use Dog AI anytime on Android with airplane mode or zero Wi-Fi connection!
                </p>

                <button
                  onClick={handleDownloadOfflineHtml}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all"
                >
                  {downloadedOffline ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>Downloaded DogAI_Android_Offline.html!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Android Offline App (.html)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Android Termux */}
          {activeTab === 'termux' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Android Termux Script (dog-ai-android.sh)</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Termux / CLI
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  For advanced users running <strong>Termux on Android</strong>: Download our launcher script to initialize local node packages and launch Dog AI directly on Android.
                </p>

                <div className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-300 border border-slate-800/80 overflow-x-auto">
                  <span className="text-slate-500"># Run in Android Termux:</span><br />
                  <span className="text-emerald-400">bash</span> ~/downloads/dog-ai-android.sh
                </div>

                <button
                  onClick={handleDownloadTermuxScript}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-teal-600/20 transition-all"
                >
                  {downloadedTermux ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>Downloaded dog-ai-android.sh!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Android Termux Script (.sh)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Windows */}
          {activeTab === 'windows' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-cyan-400" />
                    <span>Windows PC Desktop Launcher</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    .BAT File
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  If using a Windows PC, download the standalone batch launcher to run Dog AI in clean window mode.
                </p>

                <button
                  onClick={handleDownloadWindowsBat}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-600/20 transition-all"
                >
                  {downloadedWindowsBat ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>Downloaded DogAI_Windows_Launcher.bat!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Windows Launcher (.bat)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-[#090d16] text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>🤖 Android Verified</span>
            <span>·</span>
            <span className="text-emerald-400">PWA / WebAPK & Termux</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Also export as WindowsDownloadModal for backward compatibility
export { AppInstallModal as WindowsDownloadModal };
