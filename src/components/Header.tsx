import React from 'react';
import { AppMode, SystemSettings, SupportedLanguage } from '../types';
import { I18N } from '../i18n/translations';
import {
  Smartphone,
  Download,
  Wifi,
  WifiOff,
  Settings as SettingsIcon,
  FileText,
  Languages,
  HardDrive,
  Brain
} from 'lucide-react';

interface HeaderProps {
  mode: AppMode;
  onToggleMode: (mode: AppMode) => void;
  isOnline: boolean;
  settings: SystemSettings;
  onOpenSettings: () => void;
  onOpenDocuments: () => void;
  onOpenTranslator: () => void;
  onOpenTrainingStudio: () => void;
  onOpenDeviceInstall: () => void;
  onLanguageChange: (lang: SupportedLanguage) => void;
  documentsCount: number;
  storageUsedMB: number;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onToggleMode,
  isOnline,
  settings,
  onOpenSettings,
  onOpenDocuments,
  onOpenTranslator,
  onOpenTrainingStudio,
  onOpenDeviceInstall,
  onLanguageChange,
  documentsCount,
  storageUsedMB,
}) => {
  const lang = settings.language || 'en';
  const t = I18N[lang];

  return (
    <header className="flex items-center justify-between gap-2 md:gap-4 px-3 md:px-6 py-2.5 border-b border-slate-800/80 bg-[#090d16]/95 backdrop-blur-md sticky top-0 z-30 shrink-0">
      {/* Zone 1: Dog AI Brand Wordmark & Language Switcher */}
      <div className="flex items-center gap-2.5 shrink-0">
        <a href="/" className="text-sm md:text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center text-slate-950 text-base shadow-md shadow-amber-500/30 transform hover:scale-105 transition">
            🐶
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-white leading-tight flex items-center gap-1">
              Dog<span className="text-amber-400">AI</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono hidden sm:inline leading-none">
              Android Edition
            </span>
          </div>
        </a>

        {/* Trilingual Switcher (EN | 中文 | ES) */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-1.5 py-0.5 rounded transition ${
              lang === 'en' ? 'bg-amber-950 text-amber-300 font-bold border border-amber-800/60' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="English"
          >
            EN
          </button>
          <button
            onClick={() => onLanguageChange('zh')}
            className={`px-1.5 py-0.5 rounded transition ${
              lang === 'zh' ? 'bg-amber-950 text-amber-300 font-bold border border-amber-800/60' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="繁體中文 / 简体中文"
          >
            中文
          </button>
          <button
            onClick={() => onLanguageChange('es')}
            className={`px-1.5 py-0.5 rounded transition ${
              lang === 'es' ? 'bg-amber-950 text-amber-300 font-bold border border-amber-800/60' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Español"
          >
            ES
          </button>
        </div>
      </div>

      {/* Zone 2: Navigation & Tools (No feed bone, no tricks) */}
      <div className="hidden lg:flex items-center gap-2 text-xs">
        {/* Android Device Status Badge */}
        <button
          onClick={onOpenDeviceInstall}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-800/70 bg-emerald-950/40 text-emerald-200 hover:bg-emerald-900/50 transition-colors whitespace-nowrap shadow-xs"
          title="Dog AI Android Platform Settings & App Install"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-emerald-300 text-xs flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Android Active</span>
          </span>
        </button>

        {/* Dog Translator */}
        <button
          onClick={onOpenTranslator}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-300 hover:text-white bg-slate-900/70 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap"
          title="Open Dog Translator (English <-> 中文 <-> Español)"
        >
          <Languages className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t.translator}</span>
        </button>

        {/* Documents */}
        <button
          onClick={onOpenDocuments}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-300 hover:text-white bg-slate-900/70 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap"
          title="Manage local documents for knowledge"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>{t.documents}</span>
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 bg-slate-800 rounded text-cyan-400">{documentsCount}</span>
        </button>

        {/* Model Training & Teaching */}
        <button
          onClick={onOpenTrainingStudio}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/60 rounded-lg transition-colors whitespace-nowrap"
          title="Teach & Train Dog AI new habits and behaviors"
        >
          <Brain className="w-3.5 h-3.5 text-cyan-400" />
          <span>Teach Dog AI</span>
        </button>

        {/* Storage Meter */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white text-xs font-mono whitespace-nowrap"
          title="1.0 GB local persistent memory"
        >
          <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
          <span>{storageUsedMB.toFixed(1)} / 1,024 MB</span>
        </button>

        {/* Wi-Fi / Offline Status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs whitespace-nowrap ${
            isOnline
              ? 'bg-slate-900/60 border-slate-800 text-slate-300'
              : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 font-medium'
          }`}
          title={isOnline ? 'Wi-Fi Online' : '100% Offline Mode'}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.wifiOnline}</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.offlineMode}</span>
            </>
          )}
        </div>
      </div>

      {/* Zone 3: Android App Install (Prominent) & Settings */}
      <div className="flex items-center gap-2 shrink-0">
        {/* PROMINENT ANDROID APP INSTALL BUTTON */}
        <button
          onClick={onOpenDeviceInstall}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 rounded-lg shadow-md shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 whitespace-nowrap shrink-0"
          title="Install Dog AI on Android (PWA / WebAPK / Termux)"
        >
          <span className="text-sm">🤖</span>
          <Download className="w-3.5 h-3.5" />
          <span>Install Android App</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          title="Open Settings"
        >
          <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>
    </header>
  );
};
