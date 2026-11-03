import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Pin, Trash2, Edit3, Check, FileText, Send, Sparkles } from 'lucide-react';
import { PhoneSystemManager } from '../../services/phoneSystemManager';

interface NoteItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  color: 'yellow' | 'blue' | 'green' | 'rose' | 'purple';
}

const STORAGE_KEY_NOTES = 'dog_phone_quick_notes_v1';

const DEFAULT_NOTES: NoteItem[] = [
  {
    id: 'note_1',
    title: '🐕 狗僕人使用手冊與指令備忘',
    content: '1. 說「幫我安裝相機」或「幫我安裝計算機」，狗僕人會調用自主安裝權力！\n2. 說「幫我將文件搬到工作資料夾」，狗僕人會搬移檔案。\n3. 如果問到公司商業密碼或內部資產，ARP-1 守護模型會嚴格禁止！',
    createdAt: '2026-11-01 09:30',
    updatedAt: '2026-11-01 10:00',
    isPinned: true,
    color: 'yellow',
  },
  {
    id: 'note_2',
    title: '📊 Q4 公司預算會議待辦',
    content: '1. 核對 Excel 財務報表上的 Q4 預算總額\n2. 製作 PowerPoint 簡報第 3 頁：雙模型架構展示\n3. 備份 LINE 企業重要對話至本機端',
    createdAt: '2026-11-01 13:15',
    updatedAt: '2026-11-01 14:00',
    isPinned: false,
    color: 'blue',
  },
];

interface PhoneNotesAppProps {
  onBack: () => void;
  onSendToDogAI?: (prompt: string) => void;
  onOpenFileFolder?: () => void;
}

export const PhoneNotesApp: React.FC<PhoneNotesAppProps> = ({
  onBack,
  onSendToDogAI,
  onOpenFileFolder,
}) => {
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTES);
      return saved ? JSON.parse(saved) : DEFAULT_NOTES;
    } catch {
      return DEFAULT_NOTES;
    }
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editContent, setEditContent] = useState<string>('');
  const [editColor, setEditColor] = useState<NoteItem['color']>('yellow');
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
    } catch {
      // storage quota
    }
  }, [notes]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const handleStartCreate = () => {
    const newNote: NoteItem = {
      id: 'note_' + Date.now(),
      title: '未命名靈感筆記',
      content: '',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      isPinned: false,
      color: 'yellow',
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setEditTitle(newNote.title);
    setEditContent('');
    setEditColor('yellow');
    setIsEditing(true);
  };

  const handleStartEdit = (note: NoteItem) => {
    setActiveNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditColor(note.color);
    setIsEditing(true);
  };

  const handleSaveNote = () => {
    if (!activeNoteId) return;
    setNotes(prev =>
      prev.map(n =>
        n.id === activeNoteId
          ? {
              ...n,
              title: editTitle.trim() || '未命名筆記',
              content: editContent,
              color: editColor,
              updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            }
          : n
      )
    );
    setIsEditing(false);
  };

  const handleDeleteNote = (id: string) => {
    if (confirm('確定要刪除這份筆記嗎？')) {
      setNotes(prev => prev.filter(n => n.id !== id));
      if (activeNoteId === id) {
        setActiveNoteId(null);
        setIsEditing(false);
      }
    }
  };

  const handleTogglePin = (id: string) => {
    setNotes(prev =>
      prev.map(n => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  // Export note directly as a Word (.docx / markdown) document into the Phone's Files app!
  const handleExportToPhoneDocuments = (note: NoteItem) => {
    const manager = PhoneSystemManager.getInstance();
    const docName = `${note.title.replace(/[\\/:*?"<>|]/g, '_')}.docx`;
    manager.addFile({
      name: docName,
      category: 'documents',
      docFormat: 'word',
      sizeBytes: note.content.length * 2 + 1024,
      content: `# ${note.title}\n\n**由便條筆記 (Quick Notes) 匯出**\n建立日期: ${note.createdAt}\n最後修訂: ${note.updatedAt}\n\n---\n\n${note.content}`,
      thumbnail: '📝',
      folder: 'Documents',
      tags: ['Notes', 'Exported'],
    });

    setExportStatus(`已成功將「${docName}」匯出至手機文件資料夾！`);
    setTimeout(() => {
      setExportStatus(null);
    }, 3500);
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const getColorClass = (color: NoteItem['color']) => {
    switch (color) {
      case 'yellow': return 'bg-amber-950/40 border-amber-600/40 text-amber-200';
      case 'blue': return 'bg-blue-950/40 border-blue-600/40 text-blue-200';
      case 'green': return 'bg-emerald-950/40 border-emerald-600/40 text-emerald-200';
      case 'rose': return 'bg-rose-950/40 border-rose-600/40 text-rose-200';
      case 'purple': return 'bg-purple-950/40 border-purple-600/40 text-purple-200';
      default: return 'bg-slate-900 border-slate-700 text-slate-200';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121318] text-white select-none overflow-hidden font-sans">
      {/* Top Bar */}
      <div className="p-3 bg-[#191a22] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (isEditing) {
                handleSaveNote();
              } else if (activeNoteId) {
                setActiveNoteId(null);
              } else {
                onBack();
              }
            }}
            className="p-1 rounded-full hover:bg-slate-700/60 text-slate-300 transition active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 font-bold text-sm">
            <span className="text-amber-400">📝</span>
            <span>便條筆記 (Quick Notes)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              onClick={handleStartCreate}
              className="px-3 py-1.5 rounded-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1 shadow-md transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增筆記</span>
            </button>
          )}
          {isEditing && (
            <button
              onClick={handleSaveNote}
              className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-md transition active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>完成儲存</span>
            </button>
          )}
        </div>
      </div>

      {/* Export Notification Toast */}
      {exportStatus && (
        <div className="bg-emerald-900/90 border-b border-emerald-600 text-emerald-100 px-4 py-2 text-xs flex items-center justify-between animate-fadeIn">
          <span>{exportStatus}</span>
          {onOpenFileFolder && (
            <button
              onClick={onOpenFileFolder}
              className="underline font-bold ml-2 text-white hover:text-emerald-200"
            >
              前往資料夾 ➔
            </button>
          )}
        </div>
      )}

      {/* Main View: List or Editor */}
      {isEditing && activeNote ? (
        /* Note Editor */
        <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-3 bg-[#15161d]">
          {/* Color Chooser */}
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <span className="text-xs text-slate-400">卡片主題色：</span>
            {(['yellow', 'blue', 'green', 'rose', 'purple'] as const).map(color => (
              <button
                key={color}
                onClick={() => setEditColor(color)}
                className={`w-6 h-6 rounded-full border-2 transition ${
                  editColor === color ? 'border-white scale-110' : 'border-transparent'
                } ${
                  color === 'yellow' ? 'bg-amber-500' :
                  color === 'blue' ? 'bg-blue-500' :
                  color === 'green' ? 'bg-emerald-500' :
                  color === 'rose' ? 'bg-rose-500' : 'bg-purple-500'
                }`}
              />
            ))}
          </div>

          <input
            type="text"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            placeholder="請輸入筆記標題..."
            className="w-full bg-transparent text-lg font-bold text-white placeholder-slate-500 focus:outline-none border-b border-slate-800 pb-2"
          />

          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            placeholder="隨手記錄靈感、待辦事項或備忘錄內容..."
            className="flex-1 w-full bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed min-h-[220px]"
          />

          {/* Editor Actions Footer */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono text-[11px]">
              字數: {editContent.length} · 隨打即存
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportToPhoneDocuments(activeNote)}
                className="px-2.5 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 flex items-center gap-1 font-semibold transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>存入文件 (.docx)</span>
              </button>
              {onSendToDogAI && (
                <button
                  onClick={() => {
                    handleSaveNote();
                    onSendToDogAI(`汪！主人請狗僕人潤飾分析這份筆記：【${editTitle}】\n\n內容：\n${editContent}`);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 flex items-center gap-1 font-semibold transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dog AI 潤飾</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Notes List View */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search Box */}
          <div className="p-3 bg-[#16171f] border-b border-slate-800">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <Search className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜尋筆記標題或關鍵字..."
                className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Cards List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-16 text-slate-500 space-y-2">
                <p className="text-3xl">📝</p>
                <p className="text-xs">尚無相符的筆記內容</p>
                <button
                  onClick={handleStartCreate}
                  className="text-xs text-amber-400 underline font-semibold"
                >
                  點擊立即寫下第一筆靈感
                </button>
              </div>
            ) : (
              filteredNotes.map(note => (
                <div
                  key={note.id}
                  onClick={() => handleStartEdit(note)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer relative group hover:scale-[1.01] shadow-sm ${getColorClass(
                    note.color
                  )}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {note.isPinned && <Pin className="w-3.5 h-3.5 text-amber-400 rotate-45 shrink-0" />}
                      <span className="line-clamp-1">{note.title}</span>
                    </h3>

                    {/* Card Actions */}
                    <div 
                      className="flex items-center gap-1 opacity-70 group-hover:opacity-100"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleTogglePin(note.id)}
                        className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                        title={note.isPinned ? '取消置頂' : '置頂筆記'}
                      >
                        <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'text-amber-400 fill-amber-400' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleExportToPhoneDocuments(note)}
                        className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-blue-300"
                        title="匯出至手機文件 (.docx)"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-rose-400"
                        title="刪除筆記"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-1.5 line-clamp-3 leading-relaxed whitespace-pre-line font-sans">
                    {note.content || '(無內文)'}
                  </p>

                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{note.updatedAt}</span>
                    <span className="font-mono">點擊編輯 ➔</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
