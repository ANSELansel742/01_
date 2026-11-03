import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, ChatMessage, SystemSettings, AppMode, Citation, SupportedLanguage } from './types';
import { ChatStorageManager } from './services/chatStorage';
import { LocalNeuralInferenceEngine } from './services/localLLM';
import { DocumentRAGProcessor } from './services/documentRAG';
import { VoiceSystemManager } from './services/voiceSystem';
import { NetworkSearchManager } from './services/networkSearch';
import { IndexedDBStorageManager } from './services/indexedDBStorage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { DocumentManagerModal } from './components/DocumentManagerModal';
import { ComputerControlModal } from './components/ComputerControlModal';
import { CitationViewerModal } from './components/CitationViewerModal';
import { TranslatorModal } from './components/TranslatorModal';
import { TrainingStudioModal } from './components/TrainingStudioModal';
import { AppInstallModal } from './components/AppInstallModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Menu } from 'lucide-react';

export default function App() {
  const storageManager = ChatStorageManager.getInstance();
  const ragProcessor = DocumentRAGProcessor.getInstance();
  const voiceManager = VoiceSystemManager.getInstance();
  const networkManager = NetworkSearchManager.getInstance();
  const idbManager = IndexedDBStorageManager.getInstance();
  const engine = LocalNeuralInferenceEngine.getInstance();

  const [settings, setSettings] = useState<SystemSettings>(() => storageManager.getSettings());
  const [sessions, setSessions] = useState<ChatSession[]>(() => storageManager.getSessions());
  const [activeSessionId, setActiveSessionId] = useState<string>(() => storageManager.getActiveSessionId());
  const [isOnline, setIsOnline] = useState<boolean>(() => networkManager.getStatus());
  const [storageUsedMB, setStorageUsedMB] = useState<number>(14.2);

  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isTranslatorOpen, setIsTranslatorOpen] = useState(false);
  const [isTrainingStudioOpen, setIsTrainingStudioOpen] = useState(false);
  const [isDeviceInstallOpen, setIsDeviceInstallOpen] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Active session
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const cancelStreamRef = useRef<(() => void) | null>(null);

  // Initialize IndexedDB and refresh storage telemetry
  useEffect(() => {
    idbManager.init().then(() => {
      refreshStorageStats();
    });
  }, []);

  const refreshStorageStats = async () => {
    try {
      const stats = await idbManager.getStorageStats();
      setStorageUsedMB(stats.usedMB);
    } catch {
      // fallback
    }
  };

  // Subscribe to network changes
  useEffect(() => {
    const unsub = networkManager.subscribe(online => setIsOnline(online));
    return () => unsub();
  }, []);

  // Save sessions to storage whenever they change
  useEffect(() => {
    storageManager.saveSessions(sessions);
    idbManager.saveSessions(sessions).catch(() => {});
    refreshStorageStats();
  }, [sessions]);

  // Save active session ID
  useEffect(() => {
    storageManager.setActiveSessionId(activeSessionId);
  }, [activeSessionId]);

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
  };

  const handleNewSession = (mode: AppMode) => {
    const newSession = storageManager.createNewSession(mode);
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (filtered.length === 0) {
        const fallback = storageManager.createNewSession('agent');
        setActiveSessionId(fallback.id);
        return [fallback];
      }
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleTogglePin = (id: string) => {
    setSessions(prev =>
      prev.map(s => (s.id === id ? { ...s, isPinned: !s.isPinned } : s))
    );
  };

  const handleToggleMode = (newMode: AppMode) => {
    setSessions(prev =>
      prev.map(s => (s.id === activeSessionId ? { ...s, mode: newMode } : s))
    );
  };

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    const updated = {
      ...settings,
      language: newLang,
      voice: {
        ...settings.voice,
        speechRecognitionLang: newLang === 'zh' ? 'zh-TW' : newLang === 'es' ? 'es-ES' : 'en-US',
      },
    };
    setSettings(updated);
    storageManager.saveSettings(updated);
  };

  const handleSaveSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    storageManager.saveSettings(newSettings);
  };

  // Upload document handler
  const handleUploadDocument = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async e => {
        const content = (e.target?.result as string) || '';
        const doc = ragProcessor.addDocument(file.name, content, file.size, file.type, settings.rag);
        await idbManager.saveDocument(doc);
        refreshStorageStats();
        resolve();
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleDeleteDocument = async (id: string) => {
    ragProcessor.removeDocument(id);
    await idbManager.deleteDocument(id);
    refreshStorageStats();
    setSettings(prev => ({ ...prev }));
  };

  // Voice speech toggles
  const handleToggleListening = () => {
    if (isListening) {
      voiceManager.stopListening();
      setIsListening(false);
    } else {
      const started = voiceManager.startListening(
        (transcript, isFinal) => {
          if (isFinal && transcript.trim()) {
            handleSendMessage(transcript.trim());
            voiceManager.stopListening();
            setIsListening(false);
          }
        },
        () => setIsListening(false),
        () => setIsListening(false)
      );
      if (started) {
        setIsListening(true);
      }
    }
  };

  const handleSpeak = (text: string, targetLang?: SupportedLanguage) => {
    setIsSpeaking(true);
    const activeLang = targetLang || settings.language || 'en';
    const voices = voiceManager.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(activeLang));

    voiceManager.speak(
      text,
      {
        ...settings.voice,
        selectedVoiceURI: matchingVoice?.voiceURI || settings.voice.selectedVoiceURI,
      },
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleStopSpeaking = () => {
    voiceManager.stopSpeaking();
    setIsSpeaking(false);
  };

  // Send message execution flow
  const handleSendMessage = async (text: string, files?: File[]) => {
    if (!text && (!files || files.length === 0)) return;

    // 1. If files attached, process into local RAG knowledge base
    const fileAttachments: { name: string; size: number; type: string }[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        fileAttachments.push({ name: file.name, size: file.size, type: file.type });
        try {
          await handleUploadDocument(file);
        } catch (err) {
          console.warn('Error reading attachment for RAG:', err);
        }
      }
    }

    const currentMode = activeSession.mode || 'agent';

    // 2. Add user message
    const userMessage: ChatMessage = {
      id: 'msg-user-' + Date.now(),
      role: 'user',
      content: text,
      mode: currentMode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: fileAttachments.length > 0 ? fileAttachments : undefined,
    };

    // 3. Prepare placeholder assistant message
    const assistantMessageId = 'msg-asst-' + (Date.now() + 1);
    const placeholderAssistant: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      thought: undefined,
      mode: currentMode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
    };

    const updatedMessages = [...activeSession.messages, userMessage, placeholderAssistant];
    setSessions(prev =>
      prev.map(s =>
        s.id === activeSessionId
          ? {
              ...s,
              title: s.messages.length <= 1 ? text.slice(0, 36) || 'Session' : s.title,
              updatedAt: new Date().toISOString(),
              messages: updatedMessages,
            }
          : s
      )
    );

    setIsLoading(true);

    // 4. Retrieve RAG Citations locally
    const citations = ragProcessor.searchRelevantChunks(text, settings.rag);

    // 5. Stream response from Sovereign Local Engine (Dog AI & Dog Servant)
    cancelStreamRef.current = await engine.generateStream(
      text,
      updatedMessages.slice(0, -1),
      currentMode,
      {
        ...settings.model,
        outputLanguageMode: settings.outputLanguageMode || 'auto',
      },
      settings.safety,
      citations,
      isOnline,
      {
        onToken: (_token, fullText) => {
          setSessions(prev =>
            prev.map(s =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map(m =>
                      m.id === assistantMessageId ? { ...m, content: fullText } : m
                    ),
                  }
                : s
            )
          );
        },
        onThought: thoughtText => {
          setSessions(prev =>
            prev.map(s =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map(m =>
                      m.id === assistantMessageId ? { ...m, thought: thoughtText } : m
                    ),
                  }
                : s
            )
          );
        },
        onStep: step => {
          setSessions(prev =>
            prev.map(s =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map(m =>
                      m.id === assistantMessageId
                        ? {
                            ...m,
                            agentSteps: [...(m.agentSteps || []), step],
                          }
                        : m
                    ),
                  }
                : s
            )
          );
        },
        onComplete: (fullResponse, steps, cited, toolActions) => {
          setIsLoading(false);
          cancelStreamRef.current = null;

          setSessions(prev =>
            prev.map(s =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map(m =>
                      m.id === assistantMessageId
                        ? {
                            ...m,
                            content: fullResponse,
                            isStreaming: false,
                            citations: cited && cited.length > 0 ? cited : undefined,
                            agentSteps: steps,
                            toolActions: toolActions && toolActions.length > 0 ? toolActions : undefined,
                          }
                        : m
                    ),
                  }
                : s
            )
          );

          // Auto-speak response if enabled in settings
          if (settings.voice.autoSpeak && fullResponse) {
            handleSpeak(fullResponse);
          }
        },
        onError: err => {
          setIsLoading(false);
          cancelStreamRef.current = null;
          console.error('Local engine error:', err);
          setSessions(prev =>
            prev.map(s =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map(m =>
                      m.id === assistantMessageId
                        ? {
                            ...m,
                            content: `**Local Engine Notice:** An error occurred while running the sovereign model: ${err.message}`,
                            isStreaming: false,
                          }
                        : m
                    ),
                  }
                : s
            )
          );
        },
      }
    );
  };

  const handleExportBackup = () => {
    const jsonStr = storageManager.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sovereign_core_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (jsonStr: string) => {
    const res = storageManager.importBackup(jsonStr);
    if (res.success) {
      setSettings(storageManager.getSettings());
      setSessions(storageManager.getSessions());
      setActiveSessionId(storageManager.getActiveSessionId());
      alert(res.message);
    } else {
      alert(res.message);
    }
  };

  const allDocuments = ragProcessor.getDocuments();

  return (
    <div className="flex h-screen w-full bg-[#090d16] text-slate-100 overflow-hidden select-text">
      {/* Sidebar for chat history, 1GB storage meter & hardware telemetry */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onTogglePin={handleTogglePin}
        settings={settings}
        storageUsedMB={storageUsedMB}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenTrainingStudio={() => setIsTrainingStudioOpen(true)}
        onOpenWindowsDownload={() => setIsDeviceInstallOpen(true)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Top Header with Language Switcher, Dog AI, and Android App Install */}
        <Header
          mode={activeSession.mode || 'agent'}
          onToggleMode={handleToggleMode}
          isOnline={isOnline}
          settings={settings}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenDocuments={() => setIsDocumentsOpen(true)}
          onOpenTranslator={() => setIsTranslatorOpen(true)}
          onOpenTrainingStudio={() => setIsTrainingStudioOpen(true)}
          onOpenDeviceInstall={() => setIsDeviceInstallOpen(true)}
          onLanguageChange={handleLanguageChange}
          documentsCount={allDocuments.length}
          storageUsedMB={storageUsedMB}
        />

        {/* Mobile Header Sub-bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-[#0c121e] text-xs">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white"
          >
            <Menu className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold truncate max-w-[120px]">{activeSession.title}</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDeviceInstallOpen(true)}
              className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
            >
              <span>🤖 Android App</span>
            </button>
            <button
              onClick={() => setIsTranslatorOpen(true)}
              className="text-slate-400 hover:underline"
            >
              Translate
            </button>
          </div>
        </div>

        {/* Message Stream with 1-click Trilingual Translate buttons */}
        <ChatArea
          messages={activeSession.messages}
          isLoading={isLoading}
          settings={settings}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onSelectCitation={cit => setSelectedCitation(cit)}
          onSpeak={handleSpeak}
          isSpeaking={isSpeaking}
          onStopSpeaking={handleStopSpeaking}
          onOpenDeviceInstall={() => setIsDeviceInstallOpen(true)}
        />

        {/* Bottom Input Area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          mode={activeSession.mode || 'agent'}
          onChangeMode={handleToggleMode}
          settings={settings}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isListening={isListening}
          onToggleListening={handleToggleListening}
          onOpenDeviceInstall={() => setIsDeviceInstallOpen(true)}
        />

        {/* Non-intrusive Offline Connectivity Notification */}
        <OfflineIndicator isOnline={isOnline} />
      </div>

      {/* Modals */}
      <AppInstallModal
        isOpen={isDeviceInstallOpen}
        onClose={() => setIsDeviceInstallOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        storageUsedMB={storageUsedMB}
      />

      <TranslatorModal
        isOpen={isTranslatorOpen}
        onClose={() => setIsTranslatorOpen(false)}
        initialTargetLang={settings.language === 'zh' ? 'en' : 'zh'}
      />

      <TrainingStudioModal
        isOpen={isTrainingStudioOpen}
        onClose={() => setIsTrainingStudioOpen(false)}
        language={settings.language || 'en'}
      />

      <DocumentManagerModal
        isOpen={isDocumentsOpen}
        onClose={() => setIsDocumentsOpen(false)}
        documents={allDocuments}
        onUploadDocument={handleUploadDocument}
        onDeleteDocument={handleDeleteDocument}
        ragSettings={settings.rag}
      />

      <CitationViewerModal
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />
    </div>
  );
}
