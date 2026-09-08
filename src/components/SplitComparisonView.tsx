import React, { useState } from 'react';
import { Columns, Eye, FileSpreadsheet, Image as ImageIcon, Sparkles } from 'lucide-react';
import { ExcelSheetViewer } from './ExcelSheetViewer';
import { ExtractedSheet } from '../types';

interface SplitComparisonViewProps {
  originalImageUrl?: string | null;
  sheet: ExtractedSheet;
  onUpdateSheet?: (updated: ExtractedSheet) => void;
}

export const SplitComparisonView: React.FC<SplitComparisonViewProps> = ({
  originalImageUrl,
  sheet,
  onUpdateSheet,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'excel_only' | 'image_only'>(
    originalImageUrl ? 'split' : 'excel_only'
  );

  return (
    <div className="w-full space-y-4">
      {/* View Mode Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">وضع المعاينة والمطابقة:</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {originalImageUrl && (
            <button
              id="view-mode-split-btn"
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
                viewMode === 'split'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>مقارنة جنب إلى جنب</span>
            </button>
          )}

          <button
            id="view-mode-excel-btn"
            onClick={() => setViewMode('excel_only')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
              viewMode === 'excel_only'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>جدول الإكسل المستخرج</span>
          </button>

          {originalImageUrl && (
            <button
              id="view-mode-image-btn"
              onClick={() => setViewMode('image_only')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
                viewMode === 'image_only'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>صورة الورقة الأصلية</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Rendering */}
      {viewMode === 'split' && originalImageUrl ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* Original Paper Photo */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-full shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <h4 className="text-sm font-bold text-slate-200">صورة الورقة الأصلية</h4>
              </div>
              <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                المصدر
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center bg-black/40 rounded-xl overflow-hidden p-2 min-h-[420px] max-h-[600px]">
              <img
                src={originalImageUrl}
                alt="الورقة الأصلية"
                className="max-h-[560px] max-w-full object-contain rounded-lg shadow"
              />
            </div>
          </div>

          {/* Generated Excel Sheet */}
          <div className="h-full">
            <ExcelSheetViewer sheet={sheet} onUpdateSheet={onUpdateSheet} />
          </div>
        </div>
      ) : viewMode === 'image_only' && originalImageUrl ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[500px]">
          <img
            src={originalImageUrl}
            alt="صورة الورقة الأصلية"
            className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-700"
          />
        </div>
      ) : (
        <ExcelSheetViewer sheet={sheet} onUpdateSheet={onUpdateSheet} />
      )}
    </div>
  );
};
