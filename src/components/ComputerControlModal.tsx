import React, { useState } from 'react';
import { SystemSettings, PlatformProfile } from '../types';
import { ComputerControlManager, SystemProcess } from '../services/computerControl';
import { Terminal, ShieldCheck, ShieldAlert, Play, Folder, Activity, X, Trash2, Save } from 'lucide-react';

interface ComputerControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SystemSettings;
  onUpdateSafety: (safety: SystemSettings['safety']) => void;
  platform: PlatformProfile;
}

export const ComputerControlModal: React.FC<ComputerControlModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSafety,
  platform,
}) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'files' | 'processes'>('terminal');
  const [commandInput, setCommandInput] = useState('');
  const [commandLogs, setCommandLogs] = useState<Array<{ cmd: string; out: string; time: string; ok: boolean }>>([
    {
      cmd: 'uname -a',
      out: 'Linux sovereign-core 6.6.20 #1 SMP PREEMPT GNU/Linux',
      time: '12:00:00',
      ok: true,
    },
  ]);
  const [selectedFile, setSelectedFile] = useState<string>('/home/user/notes.txt');
  const [fileContent, setFileContent] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const manager = ComputerControlManager.getInstance();
  const virtualFiles = manager.getVirtualFiles();
  const [processes, setProcesses] = useState<SystemProcess[]>(manager.getProcesses());

  if (!isOpen) return null;

  const isUnlocked = settings.safety.computerControlUnlocked;

  const handleRunCommand = async () => {
    if (!commandInput.trim()) return;
    const cmd = commandInput.trim();
    setCommandInput('');

    const res = await manager.executeCommand(cmd, platform, settings.safety);
    const newLog = {
      cmd,
      out: res.stdout || res.stderr,
      time: new Date().toLocaleTimeString(),
      ok: res.success,
    };
    setCommandLogs(prev => [newLog, ...prev]);
  };

  const handleSelectFile = (path: string) => {
    setSelectedFile(path);
    setFileContent(virtualFiles.get(path) || '');
  };

  const handleSaveFile = () => {
    if (!isUnlocked) {
      setStatusMsg('Cannot write: Computer control is CLOSED by default in Settings.');
      return;
    }
    manager.saveVirtualFile(selectedFile, fileContent);
    setStatusMsg(`Saved ${selectedFile}`);
    setTimeout(() => setStatusMsg(null), 2500);
  };

  const handleKillProcess = (pid: number) => {
    const res = manager.killProcess(pid, settings.safety);
    setStatusMsg(res.message);
    setProcesses(manager.getProcesses());
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#0b101c] border border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0d1424]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-white">Computer Control & Terminal Console</h2>
              <p className="text-[11px] text-slate-400">
                Execute local commands, inspect running processes, and manipulate workspace files.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Safety Interlock Ribbon */}
        <div className={`px-5 py-2.5 flex items-center justify-between border-b text-xs ${
          isUnlocked
            ? 'bg-amber-950/30 border-amber-800/60 text-amber-300'
            : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2">
            {isUnlocked ? (
              <>
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Computer Control is <strong>UNLOCKED</strong>. Terminal & filesystem writes enabled.</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Safety Shield: High-Power Computer Control is <strong>CLOSED BY DEFAULT</strong>.</span>
              </>
            )}
          </div>

          <button
            onClick={() => onUpdateSafety({ ...settings.safety, computerControlUnlocked: !isUnlocked })}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded border transition ${
              isUnlocked
                ? 'bg-amber-900/60 hover:bg-amber-800/80 border-amber-700 text-amber-200'
                : 'bg-emerald-900/60 hover:bg-emerald-800/80 border-emerald-700 text-emerald-200'
            }`}
          >
            {isUnlocked ? 'Close Safety Lock' : 'Unlock Controls'}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 text-xs px-3">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-1.5 px-3 py-2 font-medium border-b-2 transition ${
              activeTab === 'terminal'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal Shell</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('files');
              handleSelectFile('/home/user/notes.txt');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 font-medium border-b-2 transition ${
              activeTab === 'files'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Workspace Files</span>
          </button>
          <button
            onClick={() => setActiveTab('processes')}
            className={`flex items-center gap-1.5 px-3 py-2 font-medium border-b-2 transition ${
              activeTab === 'processes'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Process Monitor</span>
          </button>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div className="px-5 py-1.5 bg-cyan-950/50 text-cyan-300 text-xs border-b border-cyan-800/50 flex items-center justify-between">
            <span>{statusMsg}</span>
            <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Main Tab Area */}
        <div className="flex-1 overflow-y-auto p-4 text-xs font-mono">
          {/* TAB 1: TERMINAL SHELL */}
          {activeTab === 'terminal' && (
            <div className="space-y-3 flex flex-col h-full">
              {/* Command Input Bar */}
              <div className="flex gap-2">
                <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5">
                  <span className="text-cyan-400 mr-2 font-bold">$</span>
                  <input
                    type="text"
                    value={commandInput}
                    onChange={e => setCommandInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRunCommand()}
                    placeholder="Enter shell command (e.g. 'ls', 'cat /home/user/notes.txt', 'ps', 'uname -a')..."
                    className="w-full bg-transparent text-slate-100 placeholder-slate-600 focus:outline-hidden text-xs"
                  />
                </div>
                <button
                  onClick={handleRunCommand}
                  className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-md flex items-center gap-1 text-xs transition"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Run</span>
                </button>
              </div>

              {/* Logs */}
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-3 overflow-y-auto max-h-[350px]">
                {commandLogs.map((log, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="text-cyan-400 font-semibold">$ {log.cmd}</span>
                      <span>{log.time}</span>
                    </div>
                    <pre className={`text-[11px] whitespace-pre-wrap ${log.ok ? 'text-slate-300' : 'text-rose-400'}`}>
                      {log.out}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: WORKSPACE FILE EXPLORER */}
          {activeTab === 'files' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* File list */}
              <div className="border border-slate-800 rounded-lg bg-slate-950 p-2 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold px-2">Files</span>
                {Array.from(virtualFiles.keys()).map(path => (
                  <div
                    key={path}
                    onClick={() => handleSelectFile(path)}
                    className={`px-2 py-1.5 rounded cursor-pointer truncate text-[11px] transition ${
                      selectedFile === path
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    {path}
                  </div>
                ))}
              </div>

              {/* File editor */}
              <div className="md:col-span-2 border border-slate-800 rounded-lg bg-slate-950 flex flex-col p-2 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[11px] text-slate-300 font-medium truncate">{selectedFile}</span>
                  <button
                    onClick={handleSaveFile}
                    className="flex items-center gap-1 px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded text-[11px] transition"
                  >
                    <Save className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                </div>
                <textarea
                  rows={10}
                  value={fileContent}
                  onChange={e => setFileContent(e.target.value)}
                  className="w-full flex-1 bg-transparent text-slate-200 text-xs resize-none focus:outline-hidden font-mono leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 3: PROCESS MONITOR */}
          {activeTab === 'processes' && (
            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">PID</th>
                    <th className="p-2.5">Process Name</th>
                    <th className="p-2.5 text-right">CPU %</th>
                    <th className="p-2.5 text-right">Mem (MB)</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {processes.map(proc => (
                    <tr key={proc.pid} className="hover:bg-slate-900/60">
                      <td className="p-2.5 font-mono text-cyan-400">{proc.pid}</td>
                      <td className="p-2.5 font-medium text-slate-200">{proc.name}</td>
                      <td className="p-2.5 text-right tabular-nums">{proc.cpu.toFixed(1)}%</td>
                      <td className="p-2.5 text-right tabular-nums">{proc.memoryMB.toFixed(1)} MB</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-emerald-400">
                          {proc.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => handleKillProcess(proc.pid)}
                          className="px-2 py-0.5 text-[10px] bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded transition"
                        >
                          Kill
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0d1424] flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400 font-mono">
            Platform: <strong className="text-slate-200">{platform}</strong> · Sandboxed Environment
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
