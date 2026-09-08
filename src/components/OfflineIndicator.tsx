import React from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-indicator-badge"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-3.5 py-2 text-xs font-bold text-white shadow-2xl border border-amber-400/40 animate-pulse"
    >
      <WifiOff className="w-4 h-4 text-white shrink-0" />
      <div className="flex flex-col text-right">
        <span>وضع عدم الاتصال (بدون نت)</span>
        <span className="text-[10px] font-normal text-amber-100">
          المعالجة الضوئية OCR وتصدير الإكسل تعمل محلياً 100%
        </span>
      </div>
    </div>
  );
};
