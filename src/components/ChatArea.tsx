import React, { useState } from 'react';
import { ChatMessage, SystemSettings, Citation, SupportedLanguage } from '../types';
import { I18N } from '../i18n/translations';
import { SovereignTranslator } from '../services/translator';
import { TrainingEngine } from '../services/trainingEngine';
import {
  User,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Volume2,
  VolumeX,
  FileText,
  Languages,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  Brain,
  CheckCircle2,
  Smartphone,
  Shield,
  Zap
} from 'lucide-react';

interface ChatAreaProps {
  messages: ChatMessage[];
  isLoading: boolean;
  settings: SystemSettings;
  onOpenSettings: () => void;
  onSelectCitation: (citation: Citation) => void;
  onSpeak: (text: string, lang?: SupportedLanguage) => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  onOpenDeviceInstall?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  settings,
  onOpenSettings,
  onSelectCitation,
  onSpeak,
  isSpeaking,
  onStopSpeaking,
  onOpenDeviceInstall,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [inlineTranslations, setInlineTranslations] = useState<Record<string, { text: string; targetLang: SupportedLanguage }>>({});
  const [ratedMessages, setRatedMessages] = useState<Record<string, 1 | -1>>({});
  const [teachingMessageId, setTeachingMessageId] = useState<string | null>(null);
  const [teachingCorrection, setTeachingCorrection] = useState('');
  const [justTrainedIds, setJustTrainedIds] = useState<Record<string, boolean>>({});

  const lang = settings.language || 'en';
  const t = I18N[lang];
  const translator = SovereignTranslator.getInstance();

  const toggleThought = (id: string) => {
    setExpandedThoughts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTranslateMessage = (msgId: string, content: string, targetLang: SupportedLanguage) => {
    const res = translator.translate(content, targetLang);
    setInlineTranslations(prev => ({
      ...prev,
      [msgId]: { text: res.translatedText, targetLang },
    }));
  };

  const handleRate = (msgId: string, rating: 1 | -1, query: string, content: string) => {
    setRatedMessages(prev => ({ ...prev, [msgId]: rating }));
    const engine = TrainingEngine.getInstance();
    if (rating === 1) {
      engine.addFeedback(query, content, 1, 'Positive reinforcement from Master', 'general');
      setJustTrainedIds(prev => ({ ...prev, [msgId]: true }));
    } else {
      setTeachingMessageId(msgId);
      setTeachingCorrection('');
    }
  };

  const handleSaveCorrection = (msgId: string, userQuery: string) => {
    if (!teachingCorrection.trim()) return;
    const engine = TrainingEngine.getInstance();
    engine.addFeedback(userQuery, teachingCorrection.trim(), 1, 'Master explicit correction', 'correction');
    setJustTrainedIds(prev => ({ ...prev, [msgId]: true }));
    setTeachingMessageId(null);
    setTeachingCorrection('');
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Android & Sovereign AI Hero Header */}
        {messages.length <= 1 && (
          <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#090d16] to-[#0a1714] border border-emerald-800/40 shadow-xl space-y-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-500 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20 shrink-0">
                  🐶
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2">
                    <span>Dog AI</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                      Android & Sovereign
                    </span>
                  </h1>
                  <p className="text-xs text-slate-300 font-medium">
                    Pure Dog AI companion optimized for Android devices with 100% offline intelligence.
                  </p>
                </div>
              </div>

              {/* Android Install Button */}
              {onOpenDeviceInstall && (
                <button
                  onClick={onOpenDeviceInstall}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-105 shrink-0"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Install on Android</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
                <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-300 block">Android WebAPK / PWA</strong>
                  <span className="text-[11px] text-slate-400">Install to your Android home screen as an app.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
                <Languages className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-cyan-300 block">True Translation</strong>
                  <span className="text-[11px] text-slate-400">Accurate translation across English, 中文, and Español.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 block">100% Local & Private</strong>
                  <span className="text-[11px] text-slate-400">Zero external cloud APIs, runs on your device.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, index) => {
          const isAssistant = msg.role === 'assistant';
          const thoughtOpen = expandedThoughts[msg.id] ?? false;
          const translated = inlineTranslations[msg.id];
          const userQuery = index > 0 && messages[index - 1]?.role === 'user' ? messages[index - 1].content : '';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 md:gap-4 ${isAssistant ? 'items-start' : 'items-start flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base font-bold shadow-md ${
                  isAssistant
                    ? 'bg-gradient-to-br from-amber-400 to-orange-600 text-slate-950 border border-amber-400/50'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {isAssistant ? '🐶' : <User className="w-4 h-4" />}
              </div>

              {/* Message Content Body */}
              <div
                className={`flex-1 min-w-0 rounded-2xl px-4 py-3.5 text-sm ${
                  isAssistant
                    ? 'bg-[#0f172a]/95 border border-slate-800 text-slate-100 shadow-lg shadow-black/20'
                    : 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-50 max-w-[85%] self-end'
                }`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/50 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-300">
                      {isAssistant ? (
                        <span className="text-amber-300 font-bold text-xs flex items-center gap-1.5">
                          <span>🐶 Dog AI</span>
                        </span>
                      ) : (
                        'User'
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span>{msg.timestamp}</span>
                    {isAssistant && (
                      <button
                        onClick={() => (isSpeaking ? onStopSpeaking() : onSpeak(msg.content))}
                        className="p-1 text-slate-400 hover:text-cyan-400 rounded transition-colors"
                        title={isSpeaking ? 'Stop speaking' : 'Read aloud with voice speech'}
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsible Reasoning / Thought */}
                {msg.thought && (
                  <div className="mb-3 rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden text-xs">
                    <button
                      onClick={() => toggleThought(msg.id)}
                      className="w-full flex items-center justify-between px-3 py-2 text-slate-400 hover:text-slate-200 bg-slate-900/90 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span className="font-semibold text-slate-300">Dog AI Reasoning & Plan</span>
                      </div>
                      {thoughtOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                    {thoughtOpen && (
                      <div className="p-3 border-t border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed bg-[#0b101c]">
                        {msg.thought}
                      </div>
                    )}
                  </div>
                )}

                {/* Grounded Citations Badges */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mb-3 p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-900/40 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-cyan-300 font-medium text-[11px]">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Referenced Documents:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => onSelectCitation(c)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[10px] transition-colors"
                          title="Click to view exact source passage"
                        >
                          <span className="truncate max-w-[120px] font-medium text-slate-200">{c.documentName}</span>
                          <span className="text-cyan-400 font-mono">({Math.round(c.score * 100)}%)</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formatted Content */}
                <div className="prose prose-invert prose-sm max-w-none space-y-2 leading-relaxed">
                  {renderMarkdown(msg.content, (code) => copyToClipboard(code, msg.id))}
                </div>

                {/* Inline Translation Display */}
                {translated && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-cyan-800/60 text-xs space-y-1.5 animate-fade-in">
                    <div className="flex items-center justify-between text-[11px] text-cyan-400 font-mono">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Languages className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Translation ({translated.targetLang.toUpperCase()}):</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(translated.text, msg.id + '-trans')}
                          className="text-slate-400 hover:text-cyan-300 p-0.5"
                          title="Copy translation"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSpeak(translated.text, translated.targetLang)}
                          className="text-slate-400 hover:text-cyan-300 p-0.5"
                          title="Speak translation"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setInlineTranslations(prev => {
                              const next = { ...prev };
                              delete next[msg.id];
                              return next;
                            });
                          }}
                          className="text-slate-500 hover:text-rose-400 text-[11px] px-1"
                          title="Hide translation"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div className="text-slate-100 leading-relaxed font-sans text-sm whitespace-pre-wrap">{translated.text}</div>
                  </div>
                )}

                {/* Just-Trained Status */}
                {justTrainedIds[msg.id] && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono bg-emerald-950/40 px-2.5 py-1.5 rounded-lg border border-emerald-800/60 animate-fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>🐾 Dog AI learned this guidance into memory!</span>
                  </div>
                )}

                {/* Inline Teaching & Correction Box */}
                {teachingMessageId === msg.id && (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-amber-800/70 space-y-2.5 shadow-lg animate-fade-in">
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
                      <div className="flex items-center gap-1.5">
                        <Brain className="w-4 h-4 text-amber-400 animate-pulse" />
                        <span>Teach Dog AI: How should I answer next time?</span>
                      </div>
                      <button
                        onClick={() => setTeachingMessageId(null)}
                        className="text-slate-400 hover:text-white text-[11px] px-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>

                    <textarea
                      rows={3}
                      value={teachingCorrection}
                      onChange={e => setTeachingCorrection(e.target.value)}
                      placeholder="Write the preferred response for Dog AI here..."
                      className="w-full p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 font-sans"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleSaveCorrection(msg.id, userQuery || msg.content.slice(0, 50))}
                        disabled={!teachingCorrection.trim()}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-lg text-xs transition flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save into Dog Memory</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Bar (Feedback + Translate + Copy) */}
                <div className="mt-3 pt-2 border-t border-slate-800/40 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-3">
                    {/* Feedback & Teaching Loop */}
                    {isAssistant && !msg.isStreaming && (
                      <div className="flex items-center gap-1 bg-slate-900/80 px-1.5 py-0.5 rounded-lg border border-slate-800">
                        <button
                          onClick={() => handleRate(msg.id, 1, userQuery, msg.content)}
                          className={`p-1 rounded hover:bg-slate-800 transition ${
                            ratedMessages[msg.id] === 1 ? 'text-emerald-400' : 'text-slate-400 hover:text-emerald-400'
                          }`}
                          title="Thumbs up"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleRate(msg.id, -1, userQuery, msg.content)}
                          className={`p-1 rounded hover:bg-slate-800 transition ${
                            ratedMessages[msg.id] === -1 ? 'text-rose-400' : 'text-slate-400 hover:text-rose-400'
                          }`}
                          title="Teach / correct Dog AI"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setTeachingMessageId(teachingMessageId === msg.id ? null : msg.id);
                            setTeachingCorrection('');
                          }}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-amber-950 hover:text-amber-300 text-slate-400 text-[10px] transition ml-0.5"
                          title="Teach Dog AI the exact expected answer"
                        >
                          <Edit3 className="w-3 h-3 text-amber-400" />
                          <span>Teach</span>
                        </button>
                      </div>
                    )}

                    {/* Quick Translator */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">Translate:</span>
                      <button
                        onClick={() => handleTranslateMessage(msg.id, msg.content, 'zh')}
                        className="px-1.5 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 text-[10px]"
                      >
                        中文
                      </button>
                      <button
                        onClick={() => handleTranslateMessage(msg.id, msg.content, 'es')}
                        className="px-1.5 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 text-[10px]"
                      >
                        Español
                      </button>
                      <button
                        onClick={() => handleTranslateMessage(msg.id, msg.content, 'en')}
                        className="px-1.5 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 text-[10px]"
                      >
                        English
                      </button>
                    </div>
                  </div>

                  {/* Copy button */}
                  <button
                    onClick={() => copyToClipboard(msg.content, msg.id)}
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors ml-auto"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">{t.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>{t.copy}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 text-xs text-emerald-300 font-medium p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 animate-pulse">
            <span className="text-xl animate-bounce">🐶</span>
            <span>Dog AI is processing your request...</span>
          </div>
        )}
      </div>
    </div>
  );
};

function renderMarkdown(content: string, onCopyCode: (code: string) => void) {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const firstLineEnd = part.indexOf('\n');
      const lang = firstLineEnd !== -1 ? part.slice(3, firstLineEnd).trim() : '';
      const code = firstLineEnd !== -1 ? part.slice(firstLineEnd + 1, -3) : part.slice(3, -3);

      return (
        <div key={index} className="my-3 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden font-mono text-xs">
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400">
            <span className="text-[11px] text-emerald-400">{lang || 'text'}</span>
            <button
              onClick={() => onCopyCode(code)}
              className="flex items-center gap-1 text-[11px] hover:text-white transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </button>
          </div>
          <pre className="p-3 overflow-x-auto text-slate-200 leading-relaxed font-mono text-[11.5px]">
            {code}
          </pre>
        </div>
      );
    }

    return (
      <div key={index} className="space-y-2 whitespace-pre-wrap">
        {part}
      </div>
    );
  });
}
