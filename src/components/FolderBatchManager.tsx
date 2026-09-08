import React, { useState } from 'react';
import {
  Folder,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  FileSpreadsheet,
  LayoutGrid,
  Sparkles,
  RefreshCw,
  Coins,
  FileCheck,
  Calendar,
  User,
  Hash,
  FileText,
  Building
} from 'lucide-react';
import { ParsedInvoiceItem, ExtractedSheet } from '../types';
import { ExcelSheetViewer } from './ExcelSheetViewer';
import { ExportActionsBar } from './ExportActionsBar';

interface FolderBatchManagerProps {
  folderName: string;
  items: ParsedInvoiceItem[];
  activeSheet: ExtractedSheet | null;
  isProcessing: boolean;
  currentIndex: number;
  totalCount: number;
  onUpdateSheet: (updated: ExtractedSheet) => void;
  onUpdateItem: (id: string, updated: Partial<ParsedInvoiceItem>) => void;
  onRetryItem: (item: ParsedInvoiceItem) => void;
  onNewUpload: () => void;
}

export const FolderBatchManager: React.FC<FolderBatchManagerProps> = ({
  folderName,
  items,
  activeSheet,
  isProcessing,
  currentIndex,
  totalCount,
  onUpdateSheet,
  onUpdateItem,
  onRetryItem,
  onNewUpload,
}) => {
  const [activeTab, setActiveTab] = useState<'master_sheet' | 'cards_gallery' | 'single_inspect'>(
    'master_sheet'
  );
  const [inspectedItemId, setInspectedItemId] = useState<string | null>(items[0]?.id || null);

  const inspectedItem = items.find((it) => it.id === inspectedItemId) || items[0];

  const completedCount = items.filter((it) => it.status === 'completed').length;
  const errorCount = items.filter((it) => it.status === 'error').length;
  const totalGrandAmount = items
    .filter((it) => it.status === 'completed')
    .reduce((sum, it) => sum + (it.totalAmount || 0), 0);

  const primaryCurrency = items.find((it) => it.currency)?.currency || 'ريال';
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="w-full space-y-6">
      {/* Top Batch Header & Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25">
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  معالجة مجلد الفواتير: <span className="text-blue-400 font-mono">{folderName}</span>
                </h2>
                {isProcessing ? (
                  <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium animate-pulse border border-amber-500/30">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    جاري التحليل بالذكاء الاصطناعي...
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    اكتمل تفريغ المجلد
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تم فحص {completedCount} من أصل {totalCount} صورة فاتورة • تفريغ فوري مطابق لكافة الحقول
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-left">
              <span className="text-[11px] text-slate-400 block">إجمالي مبالغ الفواتير</span>
              <div className="text-base font-bold text-emerald-400 font-mono">
                {totalGrandAmount.toLocaleString('ar-EG')} {primaryCurrency}
              </div>
            </div>

            <button
              id="batch-new-upload-btn"
              onClick={onNewUpload}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>مجلد أو فاتورة جديدة</span>
            </button>
          </div>
        </div>

        {/* Progress bar if running or partial */}
        {isProcessing && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-medium">
                معالجة الفاتورة {Math.min(currentIndex, totalCount)} من {totalCount}...
              </span>
              <span className="font-mono text-emerald-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>
          </div>
        )}

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              id="tab-master-sheet-btn"
              onClick={() => setActiveTab('master_sheet')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'master_sheet'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>الجدول الموحد للمجلد ({items.length})</span>
            </button>

            <button
              id="tab-cards-gallery-btn"
              onClick={() => setActiveTab('cards_gallery')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'cards_gallery'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>معرض بطاقات الفواتير</span>
            </button>

            <button
              id="tab-single-inspect-btn"
              onClick={() => setActiveTab('single_inspect')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'single_inspect'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>فاحص الفاتورة المختارة ومطابقة الصورة</span>
            </button>
          </div>

          {activeSheet && (
            <div className="text-xs text-slate-400">
              {activeSheet.rowCount} صف • {activeSheet.colCount} عمود • جاهز للتصدير
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: MASTER EXCEL SHEET */}
      {activeTab === 'master_sheet' && activeSheet && (
        <div className="space-y-4">
          <ExportActionsBar sheet={activeSheet} filename={`كشف_مجلد_${folderName}`} />
          <ExcelSheetViewer sheet={activeSheet} onUpdateSheet={onUpdateSheet} />
        </div>
      )}

      {/* TAB 2: CARDS GALLERY */}
      {activeTab === 'cards_gallery' && (
        <div className="space-y-4">
          {activeSheet && (
            <ExportActionsBar sheet={activeSheet} filename={`كشف_مجلد_${folderName}`} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, idx) => {
              const isDone = item.status === 'completed';
              const isCurr = item.status === 'processing';
              const isErr = item.status === 'error';

              return (
                <div
                  key={item.id}
                  className={`bg-slate-900 rounded-2xl border transition-all overflow-hidden flex flex-col ${
                    isCurr
                      ? 'border-blue-500/60 shadow-lg shadow-blue-950/40 ring-1 ring-blue-500/40'
                      : isErr
                      ? 'border-rose-700/60 bg-rose-950/10'
                      : 'border-slate-800 hover:border-slate-700 hover:shadow-md'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-200 truncate max-w-[170px]" title={item.fileName}>
                        {item.fileName || `فاتورة ${idx + 1}`}
                      </span>
                    </div>

                    <div>
                      {isDone && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-medium">
                          {item.docTypeLabel || 'فاتورة'}
                        </span>
                      )}
                      {isCurr && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-medium flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          تحليل...
                        </span>
                      )}
                      {isErr && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-medium">
                          فشل
                        </span>
                      )}
                      {item.status === 'pending' && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-medium">
                          في الانتظار
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail & Key Extracted Fields */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="flex items-start gap-3">
                      {item.thumbnailUrl ? (
                        <div
                          onClick={() => {
                            setInspectedItemId(item.id);
                            setActiveTab('single_inspect');
                          }}
                          className="w-20 h-24 rounded-lg bg-black/60 overflow-hidden border border-slate-800 shrink-0 cursor-pointer hover:opacity-80 transition group relative"
                        >
                          <img
                            src={item.thumbnailUrl}
                            alt={item.fileName}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-20 h-24 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-800 shrink-0 text-slate-600">
                          <FileText className="w-6 h-6" />
                        </div>
                      )}

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="text-xs text-slate-300 flex items-center gap-1">
                          <Hash className="w-3 h-3 text-slate-500" />
                          <span className="text-slate-400">رقم المرجع:</span>
                          <span className="font-mono font-bold text-white truncate">
                            {item.referenceNumber || item.invoiceNumber || 'بدون رقم'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-300 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-500" />
                          <span className="text-slate-400">المستفيد:</span>
                          <span className="font-semibold text-slate-200 truncate">
                            {item.beneficiary || item.customerName || 'غير محدد'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-300 flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-500" />
                          <span className="text-slate-400">الشركة المزودة:</span>
                          <span className="text-slate-200 truncate">
                            {item.providerCompany || item.notes || 'غير محدد'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-300 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span className="text-slate-400">تاريخ المرجع:</span>
                          <span dir="ltr" className="font-mono text-slate-200 inline-block">
                            {item.date || '-'}
                          </span>
                        </div>

                        <div className="pt-1">
                          <span className="text-xs text-slate-400 block">المبلغ:</span>
                          <span className="text-sm font-bold text-emerald-400 font-mono">
                            {(item.amount ?? item.totalAmount ?? 0).toLocaleString('ar-EG')}{' '}
                            {item.currency || primaryCurrency}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Statement (البيان) */}
                    <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300 line-clamp-2">
                      <span className="text-slate-400 font-semibold ml-1">البيان:</span>
                      {item.statement || item.itemsSummary || 'جاري استخراج بيان ومحتوى الفاتورة...'}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                      <button
                        onClick={() => {
                          setInspectedItemId(item.id);
                          setActiveTab('single_inspect');
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>معاينة ومطابقة الصورة</span>
                      </button>

                      {isErr && (
                        <button
                          onClick={() => onRetryItem(item)}
                          className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>إعادة المحاولة</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SINGLE INVOICE INSPECTOR */}
      {activeTab === 'single_inspect' && inspectedItem && (
        <div className="space-y-4">
          {/* Invoice selector bar */}
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 overflow-x-auto">
            <span className="text-xs font-bold text-slate-300 shrink-0">اختر فاتورة للمطابقة:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {items.map((it, idx) => (
                <button
                  key={it.id}
                  onClick={() => setInspectedItemId(it.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
                    it.id === inspectedItem.id
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className="font-mono">{idx + 1}.</span>
                  <span className="truncate max-w-[120px]">{it.fileName || `فاتورة ${idx + 1}`}</span>
                  {it.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Split Side-by-Side View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            {/* Original Photo */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-bold text-white">
                    صورة الورقة الأصلية ({inspectedItem.fileName})
                  </h4>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {inspectedItem.docTypeLabel || 'فاتورة'}
                </span>
              </div>

              <div className="min-h-[420px] max-h-[640px] flex items-center justify-center bg-black/50 rounded-xl overflow-hidden p-2">
                {inspectedItem.thumbnailUrl ? (
                  <img
                    src={inspectedItem.thumbnailUrl}
                    alt={inspectedItem.fileName}
                    className="max-h-[600px] max-w-full object-contain rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="text-center text-slate-500 py-16">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">لم يتم العثور على معاينة صورة لهذه الفاتورة.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Extracted Details & Editable Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">البيانات المستخرجة والمطابقة</h4>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                  قابلة للتعديل الفوري
                </span>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">
                      نوع المرجع
                    </label>
                    <input
                      type="text"
                      value={inspectedItem.referenceType || inspectedItem.docTypeLabel || ''}
                      onChange={(e) => onUpdateItem(inspectedItem.id, { 
                        referenceType: e.target.value,
                        docTypeLabel: e.target.value 
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">
                      رقم المرجع / الفاتورة
                    </label>
                    <input
                      type="text"
                      value={inspectedItem.referenceNumber || inspectedItem.invoiceNumber || ''}
                      onChange={(e) => onUpdateItem(inspectedItem.id, { 
                        referenceNumber: e.target.value,
                        invoiceNumber: e.target.value 
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">
                      المستفيد (العميل)
                    </label>
                    <input
                      type="text"
                      value={inspectedItem.beneficiary || inspectedItem.customerName || ''}
                      onChange={(e) => onUpdateItem(inspectedItem.id, { 
                        beneficiary: e.target.value,
                        customerName: e.target.value 
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">
                      الشركة المزودة (المورد / المحل)
                    </label>
                    <input
                      type="text"
                      value={inspectedItem.providerCompany || inspectedItem.notes || ''}
                      onChange={(e) => onUpdateItem(inspectedItem.id, { 
                        providerCompany: e.target.value,
                        notes: e.target.value 
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">
                      تاريخ المرجع (يوم/شهر/سنة من اليسار لليمين)
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="DD/MM/YYYY"
                      value={inspectedItem.date || ''}
                      onChange={(e) => onUpdateItem(inspectedItem.id, { date: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono text-center"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">
                      المبلغ
                    </label>
                    <input
                      type="number"
                      value={inspectedItem.amount ?? inspectedItem.totalAmount ?? 0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        onUpdateItem(inspectedItem.id, { amount: val, totalAmount: val });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-emerald-400 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    البيان (تفاصيل الأصناف والأعداد)
                  </label>
                  <textarea
                    rows={3}
                    value={inspectedItem.statement || inspectedItem.itemsSummary || ''}
                    onChange={(e) => onUpdateItem(inspectedItem.id, { 
                      statement: e.target.value,
                      itemsSummary: e.target.value 
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">حقل البند:</span>
                  <span className="text-amber-400 font-medium font-mono text-[11px]">
                    متروك فارغاً تلقائياً في الإكسل حسب شروط القالب المعتمد
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <button
                  onClick={() => setActiveTab('master_sheet')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>العودة للجدول الموحد وتحديث الإكسل</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
