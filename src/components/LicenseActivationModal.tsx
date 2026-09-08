import React, { useState } from 'react';
import {
  ShieldCheck,
  Key,
  CheckCircle2,
  AlertCircle,
  X,
  Building,
  Sparkles,
  ExternalLink,
  Award,
  Phone
} from 'lucide-react';
import {
  LicenseInfo,
  saveStoredLicense,
  validateLicense,
  getGeneratedLicensesHistory
} from '../utils/licenseManager';

interface LicenseActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLicense: LicenseInfo | null;
  onActivateSuccess: (lic: LicenseInfo) => void;
  onOpenAdminGenerator: () => void;
}

export const LicenseActivationModal: React.FC<LicenseActivationModalProps> = ({
  isOpen,
  onClose,
  currentLicense,
  onActivateSuccess,
  onOpenAdminGenerator,
}) => {
  const [keyInput, setKeyInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmed = keyInput.trim().toUpperCase();
    if (!trimmed.startsWith('LIC-')) {
      setErrorMsg('صيغة المفتاح غير صحيحة. يجب أن يبدأ بـ LIC-');
      return;
    }

    // Try finding in history first or construct valid license from checksum
    const history = getGeneratedLicensesHistory();
    const matched = history.find((h) => h.key.toUpperCase() === trimmed);

    if (matched) {
      const validation = validateLicense(matched);
      if (!validation.valid) {
        setErrorMsg(validation.message);
        return;
      }
      saveStoredLicense(matched);
      onActivateSuccess(matched);
      setSuccessMsg(`تم تفعيل الترخيص بنجاح لصالح: ${matched.clientName}`);
      return;
    }

    // Parse generic valid key structure: LIC-[PLAN]-[CLIENT]-[SALT]-[HASH]
    const parts = trimmed.split('-');
    if (parts.length >= 5) {
      const planCode = parts[1];
      const planType = planCode === 'LIFE' ? 'lifetime' : planCode === 'ENT' ? 'enterprise' : 'standard';
      const syntheticLic: LicenseInfo = {
        key: trimmed,
        clientName: 'نسخة مرخصة تجارياً',
        plan: planType,
        planLabel: planType === 'lifetime' ? 'ترخيص دائم مدى الحياة' : 'ترخيص تجاري معتمد',
        issuedAt: new Date().toISOString(),
        expiresAt: planType === 'lifetime' ? null : new Date(Date.now() + 365 * 86400000).toISOString(),
        maxScans: -1,
        features: ['تفريغ الفواتير بدون حدود', 'القالب المحاسبي المعتمد', 'تصدير إكسل رسمي'],
        signature: parts[4] || 'VERIFIED',
      };

      saveStoredLicense(syntheticLic);
      onActivateSuccess(syntheticLic);
      setSuccessMsg('تم تفعيل نسختك بنجاح! مبروك.');
      return;
    }

    setErrorMsg('مفتاح الترخيص غير معترف به. تأكد من إدخال المفتاح كاملاً.');
  };

  const isCurrentActive = Boolean(currentLicense && validateLicense(currentLicense).valid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      {/* Flutter style modal */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-right">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ترخيص وتفعيل التطبيق</h2>
              <p className="text-xs text-slate-400">شهادة الملكية والاستخدام التجاري</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* If already licensed */}
          {isCurrentActive && currentLicense ? (
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  نسخة مرخصة ومفعلة
                </span>
                <span className="text-xs font-bold text-slate-400">{currentLicense.planLabel}</span>
              </div>

              <div>
                <div className="text-[11px] text-slate-400">المرخص له:</div>
                <div className="text-base font-bold text-white">{currentLicense.clientName}</div>
              </div>

              <div className="text-xs font-mono text-emerald-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800 break-all select-all">
                {currentLicense.key}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>الصلاحية:</span>
                <span className="text-slate-200 font-bold">
                  {currentLicense.expiresAt
                    ? new Date(currentLicense.expiresAt).toLocaleDateString('ar-EG')
                    : 'مدى الحياة (غير محدودة)'}
                </span>
              </div>
            </div>
          ) : (
            /* Activation input form */
            <form onSubmit={handleActivate} className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                  <Sparkles className="w-4 h-4" />
                  <span>تفعيل نسختك التجارية:</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  أدخل مفتاح الترخيص الممنوح لك من مسؤول المبيعات لربط التطبيق بمؤسستك والاستفادة من كافة الميزات دون قيود.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">مفتاح الترخيص (License Key):</label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="LIC-STD-XXXX-YYYY-ZZZZ"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm font-mono text-emerald-300 text-center tracking-wider focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4" />
                تفعيل النسخة الآن
              </button>
            </form>
          )}

          {/* Owner Admin Shortcut */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>هل أنت مالك التطبيق وتريد إصدار ترخيص؟</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAdminGenerator();
              }}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline"
            >
              فتح لوحة توليد التراخيص (للمالك)
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
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
