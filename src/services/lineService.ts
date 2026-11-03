import { LineAccountState, LineChatMessage, LineContact, LineSticker, LineVoomPost, LineCallRecord } from '../types';

const STORAGE_KEY_LINE_ACCOUNT = 'dog_phone_line_account_v1';

export const STRANGE_WORDS_PATTERNS = [
  // Malicious, phishing, scam, exploit keywords
  'hack',
  'trojan',
  'exploit',
  'ransomware',
  'malware',
  'phishing',
  'keylogger',
  'backdoor',
  'inject',
  'bypass security',
  'dump database',
  'credit card cvv',
  'steal credentials',
  'company password',
  'internal financial leak',
  'wire money urgent',
  '點擊領取飆股',
  '投資加賴領取',
  '外流個資',
  '駭客入侵',
  '木馬程式',
  '公司機密外洩',
  '盜取密碼',
  '提款卡密碼',
  '非法代購',
  '刷單兼職',
];

export const DEFAULT_LINE_CONTACTS: LineContact[] = [
  {
    id: 'contact_dog_servant',
    name: '🐶 Dog AI (狗僕人助手)',
    avatar: '🐶',
    statusMessage: '忠誠狗僕人隨時為主人效勞！汪！🐾',
    department: '智慧核心',
  },
  {
    id: 'contact_company_official',
    name: '🏢 ARP-1 企業總部 (Company LINE)',
    avatar: '🏢',
    statusMessage: 'ARP-1 主權系統官方認證企業帳號',
    isOfficial: true,
    department: '總部管理',
  },
  {
    id: 'contact_colleague_alice',
    name: 'Alice (產品專案經理)',
    avatar: '👩‍💼',
    statusMessage: '線上會議進行中，有急事請留言',
    department: '專案管理部',
  },
  {
    id: 'contact_tech_support',
    name: 'Kevin (系統運維工程師)',
    avatar: '👨‍💻',
    statusMessage: 'Android 15 & 離線模型監控中',
    department: '資訊安全處',
  },
];

export const INITIAL_LINE_MESSAGES: Record<string, LineChatMessage[]> = {
  contact_dog_servant: [
    {
      id: 'msg_1',
      senderId: 'contact_dog_servant',
      text: '汪！主人好！這是在 Android 手機工作系統中運行的企業官方 LINE！我是您的忠誠狗僕人！🐶',
      timestamp: '10:00',
      isSelf: false,
    },
    {
      id: 'msg_2',
      senderId: 'contact_dog_servant',
      text: '主人在 LINE 裡面也可以隨時吩咐我！如果有人傳送奇怪的有害字詞（如駭客、盜密碼、釣魚詐騙），系統會立刻阻擋並禁止發送 (Forbid)！🛡️',
      timestamp: '10:01',
      isSelf: false,
    },
  ],
  contact_company_official: [
    {
      id: 'msg_c1',
      senderId: 'contact_company_official',
      text: '【ARP-1 官方通告】歡迎使用企業認證 LINE 通訊系統。本帳號受安全守衛保護，嚴禁傳送詐騙或可疑指令。',
      timestamp: '09:30',
      isSelf: false,
    },
  ],
  contact_colleague_alice: [
    {
      id: 'msg_a1',
      senderId: 'contact_colleague_alice',
      text: '今天下午的專案進度文件已經準備好了，放在手機資料夾內囉！',
      timestamp: '11:20',
      isSelf: false,
    },
  ],
};

export const DEFAULT_LINE_STICKERS: LineSticker[] = [
  { id: 'st_dog_1', name: '汪！收到！', emoji: '🐶', pack: 'Dog AI 狗僕人' },
  { id: 'st_dog_2', name: '搖尾巴歡呼', emoji: '🐾', pack: 'Dog AI 狗僕人' },
  { id: 'st_dog_3', name: '主人最棒！', emoji: '🍖', pack: 'Dog AI 狗僕人' },
  { id: 'st_dog_4', name: '忠誠警戒中', emoji: '🛡️', pack: 'Dog AI 狗僕人' },
  { id: 'st_brown_1', name: '熊大比讚', emoji: '🐻👍', pack: 'Brown & Friends' },
  { id: 'st_brown_2', name: '熊大愛心', emoji: '🐻❤️', pack: 'Brown & Friends' },
  { id: 'st_cony_1', name: '兔兔開懷笑', emoji: '🐰✨', pack: 'Brown & Friends' },
  { id: 'st_sally_1', name: '莎莉驚訝', emoji: '🐥⁉️', pack: 'Brown & Friends' },
  { id: 'st_moon_1', name: '饅頭人加班', emoji: '🌝💻', pack: 'Brown & Friends' },
  { id: 'st_corp_1', name: '收到，處理中', emoji: '💼📋', pack: '企業公務貼圖' },
  { id: 'st_corp_2', name: '辛苦了！', emoji: '☕👏', pack: '企業公務貼圖' },
  { id: 'st_corp_3', name: '會議確認', emoji: '🤝🗓️', pack: '企業公務貼圖' },
];

export const DEFAULT_VOOM_POSTS: LineVoomPost[] = [
  {
    id: 'voom_1',
    authorId: 'contact_dog_servant',
    authorName: 'Dog AI 狗僕人 (Orca Mini 3B)',
    authorAvatar: '🐶',
    department: '智慧核心僕人',
    content: '汪！報告主人！今天在 Android 15 工作系統中一切運作正常！資料夾內的文件與圖片都已經做好索引，隨時等候主人指示！🐾✨',
    mediaEmoji: '🐕📄',
    timestamp: '10分鐘前',
    likes: 12,
    isLiked: false,
    comments: [
      { id: 'c1', authorName: 'Alice (產品專案經理)', text: '忠誠的小僕人，表現得真好！', timestamp: '8分鐘前' },
      { id: 'c2', authorName: 'Kevin (系統工程師)', text: '記憶體管理良好，繼續保持！', timestamp: '5分鐘前' },
    ],
  },
  {
    id: 'voom_2',
    authorId: 'contact_company_official',
    authorName: 'ARP-1 企業總部 (Company LINE)',
    authorAvatar: '🏢',
    department: '官方資安中心',
    content: '【安全公告】本裝置已全面啟用 Android Enterprise 工作設定檔 (Work Profile) 及 ARP-1 智慧防護。所有通訊內容均受安全守衛監督，防範未授權機密洩漏。',
    mediaEmoji: '🛡️🔒',
    timestamp: '1小時前',
    likes: 28,
    isLiked: true,
    comments: [
      { id: 'c3', authorName: 'David (財務總監)', text: '資安合規性 100%，確認。', timestamp: '45分鐘前' },
    ],
  },
  {
    id: 'voom_3',
    authorId: 'contact_colleague_alice',
    authorName: 'Alice (產品專案經理)',
    authorAvatar: '👩‍💼',
    department: '專案管理部',
    content: '下午 3 點 Android 工作系統架構研討會，請各專案負責人準備好 PowerPoint 簡報。狗僕人也會出席協助紀錄會議摘要！☕💼',
    mediaEmoji: '📊📈',
    timestamp: '3小時前',
    likes: 8,
    isLiked: false,
    comments: [],
  },
];

export const DEFAULT_CALL_LOGS: LineCallRecord[] = [
  {
    id: 'call_1',
    contactId: 'contact_dog_servant',
    type: 'voice',
    direction: 'incoming',
    timestamp: '今天 11:15',
    durationSeconds: 145,
  },
  {
    id: 'call_2',
    contactId: 'contact_colleague_alice',
    type: 'video',
    direction: 'outgoing',
    timestamp: '昨天 16:30',
    durationSeconds: 320,
  },
  {
    id: 'call_3',
    contactId: 'contact_tech_support',
    type: 'voice',
    direction: 'missed',
    timestamp: '10月31日',
    durationSeconds: 0,
  },
];

export const DEFAULT_LINE_ACCOUNT: LineAccountState = {
  lineId: 'dog_master_arp1',
  displayName: 'Dog Master (swhau)',
  statusMessage: 'Sovereign Phone User · 忠誠狗僕人隨行',
  phoneNumber: '+886 912-345-678',
  email: 'swhau@hlc.edu.tw',
  avatar: '👤',
  isCompanyAccount: true,
  companyName: 'ARP-1 Sovereign Enterprise',
  contacts: [...DEFAULT_LINE_CONTACTS],
  messages: { ...INITIAL_LINE_MESSAGES },
  callLogs: [...DEFAULT_CALL_LOGS],
  voomPosts: [...DEFAULT_VOOM_POSTS],
  linePayBalance: 12500,
};

export class LineServiceManager {
  private static instance: LineServiceManager;
  private account: LineAccountState = { ...DEFAULT_LINE_ACCOUNT };
  private audioCtx: AudioContext | null = null;

  private constructor() {
    this.loadState();
  }

  public static getInstance(): LineServiceManager {
    if (!LineServiceManager.instance) {
      LineServiceManager.instance = new LineServiceManager();
    }
    return LineServiceManager.instance;
  }

  private loadState(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LINE_ACCOUNT);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.account = { 
          ...DEFAULT_LINE_ACCOUNT, 
          ...parsed,
          callLogs: parsed.callLogs || [...DEFAULT_CALL_LOGS],
          voomPosts: parsed.voomPosts || [...DEFAULT_VOOM_POSTS],
          linePayBalance: parsed.linePayBalance ?? 12500,
        };
      }
    } catch (e) {
      console.warn('Failed to load LINE account state:', e);
    }
  }

  public saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY_LINE_ACCOUNT, JSON.stringify(this.account));
    } catch (e) {
      console.warn('Failed to save LINE account state:', e);
    }
  }

  public getAccount(): LineAccountState {
    return { ...this.account };
  }

  public updateProfile(updates: Partial<LineAccountState>): void {
    this.account = { ...this.account, ...updates };
    this.saveState();
  }

  public getContacts(): LineContact[] {
    return [...this.account.contacts];
  }

  public getMessages(contactId: string): LineChatMessage[] {
    return this.account.messages[contactId] || [];
  }

  public getCallLogs(): LineCallRecord[] {
    return this.account.callLogs || [...DEFAULT_CALL_LOGS];
  }

  public getVoomPosts(): LineVoomPost[] {
    return this.account.voomPosts || [...DEFAULT_VOOM_POSTS];
  }

  /**
   * Evaluates text for strange/harmful/phishing words.
   * If strange words found -> FORBIDS sending!
   */
  public checkForStrangeWords(text: string): { forbidden: boolean; matchedWord?: string; reason?: string } {
    const lower = text.toLowerCase().trim();
    for (const pattern of STRANGE_WORDS_PATTERNS) {
      if (lower.includes(pattern)) {
        return {
          forbidden: true,
          matchedWord: pattern,
          reason: `偵測到異常/違規字詞「${pattern}」！企業 LINE 防護系統嚴格禁止發送！(Strange words forbidden 🛡️)`,
        };
      }
    }
    return { forbidden: false };
  }

  /**
   * Sends a message to a contact.
   * If strange words are detected, it returns an error and DOES NOT deliver the message!
   */
  public sendMessage(
    contactId: string, 
    text: string, 
    extra?: { sticker?: string; mediaType?: 'image' | 'file' | 'audio' | 'voice_note'; mediaName?: string }
  ): { success: boolean; message?: LineChatMessage; error?: string } {
    const check = this.checkForStrangeWords(text);
    if (check.forbidden) {
      this.playWarningSound();
      return {
        success: false,
        error: check.reason,
      };
    }

    const newMessage: LineChatMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      senderId: 'self',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      isSelf: true,
      sticker: extra?.sticker,
      mediaType: extra?.mediaType,
      mediaName: extra?.mediaName,
    };

    const currentList = this.account.messages[contactId] || [];
    this.account.messages[contactId] = [...currentList, newMessage];
    this.saveState();
    this.playSendSound();

    return {
      success: true,
      message: newMessage,
    };
  }

  public receiveReply(contactId: string, text: string, sticker?: string): LineChatMessage {
    const reply: LineChatMessage = {
      id: 'reply_' + Date.now(),
      senderId: contactId,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      isSelf: false,
      sticker,
    };

    const currentList = this.account.messages[contactId] || [];
    this.account.messages[contactId] = [...currentList, reply];
    this.saveState();
    this.playReceiveSound();

    return reply;
  }

  public addContact(contact: Omit<LineContact, 'id'>): LineContact {
    const newContact: LineContact = {
      ...contact,
      id: 'contact_' + Date.now().toString(36),
    };
    this.account.contacts = [newContact, ...this.account.contacts];
    this.saveState();
    return newContact;
  }

  public addCallRecord(record: Omit<LineCallRecord, 'id'>): LineCallRecord {
    const newRecord: LineCallRecord = {
      ...record,
      id: 'call_' + Date.now(),
    };
    this.account.callLogs = [newRecord, ...(this.account.callLogs || [])];
    this.saveState();
    return newRecord;
  }

  public addVoomPost(content: string, mediaEmoji: string = '📱'): LineVoomPost {
    const newPost: LineVoomPost = {
      id: 'voom_' + Date.now(),
      authorId: 'self',
      authorName: this.account.displayName,
      authorAvatar: this.account.avatar,
      department: this.account.companyName,
      content,
      mediaEmoji,
      timestamp: '剛剛',
      likes: 0,
      isLiked: false,
      comments: [],
    };
    this.account.voomPosts = [newPost, ...(this.account.voomPosts || [])];
    this.saveState();
    return newPost;
  }

  public toggleVoomLike(postId: string): void {
    if (!this.account.voomPosts) return;
    this.account.voomPosts = this.account.voomPosts.map(p => {
      if (p.id === postId) {
        const nextLiked = !p.isLiked;
        return {
          ...p,
          isLiked: nextLiked,
          likes: nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
        };
      }
      return p;
    });
    this.saveState();
  }

  public addVoomComment(postId: string, text: string): void {
    if (!this.account.voomPosts || !text.trim()) return;
    this.account.voomPosts = this.account.voomPosts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [
            ...p.comments,
            {
              id: 'c_' + Date.now(),
              authorName: this.account.displayName,
              text: text.trim(),
              timestamp: '剛剛',
            },
          ],
        };
      }
      return p;
    });
    this.saveState();
  }

  // Web Audio API Synthesizers for authentic LINE Sound FX
  private getAudioContext(): AudioContext | null {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  public playSendSound(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  public playReceiveSound(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6
      osc.frequency.setValueAtTime(1318.5, ctx.currentTime + 0.06); // E6
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  }

  public playWarningSound(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  }

  public playCallingRingTone(): () => void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return () => {};
      let isPlaying = true;

      const ringCycle = () => {
        if (!isPlaying || !this.audioCtx) return;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.frequency.value = 440; // A4
        osc2.frequency.value = 480; // B4
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 1.2);
        osc2.stop(ctx.currentTime + 1.2);

        if (isPlaying) {
          setTimeout(ringCycle, 2800);
        }
      };

      ringCycle();

      return () => {
        isPlaying = false;
      };
    } catch {
      return () => {};
    }
  }
}
