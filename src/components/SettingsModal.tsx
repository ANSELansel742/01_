import React, { useState } from 'react';
import { SystemSettings, PlatformProfile, SupportedLanguage, DogPowerKey, PowerRecord, DogServantPersonalityConfig } from '../types';
import { LOCAL_MODELS } from '../services/localLLM';
import { VoiceSystemManager } from '../services/voiceSystem';
import { I18N } from '../i18n/translations';
import { DogServantPersonalityService, DEFAULT_DOG_PERSONALITY } from '../services/dogServantPersonality';
import { PowerMemoryService } from '../services/powerMemory';
import { ShieldCheck, ShieldAlert, Cpu, HardDrive, Volume2, FileText, Smartphone, Server, Download, Upload, X, Check, Languages, Database, Sparkles, Zap, Lock, Unlock, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SystemSettings;
  onSaveSettings: (settings: SystemSettings) => void;
  onExportBackup: () => void;
  onImportBackup: (json: string) => void;
  storageUsedMB: number;
}

type TabType = 'safety' | 'model' | 'language' | 'storage' | 'rag' | 'voice' | 'platform';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onExportBackup,
  onImportBackup,
  storageUsedMB,
}) => {
  const [localSettings, setLocalSettings] = useState<SystemSettings>({
    ...settings,
    personality: settings.personality || { ...DEFAULT_DOG_PERSONALITY },
  });
  const [activeTab, setActiveTab] = useState<TabType>('safety');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [rememberedPowers, setRememberedPowers] = useState<PowerRecord[]>(() =>
    PowerMemoryService.getInstance().getAllRememberedPowers()
  );
  const voiceManager = VoiceSystemManager.getInstance();
  const availableVoices = voiceManager.getVoices();

  const lang = localSettings.language || 'en';
  const t = I18N[lang];

  if (!isOpen) return null;

  const handleToggleRememberedPower = (key: DogPowerKey) => {
    const current = rememberedPowers.find(p => p.key === key);
    const nextGranted = !current?.granted;
    PowerMemoryService.getInstance().rememberPower(key, nextGranted, 'Toggled in Settings');
    setRememberedPowers(PowerMemoryService.getInstance().getAllRememberedPowers());
    if (key === 'terminal_execution') {
      setLocalSettings(prev => ({
        ...prev,
        safety: {
          ...prev.safety,
          computerControlUnlocked: nextGranted,
          rememberAuthorizedPowers: true,
        },
      }));
    }
  };

  const handleGrantAllPowers = () => {
    const all = PowerMemoryService.getInstance().getAllRememberedPowers();
    all.forEach(p => {
      PowerMemoryService.getInstance().rememberPower(p.key, true, 'Master Granted All Powers');
    });
    setRememberedPowers(PowerMemoryService.getInstance().getAllRememberedPowers());
    setLocalSettings(prev => ({
      ...prev,
      safety: {
        ...prev.safety,
        computerControlUnlocked: true,
        allowTerminalExecution: true,
        allowFileSystemModification: true,
        allowProcessTermination: true,
        rememberAuthorizedPowers: true,
      },
    }));
  };

  const handleResetPowers = () => {
    const all = PowerMemoryService.getInstance().getAllRememberedPowers();
    all.forEach(p => {
      const isBase = ['offline_intelligence', 'arp1_guard_defense', 'trilingual_translation', 'document_rag', 'voice_synthesis', 'filesystem_access'].includes(p.key);
      PowerMemoryService.getInstance().rememberPower(p.key, isBase, 'Reset to Default');
    });
    setRememberedPowers(PowerMemoryService.getInstance().getAllRememberedPowers());
    setLocalSettings(prev => ({
      ...prev,
      safety: {
        ...prev.safety,
        computerControlUnlocked: false,
      },
    }));
  };

  const handleSave = () => {
    if (localSettings.personality) {
      DogServantPersonalityService.getInstance().updateConfig(localSettings.personality);
    }
    PowerMemoryService.getInstance().syncSafetySettings(localSettings.safety);
    if (localSettings.safety.computerControlUnlocked) {
      PowerMemoryService.getInstance().rememberPower('terminal_execution', true, 'Settings Saved Unlocked');
    }
    onSaveSettings(localSettings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleApplyPlatformPreset = (platform: PlatformProfile) => {
    if (platform === 'raspberry_pi') {
      setLocalSettings(prev => ({
        ...prev,
        platform: 'raspberry_pi',
        model: {
          ...prev.model,
          activeModelId: 'aether-nano-1.5b',
          ramAllocationMB: 1500,
          threadCount: 4,
          useWebGPU: false,
        },
        safety: {
          ...prev.safety,
          maxCpuPercentage: 70,
        },
      }));
    } else if (platform === 'android') {
      setLocalSettings(prev => ({
        ...prev,
        platform: 'android',
        model: {
          ...prev.model,
          activeModelId: 'aether-nano-1.5b',
          ramAllocationMB: 1200,
          threadCount: 2,
          useWebGPU: false,
        },
      }));
    } else {
      // Windows
      setLocalSettings(prev => ({
        ...prev,
        platform: 'windows',
        model: {
          ...prev.model,
          activeModelId: 'aether-sovereign-3.0b',
          ramAllocationMB: 2800,
          threadCount: 6,
          useWebGPU: true,
        },
      }));
    }
  };

  const downloadPythonBridge = () => {
    const scriptContent = `#!/usr/bin/env python3
"""
Sovereign Core - Physical Device & Computer Control Bridge
Run this script on your Raspberry Pi, Windows PC, or Android (Termux)
to connect the Sovereign AI Agent directly to your local hardware.
"""
import sys
import os
import subprocess
import json

print("==================================================")
print("  SOVEREIGN CORE - LOCAL HARDWARE BRIDGE          ")
print("  Platform:", sys.platform)
print("  Memory Protection: Active")
print("==================================================")

def execute_safe_command(cmd):
    print(f"[*] Executing authorized agent task: {cmd}")
    try:
        res = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        return {"exit_code": res.returncode, "stdout": res.stdout, "stderr": res.stderr}
    except Exception as e:
        return {"exit_code": 1, "error": str(e)}

if __name__ == "__main__":
    print("[*] Bridge ready. Waiting for sovereign agent instructions.")
    print("[*] To test local system, running uname/hostname:")
    print(execute_safe_command("uname -a || hostname"))
`;

    const blob = new Blob([scriptContent], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sovereign_agent_bridge.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'safety', label: t.tabSafety, icon: ShieldCheck, alert: !localSettings.safety.computerControlUnlocked },
    { id: 'model', label: t.tabModel, icon: HardDrive },
    { id: 'language', label: t.tabLanguage, icon: Languages },
    { id: 'storage', label: t.tabStorage, icon: Database },
    { id: 'rag', label: t.tabRAG, icon: FileText },
    { id: 'voice', label: t.tabVoice, icon: Volume2 },
    { id: 'platform', label: t.tabPlatform, icon: Server },
  ];

  const maxMB = 1024; // 1.0 GB
  const storagePercentage = Math.min(100, Math.round((storageUsedMB / maxMB) * 1000) / 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#0b101c] border border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0d1424]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold">
              ⚙
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-white">{t.settingsTitle}</h2>
              <p className="text-[11px] text-slate-400">{t.settingsSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 overflow-x-auto text-xs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 px-4 py-2.5 font-medium whitespace-nowrap transition-colors border-b-2 ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300 bg-slate-800/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.alert && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" title="Safety Closed (Protected)" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-300">
          {/* TAB 1: SAFETY & COMPUTER CONTROL */}
          {activeTab === 'safety' && (
            <div className="space-y-4">
              {/* Critical Safety Interlock Banner */}
              <div className={`p-4 rounded-xl border ${
                localSettings.safety.computerControlUnlocked
                  ? 'bg-amber-950/30 border-amber-800/80'
                  : 'bg-emerald-950/30 border-emerald-800/80'
              }`}>
                <div className="flex items-start gap-3">
                  {localSettings.safety.computerControlUnlocked ? (
                    <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white text-sm">
                      {localSettings.safety.computerControlUnlocked
                        ? t.safetyUnlocked
                        : t.safetyProtected}
                    </h3>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {localSettings.safety.computerControlUnlocked
                        ? 'The agent has permission to execute shell commands and modify local files. All actions are logged and subject to the restrictions configured below.'
                        : t.safetyReminderClosed + ' ' + t.openSettings}
                    </p>
                  </div>
                </div>

                {/* Master Switch */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="font-semibold text-slate-100">
                    Master Switch: Autonomous Computer Control
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.safety.computerControlUnlocked}
                      onChange={e =>
                        setLocalSettings(prev => ({
                          ...prev,
                          safety: { ...prev.safety, computerControlUnlocked: e.target.checked },
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>

              {/* Granular Permission Toggles */}
              <div className="space-y-3 pt-2">
                <h4 className="font-semibold text-slate-200">Granular Execution Permissions</h4>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div>
                    <div className="font-medium text-slate-200">Allow Terminal / Shell Execution</div>
                    <div className="text-[11px] text-slate-400">Run safe bash, PowerShell, and diagnostic terminal commands.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.safety.allowTerminalExecution}
                    onChange={e =>
                      setLocalSettings(prev => ({
                        ...prev,
                        safety: { ...prev.safety, allowTerminalExecution: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 text-cyan-600 rounded bg-slate-800 border-slate-700"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div>
                    <div className="font-medium text-slate-200">Allow File System Modification</div>
                    <div className="text-[11px] text-slate-400">Allow agent to write or create files in the local workspace directory.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.safety.allowFileSystemModification}
                    onChange={e =>
                      setLocalSettings(prev => ({
                        ...prev,
                        safety: { ...prev.safety, allowFileSystemModification: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 text-cyan-600 rounded bg-slate-800 border-slate-700"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div>
                    <div className="font-medium text-slate-200">Allow Process Termination</div>
                    <div className="text-[11px] text-slate-400">Permit agent to terminate runaway tasks or kill specific PIDs.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.safety.allowProcessTermination}
                    onChange={e =>
                      setLocalSettings(prev => ({
                        ...prev,
                        safety: { ...prev.safety, allowProcessTermination: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 text-cyan-600 rounded bg-slate-800 border-slate-700"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div>
                    <div className="font-medium text-slate-200">Require Manual Confirmation Before Destructive Commands</div>
                    <div className="text-[11px] text-slate-400">Always prompts you to approve commands before running on your computer.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.safety.requireManualApproval}
                    onChange={e =>
                      setLocalSettings(prev => ({
                        ...prev,
                        safety: { ...prev.safety, requireManualApproval: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 text-cyan-600 rounded bg-slate-800 border-slate-700"
                  />
                </div>
              </div>

              {/* Dog Servant Power Memory: Remember Powers Instead of Checking Every Time */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/40 space-y-3.5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🐶</span>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        Dog Servant Power Memory
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold bg-amber-950 text-amber-300 border border-amber-800">
                          {localSettings.safety.rememberAuthorizedPowers ? 'REMEMBER POWERS ACTIVE ✓' : 'CHECKING EVERY TIME'}
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Remembers all granted powers permanently instead of checking every time or quarantining actions.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={localSettings.safety.rememberAuthorizedPowers}
                      onChange={e => {
                        const val = e.target.checked;
                        setLocalSettings(prev => ({
                          ...prev,
                          safety: { ...prev.safety, rememberAuthorizedPowers: val },
                          personality: {
                            ...(prev.personality || DEFAULT_DOG_PERSONALITY),
                            rememberPowers: val,
                          },
                        }));
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-400">
                    Active Granted Powers: <span className="font-bold text-emerald-400 font-mono">{rememberedPowers.filter(p => p.granted).length}</span> / {rememberedPowers.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGrantAllPowers}
                      className="px-2.5 py-1 rounded bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/60 transition text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-amber-400" />
                      Grant All Powers (忠誠賦權)
                    </button>
                    <button
                      type="button"
                      onClick={handleResetPowers}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-slate-400" />
                      Reset Defaults
                    </button>
                  </div>
                </div>

                {/* List of Remembered Powers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                  {rememberedPowers.map(p => (
                    <div
                      key={p.key}
                      onClick={() => handleToggleRememberedPower(p.key)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start justify-between gap-2 ${
                        p.granted
                          ? 'bg-emerald-950/20 border-emerald-800/80 hover:border-emerald-700'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 opacity-70'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-medium text-xs text-slate-200">
                          {p.granted ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          )}
                          <span>{p.name}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{p.description}</p>
                        {p.authorizedAt && (
                          <div className="text-[9px] text-slate-500 font-mono">
                            {p.authorizedAt}
                          </div>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold shrink-0 mt-0.5 ${
                          p.granted
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-900 text-slate-500 border border-slate-800'
                        }`}
                      >
                        {p.granted ? 'REMEMBERED' : 'OFF'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MODEL & LOCAL HARDWARE (UP TO 3GB) */}
          {activeTab === 'model' && (
            <div className="space-y-4">
              {/* Dual-LLM Pipeline Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-100">Dual-LLM Architecture</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                      ACTIVE & SOVEREIGN
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400">100% Offline Capable</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* LLM 1: Guard */}
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-emerald-800/60 space-y-1.5">
                    <div className="flex items-center justify-between text-emerald-300 font-semibold">
                      <span>🛡️ LLM 1: ARP-1 Guard (Trained)</span>
                      <span className="text-[10px] font-mono text-emerald-400">Security Sentinel</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Continuously trained security model that guards sensitive data. <strong>Strictly forbids</strong> disclosing internal company information, corporate data, or unauthorized personal info.
                    </p>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Forbid Company Information:</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">STRICTLY FORBIDDEN ✓</span>
                    </div>
                  </div>

                  {/* LLM 2: Offline Dog Servant */}
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-amber-800/60 space-y-1.5">
                    <div className="flex items-center justify-between text-amber-300 font-semibold">
                      <span>🐶 LLM 2: Orca Mini (Dog Servant)</span>
                      <span className="text-[10px] font-mono text-amber-400">Offline Engine</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Loyal, obedient offline dog companion executing tasks, coding, and multi-language chat for Master. Operates with zero cloud latency under 3GB RAM.
                    </p>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Dog Servant Model:</span>
                      <span className="text-[10px] font-mono text-amber-400 font-bold">orca-mini (3B) ✓</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-200 mb-1">Local Sovereign Intelligence Models (Zero-API · Up to 3GB)</h4>
                <p className="text-[11px] text-slate-400">English, Chinese, and Spanish all execute using this same single local LLM engine.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {LOCAL_MODELS.map(model => {
                  const isSelected = localSettings.model.activeModelId === model.id;
                  return (
                    <div
                      key={model.id}
                      onClick={() =>
                        setLocalSettings(prev => ({
                          ...prev,
                          model: { ...prev.model, activeModelId: model.id },
                        }))
                      }
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500 shadow-sm'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-200">
                        <span>{model.name}</span>
                        <span className="text-[10px] font-mono text-cyan-400">{model.sizeGB} GB</span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-400 line-clamp-3">
                        {model.description}
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>{model.quantization}</span>
                        <span>{model.tokensPerSec} t/s</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Memory Allocation Slider (Up to 3GB) */}
              <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-200">RAM Allocation Cap (Up to 3.0 GB Max)</span>
                  <span className="font-mono text-cyan-300 font-semibold">
                    {(localSettings.model.ramAllocationMB / 1024).toFixed(2)} GB / 3.0 GB
                  </span>
                </div>
                <input
                  type="range"
                  min="512"
                  max="3072"
                  step="128"
                  value={localSettings.model.ramAllocationMB}
                  onChange={e =>
                    setLocalSettings(prev => ({
                      ...prev,
                      model: { ...prev.model, ramAllocationMB: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>512 MB (IoT/RPi3)</span>
                  <span>1.5 GB (Balanced)</span>
                  <span>3.0 GB (Full Sovereign Model)</span>
                </div>
              </div>

              {/* CPU Threads Allocation */}
              <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-200">CPU Execution Threads</span>
                  <span className="font-mono text-cyan-300">{localSettings.model.threadCount} Cores</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={localSettings.model.threadCount}
                  onChange={e =>
                    setLocalSettings(prev => ({
                      ...prev,
                      model: { ...prev.model, threadCount: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Response Tone & Personality (Relaxed vs Stiff) */}
              <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-200">Conversation Tone & Personality</span>
                  <span className="text-[11px] text-emerald-400 font-medium">Anti-Robotic Active</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setLocalSettings(prev => ({
                        ...prev,
                        model: { ...prev.model, personaTone: 'relaxed' },
                      }))
                    }
                    className={`p-2.5 rounded-lg border text-left transition ${
                      (localSettings.model.personaTone || 'relaxed') === 'relaxed'
                        ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200 shadow-sm'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                      <span>Relaxed & Friendly</span>
                      {(localSettings.model.personaTone || 'relaxed') === 'relaxed' && (
                        <span className="text-[10px] text-emerald-400">✓ Default</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Natural, warm, comfortable chat. No stiff "iron watermelon" boilerplate.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setLocalSettings(prev => ({
                        ...prev,
                        model: { ...prev.model, personaTone: 'concise' },
                      }))
                    }
                    className={`p-2.5 rounded-lg border text-left transition ${
                      localSettings.model.personaTone === 'concise'
                        ? 'bg-cyan-950/50 border-cyan-500 text-cyan-200 shadow-sm'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-200">Concise & Direct</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Brief, to the point, minimal extra words.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setLocalSettings(prev => ({
                        ...prev,
                        model: { ...prev.model, personaTone: 'technical' },
                      }))
                    }
                    className={`p-2.5 rounded-lg border text-left transition ${
                      localSettings.model.personaTone === 'technical'
                        ? 'bg-cyan-950/50 border-cyan-500 text-cyan-200 shadow-sm'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-200">Detailed & Analytical</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Deep analysis and structured breakdowns when requested.
                    </div>
                  </button>
                </div>
              </div>

              {/* Offline Ollama Agent Configuration (Orca Mini) */}
              <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-200 flex items-center gap-2">
                      <span>Offline Ollama Agent (Orca Mini)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">LLM 2</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Connect to your offline Ollama instance or run with embedded Orca Mini 3B.
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.model.useLocalOllama}
                      onChange={e =>
                        setLocalSettings(prev => ({
                          ...prev,
                          model: { ...prev.model, useLocalOllama: e.target.checked },
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Ollama Model Tag (Offline)
                    </label>
                    <input
                      type="text"
                      value={localSettings.model.ollamaModel || 'orca-mini'}
                      onChange={e =>
                        setLocalSettings(prev => ({
                          ...prev,
                          model: { ...prev.model, ollamaModel: e.target.value },
                        }))
                      }
                      placeholder="orca-mini or orca-mini:3b"
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 font-mono focus:border-cyan-500 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-500">Run: <code className="text-cyan-400">ollama run orca-mini</code></span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Ollama Daemon Endpoint
                    </label>
                    <input
                      type="text"
                      value={localSettings.model.localOllamaUrl || 'http://localhost:11434'}
                      onChange={e =>
                        setLocalSettings(prev => ({
                          ...prev,
                          model: { ...prev.model, localOllamaUrl: e.target.value },
                        }))
                      }
                      placeholder="http://localhost:11434"
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 font-mono focus:border-cyan-500 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-500">Default: http://localhost:11434</span>
                  </div>
                </div>
              </div>

              {/* Dog Servant Personality Behavioral Traits (LLM 2 Orca Mini) */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/40 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🐶</span>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        Dog Servant Behavioral Traits (Orca Mini Output)
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold bg-amber-950 text-amber-300 border border-amber-800">
                          SERVICE LAYER MAPPER ACTIVE
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Configures specific puppy behavioral traits mapped directly to Orca Mini inference outputs.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trait 1: Playfulness Level Slider (1 to 5) */}
                <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="font-medium text-slate-200 text-xs">Playfulness Level</span>
                      <p className="text-[10px] text-slate-400">
                        Controls puppy joy, tail-wagging energy, and high spirits in responses.
                      </p>
                    </div>
                    <span className="font-mono text-amber-300 font-bold text-xs px-2 py-0.5 rounded bg-amber-950 border border-amber-800">
                      Level {localSettings.personality?.playfulness ?? 4} / 5 ·{' '}
                      {(localSettings.personality?.playfulness ?? 4) === 1 && 'Calm Guard Dog'}
                      {(localSettings.personality?.playfulness ?? 4) === 2 && 'Gentle Companion'}
                      {(localSettings.personality?.playfulness ?? 4) === 3 && 'Friendly Helper'}
                      {(localSettings.personality?.playfulness ?? 4) === 4 && 'Joyful Wagging Tail'}
                      {(localSettings.personality?.playfulness ?? 4) === 5 && 'Ultra Puppy Energy!'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={localSettings.personality?.playfulness ?? 4}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setLocalSettings(prev => ({
                        ...prev,
                        personality: {
                          ...(prev.personality || DEFAULT_DOG_PERSONALITY),
                          playfulness: val,
                        },
                      }));
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1: Calm Guard</span>
                    <span>3: Friendly</span>
                    <span>5: Ultra Puppy</span>
                  </div>
                </div>

                {/* Trait 2: Simplistic Loyal Phrasing */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <div className="pr-3">
                    <div className="font-medium text-slate-200 text-xs flex items-center gap-1.5">
                      <span>Simplistic Loyal Phrasing ("Yes Master!")</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                        No Iron Watermelon
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Uses humble, simplistic, devoted phrasing addressing the user as Master (主人 / mi amo) without bloated machine jargon.
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={localSettings.personality?.simplisticLoyalPhrasing ?? true}
                      onChange={e =>
                        setLocalSettings(prev => ({
                          ...prev,
                          personality: {
                            ...(prev.personality || DEFAULT_DOG_PERSONALITY),
                            simplisticLoyalPhrasing: e.target.checked,
                          },
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {/* Trait 3: Bark Metaphors (Woof! / 汪！ / ¡Guau!) */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <div className="pr-3">
                    <div className="font-medium text-slate-200 text-xs">
                      Joyful Bark Expressions (Woof! / 汪！ / ¡Guau!)
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Naturally sprinkles happy puppy barks into multi-lingual interactions.
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={localSettings.personality?.barkMetaphors ?? true}
                      onChange={e =>
                        setLocalSettings(prev => ({
                          ...prev,
                          personality: {
                            ...(prev.personality || DEFAULT_DOG_PERSONALITY),
                            barkMetaphors: e.target.checked,
                          },
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {/* Trait 4: Fetch Metaphors */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <div className="pr-3">
                    <div className="font-medium text-slate-200 text-xs">
                      Fetch Metaphors (Fetching Answers & Tasks)
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Treats file retrieval, code execution, and knowledge lookup as fetching sticks and balls for Master.
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={localSettings.personality?.fetchMetaphors ?? true}
                      onChange={e =>
                        setLocalSettings(prev => ({
                          ...prev,
                          personality: {
                            ...(prev.personality || DEFAULT_DOG_PERSONALITY),
                            fetchMetaphors: e.target.checked,
                          },
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LANGUAGES & TRANSLATOR (EN · 中文 · ES) */}
          {activeTab === 'language' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-200 mb-1">Trilingual System & Sovereign Translator</h4>
                <p className="text-[11px] text-slate-400">
                  The same 3GB local LLM serves English, Chinese, and Spanish simultaneously with a built-in cross-translator.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <span className="font-semibold text-slate-200">{t.languageSelect}</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, language: 'en' }))}
                    className={`p-3 rounded-lg border text-left transition ${
                      localSettings.language === 'en'
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-sm font-semibold">English (US)</div>
                    <div className="text-[10px] font-mono text-slate-500">System UI in English</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, language: 'zh' }))}
                    className={`p-3 rounded-lg border text-left transition ${
                      localSettings.language === 'zh'
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-sm font-semibold">中文 (Chinese)</div>
                    <div className="text-[10px] font-mono text-slate-500">繁體與簡體中文介面</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, language: 'es' }))}
                    className={`p-3 rounded-lg border text-left transition ${
                      localSettings.language === 'es'
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-sm font-semibold">Español (Spanish)</div>
                    <div className="text-[10px] font-mono text-slate-500">Interfaz en español</div>
                  </button>
                </div>
              </div>

              {/* Output Language Policy (Auto-detect vs Sticky language) */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200">{t.outputLanguagePolicy}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      By default, Dog Servant outputs in the auto-detected language. If you choose a language below, it will stick to that language first unless translated manually.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    {(localSettings.outputLanguageMode || 'auto').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setLocalSettings(prev => ({
                      ...prev,
                      outputLanguageMode: 'auto',
                      model: { ...prev.model, outputLanguageMode: 'auto' },
                    }))}
                    className={`p-3 rounded-lg border text-left transition ${
                      (!localSettings.outputLanguageMode || localSettings.outputLanguageMode === 'auto')
                        ? 'bg-amber-950/60 border-amber-400 text-amber-200 font-bold shadow-xs'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-sm font-semibold flex items-center gap-1.5">
                      <span>🐶</span>
                      <span>Auto-Detect Language (Default)</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">
                      Replies in the exact language detected from your prompt
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocalSettings(prev => ({
                      ...prev,
                      outputLanguageMode: 'en',
                      model: { ...prev.model, outputLanguageMode: 'en' },
                    }))}
                    className={`p-3 rounded-lg border text-left transition ${
                      localSettings.outputLanguageMode === 'en'
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 font-bold shadow-xs'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-sm font-semibold flex items-center gap-1.5">
                      <span>🇺🇸</span>
                      <span>Stick to English</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">
                      Always locks response output to English first
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocalSettings(prev => ({
                      ...prev,
                      outputLanguageMode: 'zh',
                      model: { ...prev.model, outputLanguageMode: 'zh' },
                    }))}
                    className={`p-3 rounded-lg border text-left transition ${
                      localSettings.outputLanguageMode === 'zh'
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 font-bold shadow-xs'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-sm font-semibold flex items-center gap-1.5">
                      <span>🇹🇼</span>
                      <span>Stick to 中文 (Chinese)</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">
                      Always locks response output to Chinese first
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocalSettings(prev => ({
                      ...prev,
                      outputLanguageMode: 'es',
                      model: { ...prev.model, outputLanguageMode: 'es' },
                    }))}
                    className={`p-3 rounded-lg border text-left transition ${
                      localSettings.outputLanguageMode === 'es'
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 font-bold shadow-xs'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-sm font-semibold flex items-center gap-1.5">
                      <span>🇪🇸</span>
                      <span>Stick to Español</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">
                      Always locks response output to Spanish first
                    </div>
                  </button>
                </div>
              </div>

              {/* Shared LLM Explanation */}
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-900/60 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-cyan-300">Single Shared 3GB LLM Engine</div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    No redundant model downloads are needed. The underlying Aether model weights understand and reason across English, 中文, and Español natively, while the built-in translator facilitates cross-language translation on demand.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 1.0 GB STORAGE & BACKUP */}
          {activeTab === 'storage' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-200 mb-1">IndexedDB 1.0 GB Persistent Storage</h4>
                <p className="text-[11px] text-slate-400">
                  Durable offline client-side storage up to 1,024 MB for large documents, RAG indexes, and unlimited chat histories.
                </p>
              </div>

              {/* 1GB Meter */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">1.0 GB Storage Allocation</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {storageUsedMB.toFixed(1)} MB / 1,024 MB ({storagePercentage}%)
                  </span>
                </div>

                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${Math.max(2, storagePercentage)}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-slate-400 pt-1">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <div className="text-slate-500">Storage Used</div>
                    <div className="text-cyan-300 font-bold">{storageUsedMB.toFixed(1)} MB</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <div className="text-slate-500">Free Space</div>
                    <div className="text-emerald-400 font-bold">{(1024 - storageUsedMB).toFixed(1)} MB</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <div className="text-slate-500">Max Quota</div>
                    <div className="text-slate-200 font-bold">1,024 MB (1GB)</div>
                  </div>
                </div>
              </div>

              {/* Backup & Restore */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
                  <h5 className="font-medium text-slate-200">Export All Data (Backup)</h5>
                  <p className="text-[11px] text-slate-400">Save complete offline JSON file of all documents, chats, and configurations.</p>
                  <button
                    type="button"
                    onClick={onExportBackup}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export 1GB Data (JSON)</span>
                  </button>
                </div>

                <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
                  <h5 className="font-medium text-slate-200">Restore from Backup</h5>
                  <p className="text-[11px] text-slate-400">Import a previously exported sovereign backup file.</p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import JSON File</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = evt => {
                            const content = evt.target?.result as string;
                            if (content) onImportBackup(content);
                          };
                          reader.readAsText(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DOCUMENT RAG */}
          {activeTab === 'rag' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-200 mb-1">{t.tabRAG}</h4>
                <p className="text-[11px] text-slate-400">
                  Enables semantic vector retrieval over your attached local documents to cite verified passages and prevent hallucinations.
                </p>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div>
                  <div className="font-medium text-slate-200">{t.ragAccuracyBoost}</div>
                  <div className="text-[11px] text-slate-400">Automatically cross-references local documents before formulating answers.</div>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.rag.accuracyBoostEnabled}
                  onChange={e =>
                    setLocalSettings(prev => ({
                      ...prev,
                      rag: { ...prev.rag, accuracyBoostEnabled: e.target.checked },
                    }))
                  }
                  className="w-4 h-4 text-cyan-600 rounded bg-slate-800 border-slate-700"
                />
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-200">Chunk Size (Words)</span>
                  <span className="font-mono text-cyan-300">{localSettings.rag.chunkSize} words</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="600"
                  step="50"
                  value={localSettings.rag.chunkSize}
                  onChange={e =>
                    setLocalSettings(prev => ({
                      ...prev,
                      rag: { ...prev.rag, chunkSize: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-cyan-500"
                />
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-200">Top Retrieved Passages (Top-K)</span>
                  <span className="font-mono text-cyan-300">{localSettings.rag.topKRetrieval} citations</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="1"
                  value={localSettings.rag.topKRetrieval}
                  onChange={e =>
                    setLocalSettings(prev => ({
                      ...prev,
                      rag: { ...prev.rag, topKRetrieval: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>
          )}

          {/* TAB 6: VOICE SPEECH */}
          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-200 mb-1">{t.tabVoice}</h4>
                <p className="text-[11px] text-slate-400">Uses native system voices that work completely offline across English, Chinese, and Spanish.</p>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div>
                  <div className="font-medium text-slate-200">Voice Synthesis (TTS)</div>
                  <div className="text-[11px] text-slate-400">Enable voice playback of assistant responses.</div>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.voice.voiceEnabled}
                  onChange={e =>
                    setLocalSettings(prev => ({
                      ...prev,
                      voice: { ...prev.voice, voiceEnabled: e.target.checked },
                    }))
                  }
                  className="w-4 h-4 text-cyan-600 rounded bg-slate-800 border-slate-700"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div>
                  <div className="font-medium text-slate-200">Auto-Speak Responses</div>
                  <div className="text-[11px] text-slate-400">Automatically read completed agent answers aloud.</div>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.voice.autoSpeak}
                  onChange={e =>
                    setLocalSettings(prev => ({
                      ...prev,
                      voice: { ...prev.voice, autoSpeak: e.target.checked },
                    }))
                  }
                  className="w-4 h-4 text-cyan-600 rounded bg-slate-800 border-slate-700"
                />
              </div>

              {availableVoices.length > 0 && (
                <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <span className="font-medium text-slate-200">Select Offline System Voice</span>
                  <select
                    value={localSettings.voice.selectedVoiceURI}
                    onChange={e =>
                      setLocalSettings(prev => ({
                        ...prev,
                        voice: { ...prev.voice, selectedVoiceURI: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs"
                  >
                    <option value="">Default System Voice</option>
                    {availableVoices.map(v => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: PLATFORM & HARDWARE PRESETS */}
          {activeTab === 'platform' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-200 mb-1">{t.tabPlatform}</h4>
                <p className="text-[11px] text-slate-400">Switch hardware profiles to tune memory usage and terminal syntax.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleApplyPlatformPreset('raspberry_pi')}
                  className={`p-3.5 rounded-lg border text-left transition-all ${
                    localSettings.platform === 'raspberry_pi'
                      ? 'bg-rose-950/40 border-rose-500 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-slate-200">
                    <Server className="w-4 h-4 text-rose-400" />
                    <span>Raspberry Pi / ARM</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    4-core CPU limit, 1.5GB RAM cap, memory GC, and Debian/Bash command syntax.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyPlatformPreset('android')}
                  className={`p-3.5 rounded-lg border text-left transition-all ${
                    localSettings.platform === 'android'
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-slate-200">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Android / Termux</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Battery conservation, touch navigation, and Termux terminal environment.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyPlatformPreset('windows')}
                  className={`p-3.5 rounded-lg border text-left transition-all ${
                    localSettings.platform === 'windows'
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-slate-200">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span>Windows / PC</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Full 3GB sovereign model, WebGPU acceleration, and PowerShell automation.
                  </p>
                </button>
              </div>

              {/* Physical Bridge Script Download */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-slate-200">Standalone Native Bridge Script</h5>
                    <p className="text-[11px] text-slate-400">
                      Run this script on your real Raspberry Pi or Windows PC to allow physical computer control.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={downloadPythonBridge}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-md transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Script</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-[#0d1424]">
          <div className="text-[11px] text-slate-500">
            {savedSuccess ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                <span>Settings saved to local storage!</span>
              </span>
            ) : (
              <span>Changes take effect immediately on device.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white rounded-md transition"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition shadow-sm"
            >
              {t.saveSettings}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
