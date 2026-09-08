import React, { useState, useRef } from 'react';
import { Upload, Camera, FileText, FolderUp, Sparkles, CheckCircle2, Layers, AlertCircle } from 'lucide-react';
import { SAMPLE_PAPERS } from '../data/samples';
import { SamplePaper } from '../types';

interface FileUploadDropzoneProps {
  onFileSelected: (file: File) => void;
  onFolderSelected: (files: File[], folderName?: string) => void;
  onOpenCam: () => void;
  onSelectSample: (sample: SamplePaper) => void;
  isLoading: boolean;
}

export const FileUploadDropzone: React.FC<FileUploadDropzoneProps> = ({
  onFileSelected,
  onFolderSelected,
  onOpenCam,
  onSelectSample,
  isLoading,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const fileList = e.dataTransfer.files;
    if (fileList && fileList.length > 0) {
      handleFiles(Array.from(fileList));
    }
  };

  const handleFiles = (files: File[], folderName?: string) => {
    // Filter valid images and PDFs
    const validFiles = files.filter(
      (f) =>
        f.type.startsWith('image/') ||
        f.name.toLowerCase().endsWith('.pdf') ||
        /\.(jpe?g|png|webp|heic|bmp|tiff)$/i.test(f.name)
    );

    if (validFiles.length === 0) {
      alert('لم يتم العثور على أية ملفات صور أو PDF صالحة.');
      return;
    }

    if (validFiles.length > 1) {
      setSelectedFileName(`تم تحديد مجلد/دفعة: ${validFiles.length} ملف`);
      onFolderSelected(validFiles, folderName || 'مجلد فواتير');
    } else {
      setSelectedFileName(validFiles[0].name);
      onFileSelected(validFiles[0]);
    }
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const files = Array.from(fileList) as File[];
      // Determine folder name from webkitRelativePath
      const firstRelativePath = files[0]?.webkitRelativePath || '';
      const folderName = firstRelativePath.split('/')[0] || 'مجلد الفواتير';
      handleFiles(files, folderName);
    }
  };

  const handleMultiFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const files = Array.from(fileList) as File[];
      handleFiles(files);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Hidden inputs */}
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore - webkitdirectory is standard for folder selection in modern browsers
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleFolderChange}
        className="hidden"
        id="folder-input-element"
      />
      <input
        ref={multiFileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf"
        onChange={handleMultiFileChange}
        className="hidden"
        id="multi-file-input-element"
      />
      <input
        ref={singleFileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(Array.from(e.target.files));
          }
        }}
        className="hidden"
        id="file-input-element"
      />

      {/* Main 3 Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CARD 1: FOLDER UPLOAD (Requested Feature) */}
        <div
          id="folder-upload-card"
          onClick={isLoading ? undefined : () => folderInputRef.current?.click()}
          className={`group relative overflow-hidden rounded-2xl p-6 border transition-all cursor-pointer ${
            isLoading
              ? 'opacity-60 cursor-not-allowed border-slate-800 bg-slate-900/40'
              : 'border-blue-500/40 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 hover:border-blue-500/70 hover:shadow-xl hover:shadow-blue-950/40'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="p-3.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25 group-hover:scale-110 group-hover:bg-blue-500/25 transition-all">
              <FolderUp className="w-7 h-7" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse">
              مجلد كامل بالصور
            </span>
          </div>

          <div className="mt-5 space-y-1.5">
            <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
              رفع مجلد كامل بالصور
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              اختر مجلداً من جهازك ممتلئاً بصور الفواتير والإيصالات؛ سيتم تفريغها جميعاً بالذكاء الاصطناعي في جدول إكسل موحد مجمع.
            </p>
          </div>

          <div className="mt-4 flex items-center text-xs font-bold text-blue-400 gap-1.5">
            <span>تحديد المجلد وفحص الصور دفعة واحدة</span>
            <span className="text-base group-hover:translate-x-1 transition-transform">←</span>
          </div>
        </div>

        {/* CARD 2: CAMERA */}
        <div
          id="camera-action-card"
          onClick={isLoading ? undefined : onOpenCam}
          className={`group relative overflow-hidden rounded-2xl p-6 border transition-all cursor-pointer ${
            isLoading
              ? 'opacity-60 cursor-not-allowed border-slate-800 bg-slate-900/40'
              : 'border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 hover:border-emerald-500/60 hover:shadow-xl hover:shadow-emerald-950/40'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
              <Camera className="w-7 h-7" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
              مباشر بالكاميرا
            </span>
          </div>

          <div className="mt-5 space-y-1.5">
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
              تصوير الورقة الآن
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              التقط صورة فورية لأي فاتورة، جدول، أو مستند ورقي مباشرةً من كاميرا هاتفك أو حاسوبك لمعالجتها ومطابقتها.
            </p>
          </div>

          <div className="mt-4 flex items-center text-xs font-semibold text-emerald-400 gap-1">
            <span>فتح عدسة التصوير</span>
            <span className="text-base group-hover:translate-x-1 transition-transform">←</span>
          </div>
        </div>

        {/* CARD 3: MULTI-IMAGE / PDF DROPZONE */}
        <div
          id="file-dropzone-card"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={isLoading ? undefined : () => multiFileInputRef.current?.click()}
          className={`group relative overflow-hidden rounded-2xl p-6 border-2 border-dashed transition-all cursor-pointer ${
            isDragOver
              ? 'border-teal-400 bg-teal-950/40 scale-[1.01]'
              : 'border-slate-700/80 bg-slate-900/60 hover:border-teal-500/60 hover:bg-slate-900/90'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="p-3.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:scale-110 group-hover:bg-teal-500/20 transition-all">
              <Upload className="w-7 h-7" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/25">
              صور متعددة أو PDF
            </span>
          </div>

          <div className="mt-5 space-y-1.5">
            <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
              رفع ملف PDF أو صور متعددة
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              يدعم ملفات PDF كاملة أو اختيار عدة صور فواتير دفعة واحدة بالسحب والإفلات وتفريغها في إكسل.
            </p>
          </div>

          <div className="mt-4 flex items-center text-xs font-semibold text-teal-400 gap-1">
            {selectedFileName ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {selectedFileName}
              </span>
            ) : (
              <>
                <span>استعراض الملفات أو سحبها إلى هنا</span>
                <span className="text-base group-hover:translate-x-1 transition-transform">←</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Preset / Sample Papers Showcase */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-slate-300">
              أو جرّب نماذج أوراق جاهزة ومطابقة فوراً:
            </h4>
          </div>
          <span className="text-xs text-slate-400">انقر لتوليد الإكسل المطابق بنقرة واحدة</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_PAPERS.map((sample) => (
            <button
              key={sample.id}
              id={`sample-paper-${sample.id}`}
              onClick={() => onSelectSample(sample)}
              disabled={isLoading}
              className="text-right p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 hover:shadow-md transition-all group disabled:opacity-50"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <FileText className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-400">{sample.category}</span>
              </div>
              <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                {sample.name}
              </div>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {sample.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

