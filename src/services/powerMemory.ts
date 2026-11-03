import { DogPowerKey, PowerRecord, SupportedLanguage } from '../types';

const POWER_STORAGE_KEY = 'dog_ai_remembered_powers_v2';

const BASE_POWERS: Record<DogPowerKey, { name: string; defaultGranted: boolean; description: string }> = {
  offline_intelligence: {
    name: 'Offline Intelligence Engine (Orca Mini 3B)',
    defaultGranted: true,
    description: 'Fully self-contained 3GB cognitive reasoning without external cloud APIs.',
  },
  arp1_guard_defense: {
    name: 'ARP-1 Security Guard LLM',
    defaultGranted: true,
    description: 'Guards internal company information and defends personal privacy.',
  },
  trilingual_translation: {
    name: 'Real Trilingual Translation (EN ↔ ZH ↔ ES)',
    defaultGranted: true,
    description: 'Real semantic translation engine with bidirectional offline dictionary.',
  },
  document_rag: {
    name: '1.0 GB Document RAG Knowledge Base',
    defaultGranted: true,
    description: 'IndexedDB persistent storage for semantic vector search and exact citations.',
  },
  voice_synthesis: {
    name: 'Voice Speech Synthesis & Recognition',
    defaultGranted: true,
    description: 'Hands-free voice recognition and speech playback on device.',
  },
  terminal_execution: {
    name: 'Autonomous Terminal & Computer Control',
    defaultGranted: false, // Opened once by user, then permanently remembered!
    description: 'Execution of bash, powershell, and system inspection commands.',
  },
  filesystem_access: {
    name: 'Workspace File System Read & Write',
    defaultGranted: true,
    description: 'Reading, editing, and persisting project files safely in sandbox.',
  },
  process_control: {
    name: 'Process Monitor & Task Management',
    defaultGranted: false,
    description: 'Inspecting CPU/RAM consumption and terminating runaway processes.',
  },
  app_installation: {
    name: 'Autonomous App Installation & Package Control',
    defaultGranted: true, // Dog AI has power to install apps directly for Master!
    description: 'Installing and provisioning phone applications, tools, and calculators for Master.',
  },
  file_relocation: {
    name: 'File & Photo Relocation Engine (Move Pictures & Docs)',
    defaultGranted: true, // Dog AI has power to move and relocate docs, pictures, and files!
    description: 'Moving files, organizing documents, and reorganizing pictures between folders.',
  },
};

export class PowerMemoryService {
  private static instance: PowerMemoryService;
  private memory: Map<DogPowerKey, PowerRecord> = new Map();

  private constructor() {
    this.loadMemory();
  }

  public static getInstance(): PowerMemoryService {
    if (!PowerMemoryService.instance) {
      PowerMemoryService.instance = new PowerMemoryService();
    }
    return PowerMemoryService.instance;
  }

  private loadMemory(): void {
    let saved: Record<string, any> = {};
    try {
      const raw = localStorage.getItem(POWER_STORAGE_KEY);
      if (raw) {
        saved = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to parse power memory:', e);
    }

    for (const [key, base] of Object.entries(BASE_POWERS) as [DogPowerKey, typeof BASE_POWERS[DogPowerKey]][]) {
      const record = saved[key];
      this.memory.set(key, {
        key,
        name: base.name,
        granted: record?.granted !== undefined ? Boolean(record.granted) : base.defaultGranted,
        authorizedAt: record?.authorizedAt || (base.defaultGranted ? 'Initial initialization' : undefined),
        description: base.description,
      });
    }
  }

  private saveMemory(): void {
    try {
      const obj: Record<string, PowerRecord> = {};
      this.memory.forEach((val, key) => {
        obj[key] = val;
      });
      localStorage.setItem(POWER_STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      console.warn('Failed to save power memory:', e);
    }
  }

  /**
   * Checks if the Dog Servant remembers having this power.
   * If remembered as granted, the Dog Servant does not need to check settings or quarantine!
   */
  public hasRememberedPower(powerKey: DogPowerKey): boolean {
    const record = this.memory.get(powerKey);
    return Boolean(record?.granted);
  }

  /**
   * Remembers a granted power permanently so the Dog Servant remembers it across reloads.
   */
  public rememberPower(powerKey: DogPowerKey, granted = true, note?: string): void {
    const existing = this.memory.get(powerKey);
    if (existing) {
      existing.granted = granted;
      if (granted && !existing.authorizedAt) {
        existing.authorizedAt = `${new Date().toLocaleTimeString()} (${note || 'Granted by Master'})`;
      }
    } else {
      const base = BASE_POWERS[powerKey];
      this.memory.set(powerKey, {
        key: powerKey,
        name: base?.name || powerKey,
        granted,
        authorizedAt: new Date().toLocaleTimeString(),
        description: base?.description || 'Custom capability',
      });
    }
    this.saveMemory();
  }

  /**
   * Syncs with SafetySettings: if computer control was unlocked, permanently remember terminal & control!
   */
  public syncSafetySettings(safety: { computerControlUnlocked?: boolean; allowTerminalExecution?: boolean; allowProcessTermination?: boolean }): void {
    if (safety.computerControlUnlocked) {
      this.rememberPower('terminal_execution', true, 'Unlocked in Settings');
      this.rememberPower('filesystem_access', true, 'Unlocked in Settings');
      if (safety.allowProcessTermination) {
        this.rememberPower('process_control', true, 'Unlocked in Settings');
      }
    }
  }

  /**
   * Gets all remembered powers.
   */
  public getAllRememberedPowers(): PowerRecord[] {
    return Array.from(this.memory.values());
  }

  /**
   * Returns a friendly formatted declaration of remembered powers in the user's language.
   * E.g. "I remember the powers I have! I don't need to check every time!"
   */
  public getRememberedPowersDeclaration(lang: SupportedLanguage = 'en'): string {
    const list = this.getAllRememberedPowers();
    const grantedList = list.filter(p => p.granted);

    if (lang === 'zh') {
      const items = grantedList.map((p, idx) => `  ${idx + 1}. **${p.name}**：${p.description} (已永久銘記 ✓)`).join('\n');
      return `汪！主人，我清楚記得我擁有的所有力量！我不需要每次都重複檢查！🐶✨

我已經永久記住並啟用了以下主權能力：
${items}

守護家園、跑腿執行任務，忠誠狗僕人永遠記得自己的本領，主人隨時吩咐！🐾`;
    }

    if (lang === 'es') {
      const items = grantedList.map((p, idx) => `  ${idx + 1}. **${p.name}**: ${p.description} (¡Poder Recordado ✓!)`).join('\n');
      return `¡Guau! ¡Mi amo, recuerdo perfectamente los poderes que tengo! ¡No necesito verificar cada vez! 🐶✨

Tengo memorizados y autorizados permanentemente los siguientes poderes:
${items}

¡Su leal Perro Servidor recuerda siempre sus facultades y está listo a sus órdenes! 🐾`;
    }

    const items = grantedList.map((p, idx) => `  ${idx + 1}. **${p.name}**: ${p.description} (Permanently Remembered ✓)`).join('\n');
    return `Woof! Master, I remember all the powers I have! I don't need to check every single time! 🐶✨

I have permanently committed these authorized powers to my memory:
${items}

Your loyal Dog Servant always remembers what powers it holds, ready to serve you on command, Master! 🐾`;
  }
}
