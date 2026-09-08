import React, { useState, useEffect } from 'react';
import { Sparkles, FileSpreadsheet, Eye, Palette, CheckCircle2 } from 'lucide-react';

interface ProcessingOverlayProps {
  imagePreviewUrl?: string | null;
  isOfflineMode?: boolean;
  statusText?: string;
  progressPercent?: number;
}

const STEPS = [
  { text: 'فحص جودة الورقة وقراءة النصوص ضوئياً...', icon: Eye },
  { text: 'استكشاف الجداول، والصفوف، والأعمدة، والخلايا المدمجة...', icon: FileSpreadsheet },
  { text: 'استخراج الألوان الأصلية، والترويسات، والخطوط بدقة...', icon: Palette },
  { text: 'بناء جدول إكسل مطابق تماماً للشكل والمحتوى...', icon: Sparkles },
];

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({
  imagePreviewUrl,
  isOfflineMode,
  statusText,
  progressPercent,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 1800);
    const timer2 = setTimeout(() => setCurrentStep(2), 3800);
    const timer3 = setTimeout(() => setCurrentStep(3), 5800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div
      id="processing-overlay"
      className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center text-center space-y-6 min-h-[380px]"
    >
      {/* Visual pulse & Paper preview */}
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-xl animate-pulse" />
        <div className="relative w-24 h-24 rounded-2xl bg-slate-950 border-2 border-emerald-500/50 flex items-center justify-center shadow-xl overflow-hidden">
          {imagePreviewUrl ? (
            <img
              src={imagePreviewUrl}
              alt="الورقة الجاري معالجتها"
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <FileSpreadsheet className="w-12 h-12 text-emerald-400 animate-bounce" />
          )}
          <div className="absolute inset-0 bg-emerald-950/40 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-emerald-300 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>
      </div>

      <div className="space-y-2 max-w-md">
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-xl font-bold text-white">
            {isOfflineMode
              ? 'جاري تحليل الورقة محلياً بدون إنترنت'
              : 'جاري تحليل الورقة واستخراج الإكسل المطابق'}
          </h3>
        </div>
        <p className="text-sm text-slate-400">
          {statusText ||
            (isOfflineMode
              ? 'تتم المعالجة بالكامل داخل جهازك عبر خوارزميات التعرف الضوئي OCR وتحليل الألوان دون الحاجة لشبكة إنترنت.'
              : 'يقوم الذكاء الاصطناعي بدراسة جميع النصوص، الأرقام، ألوان الخلايا، والحدود لتوليد ملف إكسل مطابق للورقة بنسبة 100%.')}
        </p>

        {typeof progressPercent === 'number' && (
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800 mt-2">
            <div
              className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Step Progress List */}
      <div className="w-full max-w-md space-y-2 text-right">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          const Icon = step.icon;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                isDone
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                  : isCurrent
                  ? 'bg-slate-800 text-white border-slate-700 shadow'
                  : 'text-slate-500 border-transparent opacity-50'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg ${
                  isDone
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isCurrent
                    ? 'bg-blue-500/20 text-blue-400 animate-pulse'
                    : 'bg-slate-800 text-slate-600'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className="flex-1">{step.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
