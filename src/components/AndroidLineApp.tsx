import React, { useState, useEffect, useRef } from 'react';
import { LineContact, LineChatMessage, LineAccountState, LineVoomPost, LineCallRecord } from '../types';
import { LineServiceManager, DEFAULT_LINE_STICKERS } from '../services/lineService';
import { 
  ArrowLeft, 
  Send, 
  Search, 
  UserCheck, 
  ShieldAlert, 
  ShieldCheck, 
  Building, 
  Phone, 
  Video, 
  MoreVertical, 
  Smile, 
  Image as ImageIcon, 
  Mic, 
  Plus, 
  AlertTriangle,
  Lock,
  Check,
  Edit2,
  Users,
  MessageCircle,
  Tv,
  PhoneCall,
  CreditCard,
  QrCode,
  UserPlus,
  Share2,
  Heart,
  MessageSquare,
  Sparkles,
  PhoneOff,
  MicOff,
  Volume2,
  CheckCheck,
  X
} from 'lucide-react';

interface AndroidLineAppProps {
  onBack: () => void;
  onSendToDogAI?: (text: string) => void;
}

type LineTab = 'home' | 'chats' | 'voom' | 'calls' | 'wallet';

export const AndroidLineApp: React.FC<AndroidLineAppProps> = ({ onBack, onSendToDogAI }) => {
  const lineManager = LineServiceManager.getInstance();
  const [account, setAccount] = useState<LineAccountState>(() => lineManager.getAccount());
  const [contacts, setContacts] = useState<LineContact[]>(() => lineManager.getContacts());
  const [activeTab, setActiveTab] = useState<LineTab>('chats');
  const [activeContactId, setActiveContactId] = useState<string | null>('contact_dog_servant');
  const [inputText, setInputText] = useState('');
  const [forbiddenAlert, setForbiddenAlert] = useState<string | null>(null);
  
  // Stickers Drawer
  const [showStickers, setShowStickers] = useState(false);
  const [selectedStickerPack, setSelectedStickerPack] = useState<string>('Dog AI 狗僕人');
  
  // Modals
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(account.displayName);
  const [editStatus, setEditStatus] = useState(account.statusMessage);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [newFriendId, setNewFriendId] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [searchContact, setSearchContact] = useState('');

  // Voice / Video Call Simulation Modal
  const [callingState, setCallingState] = useState<{
    isActive: boolean;
    contact: LineContact | null;
    type: 'voice' | 'video';
    duration: number;
    isMuted: boolean;
    isSpeaker: boolean;
  }>({
    isActive: false,
    contact: null,
    type: 'voice',
    duration: 0,
    isMuted: false,
    isSpeaker: true,
  });

  // VOOM State
  const [voomPosts, setVoomPosts] = useState<LineVoomPost[]>(() => lineManager.getVoomPosts());
  const [newVoomText, setNewVoomText] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const stopRingRef = useRef<(() => void) | null>(null);

  const activeContact = contacts.find(c => c.id === activeContactId);
  const currentMessages = activeContactId ? lineManager.getMessages(activeContactId) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, activeContactId]);

  // Handle Call Timer
  useEffect(() => {
    let timer: any = null;
    if (callingState.isActive) {
      timer = setInterval(() => {
        setCallingState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callingState.isActive]);

  const refreshAccount = () => {
    setAccount(lineManager.getAccount());
    setContacts(lineManager.getContacts());
    setVoomPosts(lineManager.getVoomPosts());
  };

  const handleStartCall = (contact: LineContact, type: 'voice' | 'video') => {
    // Play calling ring tone via Web Audio API
    const stopFn = lineManager.playCallingRingTone();
    stopRingRef.current = stopFn;

    setCallingState({
      isActive: true,
      contact,
      type,
      duration: 0,
      isMuted: false,
      isSpeaker: true,
    });
  };

  const handleEndCall = () => {
    if (stopRingRef.current) {
      stopRingRef.current();
      stopRingRef.current = null;
    }
    if (callingState.contact) {
      lineManager.addCallRecord({
        contactId: callingState.contact.id,
        type: callingState.type,
        direction: 'outgoing',
        timestamp: '剛剛',
        durationSeconds: callingState.duration,
      });
    }
    setCallingState({
      isActive: false,
      contact: null,
      type: 'voice',
      duration: 0,
      isMuted: false,
      isSpeaker: true,
    });
    refreshAccount();
  };

  const handleSendMessage = (stickerText?: string, stickerEmoji?: string) => {
    if (!activeContactId) return;
    const textToSend = stickerText || inputText;
    if (!textToSend.trim() && !stickerEmoji) return;

    const result = lineManager.sendMessage(
      activeContactId, 
      textToSend, 
      stickerEmoji ? { sticker: stickerEmoji } : undefined
    );

    if (!result.success) {
      setForbiddenAlert(result.error || '偵測到異常詞彙，已被安全系統禁止發送！');
      return;
    }

    setForbiddenAlert(null);
    if (!stickerEmoji) setInputText('');
    setShowStickers(false);
    refreshAccount();

    // Neural reply from Dog Servant or coworkers
    if (activeContactId === 'contact_dog_servant') {
      const userMsg = textToSend;
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg,
          mode: 'agent',
          language: 'zh',
          systemInstruction: 'You are Dog Servant chatting on the user\'s mobile LINE app. Keep replies loyal, cheerful, playful, and concise with puppy excitement and dog barks (汪！ / 🐶). Obey company security rules.',
        }),
      })
        .then(async res => {
          if (res.ok) {
            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('text/event-stream')) {
              const reader = res.body?.getReader();
              const decoder = new TextDecoder();
              let fullReply = '';
              if (reader) {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  const chunk = decoder.decode(value);
                  const lines = chunk.split('\n');
                  for (const l of lines) {
                    if (l.startsWith('data: ')) {
                      try {
                        const parsed = JSON.parse(l.slice(6));
                        if (parsed.text) fullReply += parsed.text;
                      } catch {}
                    }
                  }
                }
              }
              if (fullReply.trim()) {
                lineManager.receiveReply(activeContactId, fullReply.trim());
                refreshAccount();
                return;
              }
            } else if (contentType.includes('application/json')) {
              const data = await res.json();
              if (data.text) {
                lineManager.receiveReply(activeContactId, data.text);
                refreshAccount();
                return;
              }
            }
          }
          throw new Error('Fallback');
        })
        .catch(() => {
          setTimeout(() => {
            const replies = [
              '汪！主人在 LINE 呼喚我！忠誠狗僕人永遠伴隨主人！🐾',
              '收到主人的 LINE 訊息！資料夾與各項工具一切正常！汪汪！🐶',
              '遵命主人！狗僕人時刻保持警惕，為主人守護通訊安全！✨',
            ];
            const rand = replies[Math.floor(Math.random() * replies.length)];
            lineManager.receiveReply(activeContactId, rand);
            refreshAccount();
          }, 800);
        });
    } else if (activeContactId === 'contact_company_official') {
      setTimeout(() => {
        lineManager.receiveReply(activeContactId, '【ARP-1 總部自動回條】訊息已安全歸檔至本機日誌，經資安守衛稽核無異常。感謝您的回報！');
        refreshAccount();
      }, 900);
    } else {
      setTimeout(() => {
        lineManager.receiveReply(activeContactId, '收到！已收到您的訊息，我稍後在會議中確認細節！');
        refreshAccount();
      }, 1000);
    }
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendId.trim()) return;

    const friendName = newFriendId.trim();
    lineManager.addContact({
      name: `${friendName} (已新增)`,
      avatar: '🧑‍💻',
      statusMessage: '透過 LINE ID / 搜尋加入的新聯絡人',
      department: '外部商務夥伴',
    });

    setNewFriendId('');
    setShowAddFriendModal(false);
    refreshAccount();
  };

  const handlePublishVoomPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoomText.trim()) return;

    lineManager.addVoomPost(newVoomText.trim(), '✨📝');
    setNewVoomText('');
    refreshAccount();
  };

  const handleAddVoomComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    lineManager.addVoomComment(postId, text);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    refreshAccount();
  };

  const stickerPacks = Array.from(new Set(DEFAULT_LINE_STICKERS.map(s => s.pack)));

  return (
    <div className="flex flex-col h-full bg-[#111317] text-white font-sans select-none overflow-hidden relative">
      {/* ===================== ACTIVE CALL OVERLAY MODAL ===================== */}
      {callingState.isActive && callingState.contact && (
        <div className="absolute inset-0 z-50 bg-[#0f1912] flex flex-col justify-between p-6 animate-fadeIn">
          {/* Top Status */}
          <div className="flex items-center justify-between text-xs text-emerald-400 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>LINE 端對端高保真加密通話</span>
            </span>
            <span>
              {String(Math.floor(callingState.duration / 60)).padStart(2, '0')}:
              {String(callingState.duration % 60).padStart(2, '0')}
            </span>
          </div>

          {/* Caller Profile */}
          <div className="flex flex-col items-center text-center space-y-4 my-auto">
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 flex items-center justify-center shadow-2xl relative">
              <span className="text-6xl">{callingState.contact.avatar}</span>
              <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-30 pointer-events-none" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">{callingState.contact.name}</h2>
              <p className="text-xs text-emerald-300 mt-1">{callingState.contact.department}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {callingState.duration > 0 ? '通話連線中 (HD Audio)' : '正在撥號連線中...'}
              </p>
            </div>
          </div>

          {/* Call Controls */}
          <div className="space-y-6 pb-6">
            <div className="flex items-center justify-around max-w-xs mx-auto">
              <button 
                onClick={() => setCallingState(prev => ({ ...prev, isMuted: !prev.isMuted }))}
                className={`w-14 h-14 rounded-full flex flex-col items-center justify-center transition active:scale-90 ${
                  callingState.isMuted ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <MicOff className="w-5 h-5" />
                <span className="text-[9px] mt-1">靜音</span>
              </button>

              <button 
                onClick={handleEndCall}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-2xl transition active:scale-90"
                title="結束通話"
              >
                <PhoneOff className="w-7 h-7" />
              </button>

              <button 
                onClick={() => setCallingState(prev => ({ ...prev, isSpeaker: !prev.isSpeaker }))}
                className={`w-14 h-14 rounded-full flex flex-col items-center justify-center transition active:scale-90 ${
                  callingState.isSpeaker ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Volume2 className="w-5 h-5" />
                <span className="text-[9px] mt-1">擴音</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== STRANGE WORDS FORBIDDEN ALERT MODAL ===================== */}
      {forbiddenAlert && (
        <div className="absolute inset-x-4 top-14 z-50 bg-red-950/95 border-2 border-red-500 text-red-100 p-4 rounded-2xl shadow-2xl backdrop-blur-md animate-bounce">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-sm text-red-200">【LINE 安全防護中心】禁止發送指令！</h4>
              <p className="text-xs text-red-300 mt-1 leading-relaxed">{forbiddenAlert}</p>
              <div className="mt-2.5 flex items-center justify-between text-[10px] text-red-400 font-mono">
                <span>防護模組: ARP-1 Guard LLM</span>
                <button
                  onClick={() => setForbiddenAlert(null)}
                  className="px-2.5 py-1 bg-red-800 hover:bg-red-700 text-white rounded font-bold"
                >
                  確認並關閉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== LINE TOP HEADER BAR ===================== */}
      <div className="bg-[#06c755] text-white p-3 shrink-0 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={onBack}
            className="p-1 rounded-full hover:bg-black/10 transition active:scale-95"
            title="返回 Android 桌面"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-extrabold text-sm tracking-wide flex items-center gap-1.5">
              <span>LINE</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/20 text-white font-normal">
                企業官方認證
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowQrModal(true)}
            className="p-1.5 rounded-full hover:bg-black/10 transition"
            title="我的行動條碼 / QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddFriendModal(true)}
            className="p-1.5 rounded-full hover:bg-black/10 transition"
            title="加好友"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: HOME (主頁) ===================== */}
      {activeTab === 'home' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* User Profile Card */}
          <div className="p-4 rounded-3xl bg-[#1b1d24] border border-slate-800 shadow-xl flex items-center gap-3.5 relative overflow-hidden">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-3xl shadow-md shrink-0">
              {account.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white truncate">{account.displayName}</h3>
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="p-1 text-slate-400 hover:text-emerald-400"
                  title="編輯個人檔案"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">{account.statusMessage}</p>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-emerald-400 font-mono">
                <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                  ID: {account.lineId}
                </span>
                <span>{account.companyName}</span>
              </div>
            </div>
          </div>

          {/* Quick Services Bar */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div 
              onClick={() => {
                setActiveTab('chats');
                setShowStickers(true);
              }}
              className="p-3 rounded-2xl bg-[#181a22] border border-slate-800/80 hover:border-emerald-500/50 cursor-pointer transition flex flex-col items-center"
            >
              <span className="text-xl mb-1">🐻</span>
              <span className="text-[11px] text-slate-300 font-medium">貼圖小舖</span>
            </div>
            <div 
              onClick={() => setActiveTab('wallet')}
              className="p-3 rounded-2xl bg-[#181a22] border border-slate-800/80 hover:border-emerald-500/50 cursor-pointer transition flex flex-col items-center"
            >
              <span className="text-xl mb-1">💳</span>
              <span className="text-[11px] text-slate-300 font-medium">LINE Pay</span>
            </div>
            <div 
              onClick={() => setActiveTab('voom')}
              className="p-3 rounded-2xl bg-[#181a22] border border-slate-800/80 hover:border-emerald-500/50 cursor-pointer transition flex flex-col items-center"
            >
              <span className="text-xl mb-1">🎬</span>
              <span className="text-[11px] text-slate-300 font-medium">VOOM 影音</span>
            </div>
            <div 
              onClick={() => {
                if (onSendToDogAI) onSendToDogAI('汪！主人在 LINE 打開了 Keep 備忘儲存空間！請狗僕人顯示重點備忘！');
              }}
              className="p-3 rounded-2xl bg-[#181a22] border border-slate-800/80 hover:border-emerald-500/50 cursor-pointer transition flex flex-col items-center"
            >
              <span className="text-xl mb-1">📌</span>
              <span className="text-[11px] text-slate-300 font-medium">Keep 筆記</span>
            </div>
          </div>

          {/* Friends Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
              <span>好友名單 ({contacts.length})</span>
              <button 
                onClick={() => setShowAddFriendModal(true)}
                className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <Plus className="w-3 h-3" />
                <span>加入好友</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {contacts.map(c => (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveContactId(c.id);
                    setActiveTab('chats');
                  }}
                  className="p-3 rounded-2xl bg-[#161820] hover:bg-[#1f222d] border border-slate-800/60 cursor-pointer transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-2xl shadow group-hover:scale-105 transition-transform">
                      {c.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{c.name}</span>
                        {c.isOfficial && (
                          <span className="text-[9px] px-1 rounded bg-[#06c755] text-white font-bold">
                            官方
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{c.statusMessage}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartCall(c, 'voice');
                      }}
                      className="p-2 rounded-full hover:bg-emerald-950/80 text-emerald-400"
                      title="撥打免費語音通話"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartCall(c, 'video');
                      }}
                      className="p-2 rounded-full hover:bg-emerald-950/80 text-emerald-400"
                      title="撥打免費視訊通話"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: CHATS (聊天) ===================== */}
      {activeTab === 'chats' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Active Chat Top Bar */}
          {activeContact && (
            <div className="p-2.5 bg-[#171922] border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-xl shadow">
                  {activeContact.avatar}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1">
                    <span>{activeContact.name}</span>
                    {activeContact.id === 'contact_dog_servant' && (
                      <span className="text-[9px] text-amber-400 font-mono">· 忠誠隨時在線</span>
                    )}
                  </h3>
                  <p className="text-[10px] text-emerald-400">{activeContact.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleStartCall(activeContact, 'voice')}
                  className="p-2 rounded-full hover:bg-slate-800 text-emerald-400 transition"
                  title="LINE 免費通話"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleStartCall(activeContact, 'video')}
                  className="p-2 rounded-full hover:bg-slate-800 text-emerald-400 transition"
                  title="LINE 視訊通話"
                >
                  <Video className="w-4 h-4" />
                </button>
                {/* Switch Contact Drawer */}
                <select
                  value={activeContactId || ''}
                  onChange={e => setActiveContactId(e.target.value)}
                  className="bg-slate-800 text-slate-300 text-[10px] rounded px-1.5 py-1 border border-slate-700 outline-none max-w-[90px]"
                >
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0d0f15]">
            <div className="text-center my-1">
              <span className="text-[10px] font-mono bg-slate-800/80 text-slate-400 px-3 py-0.5 rounded-full border border-slate-700/60">
                🔒 本對話受 LINE 端對端與 ARP-1 安全防護加密保護
              </span>
            </div>

            {currentMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${msg.isSelf ? 'justify-end' : 'justify-start'}`}
              >
                {!msg.isSelf && activeContact && (
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-sm shrink-0 mb-1">
                    {activeContact.avatar}
                  </div>
                )}

                <div className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'} max-w-[78%]`}>
                  {/* Sticker Display */}
                  {msg.sticker && (
                    <div className="text-5xl my-1 p-2 bg-slate-800/40 rounded-2xl animate-pop">
                      {msg.sticker}
                    </div>
                  )}

                  {/* Text Bubble */}
                  {msg.text && (
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed break-words shadow-md ${
                        msg.isSelf
                          ? 'bg-[#06c755] text-white rounded-br-none'
                          : 'bg-[#1e202b] text-slate-100 rounded-bl-none border border-slate-800'
                      }`}
                    >
                      {msg.text}
                    </div>
                  )}

                  <div className="flex items-center gap-1 mt-0.5 px-1 text-[9px] font-mono text-slate-400">
                    {msg.isSelf && <span className="text-emerald-400">已讀</span>}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Stickers Drawer */}
          {showStickers && (
            <div className="p-3 bg-[#181a24] border-t border-slate-800 space-y-2 shrink-0 animate-fadeIn">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <div className="flex gap-1.5 overflow-x-auto text-[10px]">
                  {stickerPacks.map(pack => (
                    <button
                      key={pack}
                      onClick={() => setSelectedStickerPack(pack)}
                      className={`px-2 py-0.5 rounded-full font-bold transition shrink-0 ${
                        selectedStickerPack === pack ? 'bg-[#06c755] text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {pack}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setShowStickers(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1">
                {DEFAULT_LINE_STICKERS.filter(s => s.pack === selectedStickerPack).map(sticker => (
                  <button
                    key={sticker.id}
                    onClick={() => handleSendMessage(sticker.name, sticker.emoji)}
                    className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 flex flex-col items-center justify-center text-center transition active:scale-95 group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{sticker.emoji}</span>
                    <span className="text-[9px] text-slate-400 mt-1 truncate max-w-full">{sticker.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Chat Input Bar */}
          <div className="p-2.5 bg-[#171922] border-t border-slate-800 flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowStickers(!showStickers)}
              className={`p-2 rounded-full transition ${showStickers ? 'bg-[#06c755] text-white' : 'text-slate-400 hover:text-white'}`}
              title="貼圖盤 (Stickers)"
            >
              <Smile className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                handleSendMessage('汪！主人傳送了一張工作相片！📸', '📸🐕');
              }}
              className="p-2 rounded-full text-slate-400 hover:text-white transition"
              title="傳送照片"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder="輸入訊息... (安全防護監督中)"
              className="flex-1 bg-[#232634] text-xs text-white placeholder-slate-500 rounded-full px-3.5 py-2 outline-none border border-slate-700/80 focus:border-[#06c755]"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="p-2 rounded-full bg-[#06c755] hover:bg-emerald-500 disabled:opacity-40 text-white transition active:scale-95 shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: VOOM (貼文串) ===================== */}
      {activeTab === 'voom' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Post Creation Box */}
          <form onSubmit={handlePublishVoomPost} className="p-3.5 rounded-2xl bg-[#1a1c25] border border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">✍️</span>
              <span className="text-xs font-bold text-white">分享我的 VOOM 動態</span>
            </div>
            <textarea
              value={newVoomText}
              onChange={e => setNewVoomText(e.target.value)}
              placeholder="分享今天在 Android 工作系統的進度或心情..."
              rows={2}
              className="w-full bg-[#121319] text-xs text-white placeholder-slate-500 rounded-xl p-2.5 outline-none border border-slate-700/80 focus:border-[#06c755] resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newVoomText.trim()}
                className="px-4 py-1.5 rounded-full bg-[#06c755] hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition shadow"
              >
                發布貼文
              </button>
            </div>
          </form>

          {/* Posts Feed */}
          <div className="space-y-3.5">
            {voomPosts.map(post => (
              <div key={post.id} className="p-4 rounded-3xl bg-[#191b24] border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl shadow">
                    {post.authorAvatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{post.authorName}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">{post.timestamp} · {post.department}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">{post.content}</p>

                {post.mediaEmoji && (
                  <div className="p-4 rounded-2xl bg-[#121318] border border-slate-800 flex items-center justify-center text-4xl">
                    {post.mediaEmoji}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <button
                    onClick={() => {
                      lineManager.toggleVoomLike(post.id);
                      refreshAccount();
                    }}
                    className={`flex items-center gap-1.5 hover:text-red-400 transition ${post.isLiked ? 'text-red-400 font-bold' : ''}`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-400' : ''}`} />
                    <span>{post.likes} 讚</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments.length} 則留言</span>
                  </div>
                </div>

                {/* Comments List */}
                {post.comments.length > 0 && (
                  <div className="space-y-1.5 bg-[#121319] p-2.5 rounded-xl border border-slate-800/80 text-[11px]">
                    {post.comments.map(c => (
                      <div key={c.id} className="text-slate-300">
                        <strong className="text-emerald-400">{c.authorName}: </strong>
                        <span>{c.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment Input */}
                <div className="flex gap-1.5 pt-1">
                  <input
                    type="text"
                    value={commentInputs[post.id] || ''}
                    onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddVoomComment(post.id);
                    }}
                    placeholder="留個言吧..."
                    className="flex-1 bg-[#121319] text-xs text-white placeholder-slate-500 rounded-full px-3 py-1.5 outline-none border border-slate-700/80"
                  />
                  <button
                    onClick={() => handleAddVoomComment(post.id)}
                    className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-[#06c755] text-white text-xs font-bold transition"
                  >
                    留言
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TAB 4: CALLS (通話) ===================== */}
      {activeTab === 'calls' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
            <span>通話紀錄</span>
            <span className="text-[10px] text-emerald-400 font-mono">VoIP HD Voice</span>
          </div>

          <div className="space-y-2">
            {(account.callLogs || []).map(record => {
              const contact = contacts.find(c => c.id === record.contactId) || {
                name: '聯絡人',
                avatar: '👤',
                department: '通訊系統',
              };

              return (
                <div
                  key={record.id}
                  className="p-3.5 rounded-2xl bg-[#191b24] border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl">
                      {contact.avatar}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{contact.name}</h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                        {record.direction === 'outgoing' ? '↗ 撥出' : record.direction === 'incoming' ? '↙ 來電' : '✕ 未接'}
                        <span>· {record.timestamp}</span>
                        {record.durationSeconds > 0 && <span>({record.durationSeconds}秒)</span>}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartCall(contact as LineContact, record.type)}
                    className="p-2 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-400 transition"
                    title="立即回撥"
                  >
                    {record.type === 'video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== TAB 5: WALLET (錢包 / LINE PAY) ===================== */}
      {activeTab === 'wallet' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* LINE Pay Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-700 to-slate-900 border border-emerald-400/30 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                <span className="font-extrabold text-sm tracking-wider">LINE Pay</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/30 border border-white/20">
                主權認證帳戶
              </span>
            </div>

            <div>
              <p className="text-[11px] text-emerald-100 opacity-80">帳戶可用餘額 (TWD)</p>
              <h2 className="text-3xl font-extrabold tracking-tight mt-1">
                ${(account.linePayBalance ?? 12500).toLocaleString()}
              </h2>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-center text-xs">
              <button 
                onClick={() => alert('已模擬產出 LINE Pay 專屬支付條碼！')}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition font-bold"
              >
                我的條碼
              </button>
              <button 
                onClick={() => alert('轉帳功能就緒！可即時轉帳給 Dog AI 或同事。')}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition font-bold"
              >
                轉帳
              </button>
              <button 
                onClick={() => alert('電子載具已綁定：/ARP1-769998445644')}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition font-bold"
              >
                發票載具
              </button>
            </div>
          </div>

          {/* Barcode Mock */}
          <div className="p-4 rounded-2xl bg-[#191b24] border border-slate-800 text-center space-y-2">
            <span className="text-xs text-slate-400 font-mono">快速出示條碼付款</span>
            <div className="h-14 bg-white rounded-lg flex items-center justify-center p-2 font-mono text-black text-xs font-bold tracking-widest">
              ||| | |||| || | |||| ||| |||| |
            </div>
            <p className="text-[10px] text-slate-500 font-mono">9844-5644-2026-1101</p>
          </div>
        </div>
      )}

      {/* ===================== AUTHENTIC LINE 5-TAB NAVIGATION BAR ===================== */}
      <div className="h-13 bg-[#13151c] border-t border-slate-800/80 px-2 flex items-center justify-around shrink-0 z-40 select-none">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center py-1 transition ${
            activeTab === 'home' ? 'text-[#06c755]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px] font-semibold mt-0.5">主頁</span>
        </button>

        <button
          onClick={() => setActiveTab('chats')}
          className={`flex flex-col items-center py-1 transition relative ${
            activeTab === 'chats' ? 'text-[#06c755]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-[10px] font-semibold mt-0.5">聊天</span>
          <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-[#06c755]" />
        </button>

        <button
          onClick={() => setActiveTab('voom')}
          className={`flex flex-col items-center py-1 transition ${
            activeTab === 'voom' ? 'text-[#06c755]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span className="text-[10px] font-semibold mt-0.5">VOOM</span>
        </button>

        <button
          onClick={() => setActiveTab('calls')}
          className={`flex flex-col items-center py-1 transition ${
            activeTab === 'calls' ? 'text-[#06c755]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span className="text-[10px] font-semibold mt-0.5">通話</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex flex-col items-center py-1 transition ${
            activeTab === 'wallet' ? 'text-[#06c755]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span className="text-[10px] font-semibold mt-0.5">錢包</span>
        </button>
      </div>

      {/* ===================== MODAL: EDIT PROFILE ===================== */}
      {isEditingProfile && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b1d26] border border-slate-700 w-full max-w-xs rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Edit2 className="w-4 h-4 text-[#06c755]" />
              <span>編輯個人檔案</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">顯示名稱</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-[#121319] border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-[#06c755]"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">狀態消息</label>
                <input
                  type="text"
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  className="w-full bg-[#121319] border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-[#06c755]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="px-3 py-1.5 rounded-full text-xs text-slate-400 hover:text-white"
              >
                取消
              </button>
              <button
                onClick={() => {
                  lineManager.updateProfile({ displayName: editName, statusMessage: editStatus });
                  refreshAccount();
                  setIsEditingProfile(false);
                }}
                className="px-4 py-1.5 rounded-full bg-[#06c755] hover:bg-emerald-500 text-white text-xs font-bold shadow"
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: ADD FRIEND ===================== */}
      {showAddFriendModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddFriend} className="bg-[#1b1d26] border border-slate-700 w-full max-w-xs rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-[#06c755]" />
              <span>加好友 / 搜尋 ID</span>
            </h3>

            <div className="space-y-2 text-xs">
              <label className="text-slate-400 block">請輸入好友 LINE ID 或姓名：</label>
              <input
                type="text"
                value={newFriendId}
                onChange={e => setNewFriendId(e.target.value)}
                placeholder="例如: tech_lead_chen 或 0912..."
                className="w-full bg-[#121319] border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-[#06c755]"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddFriendModal(false)}
                className="px-3 py-1.5 rounded-full text-xs text-slate-400 hover:text-white"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!newFriendId.trim()}
                className="px-4 py-1.5 rounded-full bg-[#06c755] hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold shadow"
              >
                加入
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===================== MODAL: QR CODE ===================== */}
      {showQrModal && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b1d26] border border-slate-700 w-full max-w-xs rounded-3xl p-6 text-center space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white">我的行動條碼 (QR Code)</span>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-44 h-44 bg-white rounded-2xl mx-auto flex items-center justify-center p-3 shadow-2xl">
              <QrCode className="w-36 h-36 text-slate-900" />
            </div>

            <div className="text-xs text-slate-400 font-mono">
              <p className="text-white font-bold">{account.displayName}</p>
              <p className="mt-0.5">LINE ID: {account.lineId}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
