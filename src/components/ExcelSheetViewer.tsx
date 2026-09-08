import React, { useState, useMemo } from 'react';
import { ExtractedSheet, ExtractedCell } from '../types';
import {
  Table,
  ZoomIn,
  ZoomOut,
  ArrowRightLeft,
  Edit2,
  Check,
  Sparkles,
  Info,
  Maximize2
} from 'lucide-react';

interface ExcelSheetViewerProps {
  sheet: ExtractedSheet;
  onUpdateSheet?: (updated: ExtractedSheet) => void;
}

// Helper to convert 0-based column index to Excel column letters (0 -> A, 25 -> Z, 26 -> AA)
function getColumnLabel(index: number): string {
  let label = '';
  let num = index;
  while (num >= 0) {
    label = String.fromCharCode((num % 26) + 65) + label;
    num = Math.floor(num / 26) - 1;
  }
  return label;
}

export const ExcelSheetViewer: React.FC<ExcelSheetViewerProps> = ({
  sheet,
  onUpdateSheet,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [selectedCellPos, setSelectedCellPos] = useState<{ r: number; c: number } | null>(null);
  const [editingPos, setEditingPos] = useState<{ r: number; c: number } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isRtl, setIsRtl] = useState<boolean>(sheet.isRtl ?? true);

  // Sync RTL if sheet changes
  React.useEffect(() => {
    setIsRtl(sheet.isRtl ?? true);
  }, [sheet.isRtl]);

  // Compute maximum rows and columns
  const effectiveRowCount = useMemo(() => {
    const maxRowFromCells = sheet.cells.reduce((max, cell) => {
      const bottom = cell.r + (cell.rowSpan || 1);
      return Math.max(max, bottom);
    }, 0);
    return Math.max(sheet.rowCount || 1, maxRowFromCells);
  }, [sheet]);

  const effectiveColCount = useMemo(() => {
    const maxColFromCells = sheet.cells.reduce((max, cell) => {
      const right = cell.c + (cell.colSpan || 1);
      return Math.max(max, right);
    }, 0);
    return Math.max(sheet.colCount || 1, maxColFromCells);
  }, [sheet]);

  // Build grid map and merged coverage map
  const { cellMap, coveredCells } = useMemo(() => {
    const map = new Map<string, ExtractedCell>();
    const covered = new Set<string>();

    for (const cell of sheet.cells) {
      const key = `${cell.r},${cell.c}`;
      map.set(key, cell);

      const rSpan = cell.rowSpan || 1;
      const cSpan = cell.colSpan || 1;

      if (rSpan > 1 || cSpan > 1) {
        for (let r = 0; r < rSpan; r++) {
          for (let c = 0; c < cSpan; c++) {
            if (r !== 0 || c !== 0) {
              covered.add(`${cell.r + r},${cell.c + c}`);
            }
          }
        }
      }
    }
    return { cellMap: map, coveredCells: covered };
  }, [sheet.cells]);

  // Handle cell click
  const handleCellClick = (r: number, c: number) => {
    setSelectedCellPos({ r, c });
    const cell = cellMap.get(`${r},${c}`);
    setEditValue(cell ? String(cell.v ?? '') : '');
  };

  // Start double-click edit
  const handleCellDoubleClick = (r: number, c: number) => {
    setSelectedCellPos({ r, c });
    const cell = cellMap.get(`${r},${c}`);
    setEditValue(cell ? String(cell.v ?? '') : '');
    setEditingPos({ r, c });
  };

  // Commit edit
  const handleSaveEdit = () => {
    if (!editingPos) return;
    const { r, c } = editingPos;

    const existingIdx = sheet.cells.findIndex((cell) => cell.r === r && cell.c === c);
    let newCells = [...sheet.cells];

    if (existingIdx >= 0) {
      newCells[existingIdx] = {
        ...newCells[existingIdx],
        v: editValue,
      };
    } else {
      newCells.push({
        r,
        c,
        v: editValue,
      });
    }

    if (onUpdateSheet) {
      onUpdateSheet({
        ...sheet,
        cells: newCells,
      });
    }
    setEditingPos(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditingPos(null);
    }
  };

  // Currently selected cell object
  const selectedCell = selectedCellPos
    ? cellMap.get(`${selectedCellPos.r},${selectedCellPos.c}`)
    : null;

  const selectedCellRef = selectedCellPos
    ? `${getColumnLabel(selectedCellPos.c)}${selectedCellPos.r + 1}`
    : 'A1';

  return (
    <div
      id="excel-sheet-viewer-container"
      className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl flex flex-col"
    >
      {/* Top Toolbar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Sheet Title & Status */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">
                {sheet.title || 'ورقة العمل المستخرجة'}
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                مطابق للأصل
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {effectiveRowCount} صف × {effectiveColCount} عمود • تم استخراج الألوان والتنسيقات بنجاح
            </p>
          </div>
        </div>

        {/* Toolbar Controls: Zoom & Direction */}
        <div className="flex items-center gap-2">
          {/* Direction toggle */}
          <button
            id="toggle-sheet-direction-btn"
            onClick={() => setIsRtl(!isRtl)}
            title={isRtl ? 'تبديل الاتجاه إلى يسار-يمين (LTR)' : 'تبديل الاتجاه إلى يمين-يسار (RTL)'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>{isRtl ? 'يمين ⇄ يسار' : 'يسار ⇄ يمين'}</span>
          </button>

          {/* Zoom Out */}
          <button
            id="zoom-out-btn"
            onClick={() => setZoomLevel((prev) => Math.max(75, prev - 10))}
            disabled={zoomLevel <= 75}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-40 transition"
            title="تصغير العرض"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-300 min-w-[40px] text-center">
            {zoomLevel}%
          </span>
          {/* Zoom In */}
          <button
            id="zoom-in-btn"
            onClick={() => setZoomLevel((prev) => Math.min(150, prev + 10))}
            disabled={zoomLevel >= 150}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-40 transition"
            title="تكبير العرض"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Formula & Active Cell Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center gap-3 text-xs">
        {/* Cell Reference Box */}
        <div className="font-mono font-bold bg-slate-800 text-emerald-400 px-3 py-1.5 rounded-md border border-slate-700 min-w-[55px] text-center">
          {selectedCellRef}
        </div>

        <div className="text-slate-500 font-mono select-none">fx</div>

        {/* Value / Formula Input */}
        <div className="flex-1 flex items-center gap-2">
          {editingPos ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-full bg-slate-950 border border-emerald-500 rounded-md px-3 py-1 text-white font-mono text-xs focus:outline-none"
              />
              <button
                onClick={handleSaveEdit}
                className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition"
                title="حفظ التعديل"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => {
                if (selectedCellPos) {
                  setEditingPos(selectedCellPos);
                }
              }}
              className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-md px-3 py-1 text-slate-300 font-mono text-xs truncate cursor-text min-h-[26px] flex items-center"
            >
              {selectedCell?.f ? (
                <span className="text-blue-400 font-semibold">{selectedCell.f}</span>
              ) : selectedCell?.v !== undefined ? (
                <span>{String(selectedCell.v)}</span>
              ) : (
                <span className="text-slate-600 italic">انقر نقراً مزدوجاً على أي خلية لتعديلها</span>
              )}
            </div>
          )}
        </div>

        {/* Cell Color / Style Indicator */}
        {selectedCell?.style?.bgColor && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 rounded border border-slate-700 text-slate-300">
            <span
              className="w-3.5 h-3.5 rounded-sm border border-black/30 shadow-sm"
              style={{ backgroundColor: selectedCell.style.bgColor }}
            />
            <span className="font-mono text-[10px]">{selectedCell.style.bgColor}</span>
          </div>
        )}
      </div>

      {/* Spreadsheet Grid Container */}
      <div
        className="w-full overflow-auto max-h-[560px] bg-slate-950 p-2 select-text"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: isRtl ? 'top right' : 'top left',
          }}
          className="transition-transform duration-100 inline-block min-w-full"
        >
          <table className="border-collapse text-xs font-sans table-fixed border border-slate-700 bg-white">
            <thead>
              <tr className="bg-slate-200 text-slate-700 font-mono">
                {/* Top Corner cell */}
                <th className="w-12 h-7 border border-slate-300 bg-slate-300 text-center font-bold text-[11px] sticky top-0 z-20">
                  #
                </th>
                {/* Column Headers A, B, C... */}
                {Array.from({ length: effectiveColCount }).map((_, c) => {
                  const width = sheet.columnWidths?.[c]
                    ? sheet.columnWidths[c] * 8
                    : 120;
                  return (
                    <th
                      key={`col-hdr-${c}`}
                      style={{ width: `${width}px`, minWidth: '80px' }}
                      className="h-7 border border-slate-300 px-2 py-1 text-center font-semibold text-slate-700 text-[11px] sticky top-0 bg-slate-200 z-10 select-none shadow-sm"
                    >
                      {getColumnLabel(c)}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: effectiveRowCount }).map((_, r) => {
                const rowHeight = sheet.rowHeights?.[r]
                  ? `${sheet.rowHeights[r]}px`
                  : '28px';

                return (
                  <tr key={`row-${r}`} style={{ height: rowHeight }}>
                    {/* Row Index Header (1, 2, 3...) */}
                    <td className="w-12 border border-slate-300 bg-slate-200 text-slate-700 font-mono text-center font-semibold text-[11px] select-none sticky left-0 z-10">
                      {r + 1}
                    </td>

                    {/* Row Cells */}
                    {Array.from({ length: effectiveColCount }).map((_, c) => {
                      const key = `${r},${c}`;

                      // Skip covered cells if part of a merge
                      if (coveredCells.has(key)) {
                        return null;
                      }

                      const cell = cellMap.get(key);
                      const isSelected =
                        selectedCellPos?.r === r && selectedCellPos?.c === c;
                      const isEditing =
                        editingPos?.r === r && editingPos?.c === c;

                      const style = cell?.style || {};
                      const bgColor = style.bgColor || '#FFFFFF';
                      const fontColor = style.fontColor || '#1E293B';
                      const isBold = !!style.bold;
                      const isItalic = !!style.italic;
                      const align = style.align || (isRtl ? 'right' : 'left');

                      const isCellLtr = style.direction === 'ltr' || (typeof cell?.v === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(cell.v));

                      return (
                        <td
                          key={`cell-${r}-${c}`}
                          rowSpan={cell?.rowSpan || 1}
                          colSpan={cell?.colSpan || 1}
                          onClick={() => handleCellClick(r, c)}
                          onDoubleClick={() => handleCellDoubleClick(r, c)}
                          style={{
                            backgroundColor: bgColor,
                            color: fontColor,
                            fontWeight: isBold ? '700' : '400',
                            fontStyle: isItalic ? 'italic' : 'normal',
                            textAlign: align,
                            fontSize: style.fontSize ? `${style.fontSize}px` : '12px',
                          }}
                          className={`border border-slate-300 px-2.5 py-1.5 transition-colors relative cursor-cell overflow-hidden text-ellipsis whitespace-nowrap ${
                            isSelected
                              ? 'ring-2 ring-emerald-500 ring-inset z-10'
                              : 'hover:outline hover:outline-1 hover:outline-blue-400'
                          }`}
                        >
                          {isEditing ? (
                            <input
                              type="text"
                              dir={isCellLtr ? 'ltr' : undefined}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleSaveEdit}
                              onKeyDown={handleKeyDown}
                              autoFocus
                              className={`w-full h-full bg-white text-black font-normal outline-none px-1 py-0.5 rounded shadow-inner ${
                                isCellLtr ? 'font-mono text-center' : ''
                              }`}
                            />
                          ) : (
                            <span
                              dir={isCellLtr ? 'ltr' : undefined}
                              className={isCellLtr ? 'inline-block font-mono tracking-wide' : ''}
                            >
                              {cell?.v !== undefined ? String(cell.v) : ''}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            يمكنك النقر المزدوج على أي خلية لتعديل النص قبل التصدير. الألوان والتنسيقات ستكون مدمجة في ملف الإكسل.
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-500">
          تنسيق مايكروسوفت إكسل المعتمد (.xlsx)
        </span>
      </div>
    </div>
  );
};
