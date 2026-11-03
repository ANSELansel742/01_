import { ChatSession, ChatMessage, SystemSettings, AppMode } from '../types';
import { DEFAULT_DOG_PERSONALITY } from './dogServantPersonality';

const STORAGE_KEY_SESSIONS = 'sovereign_chat_sessions_v1';
const STORAGE_KEY_ACTIVE_ID = 'sovereign_active_session_id_v1';
const STORAGE_KEY_SETTINGS = 'sovereign_system_settings_v1';

export const DEFAULT_SETTINGS: SystemSettings = {
  safety: {
    computerControlUnlocked: false, // "power too much will be colesed first but can open in stettings"
    requireManualApproval: true,
    allowTerminalExecution: true,
    allowFileSystemModification: true,
    allowProcessTermination: false,
    sandboxOnly: true,
    maxCpuPercentage: 80,
    rememberAuthorizedPowers: true, // "it have the power to remeber the power it have instead of cheaking every time"
  },
  model: {
    activeModelId: 'orca-mini-3b',
    ramAllocationMB: 2400, // up to 3GB
    threadCount: 4,
    contextLengthTokens: 4096,
    temperature: 0.7,
    useWebGPU: true,
    localOllamaUrl: 'http://localhost:11434',
    useLocalOllama: false,
    ollamaModel: 'orca-mini',
    dualLLMEnabled: true,
    forbidCompanyInfo: true,
    personaTone: 'relaxed',
  },
  voice: {
    voiceEnabled: true,
    autoSpeak: false,
    selectedVoiceURI: '',
    rate: 1.0,
    pitch: 1.0,
    speechRecognitionLang: 'en-US',
  },
  rag: {
    accuracyBoostEnabled: true,
    chunkSize: 300,
    chunkOverlap: 50,
    topKRetrieval: 3,
    minSimilarityScore: 0.15,
  },
  personality: {
    ...DEFAULT_DOG_PERSONALITY,
  },
  platform: 'android',
  language: 'en',
  outputLanguageMode: 'auto',
  targetTranslateLang: 'zh',
  storageQuotaMB: 1024,
  storageUsedBytes: 0,
  highContrast: false,
};

export class ChatStorageManager {
  private static instance: ChatStorageManager;

  private constructor() {}

  public static getInstance(): ChatStorageManager {
    if (!ChatStorageManager.instance) {
      ChatStorageManager.instance = new ChatStorageManager();
    }
    return ChatStorageManager.instance;
  }

  public getSettings(): SystemSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          safety: { ...DEFAULT_SETTINGS.safety, ...parsed.safety },
          model: { ...DEFAULT_SETTINGS.model, ...parsed.model },
          voice: { ...DEFAULT_SETTINGS.voice, ...parsed.voice },
          rag: { ...DEFAULT_SETTINGS.rag, ...parsed.rag },
          personality: { ...DEFAULT_DOG_PERSONALITY, ...(parsed.personality || {}) },
        };
      }
    } catch (e) {
      console.warn('Failed to parse settings, falling back to defaults:', e);
    }
    return DEFAULT_SETTINGS;
  }

  public saveSettings(settings: SystemSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }

  public getSessions(): ChatSession[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load chat sessions:', e);
    }
    // Return initial default welcome chat
    return [this.createInitialSession()];
  }

  public saveSessions(sessions: ChatSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to persist sessions:', e);
    }
  }

  public getActiveSessionId(): string {
    const stored = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (stored) return stored;
    const sessions = this.getSessions();
    return sessions[0]?.id || 'session-initial';
  }

  public setActiveSessionId(id: string): void {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  }

  public createNewSession(mode: AppMode = 'agent'): ChatSession {
    const newSession: ChatSession = {
      id: 'session-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      mode,
      messages: [
        {
          id: 'msg-welcome-' + Date.now(),
          role: 'assistant',
          content: `Woof! Hello Master! 🐶 I am your loyal **Dog AI**, running natively on Android with 100% offline local intelligence!

- **Android & Mobile Optimized**: Designed to run smoothly on Android devices and tablets.
- **Offline Intelligence**: Running completely on your local device with zero external cloud dependencies.
- **Trilingual Assistant**: Fluent in English, 中文 (Chinese), and Español with real translation.

How can I serve you today, Master?`,
          mode,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    const sessions = this.getSessions();
    sessions.unshift(newSession);
    this.saveSessions(sessions);
    this.setActiveSessionId(newSession.id);
    return newSession;
  }

  private createInitialSession(): ChatSession {
    return {
      id: 'session-initial',
      title: 'Dog AI',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: true,
      mode: 'agent',
      messages: [
        {
          id: 'msg-1',
          role: 'assistant',
          content: `Woof! Welcome Master! 🐶 I am your loyal **Dog AI**, optimized for **Android** with full offline intelligence!

- **Android Optimized**: Install directly to your Android home screen as an app.
- **Loyal Assistant**: Ready to answer questions, write code, analyze documents, and assist with any task.
- **True Translation**: Accurate translations across English, 中文, and Español.
- **100% Offline**: Zero external cloud APIs needed, fully private on your device.

How may your loyal Dog AI serve you today, Master? 🐾`,
          mode: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
  }

  public exportBackup(): string {
    const backupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      sessions: this.getSessions(),
    };
    return JSON.stringify(backupData, null, 2);
  }

  public importBackup(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) {
        this.saveSettings(data.settings);
      }
      if (Array.isArray(data.sessions)) {
        this.saveSessions(data.sessions);
        if (data.sessions[0]?.id) {
          this.setActiveSessionId(data.sessions[0].id);
        }
      }
      return { success: true, message: `Successfully restored ${data.sessions?.length || 0} sessions and system settings.` };
    } catch (e) {
      return { success: false, message: 'Invalid backup file format: ' + (e instanceof Error ? e.message : String(e)) };
    }
  }
}
