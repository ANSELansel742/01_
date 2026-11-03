import React, { useState } from 'react';
import { PhoneFileItem, FileCategory, DocumentFormat } from '../types';
import { PhoneSystemManager } from '../services/phoneSystemManager';
import { 
  ArrowLeft, 
  Folder, 
  Image as ImageIcon, 
  FileText, 
  Plus, 
  Search, 
  Download, 
  Trash2, 
  Edit3, 
  Table, 
  Presentation, 
  Eye, 
  Check, 
  FileSpreadsheet,
  FileCheck,
  Share2,
  Sparkles,
  FolderInput,
  FolderSymlink,
  Layers
} from 'lucide-react';

interface AndroidFilesAppProps {
  onBack: () => void;
  onSendToDogAI?: (file: PhoneFileItem) => void;
}

export const AndroidFilesApp: React.FC<AndroidFilesAppProps> = ({ onBack, onSendToDogAI }) => {
  const manager = PhoneSystemManager.getInstance();
  const [files, setFiles] = useState<PhoneFileItem[]>(() => manager.getFiles());
  const [activeCategory, setActiveCategory] = useState<FileCategory>('documents');
  const [selectedFormatFilter, setSelectedFormatFilter] = useState<'all' | DocumentFormat>('all');
  const [activeFile, setActiveFile] = useState<PhoneFileItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Creation modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDocType, setNewDocType] = useState<DocumentFormat>('word');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocContent, setNewDocContent] = useState('');
  
  // Quick editor state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  // Move file modal state
  const [fileToMove, setFileToMove] = useState<PhoneFileItem | null>(null);
  const [targetFolderChoice, setTargetFolderChoice] = useState('Downloads');

  const refreshFiles = () => {
    setFiles(manager.getFiles());
  };

  const handleConfirmMoveFile = () => {
    if (!fileToMove) return;
    const targetCat = targetFolderChoice === 'Pictures' ? 'pictures' : 'documents';
    manager.moveFile(fileToMove.id, targetCat, targetFolderChoice);
    refreshFiles();
    setFileToMove(null);
  };

  const handleCreateDocument = () => {
    if (!newDocTitle.trim()) {
      alert('請輸入檔案名稱！');
      return;
    }

    let defaultContent = newDocContent;
    let extension = '.docx';

    if (newDocType === 'excel') {
      extension = '.xlsx';
      if (!defaultContent) {
        defaultContent = JSON.stringify({
          title: newDocTitle,
          columns: ['項目 (Item)', '類別 (Category)', '數量 (Qty)', '單價 (Unit $)', '總計 (Total $)'],
          rows: [
            ['辦公室設備', '資產', '2', '15,000', '30,000'],
            ['伺服器節點', '硬體', '1', '45,000', '45,000'],
            ['研發訓練集', '資料', '5', '3,000', '15,000'],
          ],
          notes: '由 Android Phone 工作系統內建試算表工具生成'
        });
      }
    } else if (newDocType === 'powerpoint') {
      extension = '.pptx';
      if (!defaultContent) {
        defaultContent = JSON.stringify({
          title: newDocTitle,
          slides: [
            {
              slideNumber: 1,
              title: newDocTitle,
              subtitle: '由 Android 手機工作系統 PowerPoint 工具製作',
              bullets: ['第一頁重點項目', '支援投影片放映', '離線即時展示'],
              bgTheme: 'amber'
            },
            {
              slideNumber: 2,
              title: '行動辦公與 Dog AI 連動',
              subtitle: '手機內部工具鏈',
              bullets: ['無需依賴外部訂閱', '本地資料安全加密', '隨時輸出與列印'],
              bgTheme: 'emerald'
            }
          ]
        });
      }
    } else if (newDocType === 'pdf') {
      extension = '.pdf';
      if (!defaultContent) {
        defaultContent = `%PDF-1.7\n[PDF 文件: ${newDocTitle}]\n建立日期: ${new Date().toLocaleDateString()}\n手機系統: Android 15 Sovereign Edition\n\n內容內文：本文件已準備就緒，可作為合約、規範手冊或報告輸出。`;
      }
    } else {
      extension = '.docx';
      if (!defaultContent) {
        defaultContent = `# ${newDocTitle}\n\n**建立時間:** ${new Date().toLocaleString()}\n**作者:** Dog Master\n\n在此開始撰寫您的 Word 專業報告或會議筆記...`;
      }
    }

    const fileNameWithExt = newDocTitle.endsWith(extension) ? newDocTitle : `${newDocTitle}${extension}`;

    manager.addFile({
      name: fileNameWithExt,
      category: 'documents',
      docFormat: newDocType,
      sizeBytes: Math.floor(1024 * (30 + Math.random() * 80)),
      content: defaultContent,
    });

    refreshFiles();
    setIsCreateOpen(false);
    setNewDocTitle('');
    setNewDocContent('');
  };

  const handleCreatePicture = () => {
    const picName = prompt('請輸入新圖片名稱 (例: My_Design.png):', `Photo_${Date.now().toString().slice(-4)}.png`);
    if (!picName) return;

    const randomHue = Math.floor(Math.random() * 360);
    const svgData = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="hsl(${randomHue}, 60%, 20%)"/><circle cx="300" cy="180" r="90" fill="hsl(${randomHue}, 70%, 50%)"/><text x="300" y="200" font-size="60" text-anchor="middle" fill="%23ffffff">📸</text><text x="300" y="320" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle" fill="%23ffffff">${picName}</text><text x="300" y="350" font-family="sans-serif" font-size="14" text-anchor="middle" fill="%23cbd5e1">Saved in Pictures Folder</text></svg>`;

    manager.addFile({
      name: picName.endsWith('.png') ? picName : `${picName}.png`,
      category: 'pictures',
      sizeBytes: 1024 * 350,
      content: svgData,
      thumbnail: '📸',
    });
    refreshFiles();
  };

  const handleDeleteFile = (id: string, name: string) => {
    if (confirm(`確定要刪除「${name}」嗎？`)) {
      manager.deleteFile(id);
      refreshFiles();
      if (activeFile?.id === id) {
        setActiveFile(null);
      }
    }
  };

  const handleSaveEdit = () => {
    if (!activeFile) return;
    manager.updateFile(activeFile.id, { content: editContent });
    refreshFiles();
    setActiveFile(prev => prev ? { ...prev, content: editContent } : null);
    setIsEditing(false);
  };

  const handleDownloadExport = (file: PhoneFileItem) => {
    let mimeType = 'text/plain';
    let contentToExport = file.content;

    if (file.docFormat === 'excel') mimeType = 'application/json';
    else if (file.docFormat === 'pdf') mimeType = 'application/pdf';
    else if (file.docFormat === 'powerpoint') mimeType = 'application/json';
    else if (file.category === 'pictures') mimeType = 'image/svg+xml';

    const blob = new Blob([contentToExport], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredFiles = files.filter(f => {
    if (f.category !== activeCategory) return false;
    if (activeCategory === 'documents' && selectedFormatFilter !== 'all') {
      if (f.docFormat !== selectedFormatFilter) return false;
    }
    if (searchQuery.trim()) {
      return f.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const picturesCount = files.filter(f => f.category === 'pictures').length;
  const documentsCount = files.filter(f => f.category === 'documents').length;

  return (
    <div className="flex flex-col h-full bg-[#101114] text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Android Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#18191f] border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={activeFile ? () => setActiveFile(null) : onBack}
            className="p-1 rounded-full hover:bg-slate-700/60 text-slate-300 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <span>📁 資料夾 (Files)</span>
              {activeFile && <span className="text-xs font-normal text-slate-400">/ 檢視檔案</span>}
            </h1>
            <p className="text-[10px] text-slate-400">兩大分類：圖片 (Pictures) · 文件 (Word / Excel / PPT / PDF)</p>
          </div>
        </div>

        {/* Action button */}
        {!activeFile && (
          <div className="flex items-center gap-2">
            {/* Real File Upload from Computer */}
            <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer shadow-sm transition">
              <input
                type="file"
                className="hidden"
                accept="image/*,.docx,.xlsx,.pptx,.pdf,.txt,.csv,.json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(file.name);
                  if (isImage) {
                    reader.onload = () => {
                      manager.addFile({
                        name: file.name,
                        category: 'pictures',
                        sizeBytes: file.size,
                        content: reader.result as string,
                        thumbnail: '🖼️',
                        folder: 'Uploads',
                      });
                      refreshFiles();
                    };
                    reader.readAsDataURL(file);
                  } else {
                    reader.onload = () => {
                      let docFormat: DocumentFormat = 'word';
                      if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) docFormat = 'excel';
                      else if (file.name.endsWith('.pptx')) docFormat = 'powerpoint';
                      else if (file.name.endsWith('.pdf')) docFormat = 'pdf';
                      manager.addFile({
                        name: file.name,
                        category: 'documents',
                        docFormat,
                        sizeBytes: file.size,
                        content: reader.result as string,
                        thumbnail: '📄',
                        folder: 'Uploads',
                      });
                      refreshFiles();
                    };
                    reader.readAsText(file);
                  }
                  e.target.value = '';
                }}
              />
              <Download className="w-3.5 h-3.5 rotate-180 text-cyan-400" />
              <span>匯入電腦真實檔案</span>
            </label>

            {activeCategory === 'documents' ? (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>建立新文件</span>
              </button>
            ) : (
              <button
                onClick={handleCreatePicture}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>儲存新圖片</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Files Layout */}
      {!activeFile ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Category Tabs: Pictures vs Documents */}
          <div className="p-3 bg-[#15161c] border-b border-slate-800 shrink-0 flex items-center gap-2">
            <button
              onClick={() => { setActiveCategory('documents'); setSelectedFormatFilter('all'); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                activeCategory === 'documents'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>文件資料夾 (Documents) ({documentsCount})</span>
            </button>

            <button
              onClick={() => setActiveCategory('pictures')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                activeCategory === 'pictures'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>圖片資料夾 (Pictures) ({picturesCount})</span>
            </button>
          </div>

          {/* Sub-format Filters for Documents (Word / Excel / PPT / PDF) */}
          {activeCategory === 'documents' && (
            <div className="px-4 py-2 bg-[#121318] border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
              <span className="text-[10px] text-slate-400 mr-1 font-semibold">格式篩選:</span>
              <button
                onClick={() => setSelectedFormatFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  selectedFormatFilter === 'all'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                全部 ({documentsCount})
              </button>
              <button
                onClick={() => setSelectedFormatFilter('word')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition ${
                  selectedFormatFilter === 'word'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-blue-400 hover:text-blue-300 border border-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Word (.docx)</span>
              </button>
              <button
                onClick={() => setSelectedFormatFilter('excel')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition ${
                  selectedFormatFilter === 'excel'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-emerald-400 hover:text-emerald-300 border border-slate-800'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel (.xlsx)</span>
              </button>
              <button
                onClick={() => setSelectedFormatFilter('powerpoint')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition ${
                  selectedFormatFilter === 'powerpoint'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-900 text-amber-400 hover:text-amber-300 border border-slate-800'
                }`}
              >
                <Presentation className="w-3.5 h-3.5" />
                <span>PowerPoint (.pptx)</span>
              </button>
              <button
                onClick={() => setSelectedFormatFilter('pdf')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition ${
                  selectedFormatFilter === 'pdf'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-900 text-rose-400 hover:text-rose-300 border border-slate-800'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>PDF (.pdf)</span>
              </button>
            </div>
          )}

          {/* Search bar */}
          <div className="p-3 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={`搜尋${activeCategory === 'pictures' ? '圖片' : '文件'}名稱...`}
                className="w-full bg-[#181920] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Files Grid / List */}
          <div className="flex-1 overflow-y-auto p-3 pt-0">
            {filteredFiles.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
                <Folder className="w-12 h-12 text-slate-700 mb-2" />
                <p>此資料夾目前沒有符合的檔案</p>
                <p className="text-[10px] text-slate-600 mt-1">點擊上方按鈕建立新文件或存入新圖片</p>
              </div>
            ) : activeCategory === 'pictures' ? (
              /* Pictures Gallery Grid */
              <div className="grid grid-cols-2 gap-3">
                {filteredFiles.map(file => (
                  <div
                    key={file.id}
                    onClick={() => setActiveFile(file)}
                    className="p-2.5 rounded-2xl bg-[#181920] border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition flex flex-col group"
                  >
                    <div className="aspect-video w-full rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800/80 mb-2">
                      <img src={file.content} alt={file.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-xs font-semibold text-white truncate">{file.name}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>{(file.sizeBytes / 1024).toFixed(0)} KB</span>
                      <span>{file.updatedAt.slice(5)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Documents List */
              <div className="space-y-2">
                {filteredFiles.map(file => {
                  let badgeBg = 'bg-blue-950 text-blue-300 border-blue-800';
                  let icon = <FileText className="w-5 h-5 text-blue-400" />;
                  let formatName = 'WORD';

                  if (file.docFormat === 'excel') {
                    badgeBg = 'bg-emerald-950 text-emerald-300 border-emerald-800';
                    icon = <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
                    formatName = 'EXCEL';
                  } else if (file.docFormat === 'powerpoint') {
                    badgeBg = 'bg-amber-950 text-amber-300 border-amber-800';
                    icon = <Presentation className="w-5 h-5 text-amber-400" />;
                    formatName = 'PPT';
                  } else if (file.docFormat === 'pdf') {
                    badgeBg = 'bg-rose-950 text-rose-300 border-rose-800';
                    icon = <FileCheck className="w-5 h-5 text-rose-400" />;
                    formatName = 'PDF';
                  }

                  return (
                    <div
                      key={file.id}
                      onClick={() => setActiveFile(file)}
                      className="p-3 rounded-2xl bg-[#181920] border border-slate-800/80 hover:border-cyan-500/50 cursor-pointer transition flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                          {icon}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{file.name}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className={`px-1.5 py-0.2 rounded font-mono font-bold border ${badgeBg}`}>
                              {formatName}
                            </span>
                            <span>{(file.sizeBytes / 1024).toFixed(0)} KB</span>
                            <span>•</span>
                            <span>{file.updatedAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setFileToMove(file)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition"
                          title="移動位置 / 更換資料夾 (Change Place)"
                        >
                          <FolderSymlink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadExport(file)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                          title="輸出下載"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.id, file.name)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                          title="刪除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ===================== FILE DETAIL & EDITOR ===================== */
        <div className="flex-1 flex flex-col min-h-0 bg-[#0e0f12]">
          {/* File Action Subheader */}
          <div className="p-3 bg-[#18191f] border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-white truncate">{activeFile.name}</h2>
              <p className="text-[10px] text-slate-400">
                類別: {activeFile.category === 'pictures' ? '圖片 (Picture)' : `${activeFile.docFormat?.toUpperCase()} 文件`} · 更新於: {activeFile.updatedAt}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {activeFile.category === 'documents' && (
                <button
                  onClick={() => {
                    if (isEditing) {
                      handleSaveEdit();
                    } else {
                      setEditContent(activeFile.content);
                      setIsEditing(true);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    isEditing ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                  <span>{isEditing ? '儲存檔案' : '編輯內容'}</span>
                </button>
              )}

              <button
                onClick={() => handleDownloadExport(activeFile)}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>輸出檔案</span>
              </button>

              {onSendToDogAI && activeFile.category === 'documents' && (
                <button
                  onClick={() => onSendToDogAI(activeFile)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  title="將檔案傳送給 Dog AI 進行智慧解析"
                >
                  <span>🐶</span>
                  <span>交給 Dog AI</span>
                </button>
              )}
            </div>
          </div>

          {/* Viewer / Editor Body */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeFile.category === 'pictures' ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="max-w-xl max-h-[70vh] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black flex items-center justify-center p-2">
                  <img src={activeFile.content} alt={activeFile.name} className="max-w-full max-h-full object-contain rounded-xl" />
                </div>
                <div className="text-xs text-slate-400">已在手機圖片資料夾中載入高解析度預覽</div>
              </div>
            ) : isEditing ? (
              <div className="h-full flex flex-col space-y-2">
                <div className="text-[11px] text-slate-400 font-semibold">即時編輯工具 (支援文字、JSON、格式代碼):</div>
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className="flex-1 w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-hidden focus:border-cyan-500 resize-none leading-relaxed"
                />
              </div>
            ) : (
              /* High-fidelity format viewers */
              <div className="max-w-3xl mx-auto space-y-4">
                {/* Word Viewer */}
                {activeFile.docFormat === 'word' && (
                  <div className="p-6 bg-[#1a1b22] border border-slate-800 rounded-2xl shadow-xl text-xs leading-relaxed space-y-3">
                    <div className="flex items-center gap-2 text-blue-400 font-bold border-b border-slate-800 pb-2">
                      <FileText className="w-4 h-4" />
                      <span>Microsoft Word 文件檢視器 (.docx)</span>
                    </div>
                    <pre className="font-sans text-slate-200 whitespace-pre-wrap">{activeFile.content}</pre>
                  </div>
                )}

                {/* Excel Viewer */}
                {activeFile.docFormat === 'excel' && (
                  <div className="p-5 bg-[#1a1b22] border border-slate-800 rounded-2xl shadow-xl text-xs space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-slate-800 pb-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Microsoft Excel 試算表檢視器 (.xlsx)</span>
                    </div>

                    {(() => {
                      try {
                        const parsed = JSON.parse(activeFile.content);
                        return (
                          <div className="space-y-3">
                            <h3 className="font-bold text-white text-sm">{parsed.title}</h3>
                            <div className="overflow-x-auto rounded-xl border border-slate-800">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="bg-emerald-950/60 text-emerald-300 border-b border-slate-800">
                                    {parsed.columns.map((c: string, idx: number) => (
                                      <th key={idx} className="p-2.5 font-bold">{c}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {parsed.rows.map((row: string[], rIdx: number) => (
                                    <tr key={rIdx} className="border-b border-slate-800/60 hover:bg-slate-800/40">
                                      {row.map((cell: string, cIdx: number) => (
                                        <td key={cIdx} className="p-2.5 text-slate-300 font-mono text-[11px]">{cell}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            {parsed.notes && (
                              <p className="text-[10px] text-slate-400 italic">備註：{parsed.notes}</p>
                            )}
                          </div>
                        );
                      } catch {
                        return <pre className="font-mono text-slate-300">{activeFile.content}</pre>;
                      }
                    })()}
                  </div>
                )}

                {/* PowerPoint Viewer */}
                {activeFile.docFormat === 'powerpoint' && (
                  <div className="p-5 bg-[#1a1b22] border border-slate-800 rounded-2xl shadow-xl text-xs space-y-4">
                    <div className="flex items-center gap-2 text-amber-400 font-bold border-b border-slate-800 pb-2">
                      <Presentation className="w-4 h-4" />
                      <span>Microsoft PowerPoint 投影片播放器 (.pptx)</span>
                    </div>

                    {(() => {
                      try {
                        const parsed = JSON.parse(activeFile.content);
                        return (
                          <div className="space-y-4">
                            <h3 className="font-bold text-white text-sm">{parsed.title}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {parsed.slides.map((s: any, idx: number) => (
                                <div key={idx} className="aspect-video p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 flex flex-col justify-between shadow-lg">
                                  <div>
                                    <div className="flex items-center justify-between text-[10px] text-amber-400 font-mono">
                                      <span>SLIDE {s.slideNumber}</span>
                                      <span>16:9 HD</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white mt-1">{s.title}</h4>
                                    <p className="text-[11px] text-slate-400">{s.subtitle}</p>
                                    <ul className="mt-2 space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                                      {s.bullets.map((b: string, bIdx: number) => (
                                        <li key={bIdx}>{b}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="text-[9px] text-slate-500 font-mono">Dog AI Presentation Deck</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      } catch {
                        return <pre className="font-mono text-slate-300">{activeFile.content}</pre>;
                      }
                    })()}
                  </div>
                )}

                {/* PDF Viewer */}
                {activeFile.docFormat === 'pdf' && (
                  <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-xs space-y-3 font-mono">
                    <div className="flex items-center gap-2 text-rose-400 font-bold border-b border-slate-800 pb-2">
                      <FileCheck className="w-4 h-4" />
                      <span>Adobe PDF 檢視器 (.pdf)</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {activeFile.content}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Document Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#181920] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">建立新文件 (Word / Excel / PPT / PDF)</h3>

            {/* Document format chooser */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setNewDocType('word')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 font-semibold transition ${
                  newDocType === 'word' ? 'bg-blue-950 border-blue-500 text-blue-200' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Word 文件 (.docx)</span>
              </button>
              <button
                type="button"
                onClick={() => setNewDocType('excel')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 font-semibold transition ${
                  newDocType === 'excel' ? 'bg-emerald-950 border-emerald-500 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Excel 試算表 (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={() => setNewDocType('powerpoint')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 font-semibold transition ${
                  newDocType === 'powerpoint' ? 'bg-amber-950 border-amber-500 text-amber-200' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Presentation className="w-4 h-4 text-amber-400" />
                <span>PowerPoint (.pptx)</span>
              </button>
              <button
                type="button"
                onClick={() => setNewDocType('pdf')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 font-semibold transition ${
                  newDocType === 'pdf' ? 'bg-rose-950 border-rose-500 text-rose-200' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <FileCheck className="w-4 h-4 text-rose-400" />
                <span>PDF 文件 (.pdf)</span>
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">檔案標題 / 名稱</label>
              <input
                type="text"
                value={newDocTitle}
                onChange={e => setNewDocTitle(e.target.value)}
                placeholder="例如: 2026年度報告"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">初始內文或說明 (可選)</label>
              <textarea
                value={newDocContent}
                onChange={e => setNewDocContent(e.target.value)}
                placeholder="輸入初始文字，若留空將自動帶入標準專業範本..."
                className="w-full h-24 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-cyan-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleCreateDocument}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition"
              >
                建立並儲存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move File Location Modal (Dog AI & Manual Change Place) */}
      {fileToMove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-[#181920] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400">
              <FolderSymlink className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">更換檔案位置 (Move & Relocate)</h3>
            </div>

            <p className="text-xs text-slate-300">
              正在移動檔案：<strong className="text-white">{fileToMove.name}</strong>
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">選擇目標資料夾 (Destination Folder):</label>
              <div className="grid grid-cols-1 gap-2 text-xs">
                {['Documents', 'Pictures', 'Downloads', 'Work_Projects', 'Personal_Vault', 'Archives'].map(folder => (
                  <button
                    key={folder}
                    type="button"
                    onClick={() => setTargetFolderChoice(folder)}
                    className={`p-2.5 rounded-xl border text-left font-medium transition flex items-center justify-between ${
                      targetFolderChoice === folder
                        ? 'bg-amber-950/60 border-amber-500 text-amber-200 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-amber-400" />
                      <span>{folder}</span>
                    </span>
                    {targetFolderChoice === folder && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFileToMove(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmMoveFile}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition"
              >
                確認移動位置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
