import React, { useState } from 'react';
import { ChatSession, AppMode, SystemSettings } from '../types';
import { LOCAL_MODELS } from '../services/localLLM';
import { I18N } from '../i18n/translations';
import { Plus, MessageSquare, Pin, Trash2, Search, Cpu, HardDrive, Smartphone, Server, X, Database, Globe, Brain } from 'lucide-react';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: (mode: AppMode) => void;
  onDeleteSession: (id: string) => void;
  onTogglePin: (id: string) => void;
  settings: SystemSettings;
  storageUsedMB: number;
  isOpen: boolean;
  onClose: () => void;
  onOpenTrainingStudio?: () => void;
  onOpenWindowsDownload?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onTogglePin,
  settings,
  storageUsedMB,
  isOpen,
  onClose,
  onOpenTrainingStudio,
  onOpenWindowsDownload,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const lang = settings.language || 'en';
  const t = I18N[lang];
  const activeModel = LOCAL_MODELS.find(m => m.id === settings.model.activeModelId) || LOCAL_MODELS[0];

  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const maxMB = 1024; // 1GB
  const storagePercentage = Math.min(100, Math.round((storageUsedMB / maxMB) * 1000) / 10);

  const getPlatformIcon = () => {
    switch (settings.platform) {
      case 'raspberry_pi':
        return <Server className="w-3.5 h-3.5 text-rose-400" />;
      case 'android':
        return <Smartphone className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Cpu className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  const platformName = {
    windows: 'Windows (x64)',
    raspberry_pi: 'Raspberry Pi (ARM)',
    android: 'Android (Termux)',
    linux: 'Linux (GNU)',
  }[settings.platform];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-72 bg-[#0c121e] border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & New Chat */}
        <div className="p-3 border-b border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between lg:hidden mb-2">
            <span className="text-xs font-semibold text-slate-400">{t.conversations}</span>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <button
              onClick={() => {
                onNewSession('agent');
                onClose();
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-200 bg-amber-950/60 hover:bg-amber-900/50 border border-amber-800/60 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>🐾 New Chat</span>
            </button>
          </div>

          {/* Android App Quick Install Button */}
          <button
            onClick={() => {
              if (onOpenWindowsDownload) {
                onOpenWindowsDownload();
                onClose();
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 rounded-md transition-all shadow-md shadow-emerald-500/20"
          >
            <Smartphone className="w-4 h-4 text-slate-950" />
            <span>Install on Android</span>
          </button>

          {/* Model Training Studio Quick Access */}
          {onOpenTrainingStudio && (
            <button
              onClick={() => {
                onOpenTrainingStudio();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 rounded-md transition-colors"
            >
              <Brain className="w-3.5 h-3.5 text-amber-400" />
              <span>Teach Dog AI</span>
            </button>
          )}

          {/* Search sessions */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder={t.searchHistory}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900/80 border border-slate-800 rounded-md text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-600"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          {filteredSessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No conversations found.
            </div>
          ) : (
            filteredSessions.map(session => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    onClose();
                  }}
                  className={`group flex items-center justify-between px-2.5 py-2 rounded-md text-xs cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white font-medium shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate min-w-0 pr-2">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="truncate">{session.title}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onTogglePin(session.id);
                      }}
                      className={`p-1 rounded hover:bg-slate-700 ${session.isPinned ? 'text-amber-400 opacity-100' : 'text-slate-500'}`}
                      title={session.isPinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    {sessions.length > 1 && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-700"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 1.0 GB Persistent Storage Meter */}
        <div className="p-3 border-t border-slate-800/80 bg-[#070b13] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.storageUsage}</span>
            </span>
            <span className="text-[11px] font-mono text-cyan-300 font-bold">
              {storageUsedMB.toFixed(1)} / 1,024 MB
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
              style={{ width: `${Math.max(2, storagePercentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>{storagePercentage}% {t.quotaUsed}</span>
            <span className="text-emerald-400">IndexedDB</span>
          </div>
        </div>

        {/* Local Sovereign Hardware & Trilingual Indicator */}
        <div className="p-3 border-t border-slate-800/80 bg-[#080d16] text-xs space-y-2">
          <div className="space-y-1.5 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-400">
                <HardDrive className="w-3 h-3 text-cyan-400" />
                <span>Model Engine:</span>
              </span>
              <span className="text-slate-200 truncate max-w-[125px]">{activeModel.name.split(' ')[0]} ({activeModel.sizeGB}GB)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-400">
                <Globe className="w-3 h-3 text-cyan-400" />
                <span>Languages:</span>
              </span>
              <span className="text-cyan-300 font-semibold">EN · 中文 · ES (Same LLM)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-400">
                {getPlatformIcon()}
                <span>Hardware:</span>
              </span>
              <span className="text-slate-200">{platformName}</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
            <span>{t.zeroCloudAPIs}</span>
            <span className="text-cyan-500 font-medium">100% Offline</span>
          </div>
        </div>
      </aside>
    </>
  );
};
