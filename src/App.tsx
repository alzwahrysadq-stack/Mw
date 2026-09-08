import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CameraModal } from './components/CameraModal';
import { FileUploadDropzone } from './components/FileUploadDropzone';
import { SplitComparisonView } from './components/SplitComparisonView';
import { ExportActionsBar } from './components/ExportActionsBar';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ExtractionRulesConfig } from './components/ExtractionRulesConfig';
import { FolderBatchManager } from './components/FolderBatchManager';
import { LicenseAdminModal } from './components/LicenseAdminModal';
import { LicenseActivationModal } from './components/LicenseActivationModal';
import { FlutterBottomNav, FlutterViewTab } from './components/FlutterBottomNav';
import { ExtractedSheet, SamplePaper, ExtractionRules, ParsedInvoiceItem } from './types';
import { SAMPLE_PAPERS } from './data/samples';
import { analyzePaperOffline } from './utils/offlineOcr';
import { renderPdfPagesToImages } from './utils/pdfRenderer';
import { convertInvoicesToTemplateSheet } from './utils/templateConverter';
import { optimizeImageForAi } from './utils/imageOptimizer';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import {
  getStoredLicense,
  saveStoredLicense,
  LicenseInfo,
  StoredLicenseState
} from './utils/licenseManager';
import {
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Layers,
  WifiOff,
  FileCheck2,
  RefreshCw,
  FolderArchive,
  ArrowRight,
  KeyRound,
  FileSpreadsheet,
  Phone
} from 'lucide-react';

export default function App() {
  const isOnline = useOnlineStatus();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Flutter UI Navigation Tab: 'scanner' | 'sheet' | 'templates' | 'license'
  const [activeNavTab, setActiveNavTab] = useState<FlutterViewTab>('scanner');

  // Commercial Licensing State & Modals
  const [licenseState, setLicenseState] = useState<StoredLicenseState>(getStoredLicense);
  const [isLicenseAdminOpen, setIsLicenseAdminOpen] = useState(false);
  const [isLicenseActivationOpen, setIsLicenseActivationOpen] = useState(false);

  useEffect(() => {
    setLicenseState(getStoredLicense());
  }, []);

  // Batch / Folder Processing State
  const [batchFolderName, setBatchFolderName] = useState<string>('');
  const [batchItems, setBatchItems] = useState<ParsedInvoiceItem[] | null>(null);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchCurrentIndex, setBatchCurrentIndex] = useState(0);

  // Extraction Rules State
  const [extractionRules, setExtractionRules] = useState<ExtractionRules>({
    extractOnlyTargetHeader: true,
    condenseDescriptionToSummary: true,
    detectDocumentType: true,
    customColumnTemplate: [
      'م',
      'نوع المستند',
      'رقم الفاتورة / المرجع',
      'اسم العميل / المستفيد',
      'التاريخ',
      'البيان ومحتوى الفاتورة (الأصناف والأعداد)',
      'المبلغ الإجمالي',
      'العملة',
      'ملاحظات',
    ],
  });

  // Current sheet data & original paper image
  const [activeSheet, setActiveSheet] = useState<ExtractedSheet | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

  // Handle capture from live Camera
  const handleCameraCapture = async (imageDataUrl: string) => {
    setBatchItems(null);
    setOriginalImageUrl(imageDataUrl);
    await analyzeImage(imageDataUrl, 'image/jpeg');
  };

  // Handle file selected from device / dropzone (Single Image or multi-page PDF)
  const handleFileSelected = async (file: File) => {
    setErrorMessage(null);
    setBatchItems(null);

    // If PDF file selected
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      await handlePdfFile(file);
      return;
    }

    // Standard image file
    await analyzeImage(file, file.type || 'image/jpeg');
  };

  // Handle entire Folder or Multiple images selected
  const handleFolderSelected = async (files: File[], folderName = 'مجلد الفواتير') => {
    setErrorMessage(null);
    setBatchFolderName(folderName);
    setIsBatchProcessing(true);
    setBatchCurrentIndex(0);

    // Create initial queued items with object URLs for immediate preview
    const initialItems: ParsedInvoiceItem[] = files.map((file, idx) => ({
      id: `batch-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      pageNumber: idx + 1,
      fileName: file.name,
      thumbnailUrl: URL.createObjectURL(file),
      date: '-',
      referenceType: 'فاتورة',
      referenceNumber: 'قيد الاستخراج...',
      itemCategory: '',
      amount: 0,
      statement: 'في قائمة الانتظار للتحليل بالذكاء الاصطناعي...',
      beneficiary: 'قيد الفحص...',
      providerCompany: 'قيد الفحص...',
      docType: 'general',
      docTypeLabel: 'فاتورة',
      invoiceNumber: 'قيد الاستخراج...',
      customerName: 'قيد الفحص...',
      totalAmount: 0,
      currency: 'ريال',
      itemsSummary: 'في قائمة الانتظار للتحليل بالذكاء الاصطناعي...',
      status: 'pending',
    }));

    setBatchItems(initialItems);
    setActiveSheet(convertInvoicesToTemplateSheet(initialItems, `كشف مفرغ (${folderName})`));

    const updatedItems = [...initialItems];

    // Process files sequentially to maintain order and show real-time progress
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setBatchCurrentIndex(i + 1);

      // Mark current item as processing
      updatedItems[i] = { ...updatedItems[i], status: 'processing' };
      setBatchItems([...updatedItems]);

      try {
        // 1. Optimize image client-side (reduces 15MB camera photos to crisp ~400KB)
        const { base64, mimeType, dataUrl } = await optimizeImageForAi(file);
        updatedItems[i].thumbnailUrl = dataUrl;

        // 2. Call backend single-invoice endpoint with model fallback
        const res = await fetch('/api/analyze-single-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType,
            fileName: file.name,
            rules: extractionRules,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success || !data.item) {
          throw new Error(data.error || 'تعذر استخراج بيانات الفاتورة');
        }

        // Merge parsed data into item
        updatedItems[i] = {
          ...updatedItems[i],
          ...data.item,
          id: updatedItems[i].id,
          fileName: file.name,
          thumbnailUrl: dataUrl,
          status: 'completed',
        };
      } catch (err: any) {
        console.error(`Error processing folder file ${file.name}:`, err);
        updatedItems[i] = {
          ...updatedItems[i],
          status: 'error',
          errorMessage: err.message || 'فشل التحليل بالذكاء الاصطناعي',
          itemsSummary: `تعذر استخراج البيانات: ${err.message || 'خطأ في معالجة الصورة'}`,
        };
      }

      // Update state and refresh master Excel sheet live with every invoice finished!
      setBatchItems([...updatedItems]);
      const validFinished = updatedItems.filter((it) => it.status === 'completed');
      if (validFinished.length > 0) {
        setActiveSheet(convertInvoicesToTemplateSheet(updatedItems, `كشف مفرغ (${folderName})`));
      }
    }

    setIsBatchProcessing(false);
  };

  // Update item from folder batch view
  const handleUpdateBatchItem = (id: string, updated: Partial<ParsedInvoiceItem>) => {
    if (!batchItems) return;
    const newItems = batchItems.map((it) => (it.id === id ? { ...it, ...updated } : it));
    setBatchItems(newItems);
    setActiveSheet(convertInvoicesToTemplateSheet(newItems, `كشف مفرغ (${batchFolderName})`));
  };

  // Retry an individual invoice in the batch
  const handleRetryBatchItem = async (item: ParsedInvoiceItem) => {
    if (!batchItems) return;
    const idx = batchItems.findIndex((it) => it.id === item.id);
    if (idx === -1) return;

    const newItems = [...batchItems];
    newItems[idx] = { ...newItems[idx], status: 'processing', errorMessage: undefined };
    setBatchItems([...newItems]);

    try {
      const res = await fetch('/api/analyze-single-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: newItems[idx].thumbnailUrl,
          mimeType: 'image/jpeg',
          fileName: newItems[idx].fileName,
          rules: extractionRules,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.item) {
        throw new Error(data.error || 'تعذر إعادة التحليل');
      }

      newItems[idx] = {
        ...newItems[idx],
        ...data.item,
        status: 'completed',
      };
    } catch (err: any) {
      newItems[idx] = {
        ...newItems[idx],
        status: 'error',
        errorMessage: err.message,
      };
    }

    setBatchItems([...newItems]);
    setActiveSheet(convertInvoicesToTemplateSheet(newItems, `كشف مفرغ (${batchFolderName})`));
  };

  // Reset batch view
  const handleResetBatch = () => {
    setBatchItems(null);
    setActiveSheet(null);
    setOriginalImageUrl(null);
    setErrorMessage(null);
    setIsBatchProcessing(false);
  };

  // Process multi-page PDF file containing various invoices
  const handlePdfFile = async (pdfFile: File) => {
    setIsLoading(true);
    setProgressPercent(10);
    setProcessingStatus(`جاري فتح ملف الـ PDF وتفكيك الصفحات والمستندات... (${pdfFile.name})`);

    try {
      // 1. Render all PDF pages to high-res images
      const pages = await renderPdfPagesToImages(pdfFile, 20, (curr, total) => {
        const pct = Math.round((curr / total) * 30) + 10;
        setProgressPercent(pct);
        setProcessingStatus(`استخراج الصفحة ${curr} من ${total} بدقة عالية...`);
      });

      if (pages.length === 0) {
        throw new Error('لم يتم العثور على أية صفحات صالحة في ملف الـ PDF المرفوع.');
      }

      // Preview the first page image
      setOriginalImageUrl(pages[0].dataUrl);

      // 2. If online: Send pages to Gemini batch multi-invoice analyzer
      if (isOnline) {
        setProcessingStatus(`تحليل وتفريغ فواتير ${pages.length} صفحة بالذكاء الاصطناعي وفق شروط القالب...`);
        setProgressPercent(50);

        const res = await fetch('/api/analyze-invoices-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pages: pages.map((p) => ({ pageNumber: p.pageNumber, imageBase64: p.dataUrl })),
            rules: extractionRules,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success || !Array.isArray(data.items)) {
          throw new Error(data.error || 'تعذر استخراج بيانات الفواتير من ملف الـ PDF.');
        }

        setProgressPercent(90);
        setProcessingStatus('تنسيق جدول الإكسل الموحد وربط الأعمدة والبيان...');

        // Convert parsed items to Excel template sheet
        const sheet = convertInvoicesToTemplateSheet(
          data.items,
          `كشف مفرغ فواتير ملف (${pdfFile.name.replace(/\.[^/.]+$/, '')})`
        );
        setActiveSheet(sheet);
      } else {
        // Offline PDF processing (fallback OCR on each page)
        setProcessingStatus('معالجة صفحات الـ PDF محلياً بدون نت...');
        const items: ParsedInvoiceItem[] = [];

        for (let i = 0; i < pages.length; i++) {
          const p = pages[i];
          setProgressPercent(Math.round(((i + 1) / pages.length) * 80) + 10);
          const singleSheet = await analyzePaperOffline(p.dataUrl);

          items.push({
            id: `offline-item-${i}`,
            pageNumber: p.pageNumber,
            date: new Date().toISOString().split('T')[0],
            referenceType: 'مستند/فاتورة',
            referenceNumber: `INV-OFFLINE-${p.pageNumber}`,
            itemCategory: '',
            amount: 0,
            statement: singleSheet.summary || 'تم المسح ضوئياً محلياً بدون إنترنت',
            beneficiary: singleSheet.title || 'عميل محلي',
            providerCompany: 'مورد غير محدد',
            docType: 'general',
            docTypeLabel: 'مستند/فاتورة',
            invoiceNumber: `INV-OFFLINE-${p.pageNumber}`,
            customerName: singleSheet.title || 'عميل محلي',
            totalAmount: 0,
            currency: 'ريال',
            itemsSummary: singleSheet.summary || 'تم المسح ضوئياً محلياً بدون إنترنت',
            notes: `صفحة ${p.pageNumber}`,
          });
        }

        const sheet = convertInvoicesToTemplateSheet(items, `كشف فواتير (${pdfFile.name})`);
        setActiveSheet(sheet);
      }
    } catch (err: any) {
      console.error('PDF Processing error:', err);
      setErrorMessage(err.message || 'حدث خطأ أثناء قراءة ملف الـ PDF أو تفريغ الفواتير.');
    } finally {
      setIsLoading(false);
      setProgressPercent(undefined);
    }
  };

  // Handle preset sample selected
  const handleSelectSample = (sample: SamplePaper) => {
    setErrorMessage(null);
    setBatchItems(null);
    setActiveSheet(sample.data);
    setOriginalImageUrl(sample.previewUrl || null);
  };

  // Analyze Paper Image: Uses client-side optimization and resilient model fallback
  const analyzeImage = async (fileOrDataUrl: File | string, mimeType: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setProgressPercent(undefined);

    let optimizedDataUrl = typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '';
    let base64 = '';
    let finalMime = mimeType;

    // 1. Optimize image (resizes camera uploads down to crisp dimensions)
    try {
      setProcessingStatus('تحسين أبعاد ودقة الصورة وتسريع النقل...');
      const optimized = await optimizeImageForAi(fileOrDataUrl);
      optimizedDataUrl = optimized.dataUrl;
      base64 = optimized.base64;
      finalMime = optimized.mimeType;
      setOriginalImageUrl(optimizedDataUrl);
    } catch (optErr) {
      console.warn('Image optimization skipped:', optErr);
      if (typeof fileOrDataUrl === 'string') {
        optimizedDataUrl = fileOrDataUrl;
        base64 = fileOrDataUrl.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
        setOriginalImageUrl(optimizedDataUrl);
      }
    }

    // Offline mode
    if (!isOnline) {
      try {
        setProcessingStatus('معالجة الورقة محلياً عبر تقنية OCR بدون إنترنت...');
        const sheet = await analyzePaperOffline(optimizedDataUrl, (pct, status) => {
          setProgressPercent(pct);
          setProcessingStatus(status);
        });
        setActiveSheet(sheet);
      } catch (offlineErr: any) {
        console.error('Offline analysis error:', offlineErr);
        setErrorMessage(offlineErr.message || 'تعذرت معالجة الورقة في وضع عدم الاتصال.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Online AI Analysis
    try {
      setProcessingStatus('جاري استخراج بيانات الفاتورة وتفريغها في القالب المالي المعتمد...');
      const fileName = typeof fileOrDataUrl === 'object' && 'name' in fileOrDataUrl ? fileOrDataUrl.name : 'ورقة مصورة';

      // 1. Call single invoice analyzer with model fallback
      const res = await fetch('/api/analyze-single-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: finalMime,
          fileName,
          rules: extractionRules,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.item) {
        const parsedItem: ParsedInvoiceItem = {
          ...data.item,
          thumbnailUrl: optimizedDataUrl,
          status: 'completed',
        };

        setBatchItems([parsedItem]);
        setBatchFolderName(fileName.replace(/\.[^/.]+$/, ''));

        // Generate Excel sheet strictly adhering to the user's 8-column RTL template
        const sheet = convertInvoicesToTemplateSheet(
          [parsedItem],
          `كشف الفاتورة (${parsedItem.referenceNumber || 'مستند'})`
        );
        setActiveSheet(sheet);
      } else {
        // Fallback to table extraction endpoint if single-invoice fails
        setProcessingStatus('جاري محاولة القراءة البديلة للورقة...');
        const fallbackRes = await fetch('/api/analyze-paper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: finalMime,
          }),
        });
        const fallbackData = await fallbackRes.json();
        if (!fallbackRes.ok || !fallbackData.success || !fallbackData.sheet) {
          throw new Error(data?.error || fallbackData?.error || 'تعذر استخراج بيانات الفاتورة.');
        }
        setActiveSheet(fallbackData.sheet);
      }
    } catch (onlineErr: any) {
      console.error('Online analysis error:', onlineErr);
      setErrorMessage(
        `حدث خطأ أثناء معالجة الفاتورة: ${onlineErr.message || 'خطأ في الاتصال'}. تم تفعيل أنظمة الاحتياط؛ يرجى إعادة المحاولة أو التحقق من زاوية ووضوح الصورة.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to scan / upload another paper
  const handleReset = () => {
    setActiveSheet(null);
    setOriginalImageUrl(null);
    setBatchItems(null);
    setErrorMessage(null);
  };

  // Update active sheet after manual edits
  const handleUpdateSheet = (updated: ExtractedSheet) => {
    setActiveSheet(updated);
  };

  const handleLicenseActivated = (lic: LicenseInfo) => {
    setLicenseState({
      isLicensed: true,
      license: lic,
      scansCount: licenseState.scansCount,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white pb-24">
      {/* Flutter-style Frosted Header */}
      <Header
        onOpenCam={() => setIsCameraOpen(true)}
        onOpenUpload={() => {
          const fileInput = document.getElementById('file-input-element');
          if (fileInput) fileInput.click();
        }}
        hasActiveSheet={Boolean(activeSheet || batchItems)}
        licenseInfo={licenseState.license}
        isLicensed={licenseState.isLicensed}
        onOpenLicenseActivation={() => setIsLicenseActivationOpen(true)}
        onOpenLicenseAdmin={() => setIsLicenseAdminOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Error notification banner */}
        {errorMessage && (
          <div
            id="error-banner"
            className="p-4 rounded-3xl bg-rose-950/70 border border-rose-800/80 text-rose-200 flex items-start gap-3 shadow-xl backdrop-blur-md"
          >
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-bold text-rose-100 mb-0.5">تنبيه أثناء معالجة الورقة:</p>
              <p>{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-300 hover:text-white px-2.5 py-1 bg-rose-900/50 rounded-xl"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* State 1: Loading / Processing Screen */}
        {isLoading ? (
          <ProcessingOverlay
            imagePreviewUrl={originalImageUrl}
            isOfflineMode={!isOnline}
            statusText={processingStatus}
            progressPercent={progressPercent}
          />
        ) : activeNavTab === 'templates' ? (
          /* View Tab: Approved Accounting Templates Gallery */
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
                <FolderArchive className="w-3.5 h-3.5" />
                مكتبة القوالب والنماذج المالية المعتمدة
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
                نماذج إكسل جاهزة ومتوافقة مع القواعد المحاسبية
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                اختر القالب المالي المعتمد لتحميله وتعديل صفوفه مباشرة أو تعبئته آلياً عبر مسح فواتيرك.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SAMPLE_PAPERS.map((sample) => (
                <div
                  key={sample.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-5 shadow-lg transition duration-200 flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                        {sample.category}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {sample.data.rowCount} صفوف • {sample.data.colCount} أعمدة
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                      {sample.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {sample.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        handleSelectSample(sample);
                        setActiveNavTab('sheet');
                      }}
                      className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition active:scale-95"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      فتح وتعديل هذا القالب
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeNavTab === 'license' ? (
          /* View Tab: Commercial License & Sales Hub */
          <div className="space-y-6 max-w-2xl mx-auto animate-fadeIn">
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-center">
              <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                مركز التراخيص والبيع التجاري
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
                يمكنك ترخيص وتفعيل هذه النسخة لمؤسستك، أو الدخول كمالك بكلمة المرور لتوليد مفاتيح ترخيص رسمية وبيع التطبيق للعملاء.
              </p>

              {/* Status Pill */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-right">
                <div>
                  <div className="text-[11px] text-slate-400">حالة ترخيص الجهاز الحالي:</div>
                  <div className="text-sm font-bold text-white">
                    {licenseState.isLicensed && licenseState.license
                      ? `مرخص لصالح: ${licenseState.license.clientName} (${licenseState.license.planLabel})`
                      : 'نسخة تجريبية غير مرخصة'}
                  </div>
                </div>
                <button
                  onClick={() => setIsLicenseActivationOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition shrink-0"
                >
                  {licenseState.isLicensed ? 'عرض الشهادة' : 'تفعيل ترخيص'}
                </button>
              </div>

              {/* Owner Action */}
              <div className="pt-2">
                <button
                  onClick={() => setIsLicenseAdminOpen(true)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <KeyRound className="w-4 h-4 stroke-[2.4]" />
                  فتح لوحة توليد التراخيص (للمالك - محمية بكلمة مرور)
                </button>
              </div>
            </div>
          </div>
        ) : batchItems && batchItems.length > 0 ? (
          /* State 2: Folder Batch Processing & Results Manager */
          <FolderBatchManager
            folderName={batchFolderName}
            items={batchItems}
            activeSheet={activeSheet}
            isProcessing={isBatchProcessing}
            currentIndex={batchCurrentIndex}
            totalCount={batchItems.length}
            onUpdateSheet={handleUpdateSheet}
            onUpdateItem={handleUpdateBatchItem}
            onRetryItem={handleRetryBatchItem}
            onNewUpload={handleResetBatch}
          />
        ) : activeSheet ? (
          /* State 3: Single Extracted Sheet Result with Comparison & Download */
          <div className="space-y-6 animate-fadeIn">
            <ExportActionsBar sheet={activeSheet} onReset={handleReset} />

            <SplitComparisonView
              originalImageUrl={originalImageUrl}
              sheet={activeSheet}
              onUpdateSheet={handleUpdateSheet}
            />

            {/* Quality match highlights - Flutter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-3xl bg-slate-900/90 border border-white/5 flex items-center gap-3 shadow-lg ring-1 ring-white/5">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200">ألوان وتنسيق متطابق</div>
                  <div className="text-slate-400">التقاط ألوان الترويسة والحدود بدقة.</div>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-slate-900/90 border border-white/5 flex items-center gap-3 shadow-lg ring-1 ring-white/5">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200">تاريخ من اليسار لليمين</div>
                  <div className="text-slate-400">تاريخ المرجع بصيغة DD/MM/YYYY LTR.</div>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-slate-900/90 border border-white/5 flex items-center gap-3 shadow-lg ring-1 ring-white/5">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200">تصدير إكسل رسمي (.xlsx)</div>
                  <div className="text-slate-400">جاهز للفتح في Excel وGoogle Sheets.</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* State 4: Empty State / Scanner, Folder & File Selector */
          <div className="space-y-6 animate-fadeIn">
            {/* Flutter-style Hero banner with smooth curves */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-white/10 rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                نظام تفريغ الفواتير الورقية والمجلدات لقالب إكسل محاسبي معتمد
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                ارفع مجلد صور كامل أو صوّر أي فاتورة وتفرغ فوراً
              </h2>

              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                يدعم التطبيق رفع مجلد فواتير كامل بالذاكرة لتفريغه في كشف إكسل رسمي من اليمين لليسار مع ترك خانة البند فارغة وتنسيق التاريخ يوماً/شهراً/سنة من اليسار لليمين.
              </p>
            </div>

            {/* Extraction Rules and Template Controls */}
            <ExtractionRulesConfig rules={extractionRules} onChange={setExtractionRules} />

            {/* Camera, Folder & File Upload Dropzone */}
            <FileUploadDropzone
              onFileSelected={handleFileSelected}
              onFolderSelected={handleFolderSelected}
              onOpenCam={() => setIsCameraOpen(true)}
              onSelectSample={(sample) => {
                handleSelectSample(sample);
                setActiveNavTab('sheet');
              }}
              isLoading={isLoading}
            />

            {/* Quick tips for best capture */}
            <div className="p-4 rounded-3xl bg-slate-900/40 border border-white/5 text-xs text-slate-400 flex items-start gap-3 ring-1 ring-white/5">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-300">نصائح للحصول على أفضل دقة: </span>
                احرص على إضاءة جيدة ووضوح أرقام الفواتير والأسعار. عند رفع مجلد يحتوي على عشرات الصور، يقوم النظام بضغطها وتحسينها تلقائياً بالذاكرة ومعالجتها تباعاً بأحدث نماذج الذكاء الاصطناعي السريعة.
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Developer Credit Footer Bar */}
      <footer className="w-full max-w-7xl mx-auto px-4 py-4 mb-16 text-xs text-slate-400 border-t border-white/5 flex flex-col sm:flex-row items-center justify-center gap-2.5">
        <div className="flex items-center gap-1.5 font-medium text-slate-300">
          <span>تطوير وإعداد:</span>
          <strong className="text-white font-bold tracking-wide">صادق الظاهري 2026</strong>
        </div>
        <span className="hidden sm:inline text-slate-700">•</span>
        <a
          href="tel:772092700"
          className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 px-3.5 py-1 rounded-full transition shadow-sm"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          <span>للتواصل: 772092700</span>
        </a>
      </footer>

      {/* Flutter Material 3 Bottom Navigation Dock */}
      <FlutterBottomNav
        activeTab={activeNavTab}
        onTabChange={(tab) => {
          setActiveNavTab(tab);
          if (tab === 'license') {
            setIsLicenseActivationOpen(true);
          }
        }}
        onQuickCamera={() => setIsCameraOpen(true)}
        onQuickUpload={() => {
          const fileInput = document.getElementById('file-input-element');
          if (fileInput) fileInput.click();
        }}
        hasActiveSheet={Boolean(activeSheet || batchItems)}
        isLicensed={licenseState.isLicensed}
      />

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* Commercial License Admin Modal (Password Protected for Owner) */}
      <LicenseAdminModal
        isOpen={isLicenseAdminOpen}
        onClose={() => setIsLicenseAdminOpen(false)}
        onLicenseActivated={handleLicenseActivated}
      />

      {/* Client License Activation Modal */}
      <LicenseActivationModal
        isOpen={isLicenseActivationOpen}
        onClose={() => setIsLicenseActivationOpen(false)}
        currentLicense={licenseState.license}
        onActivateSuccess={handleLicenseActivated}
        onOpenAdminGenerator={() => setIsLicenseAdminOpen(true)}
      />

      {/* Offline Status Badge */}
      <OfflineIndicator />
    </div>
  );
}
