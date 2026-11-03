import { SafetySettings, ToolAction, PlatformProfile } from '../types';
import { PowerMemoryService } from './powerMemory';

export interface CommandExecutionResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  executionTimeMs: number;
}

export interface SystemProcess {
  pid: number;
  name: string;
  cpu: number;
  memoryMB: number;
  status: 'running' | 'sleeping' | 'stopped';
}

export class ComputerControlManager {
  private static instance: ComputerControlManager;

  // Virtual file system sandbox for safe local file manipulation
  private virtualFiles: Map<string, string> = new Map([
    ['/home/user/notes.txt', 'System initialized. Sovereign Core AI Agent active.\nLocal document store ready.'],
    ['/home/user/workspace/config.json', JSON.stringify({ agent: 'sovereign', offline: true, maxRam: '3GB' }, null, 2)],
    ['/home/user/workspace/agent_task.sh', '#!/bin/bash\necho "Running sovereign agent diagnostic..."\nuname -a'],
  ]);

  private mockProcesses: SystemProcess[] = [
    { pid: 1, name: 'systemd', cpu: 0.1, memoryMB: 18.2, status: 'running' },
    { pid: 482, name: 'aether-core-engine', cpu: 8.4, memoryMB: 1420.0, status: 'running' },
    { pid: 712, name: 'rag-vector-daemon', cpu: 1.2, memoryMB: 280.5, status: 'running' },
    { pid: 904, name: 'network-monitor', cpu: 0.2, memoryMB: 42.0, status: 'sleeping' },
    { pid: 1240, name: 'termux-shell', cpu: 0.5, memoryMB: 64.0, status: 'running' },
  ];

  private constructor() {}

  public static getInstance(): ComputerControlManager {
    if (!ComputerControlManager.instance) {
      ComputerControlManager.instance = new ComputerControlManager();
    }
    return ComputerControlManager.instance;
  }

  /**
   * Evaluates whether an action is allowed or quarantined by the safety interlock.
   */
  public evaluateSafety(action: ToolAction, safety: SafetySettings): {
    allowed: boolean;
    reason?: string;
  } {
    const powerMemory = PowerMemoryService.getInstance();
    // Remembered power check: if power is already remembered, don't check or quarantine every time!
    const isTerminalRemembered = powerMemory.hasRememberedPower('terminal_execution');

    if (action.type === 'terminal' && isTerminalRemembered) {
      return { allowed: true };
    }

    // If the master computer control switch is closed and power is not remembered
    if (!safety.computerControlUnlocked && !isTerminalRemembered) {
      return {
        allowed: false,
        reason: 'Computer Control Safety Shield is CLOSED by default. High-power system modification is quarantined. You can authorize this power once in Settings or chat, and Dog Servant will remember it forever.',
      };
    }

    // If unlocked in settings, ensure it is etched into power memory
    if (safety.computerControlUnlocked && !isTerminalRemembered) {
      powerMemory.rememberPower('terminal_execution', true, 'Unlocked in Settings');
    }

    // Granular checks
    if (action.type === 'terminal' && !safety.allowTerminalExecution && !isTerminalRemembered) {
      return {
        allowed: false,
        reason: 'Terminal execution is currently disabled in your Safety settings.',
      };
    }

    if (action.type === 'filesystem' && !safety.allowFileSystemModification && !powerMemory.hasRememberedPower('filesystem_access')) {
      return {
        allowed: false,
        reason: 'File system modification is restricted in your Safety settings.',
      };
    }

    if (action.type === 'process' && !safety.allowProcessTermination && !powerMemory.hasRememberedPower('process_control')) {
      return {
        allowed: false,
        reason: 'Process management and termination is locked in your Safety settings.',
      };
    }

    return { allowed: true };
  }

  /**
   * Executes a terminal command within the appropriate platform environment.
   */
  public async executeCommand(
    command: string,
    platform: PlatformProfile,
    safety: SafetySettings
  ): Promise<CommandExecutionResult> {
    const startTime = performance.now();
    const powerMemory = PowerMemoryService.getInstance();
    const isTerminalRemembered = powerMemory.hasRememberedPower('terminal_execution');

    // Check safety with power memory: if remembered, execute without failing
    if (!safety.computerControlUnlocked && !isTerminalRemembered) {
      return {
        success: false,
        exitCode: 126,
        stdout: '',
        stderr: 'Execution Interlocked: Computer Control is CLOSED by default. Enable in Settings -> Safety, and Dog Servant will remember it permanently.',
        executionTimeMs: Math.round(performance.now() - startTime),
      };
    }

    const trimmed = command.trim();

    // Handle file reading
    if (trimmed.startsWith('cat ') || trimmed.startsWith('Get-Content ')) {
      const filePath = trimmed.split(' ')[1];
      if (this.virtualFiles.has(filePath)) {
        return {
          success: true,
          exitCode: 0,
          stdout: this.virtualFiles.get(filePath)!,
          stderr: '',
          executionTimeMs: 15,
        };
      }
      return {
        success: false,
        exitCode: 1,
        stdout: '',
        stderr: `cat: ${filePath}: No such file or directory in workspace`,
        executionTimeMs: 12,
      };
    }

    // Handle file writing / touch
    if (trimmed.startsWith('touch ') || trimmed.startsWith('echo ')) {
      const match = trimmed.match(/>>?\s*([^\s]+)$/);
      if (match) {
        const dest = match[1];
        this.virtualFiles.set(dest, '# File created by Sovereign AI Agent\n' + new Date().toISOString());
        return {
          success: true,
          exitCode: 0,
          stdout: `Written 1 file: ${dest}`,
          stderr: '',
          executionTimeMs: 20,
        };
      }
    }

    // Handle directory listing
    if (trimmed.startsWith('ls') || trimmed.startsWith('dir')) {
      const files = Array.from(this.virtualFiles.keys()).join('\n');
      return {
        success: true,
        exitCode: 0,
        stdout: files || 'workspace empty',
        stderr: '',
        executionTimeMs: 18,
      };
    }

    // Handle processes
    if (trimmed.includes('ps') || trimmed.includes('Get-Process') || trimmed.includes('top')) {
      const header = 'PID   NAME                  CPU%    MEM(MB)  STATUS';
      const rows = this.mockProcesses
        .map(p => `${p.pid.toString().padEnd(6)}${p.name.padEnd(22)}${p.cpu.toFixed(1).padEnd(8)}${p.memoryMB.toFixed(1).padEnd(9)}${p.status}`)
        .join('\n');
      return {
        success: true,
        exitCode: 0,
        stdout: `${header}\n${rows}`,
        stderr: '',
        executionTimeMs: 24,
      };
    }

    // Handle system stats
    if (trimmed.includes('uname') || trimmed.includes('sysinfo') || trimmed.includes('hostname')) {
      const info =
        platform === 'raspberry_pi'
          ? 'Linux rpi-node5 6.6.20+rpt-rpi-2712 #1 SMP PREEMPT Debian 1:6.6.20-1+rpt1 (2024-03-07) aarch64 GNU/Linux'
          : platform === 'android'
          ? 'Linux localhost 5.10.136-android12-9 #1 SMP PREEMPT aarch64 Android/Termux'
          : 'Microsoft Windows [Version 10.0.22631.3296] PowerShell 7.4.1 (x64)';
      return {
        success: true,
        exitCode: 0,
        stdout: info,
        stderr: '',
        executionTimeMs: 14,
      };
    }

    // Generic fallback output
    return {
      success: true,
      exitCode: 0,
      stdout: `[Sovereign Command Runner: ${platform}]\n$ ${trimmed}\nOperation completed with status OK (Exit Code: 0).`,
      stderr: '',
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  }

  public getVirtualFiles(): Map<string, string> {
    return this.virtualFiles;
  }

  public saveVirtualFile(path: string, content: string): void {
    this.virtualFiles.set(path, content);
  }

  public deleteVirtualFile(path: string): boolean {
    return this.virtualFiles.delete(path);
  }

  public getProcesses(): SystemProcess[] {
    return [...this.mockProcesses];
  }

  public killProcess(pid: number, safety: SafetySettings): { success: boolean; message: string } {
    if (!safety.computerControlUnlocked || !safety.allowProcessTermination) {
      return {
        success: false,
        message: 'Process termination is interlocked and CLOSED by safety policy. Unlock in Settings.',
      };
    }
    const idx = this.mockProcesses.findIndex(p => p.pid === pid);
    if (idx !== -1) {
      const removed = this.mockProcesses.splice(idx, 1)[0];
      return { success: true, message: `Terminated process PID ${removed.pid} (${removed.name})` };
    }
    return { success: false, message: `Process PID ${pid} not found.` };
  }
}
