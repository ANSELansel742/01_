import React, { useRef, useState, useEffect } from 'react';
import { AppMode, SystemSettings } from '../types';
import { I18N } from '../i18n/translations';
import {
  Send,
  Paperclip,
  Mic,
  MicOff,
  X,
  Smartphone,
  Languages,
  Code2,
  FileSearch,
  Sparkles
} from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string, files?: File[]) => void;
  isLoading: boolean;
  mode: AppMode;
  onChangeMode: (mode: AppMode) => void;
  settings: SystemSettings;
  onOpenSettings: () => void;
  isListening: boolean;
  onToggleListening: () => void;
  onOpenDeviceInstall?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  mode,
  onChangeMode,
  settings,
  onOpenSettings,
  isListening,
  onToggleListening,
  onOpenDeviceInstall,
}) => {
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lang = settings.language || 'en';
  const t = I18N[lang];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;

    onSendMessage(input.trim(), attachedFiles);
    setInput('');
    setAttachedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setAttachedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuickPrompt = (promptText: string) => {
    onSendMessage(promptText);
  };

  return (
    <div className="border-t border-slate-800/80 bg-[#090d16]/95 backdrop-blur-md p-3 md:p-4 shrink-0">
      <div className="max-w-4xl mx-auto space-y-2.5">
        {/* Clean Topic & Assistant Helpers (NO feed bone, NO shake paw, NO roll over, NO play fetch) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => handleQuickPrompt('Translate this to Chinese and Spanish: ')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 whitespace-nowrap transition"
          >
            <Languages className="w-3 h-3 text-cyan-400" />
            <span>Translate</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickPrompt('Write a clean Python script that ')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 whitespace-nowrap transition"
          >
            <Code2 className="w-3 h-3 text-amber-400" />
            <span>Write Code</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickPrompt('Explain this concept simply: ')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 whitespace-nowrap transition"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Explain Topic</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickPrompt('Analyze the attached document and summarize key points.')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 whitespace-nowrap transition"
          >
            <FileSearch className="w-3 h-3 text-emerald-400" />
            <span>Analyze Doc</span>
          </button>

          {/* Android App Install Pill */}
          {onOpenDeviceInstall && (
            <button
              type="button"
              onClick={onOpenDeviceInstall}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 whitespace-nowrap transition font-semibold ml-auto"
            >
              <Smartphone className="w-3 h-3 text-emerald-400" />
              <span>Android App</span>
            </button>
          )}
        </div>

        {/* Attached Files Strip */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pb-1">
            {attachedFiles.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-800 text-slate-200 border border-slate-700 rounded-md"
              >
                <Paperclip className="w-3 h-3 text-amber-400" />
                <span className="truncate max-w-[150px]">{f.name}</span>
                <span className="text-[10px] text-slate-400">({Math.round(f.size / 1024)} KB)</span>
                <button
                  onClick={() => removeFile(i)}
                  className="p-0.5 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Container */}
        <div className="relative flex flex-col bg-slate-900/90 border border-slate-800 focus-within:border-amber-500/70 rounded-2xl transition-colors shadow-lg shadow-black/30">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Dog AI anything (e.g. 'Analyze file', 'Translate this', 'Help me write code')..."
            disabled={isLoading}
            className="w-full px-4 pt-3 pb-2 text-sm bg-transparent text-slate-100 placeholder-slate-500 focus:outline-hidden resize-none min-h-[44px] max-h-[180px]"
          />

          {/* Action Toolbar */}
          <div className="flex items-center justify-between px-3.5 pb-2.5 pt-1 border-t border-slate-800/60">
            {/* Left Controls: Attach + Voice */}
            <div className="flex items-center gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".txt,.md,.pdf,.json,.csv,.py,.js,.ts,.html,.log,.yaml,.yml"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                title="Attach document to analyze"
              >
                <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Attach Doc</span>
              </button>

              {/* Voice Input Button */}
              <button
                type="button"
                onClick={onToggleListening}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-colors ${
                  isListening
                    ? 'bg-rose-950/80 border border-rose-800 text-rose-300 animate-pulse'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title={isListening ? 'Listening... click to stop' : 'Speech-to-Text Voice Input'}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-[11px] font-mono">{t.listening}</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t.voice}</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Controls: Send button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
                className="flex items-center justify-center p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 disabled:opacity-40 font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95"
                title="Send message to Dog AI"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Clean Android Status Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>🐶</span>
            <span>Dog AI · Sovereign Intelligence for Android & Web.</span>
          </div>

          <span className="hidden sm:inline font-mono text-[10px] text-slate-500">
            Shift + Enter for new line
          </span>
        </div>
      </div>
    </div>
  );
};
