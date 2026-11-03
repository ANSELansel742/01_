import React, { useState } from 'react';
import { SupportedLanguage } from '../types';
import { SovereignTranslator } from '../services/translator';
import { VoiceSystemManager } from '../services/voiceSystem';
import { Languages, ArrowRightLeft, Volume2, Copy, Check, X, Sparkles } from 'lucide-react';

interface TranslatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText?: string;
  initialTargetLang?: SupportedLanguage;
}

export const TranslatorModal: React.FC<TranslatorModalProps> = ({
  isOpen,
  onClose,
  initialText = '',
  initialTargetLang = 'zh',
}) => {
  const [inputText, setInputText] = useState(initialText);
  const [sourceLang, setSourceLang] = useState<SupportedLanguage | 'auto'>('auto');
  const [targetLang, setTargetLang] = useState<SupportedLanguage>(initialTargetLang);
  const [outputText, setOutputText] = useState('');
  const [phonetics, setPhonetics] = useState<string | undefined>();
  const [copied, setCopied] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const translator = SovereignTranslator.getInstance();
  const voiceManager = VoiceSystemManager.getInstance();

  if (!isOpen) return null;

  const handleTranslate = (text = inputText, tgt = targetLang) => {
    if (!text.trim()) {
      setOutputText('');
      setPhonetics(undefined);
      return;
    }

    setIsTranslating(true);
    const effectiveSrc = sourceLang === 'auto' ? translator.detectLanguage(text) : sourceLang;
    const result = translator.translate(text, tgt, effectiveSrc);
    setOutputText(result.translatedText);
    setPhonetics(result.phonetics);
    setIsTranslating(false);
  };

  const handleSwap = () => {
    if (sourceLang === 'auto') {
      const detected = translator.detectLanguage(inputText);
      setSourceLang(targetLang);
      setTargetLang(detected);
    } else {
      const prevSrc = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(prevSrc);
    }
    const prevIn = inputText;
    setInputText(outputText);
    setOutputText(prevIn);
  };

  const handleSpeak = (text: string, lang: SupportedLanguage) => {
    const langCode = lang === 'zh' ? 'zh-TW' : lang === 'es' ? 'es-ES' : 'en-US';
    const voices = voiceManager.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(lang) || v.lang.startsWith(langCode));

    voiceManager.speak(text, {
      voiceEnabled: true,
      autoSpeak: false,
      selectedVoiceURI: matchingVoice?.voiceURI || '',
      rate: 0.95,
      pitch: 1.0,
      speechRecognitionLang: langCode,
    });
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const langNames: Record<SupportedLanguage, string> = {
    en: 'English (英文)',
    zh: '中文 (Chinese)',
    es: 'Español (西班牙文)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0b101c] border border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0d1424]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold">
              <Languages className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                <span>Dog AI Real Trilingual Translator</span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  Real Translation · EN · 中文 · ES
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                True semantic translation engine with offline multi-lingual lexicon and grammar synthesis. Zero external API calls.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Language Selection Bar */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <select
              value={sourceLang}
              onChange={e => {
                setSourceLang(e.target.value as any);
                handleTranslate(inputText, targetLang);
              }}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2.5 py-1 text-xs focus:outline-hidden"
            >
              <option value="auto">Auto Detect (自動檢測)</option>
              <option value="en">English (英文)</option>
              <option value="zh">中文 (Chinese)</option>
              <option value="es">Español (西班牙文)</option>
            </select>
          </div>

          <button
            onClick={handleSwap}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition"
            title="Swap Languages"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <select
              value={targetLang}
              onChange={e => {
                const newTgt = e.target.value as SupportedLanguage;
                setTargetLang(newTgt);
                handleTranslate(inputText, newTgt);
              }}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2.5 py-1 text-xs focus:outline-hidden"
            >
              <option value="zh">中文 (Chinese)</option>
              <option value="en">English (英文)</option>
              <option value="es">Español (西班牙文)</option>
            </select>
          </div>
        </div>

        {/* Translation Content Viewport */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Source Text Box */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="font-semibold text-slate-300">
                Source: {sourceLang === 'auto' ? 'Auto Detect' : langNames[sourceLang]}
              </span>
              {inputText && (
                <button
                  onClick={() =>
                    handleSpeak(
                      inputText,
                      sourceLang === 'auto' ? translator.detectLanguage(inputText) : sourceLang
                    )
                  }
                  className="p-1 text-slate-400 hover:text-cyan-400 rounded transition"
                  title="Pronounce source speech"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <textarea
              rows={8}
              value={inputText}
              onChange={e => {
                setInputText(e.target.value);
                handleTranslate(e.target.value, targetLang);
              }}
              placeholder="Type or paste text in English, Chinese (中文), or Spanish (Español)..."
              className="w-full flex-1 p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-hidden focus:border-cyan-600 resize-none leading-relaxed"
            />
          </div>

          {/* Target Translation Box */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="font-semibold text-cyan-300">
                Target: {langNames[targetLang]}
              </span>
              <div className="flex items-center gap-1.5">
                {outputText && (
                  <button
                    onClick={() => handleSpeak(outputText, targetLang)}
                    className="p-1 text-slate-400 hover:text-cyan-400 rounded transition"
                    title="Speak translation aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {outputText && (
                  <button
                    onClick={handleCopy}
                    className="p-1 text-slate-400 hover:text-white rounded transition"
                    title="Copy translation"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            <div className="w-full flex-1 p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-slate-100 leading-relaxed overflow-y-auto whitespace-pre-wrap">
              {outputText ? (
                <div>
                  <div className="font-medium text-slate-100">{outputText}</div>
                  {phonetics && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 font-mono text-[11px] text-cyan-400">
                      Pinyin: {phonetics}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-slate-600 italic">
                  Translation will appear here instantly...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Sample Prompts Bar */}
        <div className="px-5 py-2.5 bg-slate-900/40 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-500 whitespace-nowrap">Quick Test:</span>
          <button
            onClick={() => {
              setInputText('System initialized and running locally');
              handleTranslate('System initialized and running locally', targetLang);
            }}
            className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white whitespace-nowrap"
          >
            "System initialized locally"
          </button>
          <button
            onClick={() => {
              setInputText('自主電腦控制權限出於安全考量預設關閉');
              handleTranslate('自主電腦控制權限出於安全考量預設關閉', 'en');
              setTargetLang('en');
            }}
            className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white whitespace-nowrap"
          >
            "自主電腦控制權限"
          </button>
          <button
            onClick={() => {
              setInputText('Control Autónomo de la Computadora cerrado por seguridad');
              handleTranslate('Control Autónomo de la Computadora cerrado por seguridad', 'zh');
              setTargetLang('zh');
            }}
            className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white whitespace-nowrap"
          >
            "Control Autónomo de la Computadora"
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0d1424] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Unified sovereign model weights serve English, Chinese & Spanish</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
