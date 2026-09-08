import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, Check, Zap, ZapOff, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [flashOn, setFlashOn] = useState<boolean>(false);
  const [hasFlashSupport, setHasFlashSupport] = useState<boolean>(false);
  const [isShutterActive, setIsShutterActive] = useState<boolean>(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    stopStream();
    setErrorMessage('');
    setHasPermission(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('المتصفح لا يدعم الوصول للكاميرا المباشرة.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setHasPermission(true);

      // Check for torch/flash capability
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = (videoTrack?.getCapabilities?.() as any) || {};
      setHasFlashSupport(Boolean(capabilities.torch));
    } catch (err: any) {
      console.error('Camera access error:', err);
      setHasPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('تم رفض الإذن للوصول إلى الكاميرا. يرجى تفعيل إذن الكاميرا من إعدادات المتصفح.');
      } else if (err.name === 'NotFoundError') {
        setErrorMessage('لم يتم العثور على كاميرا في هذا الجهاز.');
      } else {
        setErrorMessage(err.message || 'تعذر تشغيل الكاميرا.');
      }
    }
  }, [facingMode, stopStream]);

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopStream();
    }
    return () => {
      stopStream();
    };
  }, [isOpen, capturedImage, startCamera, stopStream]);

  const toggleFlash = async () => {
    if (!streamRef.current || !hasFlashSupport) return;
    try {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      const newFlash = !flashOn;
      await (videoTrack as any).applyConstraints({
        advanced: [{ torch: newFlash }],
      });
      setFlashOn(newFlash);
    } catch (e) {
      console.warn('Torch toggle failed', e);
    }
  };

  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Trigger visual shutter effect
    setIsShutterActive(true);
    setTimeout(() => setIsShutterActive(false), 200);

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(dataUrl);
    stopStream();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="camera-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
    >
      <div
        id="camera-modal-content"
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">تصوير الورقة أو المستند</h3>
              <p className="text-xs text-slate-400">
                ضع الورقة داخل الإطار للحصول على أعلى دقة واستخراج كامل الألوان
              </p>
            </div>
          </div>
          <button
            id="close-camera-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview Area */}
        <div className="relative flex-1 min-h-[380px] bg-black flex items-center justify-center overflow-hidden">
          {capturedImage ? (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img
                src={capturedImage}
                alt="الورقة المصورة"
                className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg border border-slate-700"
              />
              <div className="absolute top-6 right-6 bg-emerald-600/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm shadow flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                تم التقاط الورقة بنجاح
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />

              {/* Shutter visual flash effect */}
              {isShutterActive && (
                <div className="absolute inset-0 bg-white/70 transition-opacity duration-150 pointer-events-none" />
              )}

              {/* Document Alignment Frame */}
              <div className="absolute inset-8 sm:inset-12 pointer-events-none border-2 border-emerald-400/70 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                {/* Corner Accents */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-sm" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-sm" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-sm" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-sm" />

                {/* Grid guidelines */}
                <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-20 border border-white/30">
                  <div className="border-r border-b border-white/30" />
                  <div className="border-r border-b border-white/30" />
                  <div className="border-b border-white/30" />
                  <div className="border-r border-b border-white/30" />
                  <div className="border-r border-b border-white/30" />
                  <div className="border-b border-white/30" />
                  <div className="border-r border-white/30" />
                  <div className="border-r border-white/30" />
                  <div />
                </div>

                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className="bg-black/70 backdrop-blur-sm text-slate-200 text-xs px-3 py-1 rounded-full border border-white/10">
                    اضبط أطراف الورقة داخل الإطار الأخضر
                  </span>
                </div>
              </div>

              {/* Error state */}
              {hasPermission === false && (
                <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-rose-400 mb-3" />
                  <h4 className="text-white font-bold text-lg mb-1">تعذر الوصول للكاميرا</h4>
                  <p className="text-slate-300 text-sm max-w-md mb-6">{errorMessage}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition"
                    >
                      <RefreshCw className="w-4 h-4" />
                      إعادة المحاولة
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition"
                    >
                      استخدام رفع الملفات بدلاً من ذلك
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls Bar */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          {capturedImage ? (
            <div className="w-full flex items-center justify-between gap-4">
              <button
                id="retake-photo-btn"
                onClick={retakePhoto}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium flex items-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4" />
                إعادة التصوير
              </button>

              <button
                id="confirm-photo-btn"
                onClick={confirmPhoto}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-950 transition"
              >
                <Check className="w-4 h-4" />
                تحليل الورقة واستخراج إكسل
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between">
              {/* Flash / Light button */}
              <button
                id="toggle-flash-btn"
                onClick={toggleFlash}
                disabled={!hasFlashSupport}
                title={hasFlashSupport ? 'تشغيل الفلاش' : 'الفلاش غير مدعوم على هذا الجهاز'}
                className={`p-3 rounded-xl border transition ${
                  flashOn
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 disabled:opacity-40'
                }`}
              >
                {flashOn ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
              </button>

              {/* Main Shutter Button */}
              <button
                id="shutter-capture-btn"
                onClick={takeSnapshot}
                disabled={hasPermission !== true}
                className="relative group p-1 rounded-full focus:outline-none disabled:opacity-40 transition"
                aria-label="التقاط الصورة"
              >
                <div className="w-16 h-16 rounded-full border-4 border-emerald-400 flex items-center justify-center p-1 bg-emerald-600/30 group-hover:scale-105 transition-transform">
                  <div className="w-full h-full bg-emerald-500 rounded-full shadow-lg group-active:scale-90 transition-transform" />
                </div>
              </button>

              {/* Flip camera button */}
              <button
                id="flip-camera-btn"
                onClick={flipCamera}
                title="تبديل الكاميرا (الأمامية / الخلفية)"
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
