import React, { useState } from 'react';
import { AndroidSettingsState } from '../types';
import { PhoneSystemManager } from '../services/phoneSystemManager';
import { 
  Wifi, 
  WifiOff, 
  Bluetooth, 
  Smartphone, 
  Share2, 
  UserCheck, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Grid, 
  Info, 
  ChevronRight, 
  ArrowLeft, 
  Search, 
  ToggleLeft, 
  ToggleRight, 
  Check, 
  Lock, 
  Fingerprint, 
  HardDrive, 
  RotateCcw, 
  Bell, 
  ShieldAlert,
  Sliders,
  Database
} from 'lucide-react';

interface AndroidSettingsAppProps {
  onBack: () => void;
  onOpenDogAISettings?: () => void;
}

type SettingsSection = 
  | 'menu' 
  | 'network' 
  | 'accounts' 
  | 'security' 
  | 'display' 
  | 'apps' 
  | 'system'
  | 'shared_preferences';

export const AndroidSettingsApp: React.FC<AndroidSettingsAppProps> = ({ onBack, onOpenDogAISettings }) => {
  const manager = PhoneSystemManager.getInstance();
  const [settings, setSettings] = useState<AndroidSettingsState>(() => manager.getSettings());
  const [currentSection, setCurrentSection] = useState<SettingsSection>('menu');
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 2500);
  };

  const updateSettings = (updates: Partial<AndroidSettingsState>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    manager.saveSettings(updates);
  };

  const updateAppPermission = (appKey: string, perm: 'camera' | 'location' | 'storage' | 'microphone' | 'notifications', val: boolean) => {
    const curAppPerms = settings.appPermissions[appKey] || { camera: false, location: false, storage: true, microphone: false, notifications: true };
    const newPerms = {
      ...settings.appPermissions,
      [appKey]: {
        ...curAppPerms,
        [perm]: val,
      },
    };
    updateSettings({ appPermissions: newPerms });
    triggerToast(`Updated ${appKey} ${perm} permission`);
  };

  const handleFactoryReset = () => {
    if (confirm('確定要將手機系統恢復原廠設定嗎？所有快取與自訂設定將回到預設值（Dog AI 與資料夾文件將安全備份）。')) {
      localStorage.removeItem('dog_phone_android_settings_v1');
      location.reload();
    }
  };

  const menuItems = [
    {
      id: 'network',
      title: '網路與連線 (Network & Connectivity)',
      subtitle: settings.wifiEnabled ? `Wi-Fi (${settings.connectedWifiSsid}) · 行動數據開啟` : '飛航模式或離線',
      icon: Wifi,
      color: 'bg-blue-500',
    },
    {
      id: 'accounts',
      title: '帳號與同步 (Accounts & Sync)',
      subtitle: `${settings.googleAccountName} (${settings.googleAccountEmail})`,
      icon: UserCheck,
      color: 'bg-emerald-500',
    },
    {
      id: 'security',
      title: '安全與生物辨識 (Security & Biometrics)',
      subtitle: `指紋解鎖已啟用 · 面部辨識 · 螢幕鎖定 (${settings.screenLockType})`,
      icon: ShieldCheck,
      color: 'bg-amber-500',
    },
    {
      id: 'display',
      title: '顯示與亮度 (Display & Brightness)',
      subtitle: `亮度 ${settings.brightnessLevel}% · ${settings.darkModeEnabled ? '深色模式' : '淺色模式'} · 休眠 ${settings.screenTimeoutSeconds}s`,
      icon: Sun,
      color: 'bg-orange-500',
    },
    {
      id: 'apps',
      title: '應用程式管理 (Apps / Applications)',
      subtitle: '查看已安裝的 6 個核心軟體、權限宣告、清除快取與強制停止',
      icon: Grid,
      color: 'bg-purple-500',
    },
    {
      id: 'system',
      title: '系統與更新 (System & Updates)',
      subtitle: `${settings.androidVersion} · OTA 更新 · 儲存空間 (${settings.usedStorageGB}GB / ${settings.totalStorageGB}GB)`,
      icon: Info,
      color: 'bg-cyan-500',
    },
    {
      id: 'shared_preferences',
      title: '核心開發設定 (SharedPreferences & Framework)',
      subtitle: '底層 Key-Value 資料庫、PreferenceFragment 映射與系統權限標頭',
      icon: Database,
      color: 'bg-rose-500',
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#121316] text-slate-100 font-sans select-none overflow-hidden">
      {/* Toast Notification */}
      {showToast && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-slate-800 border border-slate-700 text-white text-xs px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Top Android App Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1a1b20] border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          {currentSection !== 'menu' ? (
            <button
              onClick={() => setCurrentSection('menu')}
              className="p-1 rounded-full hover:bg-slate-700/60 text-slate-300 transition"
              title="返回設定主頁"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onBack}
              className="p-1 rounded-full hover:bg-slate-700/60 text-slate-300 transition"
              title="返回手機桌面"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">
              {currentSection === 'menu' && '設定 (Settings)'}
              {currentSection === 'network' && '網路與連線'}
              {currentSection === 'accounts' && '帳號與同步'}
              {currentSection === 'security' && '安全與生物辨識'}
              {currentSection === 'display' && '顯示與亮度'}
              {currentSection === 'apps' && '應用程式管理'}
              {currentSection === 'system' && '系統與更新'}
              {currentSection === 'shared_preferences' && 'SharedPreferences 後台'}
            </h1>
            <p className="text-[10px] text-slate-400">Android 15 Sovereign Phone OS</p>
          </div>
        </div>

        {onOpenDogAISettings && (
          <button
            onClick={onOpenDogAISettings}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-300 text-[11px] font-semibold hover:bg-amber-900 transition"
          >
            <span>🐶</span>
            <span>Dog AI 模型設定</span>
          </button>
        )}
      </div>

      {/* Main Settings Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ===================== MENU HOME ===================== */}
        {currentSection === 'menu' && (
          <div className="space-y-4">
            {/* Search Settings Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜尋設定、網路、帳號、顯示..."
                className="w-full bg-[#1e2026] border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            {/* User Account Quick Card */}
            <div 
              onClick={() => setCurrentSection('accounts')}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-900/40 flex items-center justify-between cursor-pointer hover:border-blue-700/60 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  G
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    {settings.googleAccountName}
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/40 font-normal">Google 帳號</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">{settings.googleAccountEmail}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Core Settings Sections */}
            <div className="bg-[#1a1b22] border border-slate-800/80 rounded-2xl divide-y divide-slate-800/60 overflow-hidden">
              {filteredMenuItems.map(item => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => setCurrentSection(item.id as SettingsSection)}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center text-white shadow-sm shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-100">{item.title}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{item.subtitle}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
                  </div>
                );
              })}
            </div>

            {/* Quick Developer Info Footnote */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-[10px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300">Android 系統架構說明：</div>
              <p>本設定為真實手機系統核心（包含 SharedPreferences、PreferenceFragment 交互介面與 Permissions 權限宣告），與內建的 Dog AI 認知助手雙向同步。</p>
            </div>
          </div>
        )}

        {/* ===================== 1. NETWORK & CONNECTIVITY ===================== */}
        {currentSection === 'network' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-[#1a1b22] border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-bold text-cyan-400 tracking-wider uppercase">網路連線開關</h3>

              {/* Wi-Fi */}
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Wi-Fi 無線網路</div>
                    <div className="text-[10px] text-slate-400">
                      {settings.wifiEnabled ? `已連線至 ${settings.connectedWifiSsid} (5GHz · 866 Mbps)` : '已關閉 Wi-Fi'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.wifiEnabled}
                  onChange={e => {
                    updateSettings({ wifiEnabled: e.target.checked });
                    triggerToast(`Wi-Fi ${e.target.checked ? '已開啟' : '已關閉'}`);
                  }}
                  className="w-5 h-5 accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Mobile Data */}
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">行動數據 (Mobile Data 5G)</div>
                    <div className="text-[10px] text-slate-400">
                      {settings.mobileDataEnabled ? '5G SA 高速自主連線 · 漫遊已開啟' : '已關閉行動數據'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.mobileDataEnabled}
                  onChange={e => {
                    updateSettings({ mobileDataEnabled: e.target.checked });
                    triggerToast(`行動數據 ${e.target.checked ? '已開啟' : '已關閉'}`);
                  }}
                  className="w-5 h-5 accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Bluetooth */}
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Bluetooth className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">藍牙 (Bluetooth 5.4)</div>
                    <div className="text-[10px] text-slate-400">
                      {settings.bluetoothEnabled ? `已連接裝置: ${settings.connectedBluetoothDevice} (電量 90%)` : '已關閉藍牙'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.bluetoothEnabled}
                  onChange={e => {
                    updateSettings({ bluetoothEnabled: e.target.checked });
                    triggerToast(`藍牙 ${e.target.checked ? '已開啟' : '已關閉'}`);
                  }}
                  className="w-5 h-5 accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Hotspot */}
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">個人熱點 (Personal Hotspot)</div>
                    <div className="text-[10px] text-slate-400">分享行動網路給其他筆電或手機</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.hotspotEnabled}
                  onChange={e => {
                    updateSettings({ hotspotEnabled: e.target.checked });
                    triggerToast(`個人熱點 ${e.target.checked ? '已啟用' : '已停用'}`);
                  }}
                  className="w-5 h-5 accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Airplane mode */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <WifiOff className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">飛航模式 (Airplane Mode)</div>
                    <div className="text-[10px] text-slate-400">停用所有無線電傳輸（Wi-Fi、行動數據、藍牙）</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.airplaneMode}
                  onChange={e => {
                    updateSettings({ 
                      airplaneMode: e.target.checked,
                      wifiEnabled: !e.target.checked,
                      mobileDataEnabled: !e.target.checked,
                    });
                    triggerToast(`飛航模式 ${e.target.checked ? '已開啟' : '已關閉'}`);
                  }}
                  className="w-5 h-5 accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================== 2. ACCOUNTS & SYNC ===================== */}
        {currentSection === 'accounts' && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#1a1b22] border border-slate-800/80 space-y-3">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  G
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{settings.googleAccountName}</h3>
                  <p className="text-xs text-blue-400">{settings.googleAccountEmail}</p>
                  <p className="text-[10px] text-slate-400">Google 服務架構 · 已完全驗證登入</p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="text-xs font-semibold text-white">自動同步資料 (Auto Sync)</div>
                    <div className="text-[10px] text-slate-400">背景同步聯絡人、行事曆、Gmail、雲端檔案</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoSyncEnabled}
                    onChange={e => {
                      updateSettings({ autoSyncEnabled: e.target.checked });
                      triggerToast('已更新自動同步設定');
                    }}
                    className="w-5 h-5 accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="text-xs font-semibold text-white">Google 相簿雲端備份</div>
                    <div className="text-[10px] text-slate-400">高畫質備份照片資料夾中的圖片</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.backupPhotosEnabled}
                    onChange={e => {
                      updateSettings({ backupPhotosEnabled: e.target.checked });
                      triggerToast('已更新相簿備份');
                    }}
                    className="w-5 h-5 accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                  <span>最近一次備份時間:</span>
                  <span className="font-mono text-emerald-400">{settings.lastBackupTime}</span>
                </div>

                <button
                  onClick={() => {
                    updateSettings({ lastBackupTime: new Date().toLocaleTimeString() + ' (剛剛)' });
                    triggerToast('已立即手動觸發 Google 雲端同步！');
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  立即同步 Google 帳號資料
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== 3. SECURITY & BIOMETRICS ===================== */}
        {currentSection === 'security' && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#1a1b22] border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-bold text-amber-400 tracking-wider uppercase">螢幕鎖定與生物辨識</h3>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between py-1 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2.5">
                    <Fingerprint className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">指紋辨識解鎖 (Fingerprint)</div>
                      <div className="text-[10px] text-slate-400">已錄入指紋 1 (右手大拇指) · 快速解鎖</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.fingerprintEnrolled}
                    onChange={e => {
                      updateSettings({ fingerprintEnrolled: e.target.checked });
                      triggerToast(`指紋解鎖 ${e.target.checked ? '已啟用' : '已關閉'}`);
                    }}
                    className="w-5 h-5 accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">面孔解鎖 (Face Unlock)</div>
                      <div className="text-[10px] text-slate-400">前置鏡頭 3D 結構光人臉辨識</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.faceUnlockEnrolled}
                    onChange={e => {
                      updateSettings({ faceUnlockEnrolled: e.target.checked });
                      triggerToast(`面孔解鎖 ${e.target.checked ? '已啟用' : '已關閉'}`);
                    }}
                    className="w-5 h-5 accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">尋找我的裝置 (Find My Device)</div>
                      <div className="text-[10px] text-slate-400">遺失時可遠端定位、響鈴或抹除資料</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.findMyDeviceEnabled}
                    onChange={e => {
                      updateSettings({ findMyDeviceEnabled: e.target.checked });
                      triggerToast('已更新尋找我的裝置設定');
                    }}
                    className="w-5 h-5 accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* ARP-1 Defense Notice */}
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-200 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Dog AI 主權守衛防護已連動</div>
                    <div className="text-[10px] text-amber-300/80">LLM 1 守衛會自動保護手機隱私，不允許外部查詢企業未公開機密。</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== 4. DISPLAY & BRIGHTNESS ===================== */}
        {currentSection === 'display' && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#1a1b22] border border-slate-800/80 space-y-4">
              <h3 className="text-xs font-bold text-orange-400 tracking-wider uppercase">螢幕顯示偏好</h3>

              {/* Brightness slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    螢幕亮度
                  </span>
                  <span className="font-mono text-cyan-400">{settings.brightnessLevel}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={settings.brightnessLevel}
                  onChange={e => updateSettings({ brightnessLevel: Number(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Dark mode */}
              <div className="flex items-center justify-between py-2 border-t border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">深色模式 (Dark Theme)</div>
                    <div className="text-[10px] text-slate-400">省電 AMOLED 純黑背景，保護眼睛</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.darkModeEnabled}
                  onChange={e => {
                    updateSettings({ darkModeEnabled: e.target.checked });
                    triggerToast(`深色模式 ${e.target.checked ? '已開啟' : '已關閉'}`);
                  }}
                  className="w-5 h-5 accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Screen timeout */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white">螢幕逾時關閉時間</label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[15, 30, 60, 120].map(sec => (
                    <button
                      key={sec}
                      onClick={() => {
                        updateSettings({ screenTimeoutSeconds: sec });
                        triggerToast(`休眠時間設定為 ${sec} 秒`);
                      }}
                      className={`py-1.5 rounded-lg border text-center transition ${
                        settings.screenTimeoutSeconds === sec
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {sec} 秒
                    </button>
                  ))}
                </div>
              </div>

              {/* Eye Comfort Shield */}
              <div className="flex items-center justify-between py-2 border-t border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-white">護眼模式 (Eye Comfort Shield)</div>
                  <div className="text-[10px] text-slate-400">過濾有害藍光，夜間自動調暖色溫</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.eyeComfortShield}
                  onChange={e => {
                    updateSettings({ eyeComfortShield: e.target.checked });
                    triggerToast(`護眼模式 ${e.target.checked ? '已開啟' : '已關閉'}`);
                  }}
                  className="w-5 h-5 accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================== 5. APPS & PERMISSIONS ===================== */}
        {currentSection === 'apps' && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#1a1b22] border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-purple-400 tracking-wider uppercase">已安裝的應用程式清單</h3>
                  <p className="text-[10px] text-slate-400">管理軟體權限宣告 (Permissions) 與快取清理</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                  共 7 個核心系統與通訊 App
                </span>
              </div>

              <div className="divide-y divide-slate-800/60 pt-1">
                {[
                  { id: 'dog_ai', name: 'Dog AI (狗僕人助手)', icon: '🐶', size: '2.4 GB', core: true },
                  { id: 'line', name: 'LINE (企業官方通訊)', icon: '💬', size: '98 MB', core: true },
                  { id: 'google', name: 'Google (官方真實搜尋)', icon: '🔍', size: '145 MB', core: true },
                  { id: 'chrome', name: 'Chrome (網路瀏覽器)', icon: '🌐', size: '210 MB', core: true },
                  { id: 'files', name: '資料夾 (Files: 圖片與文件)', icon: '📁', size: '84 MB', core: true },
                  { id: 'play_store', name: 'Google Play 商店', icon: '▶️', size: '95 MB', core: true },
                  { id: 'settings', name: '設定 (Settings 系統核心)', icon: '⚙️', size: '32 MB', core: true },
                ].map(app => {
                  const perms = settings.appPermissions[app.id] || { camera: false, location: false, storage: true, microphone: false, notifications: true };
                  return (
                    <div key={app.id} className="py-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{app.icon}</span>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              {app.name}
                              {app.core && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">系統必備</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">佔用空間: {app.size} · 狀態: 正常運行中</div>
                          </div>
                        </div>

                        <button
                          onClick={() => triggerToast(`已成功清除 ${app.name} 快取與暫存檔！`)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition"
                        >
                          清除快取
                        </button>
                      </div>

                      {/* Permissions row */}
                      <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400 bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
                        <span className="font-semibold text-slate-300">權限宣告:</span>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={perms.storage}
                            onChange={e => updateAppPermission(app.id, 'storage', e.target.checked)}
                            className="w-3.5 h-3.5 accent-cyan-500"
                          />
                          <span>儲存</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={perms.microphone}
                            onChange={e => updateAppPermission(app.id, 'microphone', e.target.checked)}
                            className="w-3.5 h-3.5 accent-cyan-500"
                          />
                          <span>麥克風</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={perms.camera}
                            onChange={e => updateAppPermission(app.id, 'camera', e.target.checked)}
                            className="w-3.5 h-3.5 accent-cyan-500"
                          />
                          <span>相機</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={perms.notifications}
                            onChange={e => updateAppPermission(app.id, 'notifications', e.target.checked)}
                            className="w-3.5 h-3.5 accent-cyan-500"
                          />
                          <span>通知</span>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===================== 6. SYSTEM & UPDATES ===================== */}
        {currentSection === 'system' && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#1a1b22] border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-bold text-cyan-400 tracking-wider uppercase">裝置規格與系統資訊</h3>

              <div className="divide-y divide-slate-800/60 text-xs">
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-400">手機裝置型號</span>
                  <span className="font-semibold text-white">{settings.deviceModel}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-400">Android 系統版本</span>
                  <span className="font-mono text-cyan-300 font-bold">{settings.androidVersion}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-400">安全性修補程式等級</span>
                  <span className="font-mono text-emerald-400">{settings.securityPatchDate}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-400">系統內部版本號 (Build)</span>
                  <span className="font-mono text-[10px] text-slate-300">{settings.buildNumber}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-400">內部儲存空間</span>
                  <span className="font-mono text-slate-200">
                    {settings.usedStorageGB} GB / {settings.totalStorageGB} GB (已使用 16.7%)
                  </span>
                </div>
              </div>

              {/* OTA Check */}
              <button
                onClick={() => triggerToast('系統檢查中... 您的 Android 15 Sovereign OS 已是最新版本！無需更新。')}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                檢查系統軟體更新 (OTA)
              </button>

              {/* Reset to Factory */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={handleFactoryReset}
                  className="w-full py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-xs font-semibold transition flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                  恢復原廠設定 (Factory Reset)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== 7. SHAREDPREFERENCES DEVELOPER BACKEND ===================== */}
        {currentSection === 'shared_preferences' && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#1a1b22] border border-slate-800/80 space-y-3">
              <div className="flex items-center gap-2 text-rose-400">
                <Database className="w-4 h-4" />
                <h3 className="text-xs font-bold tracking-wider uppercase">SharedPreferences 偏好儲存庫</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                這是 Android 開發中用來持久化儲存開關與狀態的 Key-Value 本地數據庫。您可在此直接檢視與測試修改鍵值：
              </p>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono text-[11px] space-y-2">
                {Object.entries(settings.sharedPreferences).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-cyan-400">"{k}"</span>
                    <span className="text-amber-300 font-bold">{String(v)}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-[10px] text-slate-400 space-y-1">
                <div className="font-bold text-slate-300">三大核心架構組成完全實作：</div>
                <div>1. <strong>SharedPreferences / UserDefaults</strong>: 儲存偏好數據，持久化保留。</div>
                <div>2. <strong>PreferenceFragment / UI 畫面</strong>: 提供上述選單開關、滑桿與分頁。</div>
                <div>3. <strong>權限宣告 (Permissions)</strong>: 在應用程式管理中引導開關相機、麥克風、儲存空間。</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
