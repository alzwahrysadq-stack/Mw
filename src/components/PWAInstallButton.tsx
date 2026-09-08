import React, { useState } from 'react';
import { Download, Smartphone, Check, HelpCircle, X, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showDirectGuide, setShowDirectGuide] = useState(false);

  // If already running as an installed PWA standalone app
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
        <Check className="w-3.5 h-3.5" />
        <span>مثبّت كتطبيق رسمي</span>
      </div>
    );
  }

  return (
    <>
      {/* Dynamic Install Button */}
      {isInstallable ? (
        <button
          id="pwa-install-app-btn"
          onClick={install}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-950 transition transform active:scale-95 animate-pulse"
        >
          <Download className="w-4 h-4" />
          <span>تثبيت التطبيق على الجهاز</span>
        </button>
      ) : isIOS ? (
        <button
          id="pwa-install-ios-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50 transition"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>تثبيت على آيفون / آيباد</span>
        </button>
      ) : (
        <button
          id="pwa-install-guide-btn"
          onClick={() => setShowDirectGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-750 px-3 py-1.5 text-xs font-semibold text-slate-200 transition"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>تثبيت الحزمة والتطبيق</span>
        </button>
      )}

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">تثبيت التطبيق على أجهزة آبل (iOS)</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p>لتثبيت التطبيق ليعمل مثل تطبيق آبل الأصلي ويعمل بدون إنترنت:</p>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                  <span>اضغط على زر <strong>المشاركة (Share)</strong> في شريط متصفح Safari أسفل أو أعلى الشاشة.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                  <span>قم بالتمرير للأسفل واضغط على <strong>إضافة إلى الصفحة الرئيسية (Add to Home Screen)</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                  <span>اضغط <strong>إضافة (Add)</strong> أعلى اليمين. سيظهر رمز التطبيق على شاشتك الرئيسية ويعمل فورياً بدون نت!</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition"
            >
              فهمت ذلك، تم!
            </button>
          </div>
        </div>
      )}

      {/* Direct Install & Offline Package Guide Modal (Android / Chrome / Windows / Mac) */}
      {showDirectGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">تثبيت التطبيق للعمل بدون إنترنت</h3>
              </div>
              <button
                onClick={() => setShowDirectGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>التطبيق مزود بتقنية Progressive Web App (PWA) الكاملة ويعمل 100% بدون اتصال بالإنترنت.</span>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs">طريقة التثبيت السريعة:</h4>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <p>
                    • <strong>على أجهزة أندرويد (Chrome):</strong> اضغط على قائمة الخيارات (الثلاث نقاط) ثم اختر <strong>«تثبيت التطبيق» (Install App)</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong>.
                  </p>
                  <p>
                    • <strong>على الكمبيوتر (Chrome / Edge):</strong> اضغط على أيقونة التثبيت <Download className="w-3.5 h-3.5 inline mx-1 text-emerald-400" /> الموجودة في شريط عنوان المتصفح أعلى اليمين.
                  </p>
                  <p>
                    • بمجرد التثبيت، سيفتح التطبيق في نافذة مستقلة كأي برنامج رسمي على سطح المكتب أو شاشة الهاتف، مع تخزين كافة الملفات والذكاء الاصطناعي محلياً للعمل بدون نت!
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowDirectGuide(false)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition"
              >
                حسناً، فهمت
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
