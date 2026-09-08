import React from 'react';
import { Filter, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { ExtractionRules } from '../types';
import { TEMPLATE_COLUMNS } from '../utils/templateConverter';

interface ExtractionRulesConfigProps {
  rules: ExtractionRules;
  onChange: (newRules: ExtractionRules) => void;
}

export const ExtractionRulesConfig: React.FC<ExtractionRulesConfigProps> = () => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 text-right">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              القالب المالي المعتمد لملفات الإكسل (من اليمين لليسار)
            </h3>
            <p className="text-[11px] text-slate-400">
              يبدأ بصف فارغ (Row 0)، ثم الترويسة في الصف الثاني، والبنود تُترك فارغة كما طلبت بدقة.
            </p>
          </div>
        </div>
        <span className="text-[11px] bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          القالب المعتمد نشط
        </span>
      </div>

      {/* Visual Template Columns Pill Grid */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-300 block">
          ترتيب الأعمدة الـ 8 المعتمدة في الإكسل:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {TEMPLATE_COLUMNS.map((col, idx) => (
            <div
              key={col}
              className={`p-2.5 rounded-xl border text-center transition ${
                col === 'البند'
                  ? 'bg-amber-950/20 border-amber-800/40 text-amber-300'
                  : 'bg-slate-950/80 border-slate-800 text-slate-200'
              }`}
            >
              <span className="text-[10px] text-slate-500 font-mono block mb-0.5">عمود {idx + 1}</span>
              <span className="text-xs font-bold block truncate">{col}</span>
              {col === 'تاريخ المرجع' && (
                <span className="text-[9px] text-emerald-400 block mt-0.5 font-mono" dir="ltr">DD/MM/YYYY</span>
              )}
              {col === 'البند' && (
                <span className="text-[9px] text-amber-400/80 block mt-0.5 font-medium">(فارغ دائماً)</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
