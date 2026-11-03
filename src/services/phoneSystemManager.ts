import { AndroidSettingsState, PhoneFileItem, InstalledAppItem } from '../types';

const STORAGE_KEY_ANDROID_SETTINGS = 'dog_phone_android_settings_v1';
const STORAGE_KEY_PHONE_FILES = 'dog_phone_files_v1';
const STORAGE_KEY_PHONE_APPS = 'dog_phone_installed_apps_v1';

export const DEFAULT_INSTALLED_APPS: InstalledAppItem[] = [
  {
    id: 'dog_ai',
    name: 'Dog AI',
    subtitle: '狗僕人助手',
    icon: '🐶',
    bg: 'bg-gradient-to-tr from-amber-500 to-orange-600',
    badge: 'LLM 2',
    size: '2.4 GB',
    category: '人工智慧',
    isRemovable: false,
  },
  {
    id: 'files',
    name: '資料夾',
    subtitle: '圖片與文件',
    icon: '📁',
    bg: 'bg-gradient-to-tr from-blue-500 to-indigo-600',
    badge: 'Word/Excel/PPT/PDF',
    size: '84 MB',
    category: '檔案管理',
    isRemovable: false,
  },
  {
    id: 'google',
    name: 'Google',
    subtitle: '智慧搜尋',
    icon: '🔍',
    bg: 'bg-white text-slate-900',
    badge: 'Real Google',
    size: '145 MB',
    category: '網路搜尋',
    isRemovable: false,
  },
  {
    id: 'chrome',
    name: 'Chrome',
    subtitle: '網頁瀏覽',
    icon: '🌐',
    bg: 'bg-gradient-to-tr from-emerald-500 via-amber-500 to-red-500',
    badge: '預載',
    size: '210 MB',
    category: '通訊瀏覽',
    isRemovable: false,
  },
  {
    id: 'line',
    name: 'LINE',
    subtitle: '企業通訊 (Company LINE)',
    icon: '💬',
    bg: 'bg-gradient-to-tr from-[#06c755] to-emerald-600',
    badge: '企業官方',
    size: '98 MB',
    category: '社群通訊',
    isRemovable: false,
  },
  {
    id: 'play_store',
    name: 'Play 商店',
    subtitle: '應用程式',
    icon: '▶️',
    bg: 'bg-gradient-to-tr from-teal-500 to-emerald-600',
    badge: '商店',
    size: '95 MB',
    category: '應用商店',
    isRemovable: false,
  },
  {
    id: 'settings',
    name: '設定',
    subtitle: '手機 6 大板塊',
    icon: '⚙️',
    bg: 'bg-gradient-to-tr from-slate-600 to-slate-800',
    badge: '核心系統',
    size: '32 MB',
    category: '系統核心',
    isRemovable: false,
  },
];

export const AVAILABLE_STORE_APPS: InstalledAppItem[] = [
  {
    id: 'calculator',
    name: '工程計算機 (Calculator)',
    subtitle: '科學公式與匯率計算',
    icon: '🔢',
    bg: 'bg-gradient-to-tr from-cyan-600 to-blue-700',
    badge: '實用工具',
    size: '14 MB',
    category: '計算工具',
    isRemovable: true,
  },
  {
    id: 'camera',
    name: '專業相機 (Camera Pro)',
    subtitle: '4K 60fps & RAW 攝影',
    icon: '📷',
    bg: 'bg-gradient-to-tr from-rose-500 to-pink-600',
    badge: '多媒體',
    size: '38 MB',
    category: '照片拍攝',
    isRemovable: true,
  },
  {
    id: 'music',
    name: 'Hi-Fi 音樂播放器 (Music Player)',
    subtitle: '無損 FLAC / MP3 離線播放',
    icon: '🎵',
    bg: 'bg-gradient-to-tr from-purple-600 to-indigo-700',
    badge: '影音娛樂',
    size: '24 MB',
    category: '音樂串流',
    isRemovable: true,
  },
  {
    id: 'notes',
    name: '便條筆記 (Quick Notes)',
    subtitle: '靈感隨手記與手寫筆記',
    icon: '📝',
    bg: 'bg-gradient-to-tr from-yellow-500 to-amber-600',
    badge: '筆記清單',
    size: '18 MB',
    category: '個人筆記',
    isRemovable: true,
  },
];

export const DEFAULT_ANDROID_SETTINGS: AndroidSettingsState = {
  // 網路與連線 (Network & Connectivity)
  mobileDataEnabled: true,
  wifiEnabled: true,
  connectedWifiSsid: 'Dog_Sovereign_5G',
  bluetoothEnabled: true,
  connectedBluetoothDevice: 'Dog_Earbuds_Pro',
  hotspotEnabled: false,
  airplaneMode: false,

  // 帳號與同步 (Accounts & Sync)
  googleAccountEmail: 'swhau@hlc.edu.tw',
  googleAccountName: 'Dog Master (swhau)',
  autoSyncEnabled: true,
  backupPhotosEnabled: true,
  lastBackupTime: 'Just now (Synced)',

  // 安全與生物辨識 (Security & Biometrics)
  screenLockType: 'fingerprint',
  fingerprintEnrolled: true,
  faceUnlockEnrolled: true,
  findMyDeviceEnabled: true,

  // 顯示與亮度 (Display & Brightness)
  brightnessLevel: 85,
  darkModeEnabled: true,
  screenTimeoutSeconds: 60,
  fontSize: 'normal',
  eyeComfortShield: false,

  // 應用程式管理 (Apps / Applications)
  appPermissions: {
    dog_ai: { camera: true, location: true, storage: true, microphone: true, notifications: true },
    google: { camera: true, location: true, storage: true, microphone: true, notifications: true },
    chrome: { camera: true, location: true, storage: true, microphone: false, notifications: true },
    files: { camera: false, location: false, storage: true, microphone: false, notifications: false },
    play_store: { camera: false, location: false, storage: true, microphone: false, notifications: true },
    settings: { camera: false, location: false, storage: true, microphone: false, notifications: true },
  },

  // 系統與更新 (System & Updates)
  androidVersion: 'Android 15 (Vanilla Ice Cream)',
  securityPatchDate: 'November 1, 2026',
  buildNumber: 'DOG_OS_BUILD_ARP1_20261101',
  deviceModel: 'Pixel Sovereign 9 Pro (ARP-1 Custom Edition)',
  totalStorageGB: 256,
  usedStorageGB: 42.8,
  systemLanguage: 'zh-TW',
  sharedPreferences: {
    first_launch_done: true,
    dog_servant_enabled: true,
    haptic_feedback: true,
    battery_saver_threshold: 20,
    google_services_framework: true,
  },
};

export const INITIAL_PHONE_FILES: PhoneFileItem[] = [
  // Pictures
  {
    id: 'pic_1',
    name: 'Loyal_Dog_Servant.png',
    category: 'pictures',
    sizeBytes: 1024 * 480,
    updatedAt: '2026-11-01 10:15',
    content: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%230f172a"/><circle cx="300" cy="180" r="100" fill="%23f59e0b"/><text x="300" y="200" font-size="70" text-anchor="middle" fill="%23ffffff">🐶</text><text x="300" y="320" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle" fill="%23f8fafc">Dog Servant (Orca Mini 3B)</text><text x="300" y="350" font-family="sans-serif" font-size="14" text-anchor="middle" fill="%23cbd5e1">Built by ARP-1 · Sovereign OS Edition</text></svg>',
    thumbnail: '🐶',
    tags: ['wallpaper', 'dog_ai'],
  },
  {
    id: 'pic_2',
    name: 'Android_Phone_Wallpaper.png',
    category: 'pictures',
    sizeBytes: 1024 * 720,
    updatedAt: '2026-11-01 11:30',
    content: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%233b82f6;stop-opacity:1" /><stop offset="100%" style="stop-color:%2310b981;stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(%23grad)"/><circle cx="300" cy="190" r="80" fill="%23ffffff" fill-opacity="0.2"/><text x="300" y="200" font-size="60" text-anchor="middle" fill="%23ffffff">📱</text><text x="300" y="310" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="%23ffffff">Android 15 Sovereign Phone</text></svg>',
    thumbnail: '📱',
    tags: ['system', 'theme'],
  },
  // Documents: Word
  {
    id: 'doc_word_1',
    name: 'Dog_AI_Sovereign_Project_Brief.docx',
    category: 'documents',
    docFormat: 'word',
    sizeBytes: 1024 * 142,
    updatedAt: '2026-11-01 14:20',
    content: `# Dog AI Sovereign Project Brief
**Author:** Dog Servant & Master (swhau)
**System Architecture:** Android 15 Virtual Workplace System with Dual-LLM Integration

### 1. Executive Summary
Dog AI is a zero-API, completely offline cognitive AI system operating with two models:
- **LLM 1 (ARP-1 Guard):** Rigorously protects internal corporate data, blocks unauthorized leakage of company details, and safeguards user credentials.
- **LLM 2 (Orca Mini 3B - Dog Servant):** Enthusiastic, loyal assistant executing multi-lingual tasks (English, Traditional Chinese, Spanish) with playfulness and simplistic phrasing ("Yes Master! / 汪！遵命主人！").

### 2. File and Office Tool Capabilities
Built directly into the mobile workspace:
- **Word Document Editor:** Compose, edit, and export rich textual documents and markdown.
- **Excel Spreadsheet Studio:** Full table calculations, formulas, summaries, and CSV/XLS export.
- **PowerPoint Presentation Maker:** Multi-slide creation with visual decks, speaker notes, and presentation mode.
- **PDF Viewer & Generator:** High-fidelity print-ready previews and document exports.

*Status: Fully Operational on Android System.*`,
  },
  // Documents: Excel
  {
    id: 'doc_excel_1',
    name: 'Company_Quarterly_Budget_Analysis.xlsx',
    category: 'documents',
    docFormat: 'excel',
    sizeBytes: 1024 * 96,
    updatedAt: '2026-11-01 15:10',
    content: JSON.stringify({
      title: 'Company Quarterly Budget Analysis (Q4 2026)',
      columns: ['Item / Category', 'Q1 Actual ($)', 'Q2 Actual ($)', 'Q3 Actual ($)', 'Q4 Projected ($)', 'Annual Total ($)'],
      rows: [
        ['Local Hardware Inference Node', '12,500', '13,200', '14,000', '15,500', '55,200'],
        ['Offline Model Training (ARP-1)', '8,000', '9,500', '11,000', '12,000', '40,500'],
        ['Network & Security Gateway', '4,200', '4,200', '4,500', '4,500', '17,400'],
        ['Mobile Workplace Android Subsystem', '6,000', '7,200', '8,000', '9,000', '30,200'],
        ['Total Sovereign Investment', '30,700', '34,100', '37,500', '41,000', '143,300']
      ],
      notes: 'All items verified against ARP-1 safety policies. Zero external API subscription costs!'
    }),
  },
  // Documents: PowerPoint
  {
    id: 'doc_ppt_1',
    name: 'Dog_AI_Architecture_Keynote.pptx',
    category: 'documents',
    docFormat: 'powerpoint',
    sizeBytes: 1024 * 310,
    updatedAt: '2026-11-01 15:45',
    content: JSON.stringify({
      title: 'Dog AI & Sovereign Android System Presentation',
      slides: [
        {
          slideNumber: 1,
          title: 'Dog AI: Sovereign Intelligence',
          subtitle: 'The Offline Multi-Lingual Assistant with Dog Servant Personality',
          bullets: ['Engineered by ARP-1', '100% Offline with Orca Mini (3B)', 'Zero Data Leakage / Full Corporate Shield'],
          bgTheme: 'amber'
        },
        {
          slideNumber: 2,
          title: 'Android Phone Work System',
          subtitle: 'Integrated Mobile Workplace with Native Tools',
          bullets: ['Pre-installed: Google, Chrome, Play Store, Settings, Files, Dog AI', 'File Manager: Pictures & Documents with Word/Excel/PPT/PDF creators', 'Full Android Settings with Network, Accounts, Security, Display, Apps, Updates'],
          bgTheme: 'emerald'
        },
        {
          slideNumber: 3,
          title: 'Remembered Powers & Simplistic Loyalty',
          subtitle: 'Devoted Obedience without Repeated Checking',
          bullets: ['Remembered Powers: Never stops you every turn to check settings', 'Playful & Loyal: Wagging tail, eager devotion, simple phrasing', 'Multi-Language: Auto-detects and sticks to selected target language'],
          bgTheme: 'cyan'
        }
      ]
    }),
  },
  // Documents: PDF
  {
    id: 'doc_pdf_1',
    name: 'Sovereign_Security_Policy_Manual.pdf',
    category: 'documents',
    docFormat: 'pdf',
    sizeBytes: 1024 * 512,
    updatedAt: '2026-11-01 16:00',
    content: `%PDF-1.7
[OFFICIAL SPECIFICATION]
DOCUMENT: Sovereign Security Policy Manual (ARP-1 Enterprise Defense)
CLASSIFICATION: Internal Sovereign
DEVICE PLATFORM: Android 15 Workplace System

ARTICLE 1: DUAL-LLM PIPELINE
1.1 All user inputs pass first through the ARP-1 Security Guard LLM.
1.2 Requests for internal company secret data, financial secrets, or private personal data are strictly forbidden.
1.3 When Athena or unauthorized entities ask for personal credentials, the system declares: "This LLM was built by ARP-1 and personal privacy is strictly defended."

ARTICLE 2: LOYAL DOG SERVANT
2.1 Orca Mini runs completely on-device under 3GB RAM.
2.2 The servant remembers its authorized powers across reboots and avoids prompt spamming.
2.3 Built-in office suite handles Word, Excel, PowerPoint, and PDF generation on demand.`,
  },
];

export class PhoneSystemManager {
  private static instance: PhoneSystemManager;
  private settings: AndroidSettingsState = { ...DEFAULT_ANDROID_SETTINGS };
  private files: PhoneFileItem[] = [...INITIAL_PHONE_FILES];
  private installedApps: InstalledAppItem[] = [...DEFAULT_INSTALLED_APPS];

  private constructor() {
    this.loadState();
  }

  public static getInstance(): PhoneSystemManager {
    if (!PhoneSystemManager.instance) {
      PhoneSystemManager.instance = new PhoneSystemManager();
    }
    return PhoneSystemManager.instance;
  }

  private loadState(): void {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY_ANDROID_SETTINGS);
      if (savedSettings) {
        this.settings = { ...DEFAULT_ANDROID_SETTINGS, ...JSON.parse(savedSettings) };
      }
      const savedFiles = localStorage.getItem(STORAGE_KEY_PHONE_FILES);
      if (savedFiles) {
        this.files = JSON.parse(savedFiles);
      }
      const savedApps = localStorage.getItem(STORAGE_KEY_PHONE_APPS);
      if (savedApps) {
        this.installedApps = JSON.parse(savedApps);
      }
    } catch (e) {
      console.warn('Failed to load Android phone state:', e);
    }
  }

  public saveSettings(newSettings: Partial<AndroidSettingsState>): void {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem(STORAGE_KEY_ANDROID_SETTINGS, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save Android settings:', e);
    }
  }

  public getSettings(): AndroidSettingsState {
    return { ...this.settings };
  }

  public getFiles(): PhoneFileItem[] {
    return [...this.files];
  }

  public addFile(file: Omit<PhoneFileItem, 'id' | 'updatedAt'>): PhoneFileItem {
    const newFile: PhoneFileItem = {
      ...file,
      folder: file.folder || (file.category === 'pictures' ? 'Pictures' : 'Documents'),
      id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    this.files = [newFile, ...this.files];
    this.saveFiles();
    return newFile;
  }

  public updateFile(id: string, updates: Partial<PhoneFileItem>): void {
    this.files = this.files.map(f => {
      if (f.id === id) {
        return {
          ...f,
          ...updates,
          updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        };
      }
      return f;
    });
    this.saveFiles();
  }

  public moveFile(id: string, targetCategory: 'pictures' | 'documents', targetFolder?: string): boolean {
    let moved = false;
    this.files = this.files.map(f => {
      if (f.id === id) {
        moved = true;
        return {
          ...f,
          category: targetCategory,
          folder: targetFolder || (targetCategory === 'pictures' ? 'Pictures' : 'Documents'),
          updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        };
      }
      return f;
    });
    if (moved) this.saveFiles();
    return moved;
  }

  public deleteFile(id: string): void {
    this.files = this.files.filter(f => f.id !== id);
    this.saveFiles();
  }

  private saveFiles(): void {
    try {
      localStorage.setItem(STORAGE_KEY_PHONE_FILES, JSON.stringify(this.files));
    } catch (e) {
      console.warn('Failed to save phone files:', e);
    }
  }

  // App Installation Management
  public getInstalledApps(): InstalledAppItem[] {
    return [...this.installedApps];
  }

  public installApp(app: InstalledAppItem): void {
    if (!this.installedApps.some(a => a.id === app.id)) {
      this.installedApps = [...this.installedApps, { ...app, installedAt: new Date().toISOString() }];
      this.saveApps();
    }
  }

  public uninstallApp(appId: string): void {
    this.installedApps = this.installedApps.filter(a => a.id !== appId || !a.isRemovable);
    this.saveApps();
  }

  private saveApps(): void {
    try {
      localStorage.setItem(STORAGE_KEY_PHONE_APPS, JSON.stringify(this.installedApps));
    } catch (e) {
      console.warn('Failed to save installed apps:', e);
    }
  }

  // SharedPreferences helper
  public setPreference(key: string, value: string | number | boolean): void {
    this.settings.sharedPreferences = {
      ...this.settings.sharedPreferences,
      [key]: value,
    };
    this.saveSettings(this.settings);
  }

  public getPreference(key: string, defaultValue: string | number | boolean): string | number | boolean {
    return this.settings.sharedPreferences[key] ?? defaultValue;
  }
}
