import React from 'react';
import {
  Scan,
  FileSpreadsheet,
  FolderArchive,
  ShieldCheck,
  Camera,
  FolderOpen
} from 'lucide-react';

export type FlutterViewTab = 'scanner' | 'sheet' | 'templates' | 'license';

interface FlutterBottomNavProps {
  activeTab: FlutterViewTab;
  onTabChange: (tab: FlutterViewTab) => void;
  onQuickCamera: () => void;
  onQuickUpload: () => void;
  hasActiveSheet: boolean;
  isLicensed: boolean;
}

export const FlutterBottomNav: React.FC<FlutterBottomNavProps> = ({
  activeTab,
  onTabChange,
  onQuickCamera,
  onQuickUpload,
  hasActiveSheet,
  isLicensed,
}) => {
  return (
    <nav aria-label="شريط التنقل السفلي" className="fixed bottom-3 inset-x-0 z-40 max-w-lg mx-auto px-4 pointer-events-none">
      <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-2xl shadow-black/60 flex items-center justify-between gap-1 ring-1 ring-white/5">
        {/* Tab 1: Scanner / Upload */}
        <button
          onClick={() => onTabChange('scanner')}
          className={`flex-1 py-2 px-2 rounded-2xl flex flex-col items-center gap-1 transition-all duration-200 ${
            activeTab === 'scanner'
              ? 'bg-emerald-500/15 text-emerald-400 font-bold scale-[1.03]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Scan className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">المسح والمجلد</span>
        </button>

        {/* Tab 2: Sheet / Table */}
        <button
          onClick={() => onTabChange('sheet')}
          className={`flex-1 py-2 px-2 rounded-2xl flex flex-col items-center gap-1 transition-all duration-200 relative ${
            activeTab === 'sheet'
              ? 'bg-emerald-500/15 text-emerald-400 font-bold scale-[1.03]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <FileSpreadsheet className="w-5 h-5" />
            {hasActiveSheet && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">جدول الإكسل</span>
        </button>

        {/* Center Flutter Floating Action Button (FAB) for Instant Photo/Scan */}
        <div className="relative -top-5 px-1">
          <button
            onClick={onQuickCamera}
            title="تصوير ورقة فورية بالذكاء الاصطناعي"
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-transform duration-200 border-2 border-slate-900"
          >
            <Camera className="w-6 h-6 stroke-[2.2]" />
          </button>
        </div>

        {/* Tab 3: Pre-configured Templates */}
        <button
          onClick={() => onTabChange('templates')}
          className={`flex-1 py-2 px-2 rounded-2xl flex flex-col items-center gap-1 transition-all duration-200 ${
            activeTab === 'templates'
              ? 'bg-emerald-500/15 text-emerald-400 font-bold scale-[1.03]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <FolderArchive className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">النماذج المعتمدة</span>
        </button>

        {/* Tab 4: License & Owner Panel */}
        <button
          onClick={() => onTabChange('license')}
          className={`flex-1 py-2 px-2 rounded-2xl flex flex-col items-center gap-1 transition-all duration-200 relative ${
            activeTab === 'license'
              ? 'bg-emerald-500/15 text-emerald-400 font-bold scale-[1.03]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ShieldCheck className="w-5 h-5" />
            {isLicensed && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">التراخيص والبيع</span>
        </button>
      </div>
    </nav>
  );
};
