import React, { useState } from 'react';
import { Download, Copy, Printer, Check, RefreshCw, FileSpreadsheet, Sparkles } from 'lucide-react';
import { ExtractedSheet } from '../types';
import { generateExcelBlob, downloadExcelFile } from '../utils/excelGenerator';

interface ExportActionsBarProps {
  sheet: ExtractedSheet;
  onReset: () => void;
}

export const ExportActionsBar: React.FC<ExportActionsBarProps> = ({
  sheet,
  onReset,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [copiedCsv, setCopiedCsv] = useState(false);

  // Handle Download Excel (.xlsx)
  const handleDownloadExcel = async () => {
    try {
      setIsExporting(true);
      const blob = await generateExcelBlob(sheet);
      const filename = `${sheet.title || 'paper_to_excel'}_${Date.now()}.xlsx`;
      downloadExcelFile(blob, filename);
    } catch (err) {
      console.error('Failed to export Excel file:', err);
      alert('حدث خطأ أثناء تصدير ملف الإكسل. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsExporting(false);
    }
  };

  // Convert Sheet to CSV String
  const handleCopyCsv = () => {
    try {
      const rowMap = new Map<number, Map<number, string>>();
      let maxR = sheet.rowCount || 0;
      let maxC = sheet.colCount || 0;

      for (const cell of sheet.cells) {
        if (!rowMap.has(cell.r)) {
          rowMap.set(cell.r, new Map());
        }
        rowMap.get(cell.r)!.set(cell.c, String(cell.v ?? ''));
        maxR = Math.max(maxR, cell.r + 1);
        maxC = Math.max(maxC, cell.c + 1);
      }

      const rows: string[] = [];
      for (let r = 0; r < maxR; r++) {
        const rowCells: string[] = [];
        const cols = rowMap.get(r);
        for (let c = 0; c < maxC; c++) {
          const val = cols?.get(c) || '';
          // Escape quotes
          const escaped = `"${val.replace(/"/g, '""')}"`;
          rowCells.push(escaped);
        }
        rows.push(rowCells.join(','));
      }

      const csvContent = rows.join('\n');
      navigator.clipboard.writeText(csvContent);
      setCopiedCsv(true);
      setTimeout(() => setCopiedCsv(false), 2500);
    } catch (err) {
      console.error('Failed to copy CSV:', err);
    }
  };

  // Print Sheet
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="export-actions-bar"
      className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4"
    >
      {/* Reset / New Paper Button */}
      <button
        id="reset-new-paper-btn"
        onClick={onReset}
        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
      >
        <RefreshCw className="w-4 h-4 text-slate-400" />
        <span>تصوير أو رفع ورقة جديدة</span>
      </button>

      {/* Action Buttons: Copy CSV, Print, Download Excel */}
      <div className="flex items-center flex-wrap gap-2.5">
        {/* Copy CSV */}
        <button
          id="copy-csv-btn"
          onClick={handleCopyCsv}
          className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium flex items-center gap-2 border border-slate-700 transition"
        >
          {copiedCsv ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300">تم نسخ البيانات كـ CSV!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-400" />
              <span>نسخ كـ CSV</span>
            </>
          )}
        </button>

        {/* Print */}
        <button
          id="print-sheet-btn"
          onClick={handlePrint}
          className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium flex items-center gap-2 border border-slate-700 transition"
        >
          <Printer className="w-4 h-4 text-slate-400" />
          <span>طباعة</span>
        </button>

        {/* Primary Download Excel Button */}
        <button
          id="download-excel-btn"
          onClick={handleDownloadExcel}
          disabled={isExporting}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all transform active:scale-95 disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>جاري تجهيز ملف الإكسل...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>تحميل ملف إكسل مطابق (.xlsx)</span>
              <span className="text-[10px] bg-emerald-700/80 px-1.5 py-0.5 rounded text-emerald-100">
                بالألوان والتنسيق
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
