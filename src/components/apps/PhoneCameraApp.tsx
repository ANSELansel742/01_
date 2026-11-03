import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, RefreshCw, Zap, Image, Check, Eye, Download, Sparkles, Folder } from 'lucide-react';
import { PhoneSystemManager } from '../../services/phoneSystemManager';

interface PhoneCameraAppProps {
  onBack: () => void;
  onOpenPicturesFolder?: () => void;
  onSendPhotoToDogAI?: (photoName: string, photoDataUrl: string) => void;
}

export const PhoneCameraApp: React.FC<PhoneCameraAppProps> = ({
  onBack,
  onOpenPicturesFolder,
  onSendPhotoToDogAI,
}) => {
  const [hasWebcam, setHasWebcam] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [flashEnabled, setFlashEnabled] = useState<boolean>(false);
  const [gridEnabled, setGridEnabled] = useState<boolean>(false);
  const [simulatedScene, setSimulatedScene] = useState<'dog_park' | 'workspace' | 'document' | 'cyber'>('dog_park');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [lastCapturedPhoto, setLastCapturedPhoto] = useState<{ id: string; name: string; url: string } | null>(null);
  const [capturedCount, setCapturedCount] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize or update camera stream
  useEffect(() => {
    let isMounted = true;

    async function initCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('瀏覽器不支援 WebRTC 攝影機');
        }

        // Stop any existing stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (isMounted) {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
          setHasWebcam(true);
          setWebcamError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setHasWebcam(false);
          setWebcamError(err.message || '無法取得攝影機存取權限，已啟動智慧模擬實景取景器');
        }
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  // Audio effect for camera shutter
  const playShutterSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.09);
    } catch {
      // AudioContext may be restricted
    }
  };

  // Generate SVG simulated snapshot when no physical webcam is available
  const generateSimulatedPhotoData = (scene: string, timestamp: string) => {
    let sceneSvg = '';
    if (scene === 'dog_park') {
      sceneSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#bae6fd"/></linearGradient>
          <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4ade80"/><stop offset="100%" stop-color="#15803d"/></linearGradient>
        </defs>
        <rect width="800" height="360" fill="url(#sky)"/>
        <circle cx="680" cy="100" r="50" fill="#fef08a" opacity="0.9"/>
        <rect y="360" width="800" height="240" fill="url(#grass)"/>
        <circle cx="400" cy="380" r="90" fill="#f59e0b"/>
        <text x="400" y="405" font-size="80" text-anchor="middle">🐶</text>
        <rect x="250" y="500" width="300" height="40" rx="20" fill="#0f172a" opacity="0.85"/>
        <text x="400" y="526" font-family="sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">Dog AI 忠誠狗僕人 · 戶外公園快照</text>
        <text x="400" y="570" font-family="monospace" font-size="13" fill="#ffffff" text-anchor="middle">${timestamp}</text>
      </svg>`;
    } else if (scene === 'workspace') {
      sceneSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <rect width="800" height="600" fill="#1e293b"/>
        <rect x="150" y="120" width="500" height="320" rx="16" fill="#0f172a" stroke="#38bdf8" stroke-width="4"/>
        <text x="400" y="240" font-size="60" text-anchor="middle">💻</text>
        <text x="400" y="320" font-family="sans-serif" font-size="22" font-weight="bold" fill="#f8fafc" text-anchor="middle">Android 15 Sovereign Studio</text>
        <text x="400" y="360" font-family="sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">Dual-LLM Offline Defense Matrix Active</text>
        <text x="400" y="550" font-family="monospace" font-size="13" fill="#64748b" text-anchor="middle">${timestamp}</text>
      </svg>`;
    } else if (scene === 'document') {
      sceneSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <rect width="800" height="600" fill="#334155"/>
        <rect x="200" y="80" width="400" height="440" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <text x="400" y="150" font-family="sans-serif" font-size="20" font-weight="bold" fill="#0f172a" text-anchor="middle">企業機密文件掃描 (ARP-1 審核)</text>
        <line x1="240" y1="180" x2="560" y2="180" stroke="#94a3b8" stroke-width="3"/>
        <line x1="240" y1="210" x2="520" y2="210" stroke="#94a3b8" stroke-width="2"/>
        <line x1="240" y1="240" x2="540" y2="240" stroke="#94a3b8" stroke-width="2"/>
        <line x1="240" y1="270" x2="480" y2="270" stroke="#94a3b8" stroke-width="2"/>
        <rect x="240" y="320" width="320" height="90" rx="6" fill="#fef2f2" stroke="#f87171" stroke-width="1.5"/>
        <text x="400" y="360" font-family="sans-serif" font-size="13" font-weight="bold" fill="#b91c1c" text-anchor="middle">🛡️ 企業保護：嚴禁外洩公司密碼與財務數據</text>
        <text x="400" y="560" font-family="monospace" font-size="12" fill="#94a3b8" text-anchor="middle">${timestamp}</text>
      </svg>`;
    } else {
      sceneSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs>
          <linearGradient id="cyber" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#090d16"/><stop offset="100%" stop-color="#1e1b4b"/></linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#cyber)"/>
        <circle cx="400" cy="300" r="160" fill="none" stroke="#06b6d4" stroke-width="2" stroke-dasharray="10 5"/>
        <text x="400" y="315" font-size="70" text-anchor="middle">🌌</text>
        <text x="400" y="440" font-family="sans-serif" font-size="18" font-weight="bold" fill="#38bdf8" text-anchor="middle">Cyber Sovereign Camera 4K RAW</text>
        <text x="400" y="550" font-family="monospace" font-size="12" fill="#06b6d4" text-anchor="middle">${timestamp}</text>
      </svg>`;
    }
    return `data:image/svg+xml;utf8,${encodeURIComponent(sceneSvg)}`;
  };

  const handleCapturePhoto = () => {
    setIsCapturing(true);
    playShutterSound();

    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').slice(0, 19);
    const photoFileName = `Photo_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}.jpg`;

    let photoDataUrl = '';

    if (hasWebcam && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      }
    }

    if (!photoDataUrl) {
      photoDataUrl = generateSimulatedPhotoData(simulatedScene, timeStr);
    }

    // Save directly to PhoneSystemManager's Pictures folder!
    const manager = PhoneSystemManager.getInstance();
    const savedItem = manager.addFile({
      name: photoFileName,
      category: 'pictures',
      sizeBytes: Math.floor(photoDataUrl.length * 0.75),
      content: photoDataUrl,
      thumbnail: '📸',
      tags: ['Camera', 'Android 15', simulatedScene],
      folder: 'Camera',
    });

    setLastCapturedPhoto({
      id: savedItem.id,
      name: savedItem.name,
      url: photoDataUrl,
    });
    setCapturedCount(prev => prev + 1);

    setTimeout(() => {
      setIsCapturing(false);
    }, 300);
  };

  const handleFlipCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  return (
    <div className="flex flex-col h-full bg-black text-white select-none overflow-hidden font-sans relative">
      {/* Hidden Canvas for Webcam capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Shutter Flash Animation */}
      {isCapturing && (
        <div className="absolute inset-0 bg-white z-50 animate-flash pointer-events-none opacity-80" />
      )}

      {/* Top Camera Controls Bar */}
      <div className="p-3 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={onBack}
            className="p-1 rounded-full hover:bg-white/10 text-white transition active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <Camera className="w-4 h-4 text-rose-500" />
            <span>專業相機 4K</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Flash toggle */}
          <button
            onClick={() => setFlashEnabled(!flashEnabled)}
            className={`p-1.5 rounded-full text-xs transition ${
              flashEnabled ? 'bg-amber-500 text-black font-bold' : 'bg-white/10 text-white/70'
            }`}
            title="閃光燈"
          >
            <Zap className="w-4 h-4" />
          </button>

          {/* Grid toggle */}
          <button
            onClick={() => setGridEnabled(!gridEnabled)}
            className={`px-2 py-1 rounded-full text-[10px] font-mono transition ${
              gridEnabled ? 'bg-cyan-600 text-white' : 'bg-white/10 text-white/70'
            }`}
          >
            九宮格
          </button>

          {/* Flip Camera */}
          <button
            onClick={handleFlipCamera}
            className="p-1.5 rounded-full bg-white/10 text-white/70 hover:text-white transition active:rotate-180"
            title="翻轉前/後鏡頭"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Camera Viewfinder Area */}
      <div className="flex-1 relative bg-neutral-950 flex items-center justify-center overflow-hidden">
        {hasWebcam ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />
        ) : (
          /* Simulated Viewfinder with Scene Select */
          <div className="w-full h-full flex flex-col items-center justify-center relative p-4 text-center">
            {/* Background scene preview */}
            <div className="absolute inset-0 opacity-40 overflow-hidden pointer-events-none flex items-center justify-center">
              {simulatedScene === 'dog_park' && (
                <div className="w-full h-full bg-gradient-to-b from-sky-900/60 to-emerald-950/80 flex flex-col items-center justify-center">
                  <span className="text-8xl animate-bounce">🐶</span>
                  <span className="text-sm text-emerald-400 mt-2 font-semibold">戶外狗公園實景</span>
                </div>
              )}
              {simulatedScene === 'workspace' && (
                <div className="w-full h-full bg-gradient-to-b from-slate-900 to-indigo-950 flex flex-col items-center justify-center">
                  <span className="text-8xl">💻</span>
                  <span className="text-sm text-cyan-400 mt-2 font-semibold">辦公桌主機視角</span>
                </div>
              )}
              {simulatedScene === 'document' && (
                <div className="w-full h-full bg-gradient-to-b from-slate-900 to-rose-950 flex flex-col items-center justify-center">
                  <span className="text-8xl">📄</span>
                  <span className="text-sm text-rose-400 mt-2 font-semibold">文件機密掃描模式</span>
                </div>
              )}
              {simulatedScene === 'cyber' && (
                <div className="w-full h-full bg-gradient-to-b from-black to-purple-950 flex flex-col items-center justify-center">
                  <span className="text-8xl">🌌</span>
                  <span className="text-sm text-purple-400 mt-2 font-semibold">賽博夜景 4K HDR</span>
                </div>
              )}
            </div>

            {/* Notification badge */}
            <div className="z-10 bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 max-w-xs space-y-1.5 shadow-xl">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>取景器實景模式 (Real-time Viewfinder)</span>
              </div>
              <p className="text-[11px] text-slate-300">
                點擊下方切換拍攝場景，按下快門將真實儲存至手機「資料夾 ➜ 圖片」中！
              </p>
              {/* Scene Pills */}
              <div className="flex justify-center gap-1.5 pt-1">
                {(['dog_park', 'workspace', 'document', 'cyber'] as const).map(scene => (
                  <button
                    key={scene}
                    onClick={() => setSimulatedScene(scene)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition ${
                      simulatedScene === scene ? 'bg-rose-600 text-white font-bold' : 'bg-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {scene === 'dog_park' ? '狗公園' : scene === 'workspace' ? '辦公室' : scene === 'document' ? '文件' : '夜景'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Viewfinder Grid Overlay */}
        {gridEnabled && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10 border border-white/10">
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-b border-white/20" />
            <div className="border-r border-white/20" />
            <div className="border-r border-white/20" />
            <div />
          </div>
        )}

        {/* Viewfinder Autofocus Bracket */}
        <div className="absolute w-20 h-20 border-2 border-white/40 rounded-lg pointer-events-none flex items-center justify-center animate-pulse">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
        </div>
      </div>

      {/* Captured Photo Notification / Quick Action Banner */}
      {lastCapturedPhoto && (
        <div className="bg-[#181a20] border-t border-slate-800 p-2.5 flex items-center justify-between gap-3 text-xs z-20">
          <div className="flex items-center gap-2 overflow-hidden">
            <img 
              src={lastCapturedPhoto.url} 
              alt="Snapshot thumbnail" 
              className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0" 
            />
            <div className="truncate">
              <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                <Check className="w-3.5 h-3.5" /> 已存入手機相簿
              </span>
              <p className="text-slate-400 text-[10px] truncate">{lastCapturedPhoto.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenPicturesFolder && (
              <button
                onClick={onOpenPicturesFolder}
                className="px-2.5 py-1 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white text-[11px] font-semibold flex items-center gap-1 transition"
                title="至資料夾檢視"
              >
                <Folder className="w-3 h-3" />
                <span>相簿</span>
              </button>
            )}
            {onSendPhotoToDogAI && (
              <button
                onClick={() => onSendPhotoToDogAI(lastCapturedPhoto.name, lastCapturedPhoto.url)}
                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-semibold flex items-center gap-1 transition"
              >
                <span>🐶 分析</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Shutter & Gallery Bar */}
      <div className="p-4 bg-black/90 backdrop-blur-md flex items-center justify-around z-20 shrink-0">
        {/* Gallery Preview Thumbnail & Import Real Photo */}
        <div className="flex items-center gap-1.5">
          {lastCapturedPhoto ? (
            <button
              onClick={onOpenPicturesFolder}
              className="w-11 h-11 rounded-xl overflow-hidden border-2 border-white/50 active:scale-90 transition shadow-lg"
              title="檢視最近拍攝"
            >
              <img src={lastCapturedPhoto.url} alt="Gallery" className="w-full h-full object-cover" />
            </button>
          ) : (
            <button
              onClick={onOpenPicturesFolder}
              className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
              title="開啟相簿"
            >
              <Image className="w-5 h-5" />
            </button>
          )}

          {/* Import real photo from PC */}
          <label className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer transition" title="從電腦上傳真實相片">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const url = reader.result as string;
                  const manager = PhoneSystemManager.getInstance();
                  const saved = manager.addFile({
                    name: file.name,
                    category: 'pictures',
                    sizeBytes: file.size,
                    content: url,
                    thumbnail: '📸',
                    tags: ['Real Upload', 'Camera'],
                    folder: 'Camera',
                  });
                  setLastCapturedPhoto({
                    id: saved.id,
                    name: saved.name,
                    url,
                  });
                  setCapturedCount(c => c + 1);
                };
                reader.readAsDataURL(file);
                e.target.value = '';
              }}
            />
            <Download className="w-3.5 h-3.5 rotate-180" />
          </label>
        </div>

        {/* Big Shutter Button */}
        <button
          onClick={handleCapturePhoto}
          className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center p-1 hover:scale-105 active:scale-90 transition shadow-2xl"
          title="按下快門拍攝照片"
        >
          <div className="w-full h-full rounded-full bg-white active:bg-rose-500 transition-colors shadow-inner" />
        </button>

        {/* Mode / Count Pill */}
        <div className="w-12 h-12 flex items-center justify-center">
          <span className="text-[11px] font-mono text-slate-400 bg-white/10 px-2 py-1 rounded-full">
            {capturedCount > 0 ? `${capturedCount}張` : '照片'}
          </span>
        </div>
      </div>
    </div>
  );
};
