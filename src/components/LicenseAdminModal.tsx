import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  CheckCircle2,
  Copy,
  Plus,
  History,
  Building,
  Calendar,
  Sparkles,
  X,
  AlertCircle,
  Key,
  Download,
  Settings,
  Phone,
  Monitor,
  FolderDown,
  Terminal,
  FileCode2
} from 'lucide-react';
import {
  LicenseInfo,
  generateLicenseKey,
  recordGeneratedLicense,
  getGeneratedLicensesHistory,
  verifyAdminPassword,
  setAdminPassword,
  saveStoredLicense
} from '../utils/licenseManager';

interface LicenseAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLicenseActivated?: (license: LicenseInfo) => void;
}

export const LicenseAdminModal: React.FC<LicenseAdminModalProps> = ({
  isOpen,
  onClose,
  onLicenseActivated,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Tabs: 'generate' | 'history' | 'desktop' | 'security'
  const [activeTab, setActiveTab] = useState<'generate' | 'history' | 'desktop' | 'security'>('generate');

  // Generator Form State
  const [clientName, setClientName] = useState('');
  const [planType, setPlanType] = useState<'standard' | 'enterprise' | 'lifetime' | 'trial'>('standard');
  const [durationDays, setDurationDays] = useState(365);
  const [maxScans, setMaxScans] = useState(-1); // -1 = unlimited
  const [lastGenerated, setLastGenerated] = useState<LicenseInfo | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [historyList, setHistoryList] = useState<LicenseInfo[]>(getGeneratedLicensesHistory);

  // Change Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMessage, setPwdMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (verifyAdminPassword(passwordInput)) {
      setIsAuthenticated(true);
      setHistoryList(getGeneratedLicensesHistory());
    } else {
      setAuthError('كلمة المرور غير صحيحة. كلمة المرور الافتراضية هي: admin2026');
    }
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert('يرجى كتابة اسم العميل أو اسم المؤسسة المستفيدة.');
      return;
    }

    const lic = generateLicenseKey(clientName, planType, durationDays, maxScans);
    recordGeneratedLicense(lic);
    setLastGenerated(lic);
    setHistoryList(getGeneratedLicensesHistory());
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleApplyToThisDevice = (lic: LicenseInfo) => {
    saveStoredLicense(lic);
    if (onLicenseActivated) {
      onLicenseActivated(lic);
    }
    alert(`تم تفعيل الترخيص بنجاح على هذا الجهاز لصالح: ${lic.clientName}`);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setPwdMessage('يجب ألا تقل كلمة المرور عن 4 خانات');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMessage('كلمتا المرور غير متطابقتين');
      return;
    }
    setAdminPassword(newPassword);
    setPwdMessage('تم حفظ كلمة المرور الرئيسية الجديدة بنجاح!');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      {/* Flutter-style dialog container */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-right">
        {/* Flutter Scaffold-like Top Bar */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                لوحة إدارة وتوليد التراخيص التجارية
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  Owner Admin
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                إصدار تراخيص بيع رسمية للعملاء والشركات والمحاسبين
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!isAuthenticated ? (
            /* Login Form with Master Password */
            <form onSubmit={handleLogin} className="max-w-md mx-auto py-8 space-y-5 text-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                <Lock className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">تسجيل الدخول للمالك</h3>
                <p className="text-xs text-slate-400">
                  أدخل كلمة المرور الرئيسية للوصول إلى أداة توليد التراخيص
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="space-y-2 text-right">
                <label className="text-xs font-semibold text-slate-300 block">
                  كلمة المرور الرئيسية (Master Key):
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="أدخل كلمة المرور..."
                    autoFocus
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono tracking-widest text-center"
                  />
                </div>
                <div className="text-[11px] text-slate-500 text-center">
                  كلمة المرور المبدئية: <span className="text-emerald-400 font-mono font-bold">admin2026</span> (يمكنك تغييرها من الداخل)
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                فتح نظام التراخيص
              </button>
            </form>
          ) : (
            /* Authenticated Admin Dashboard */
            <div className="space-y-6">
              {/* Flutter Material 3 Tab Segment Bar */}
              <div className="p-1.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('generate')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'generate'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  توليد ترخيص جديد
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'history'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <History className="w-4 h-4" />
                  سجل التراخيص الصادرة ({historyList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'security'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  أمان كلمة المرور
                </button>
              </div>

              {/* Tab 1: Generate License */}
              {activeTab === 'generate' && (
                <div className="space-y-6">
                  <form onSubmit={handleGenerate} className="space-y-4 bg-slate-950/70 p-5 rounded-3xl border border-slate-800/80">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-emerald-400" />
                        اسم العميل أو الجهة المشترية:
                      </label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="مثال: مؤسسة التقنية للتجارة، أو د. عبدالله المحاسب"
                        required
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 block">
                          نوع وخطة الترخيص:
                        </label>
                        <select
                          value={planType}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setPlanType(val);
                            if (val === 'trial') setDurationDays(30);
                            else if (val === 'standard') setDurationDays(365);
                            else if (val === 'enterprise') setDurationDays(730);
                            else if (val === 'lifetime') setDurationDays(9999);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
                        >
                          <option value="standard">ترخيص سنوي قياسي (1 سنة)</option>
                          <option value="enterprise">ترخيص شركات متقدم (سنتين)</option>
                          <option value="lifetime">ترخيص دائم مدى الحياة (Lifetime)</option>
                          <option value="trial">ترخيص تجريبي (30 يوم)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 block">
                          الحد الأقصى للمسح الضوئي:
                        </label>
                        <select
                          value={maxScans}
                          onChange={(e) => setMaxScans(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
                        >
                          <option value="-1">غير محدود (Unlimited)</option>
                          <option value="500">حتى 500 ورقة</option>
                          <option value="1500">حتى 1500 ورقة</option>
                          <option value="5000">حتى 5000 ورقة</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 mt-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      توليد مفتاح الترخيص التجاري وتجهيز الشهادة
                    </button>
                  </form>

                  {/* Generated Certificate Card */}
                  {lastGenerated && (
                    <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950 border-2 border-emerald-500/40 space-y-4 shadow-xl relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span className="font-bold text-sm text-white">تم إصدار الترخيص بنجاح</span>
                        </div>
                        <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold">
                          {lastGenerated.planLabel}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs text-slate-400">العميل المستفيد:</div>
                        <div className="text-base font-extrabold text-white">{lastGenerated.clientName}</div>
                      </div>

                      {/* License Key Box */}
                      <div className="space-y-1">
                        <span className="text-xs text-slate-400 block">مفتاح التفعيل (License Key):</span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-900 border border-emerald-500/30 rounded-2xl px-3 py-2.5 text-xs sm:text-sm font-mono font-bold text-emerald-300 text-center tracking-wider select-all">
                            {lastGenerated.key}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyKey(lastGenerated.key)}
                            className="px-3.5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow transition shrink-0"
                          >
                            {copiedKey ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                تم النسخ
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                نسخ
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Details row */}
                      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                        <div>
                          <span className="text-slate-400 block text-[10px]">تاريخ الصلاحية:</span>
                          <span className="text-slate-200 font-mono font-bold">
                            {lastGenerated.expiresAt
                              ? new Date(lastGenerated.expiresAt).toLocaleDateString('ar-EG')
                              : 'دائم مدى الحياة'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">الاستخدام المسموح:</span>
                          <span className="text-emerald-400 font-bold">
                            {lastGenerated.maxScans === -1 ? 'غير محدود' : `${lastGenerated.maxScans} عملية`}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleApplyToThisDevice(lastGenerated)}
                          className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          تفعيل على هذا الجهاز مباشرة
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: History List */}
              {activeTab === 'history' && (
                <div className="space-y-3">
                  {historyList.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs">
                      لم يتم إصدار أي تراخيص حتى الآن. ابدأ بتوليد أول ترخيص من التبويب السابق.
                    </div>
                  ) : (
                    historyList.map((lic, idx) => (
                      <div
                        key={lic.key + idx}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 flex-wrap text-xs"
                      >
                        <div className="space-y-1 min-w-[200px]">
                          <div className="font-bold text-white text-sm">{lic.clientName}</div>
                          <div className="font-mono text-emerald-400 text-xs">{lic.key}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>{lic.planLabel}</span>
                            <span>•</span>
                            <span>
                              {lic.expiresAt
                                ? `ينتهي: ${new Date(lic.expiresAt).toLocaleDateString('ar-EG')}`
                                : 'دائم'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyKey(lic.key)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            نسخ المفتاح
                          </button>
                          <button
                            onClick={() => handleApplyToThisDevice(lic)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold text-xs"
                          >
                            تفعيل
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 3: Security & Password */}
              {activeTab === 'security' && (
                <form onSubmit={handleChangePassword} className="space-y-4 bg-slate-950/70 p-5 rounded-3xl border border-slate-800/80 max-w-md mx-auto">
                  <h3 className="text-sm font-bold text-white">تغيير كلمة المرور الرئيسية (Master Password)</h3>
                  <p className="text-xs text-slate-400">
                    يمكنك تغيير كلمة المرور التي تحمي لوحة توليد التراخيص لتأمين مبيعاتك
                  </p>

                  {pwdMessage && (
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs">
                      {pwdMessage}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">
                      كلمة المرور الجديدة:
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="كلمة مرور جديدة..."
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">
                      تأكيد كلمة المرور الجديدة:
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="أعد إدخال كلمة المرور..."
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow transition"
                  >
                    حفظ كلمة المرور الجديدة
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Developer Credit Modal Footer */}
        <div className="px-6 py-3 bg-slate-950/90 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2">
          <span>تطوير وإعداد: <strong className="text-slate-200">صادق الظاهري 2026</strong></span>
          <a
            href="tel:772092700"
            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline"
          >
            <Phone className="w-3 h-3" />
            <span>للتواصل: 772092700</span>
          </a>
        </div>
      </div>
    </div>
  );
};
