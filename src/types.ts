export type AppMode = 'llm' | 'agent';

export type PlatformProfile = 'windows' | 'raspberry_pi' | 'android' | 'linux';

export type SupportedLanguage = 'en' | 'zh' | 'es';

export interface TranslationResult {
  sourceText: string;
  translatedText: string;
  sourceLang: SupportedLanguage;
  targetLang: SupportedLanguage;
  phonetics?: string;
  notes?: string;
}

export interface ModelProfile {
  id: string;
  name: string;
  sizeGB: number;
  parameters: string;
  quantization: string;
  contextWindow: number;
  recommendedRAM: string;
  targetHardware: string;
  tokensPerSec: number;
  description: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentName: string;
  chunkIndex: number;
  text: string;
  tokenCount: number;
  score?: number;
}

export interface UploadedDocument {
  id: string;
  name: string;
  sizeBytes: number;
  type: string;
  uploadedAt: string;
  chunksCount: number;
  content: string;
}

export interface ToolAction {
  id: string;
  type: 'terminal' | 'filesystem' | 'process' | 'gui' | 'web_search' | 'document_query';
  title: string;
  command?: string;
  payload?: Record<string, unknown>;
  status: 'quarantined' | 'pending_approval' | 'executed' | 'rejected' | 'failed';
  output?: string;
  requiresHighPower: boolean;
  quarantineReason?: string;
  executedAt?: string;
}

export interface AgentStep {
  stepNumber: number;
  thought: string;
  action?: ToolAction;
  observation?: string;
  completed: boolean;
}

export interface Citation {
  documentId: string;
  documentName: string;
  chunkIndex: number;
  snippet: string;
  score: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  thought?: string; // Collapsible reasoning in Agent mode
  mode: AppMode;
  modelUsed?: string;
  timestamp: string;
  attachments?: { name: string; size: number; type: string }[];
  agentSteps?: AgentStep[];
  toolActions?: ToolAction[];
  citations?: Citation[];
  isStreaming?: boolean;
  feedbackRating?: 1 | -1;
  feedbackCorrection?: string;
  isFeedbackTrained?: boolean;
  guardBlocked?: boolean;
  guardCategory?: 'company_defense' | 'athena_privacy' | 'creator_origin' | 'trained_memory';
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  messages: ChatMessage[];
  mode: AppMode;
}

export type DogPowerKey =
  | 'terminal_execution'
  | 'filesystem_access'
  | 'process_control'
  | 'document_rag'
  | 'offline_intelligence'
  | 'trilingual_translation'
  | 'arp1_guard_defense'
  | 'voice_synthesis'
  | 'app_installation'
  | 'file_relocation';

export interface PowerRecord {
  key: DogPowerKey;
  name: string;
  granted: boolean;
  authorizedAt?: string;
  description: string;
}

export interface DogServantPersonalityConfig {
  playfulness: number; // 1 to 5 (e.g. 4: joyful, wagging tail, high spirits)
  simplisticLoyalPhrasing: boolean; // simplistic, devoted, honest phrasing to master
  eagerTone: boolean; // enthusiastic puppy energy
  barkMetaphors: boolean; // Woof / 汪 / Guau expressions
  fetchMetaphors: boolean; // talks about fetching knowledge/answers
  rememberPowers: boolean; // remembers its granted powers without re-checking every time
}

export interface SafetySettings {
  computerControlUnlocked: boolean; // "power too much closed first but can open in settings"
  requireManualApproval: boolean;
  allowTerminalExecution: boolean;
  allowFileSystemModification: boolean;
  allowProcessTermination: boolean;
  sandboxOnly: boolean;
  maxCpuPercentage: number;
  rememberAuthorizedPowers: boolean; // Remembers granted power without checking every time
  rememberedPowersList?: string[];
}

export interface ModelSettings {
  activeModelId: string;
  ramAllocationMB: number; // up to 3GB (3072 MB)
  threadCount: number; // 1-8
  contextLengthTokens: number; // 2048, 4096, 8192
  temperature: number;
  useWebGPU: boolean;
  localOllamaUrl?: string;
  useLocalOllama: boolean;
  ollamaModel?: string; // e.g. 'orca-mini' or 'orca-mini:3b'
  dualLLMEnabled?: boolean; // LLM 1 (Guard) + LLM 2 (Orca Mini Agent)
  forbidCompanyInfo?: boolean; // Guard blocks company information
  personaTone?: 'relaxed' | 'concise' | 'technical';
  outputLanguageMode?: 'auto' | 'en' | 'zh' | 'es';
}

export interface VoiceSettings {
  voiceEnabled: boolean;
  autoSpeak: boolean;
  selectedVoiceURI: string;
  rate: number; // 0.5 - 2.0
  pitch: number; // 0.5 - 2.0
  speechRecognitionLang: string;
}

export interface RAGSettings {
  accuracyBoostEnabled: boolean;
  chunkSize: number;
  chunkOverlap: number;
  topKRetrieval: number;
  minSimilarityScore: number;
}

export interface SystemSettings {
  safety: SafetySettings;
  model: ModelSettings;
  voice: VoiceSettings;
  rag: RAGSettings;
  platform: PlatformProfile;
  language: SupportedLanguage; // 'en' | 'zh' | 'es'
  outputLanguageMode: 'auto' | 'en' | 'zh' | 'es'; // Auto-detect or sticky output language
  targetTranslateLang: SupportedLanguage;
  storageQuotaMB: number; // 1024 MB = 1GB
  storageUsedBytes: number;
  highContrast: boolean;
  personality?: DogServantPersonalityConfig;
}

export interface DeviceTelemetry {
  online: boolean;
  networkLatencyMs: number;
  allocatedRAMMB: number;
  cpuLoadPercent: number;
  batteryLevel?: number;
  activePlatform: PlatformProfile;
}

// Android Phone System Types
export type PhoneAppId = 
  | 'dog_ai' 
  | 'line'
  | 'google' 
  | 'files' 
  | 'chrome' 
  | 'play_store' 
  | 'settings' 
  | 'office_suite'
  | 'calculator'
  | 'camera'
  | 'music'
  | 'notes'
  | string;

export interface LineContact {
  id: string;
  name: string;
  avatar: string;
  statusMessage: string;
  isOfficial?: boolean;
  department?: string;
}

export interface LineSticker {
  id: string;
  name: string;
  emoji: string;
  pack: string;
}

export interface LineCallRecord {
  id: string;
  contactId: string;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  timestamp: string;
  durationSeconds: number;
}

export interface LineVoomPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  department?: string;
  content: string;
  mediaEmoji?: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  comments: { id: string; authorName: string; text: string; timestamp: string }[];
}

export interface LineChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
  isBlocked?: boolean;
  blockReason?: string;
  sticker?: string;
  mediaType?: 'image' | 'file' | 'audio' | 'voice_note';
  mediaName?: string;
}

export interface LineAccountState {
  lineId: string;
  displayName: string;
  statusMessage: string;
  phoneNumber: string;
  email: string;
  avatar: string;
  isCompanyAccount: boolean;
  companyName: string;
  contacts: LineContact[];
  messages: Record<string, LineChatMessage[]>; // contactId -> messages
  callLogs?: LineCallRecord[];
  voomPosts?: LineVoomPost[];
  linePayBalance?: number;
}

export type FileCategory = 'pictures' | 'documents';
export type DocumentFormat = 'word' | 'excel' | 'powerpoint' | 'pdf';

export interface PhoneFileItem {
  id: string;
  name: string;
  category: FileCategory;
  docFormat?: DocumentFormat;
  sizeBytes: number;
  updatedAt: string;
  content: string; // text content, spreadsheet json, presentation slides, or svg/image data uri
  thumbnail?: string;
  tags?: string[];
  folder?: string; // e.g. 'Downloads', 'Work', 'Personal', 'Archives', 'Camera'
}

export interface InstalledAppItem {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  iconUrl?: string;
  bg: string;
  badge: string;
  installedAt?: string;
  size: string;
  category: string;
  isRemovable?: boolean;
  packageId?: string;
  developer?: string;
  rating?: string;
  downloads?: string;
  description?: string;
  isWorkProfile?: boolean;
  webAppUrl?: string;
  screenshots?: string[];
  ratingCount?: string;
}

export interface LineSticker {
  id: string;
  name: string;
  emoji: string;
  pack: string;
}

export interface AndroidSettingsState {
  // 網路與連線 (Network & Connectivity)
  mobileDataEnabled: boolean;
  wifiEnabled: boolean;
  connectedWifiSsid: string;
  bluetoothEnabled: boolean;
  connectedBluetoothDevice: string;
  hotspotEnabled: boolean;
  airplaneMode: boolean;

  // 帳號與同步 (Accounts & Sync)
  googleAccountEmail: string;
  googleAccountName: string;
  autoSyncEnabled: boolean;
  backupPhotosEnabled: boolean;
  lastBackupTime: string;

  // 安全與生物辨識 (Security & Biometrics)
  screenLockType: 'none' | 'pin' | 'pattern' | 'password' | 'fingerprint' | 'face';
  fingerprintEnrolled: boolean;
  faceUnlockEnrolled: boolean;
  findMyDeviceEnabled: boolean;

  // 顯示與亮度 (Display & Brightness)
  brightnessLevel: number; // 0 - 100
  darkModeEnabled: boolean;
  screenTimeoutSeconds: number; // 15, 30, 60, 120, 300
  fontSize: 'small' | 'normal' | 'large' | 'huge';
  eyeComfortShield: boolean;

  // 應用程式管理 (Apps / Applications)
  appPermissions: Record<string, { camera: boolean; location: boolean; storage: boolean; microphone: boolean; notifications: boolean }>;
  
  // 系統與更新 (System & Updates)
  androidVersion: string;
  securityPatchDate: string;
  buildNumber: string;
  deviceModel: string;
  totalStorageGB: number;
  usedStorageGB: number;
  systemLanguage: 'zh-TW' | 'en-US' | 'es-ES';
  sharedPreferences: Record<string, string | number | boolean>;
}
