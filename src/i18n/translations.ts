import { SupportedLanguage } from '../types';

export interface TranslationStrings {
  brandName: string;
  dogServant: string;
  outputLanguagePolicy: string;
  outputLangAuto: string;
  outputLangStickEn: string;
  outputLangStickZh: string;
  outputLangStickEs: string;
  agentMode: string;
  llmMode: string;
  documents: string;
  computerControl: string;
  translator: string;
  safetyProtected: string;
  safetyUnlocked: string;
  wifiOnline: string;
  offlineMode: string;
  storageUsage: string;
  conversations: string;
  newAgentChat: string;
  newLLMChat: string;
  searchHistory: string;
  storage1GBQuota: string;
  zeroCloudAPIs: string;
  inputPlaceholderAgent: string;
  inputPlaceholderLLM: string;
  addFile: string;
  voice: string;
  listening: string;
  safetyReminderClosed: string;
  openSettings: string;
  closeSafetyLock: string;
  unlockControls: string;
  settingsTitle: string;
  settingsSubtitle: string;
  saveSettings: string;
  cancel: string;
  tabSafety: string;
  tabModel: string;
  tabRAG: string;
  tabVoice: string;
  tabPlatform: string;
  tabStorage: string;
  tabLanguage: string;
  languageSelect: string;
  languageEnglish: string;
  languageChinese: string;
  languageSpanish: string;
  translateMessage: string;
  translatedTo: string;
  copyPassage: string;
  copy: string;
  copied: string;
  run: string;
  terminate: string;
  saveFile: string;
  ragAccuracyBoost: string;
  quotaUsed: string;
}

export const I18N: Record<SupportedLanguage, TranslationStrings> = {
  en: {
    brandName: 'Dog AI',
    dogServant: 'Dog Servant',
    outputLanguagePolicy: 'Output Response Language',
    outputLangAuto: 'Auto-detect from message (Default)',
    outputLangStickEn: 'Stick to English (Always reply in English)',
    outputLangStickZh: 'Stick to 中文 (Always reply in Chinese)',
    outputLangStickEs: 'Stick to Español (Always reply in Spanish)',
    agentMode: 'Dog AI',
    llmMode: 'Dog AI',
    documents: 'Documents',
    computerControl: 'Computer Control',
    translator: 'Translator',
    safetyProtected: 'Safety: Protected (Closed)',
    safetyUnlocked: 'Safety: Unlocked',
    wifiOnline: 'Wi-Fi Online',
    offlineMode: '100% Offline',
    storageUsage: '1GB Local Storage',
    conversations: 'Conversations',
    newAgentChat: '+ Agent',
    newLLMChat: '+ Chat',
    searchHistory: 'Search chat history...',
    storage1GBQuota: 'IndexedDB 1GB Quota',
    zeroCloudAPIs: 'Zero Cloud APIs · Sovereign',
    inputPlaceholderAgent: 'Speak to your loyal Dog Servant (e.g. "Fetch notes", "Write a script", "Translate this")...',
    inputPlaceholderLLM: 'Speak to your loyal Dog Servant (e.g. "Fetch notes", "Write a script", "Translate this")...',
    addFile: 'Add File',
    voice: 'Voice',
    listening: 'Listening...',
    safetyReminderClosed: 'Computer control power is CLOSED by default for safety.',
    openSettings: 'Open in Settings',
    closeSafetyLock: 'Close Safety Lock',
    unlockControls: 'Unlock Controls',
    settingsTitle: 'System Settings & Governance',
    settingsSubtitle: 'Configure safety interlocks, local 3GB model, 1GB storage, trilingual settings, and platforms.',
    saveSettings: 'Save Settings',
    cancel: 'Cancel',
    tabSafety: 'Safety & Control',
    tabModel: 'Model Engine (3GB)',
    tabRAG: 'Document RAG',
    tabVoice: 'Voice Speech',
    tabPlatform: 'Platform & RPi',
    tabStorage: '1GB Storage & Data',
    tabLanguage: 'Languages (EN/ZH/ES)',
    languageSelect: 'Interface Language',
    languageEnglish: 'English (US)',
    languageChinese: '繁體中文 / 简体中文 (Chinese)',
    languageSpanish: 'Español (Spanish)',
    translateMessage: 'Translate',
    translatedTo: 'Translated to',
    copyPassage: 'Copy Passage',
    copy: 'Copy',
    copied: 'Copied',
    run: 'Run',
    terminate: 'Kill',
    saveFile: 'Save File',
    ragAccuracyBoost: 'RAG Accuracy Boost',
    quotaUsed: 'Used of 1.0 GB Storage',
  },
  zh: {
    brandName: 'Dog AI',
    dogServant: '忠誠狗僕人',
    outputLanguagePolicy: '輸出回覆語言政策',
    outputLangAuto: '自動檢測發問語言 (預設)',
    outputLangStickEn: '固定鎖定英文 (所有回答皆輸出英文)',
    outputLangStickZh: '固定鎖定中文 (所有回答皆輸出中文)',
    outputLangStickEs: '固定鎖定西班牙文 (所有回答皆輸出西文)',
    agentMode: 'Dog AI',
    llmMode: 'Dog AI',
    documents: '本地文檔庫',
    computerControl: '電腦控制系統',
    translator: '三語翻譯器',
    safetyProtected: '安全防護：已關閉 (安全中)',
    safetyUnlocked: '安全防護：已授權解鎖',
    wifiOnline: 'Wi-Fi 在線',
    offlineMode: '100% 離線運行',
    storageUsage: '1GB 本地存儲空間',
    conversations: '歷史會話',
    newAgentChat: '+ 新對話',
    newLLMChat: '+ 新對話',
    searchHistory: '搜尋對話歷史...',
    storage1GBQuota: 'IndexedDB 1GB 獨立配額',
    zeroCloudAPIs: '零雲端 API · 100% 本地自主',
    inputPlaceholderAgent: '對忠誠狗僕人說話（例如：「幫我寫腳本」、「檢查文件」、「翻譯段落」）...',
    inputPlaceholderLLM: '對忠誠狗僕人說話（例如：「幫我寫腳本」、「檢查文件」、「翻譯段落」）...',
    addFile: '新增文件',
    voice: '語音輸入',
    listening: '正在聆聽語音...',
    safetyReminderClosed: '出於安全考量，電腦高權限控制預設為「已關閉」狀態。',
    openSettings: '前往設定開啟',
    closeSafetyLock: '啟動安全封鎖',
    unlockControls: '授權解鎖控制',
    settingsTitle: 'Dog AI 系統設定與安全管控',
    settingsSubtitle: '配置安全開關、3GB 本地模型、1GB 存儲容量、中英西語言政策。',
    saveSettings: '儲存設定',
    cancel: '取消',
    tabSafety: '安全與電腦控制',
    tabModel: '本地模型 (最高3GB)',
    tabRAG: '本地文檔 RAG',
    tabVoice: '語音辨識與朗讀',
    tabPlatform: '樹莓派與跨平台',
    tabStorage: '1GB 存儲與備份',
    tabLanguage: '語言與真實翻譯',
    languageSelect: '介面與代理語言',
    languageEnglish: 'English (英文)',
    languageChinese: '中文 (Traditional/Simplified)',
    languageSpanish: 'Español (西班牙文)',
    translateMessage: '真實翻譯',
    translatedTo: '已翻譯為',
    copyPassage: '複製段落內容',
    copy: '複製',
    copied: '已複製',
    run: '執行命令',
    terminate: '結束進程',
    saveFile: '儲存文件',
    ragAccuracyBoost: 'RAG 準確率增強',
    quotaUsed: '已使用 1.0 GB 空間中的',
  },
  es: {
    brandName: 'Dog AI',
    dogServant: 'Perro Servidor',
    outputLanguagePolicy: 'Política de Idioma de Salida',
    outputLangAuto: 'Autodetectar del mensaje (Predeterminado)',
    outputLangStickEn: 'Fijar en Inglés (Siempre responder en inglés)',
    outputLangStickZh: 'Fijar en Chino (Siempre responder en chino)',
    outputLangStickEs: 'Fijar en Español (Siempre responder en español)',
    agentMode: 'Dog AI',
    llmMode: 'Dog AI',
    documents: 'Documentos',
    computerControl: 'Control Computadora',
    translator: 'Traductor Trilingüe',
    safetyProtected: 'Seguridad: Protegido (Cerrado)',
    safetyUnlocked: 'Seguridad: Desbloqueado',
    wifiOnline: 'Wi-Fi En Línea',
    offlineMode: '100% Fuera de Línea',
    storageUsage: '1GB Almacenamiento Local',
    conversations: 'Conversaciones',
    newAgentChat: '+ Nuevo Chat',
    newLLMChat: '+ Nuevo Chat',
    searchHistory: 'Buscar en el historial...',
    storage1GBQuota: 'Cuota de 1GB en IndexedDB',
    zeroCloudAPIs: 'Cero APIs en la nube · Soberano',
    inputPlaceholderAgent: 'Habla con tu fiel Perro Servidor (ej. "Revisar CPU", "Traducir notas")...',
    inputPlaceholderLLM: 'Habla con tu fiel Perro Servidor (ej. "Revisar CPU", "Traducir notas")...',
    addFile: 'Adjuntar',
    voice: 'Voz',
    listening: 'Escuchando voz...',
    safetyReminderClosed: 'El control de la computadora está CERRADO por defecto por seguridad.',
    openSettings: 'Abrir en Configuración',
    closeSafetyLock: 'Bloquear Seguridad',
    unlockControls: 'Desbloquear Control',
    settingsTitle: 'Configuración Dog AI y Gobernanza',
    settingsSubtitle: 'Configura seguridad, modelo de 3GB, almacenamiento de 1GB, idiomas y plataformas.',
    saveSettings: 'Guardar Ajustes',
    cancel: 'Cancelar',
    tabSafety: 'Seguridad y Control',
    tabModel: 'Motor LLM (3GB)',
    tabRAG: 'RAG Documental',
    tabVoice: 'Voz y Síntesis',
    tabPlatform: 'Plataforma y RPi',
    tabStorage: 'Almacenamiento 1GB',
    tabLanguage: 'Idiomas y Traducción Real',
    languageSelect: 'Idioma de la Interfaz',
    languageEnglish: 'English (Inglés)',
    languageChinese: '中文 (Chino)',
    languageSpanish: 'Español (Spanish)',
    translateMessage: 'Traducción Real',
    translatedTo: 'Traducido a',
    copyPassage: 'Copiar Pasaje',
    copy: 'Copiar',
    copied: 'Copiado',
    run: 'Ejecutar',
    terminate: 'Terminar',
    saveFile: 'Guardar Archivo',
    ragAccuracyBoost: 'Mejora de Precisión RAG',
    quotaUsed: 'Usado de 1.0 GB de almacenamiento',
  },
};
