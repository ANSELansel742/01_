import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, Disc3, Radio, Sparkles } from 'lucide-react';

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationSeconds: number;
  coverEmoji: string;
  coverBg: string;
  notes: number[]; // frequencies for melodic playback
}

const TRACKS: MusicTrack[] = [
  {
    id: 'track_1',
    title: '汪星療癒日光 (Dog Servant Lofi Chill)',
    artist: 'Dog AI & Orca Mini',
    album: 'Sovereign Pets Vol. 1',
    durationSeconds: 194,
    coverEmoji: '🐶',
    coverBg: 'from-amber-500 via-orange-600 to-amber-700',
    notes: [261.63, 329.63, 392.00, 523.25, 440.00, 392.00, 329.63, 293.66],
  },
  {
    id: 'track_2',
    title: '安卓 15 賽博夜律 (Android 15 Cyber Beat)',
    artist: 'ARP-1 Defense Core',
    album: 'Neural Matrix OST',
    durationSeconds: 218,
    coverEmoji: '📱',
    coverBg: 'from-cyan-500 via-blue-600 to-indigo-800',
    notes: [220.00, 261.63, 329.63, 440.00, 329.63, 261.63, 196.00, 220.00],
  },
  {
    id: 'track_3',
    title: '主人的專注心流 (Deep Work Symphony)',
    artist: 'Master swhau & Sovereign AI',
    album: 'Focus Workspace',
    durationSeconds: 245,
    coverEmoji: '💻',
    coverBg: 'from-emerald-500 via-teal-600 to-slate-900',
    notes: [174.61, 220.00, 261.63, 349.23, 261.63, 220.00, 174.61, 196.00],
  },
  {
    id: 'track_4',
    title: '離線星空微風 (Offline Sovereign Ambient)',
    artist: 'Offline Neural Sanctuary',
    album: 'Zero Telemetry Chill',
    durationSeconds: 180,
    coverEmoji: '🌌',
    coverBg: 'from-purple-600 via-indigo-700 to-slate-950',
    notes: [196.00, 246.94, 293.66, 392.00, 293.66, 246.94, 196.00, 164.81],
  },
];

interface PhoneMusicAppProps {
  onBack: () => void;
}

export const PhoneMusicApp: React.FC<PhoneMusicAppProps> = ({ onBack }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(75);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<any>(null);
  const synthTimerRef = useRef<any>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  // Initialize Web Audio synthesizer for offline ambient audio
  const playSynthesizedMelody = (freq: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const effectiveVol = isMuted ? 0 : (volume / 100) * 0.15;
      gain.gain.setValueAtTime(effectiveVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.85);
    } catch {
      // Browser audio restriction
    }
  };

  useEffect(() => {
    if (isPlaying) {
      let noteStep = 0;
      synthTimerRef.current = setInterval(() => {
        const notes = currentTrack.notes;
        const note = notes[noteStep % notes.length];
        playSynthesizedMelody(note);
        noteStep++;
      }, 700);

      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= currentTrack.durationSeconds) {
            handleNextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (synthTimerRef.current) clearInterval(synthTimerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (synthTimerRef.current) clearInterval(synthTimerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentTrackIndex, volume, isMuted]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    setCurrentTrackIndex(prev => (prev + 1) % TRACKS.length);
    setCurrentTime(0);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex(prev => (prev - 1 + TRACKS.length) % TRACKS.length);
    setCurrentTime(0);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = Math.floor(sec % 60);
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#0e0f14] text-white select-none overflow-hidden font-sans">
      {/* Top Bar */}
      <div className="p-3 bg-[#15161d] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="p-1 rounded-full hover:bg-slate-700/60 text-slate-300 transition active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 font-bold text-sm">
            <span className="text-purple-400">🎵</span>
            <span>Hi-Fi 音樂播放器</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/60">
          <Radio className="w-3 h-3 animate-pulse" />
          <span>FLAC 24-bit 96kHz</span>
        </div>
      </div>

      {/* Main Track Artwork & Info */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
        {/* Album Vinyl / Art Frame */}
        <div className="relative mb-6">
          <div
            className={`w-48 h-48 rounded-3xl bg-gradient-to-tr ${currentTrack.coverBg} flex items-center justify-center text-7xl shadow-2xl transition-transform duration-700 ${
              isPlaying ? 'scale-105 shadow-purple-500/20' : 'scale-100'
            }`}
          >
            <span className={isPlaying ? 'animate-pulse' : ''}>{currentTrack.coverEmoji}</span>
          </div>

          {/* Rotating Vinyl Badge */}
          <div
            className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-black/80 border-2 border-white/20 flex items-center justify-center text-white ${
              isPlaying ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '6s' }}
          >
            <Disc3 className="w-6 h-6 text-purple-400" />
          </div>
        </div>

        {/* Track Title and Artist */}
        <div className="max-w-xs space-y-1">
          <h2 className="text-base font-bold text-white tracking-tight line-clamp-1">
            {currentTrack.title}
          </h2>
          <p className="text-xs text-slate-400 font-medium">{currentTrack.artist}</p>
          <p className="text-[10px] text-purple-400 font-mono mt-0.5">{currentTrack.album}</p>
        </div>

        {/* Animated Audio Spectrum Bars (when playing) */}
        <div className="flex items-end justify-center gap-1 h-8 mt-5">
          {[40, 75, 90, 60, 100, 80, 50, 85, 65, 95, 45, 70].map((h, idx) => (
            <div
              key={idx}
              className={`w-1 rounded-full bg-gradient-to-t from-purple-500 to-cyan-400 transition-all duration-300 ${
                isPlaying ? 'opacity-100' : 'opacity-20 !h-1.5'
              }`}
              style={{
                height: isPlaying ? `${Math.max(15, (h * ((idx % 3) + 1)) % 100)}%` : '6px',
              }}
            />
          ))}
        </div>
      </div>

      {/* Scrubber & Controls Panel */}
      <div className="p-5 bg-[#14151e] border-t border-slate-800 space-y-4 shrink-0 pb-6">
        {/* Progress Bar & Timestamps */}
        <div className="space-y-1.5">
          <div className="relative w-full h-1.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{
                width: `${(currentTime / currentTrack.durationSeconds) * 100}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>{formatSeconds(currentTime)}</span>
            <span>{formatSeconds(currentTrack.durationSeconds)}</span>
          </div>
        </div>

        {/* Media Buttons: Prev, Play/Pause, Next */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handlePrevTrack}
            className="p-2 text-slate-400 hover:text-white transition active:scale-90"
            title="上一首"
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </button>

          <button
            onClick={handleTogglePlay}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 active:scale-95 transition"
            title={isPlaying ? '暫停' : '播放'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-white" />
            ) : (
              <Play className="w-6 h-6 fill-white ml-0.5" />
            )}
          </button>

          <button
            onClick={handleNextTrack}
            className="p-2 text-slate-400 hover:text-white transition active:scale-90"
            title="下一首"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>
        </div>

        {/* Volume & Playlist Drawer */}
        <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-slate-400 hover:text-white"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={e => {
                setVolume(Number(e.target.value));
                setIsMuted(false);
              }}
              className="w-20 h-1 bg-slate-800 rounded-lg accent-purple-500 cursor-pointer"
            />
          </div>

          <span className="text-[11px] font-mono text-slate-500">
            曲目 {currentTrackIndex + 1} / {TRACKS.length}
          </span>
        </div>
      </div>
    </div>
  );
};
