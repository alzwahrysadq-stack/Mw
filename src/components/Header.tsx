import React from 'react';
import {
  FileSpreadsheet,
  Camera,
  Upload,
  Sparkles,
  WifiOff,
  ShieldCheck,
  KeyRound,
  Award
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { LicenseInfo } from '../utils/licenseManager';

interface HeaderProps {
  onOpenCam: () => void;
  onOpenUpload: () => void;
  hasActiveSheet: boolean;
  licenseInfo: LicenseInfo | null;
  isLicensed: boolean;
  onOpenLicenseActivation: () => void;
  onOpenLicenseAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCam,
  onOpenUpload,
  hasActiveSheet,
  licenseInfo,
  isLicensed,
  onOpenLicenseActivation,
  onOpenLicenseAdmin,
}) => {
  const isOnline = useOnlineStatus();

  return (
    <header className="w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30 shadow-md shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
        {/* Logo & Flutter-style Brand Pill */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
            <FileSpreadsheet className="w-5 h-5 stroke-[2.3]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                ورقة إلى إكسل ذكي
              </h1>

              {/* Status Chips - Flutter Material 3 style */}
              {isOnline ? (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Gemini Vision
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                  <WifiOff className="w-3 h-3" />
                  بدون نت
                </span>
              )}

              {/* License Status Chip */}
              {isLicensed && licenseInfo ? (
                <button
                  onClick={onOpenLicenseActivation}
                  title="عرض شهادة الترخيص"
                  className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full hover:bg-emerald-500/25 transition"
                >
                  <Award className="w-3 h-3 text-emerald-400" />
                  <span>مرخص: {licenseInfo.clientName}</span>
                </button>
              ) : (
                <button
                  onClick={onOpenLicenseActivation}
                  className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-800/80 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full hover:bg-slate-800 transition"
                >
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span>تفعيل الترخيص</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 hidden xs:flex flex-wrap">
              <span>تطوير وإعداد: <strong className="text-slate-200">صادق الظاهري 2026</strong></span>
              <span className="text-slate-600">•</span>
              <a
                href="tel:772092700"
                className="text-emerald-400 hover:text-emerald-300 font-bold transition hover:underline"
              >
                للتواصل: 772092700
              </a>
            </div>
          </div>
        </div>

        {/* Right Actions: Password-Protected Admin License Button + Quick Action Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Owner License Generator Button (Protected with Password) */}
          <button
            onClick={onOpenLicenseAdmin}
            id="open-license-admin-btn"
            title="لوحة توليد التراخيص لبيع التطبيق (محمية بكلمة مرور)"
            className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 hover:from-emerald-900/60 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">توليد التراخيص (للمالك)</span>
            <span className="md:hidden">التراخيص</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Quick actions if active sheet */}
          {hasActiveSheet && (
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                id="header-camera-quick-btn"
                onClick={onOpenCam}
                className="px-3 py-1.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5 transition active:scale-95"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>تصوير ورقة</span>
              </button>
              <button
                id="header-upload-quick-btn"
                onClick={onOpenUpload}
                className="px-3 py-1.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 flex items-center gap-1.5 transition active:scale-95"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>رفع ملف</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

