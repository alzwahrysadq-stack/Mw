import ExcelJS from 'exceljs';
import { ExtractedSheet } from '../types';

/**
 * Normalizes hex color code to 6 uppercase characters without #
 */
export function cleanHexColor(colorStr?: string): string | null {
  if (!colorStr) return null;
  let c = colorStr.trim().replace(/^#/, '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  if (c.length === 6) {
    return c.toUpperCase();
  }
  if (c.length === 8) {
    // If RGBA or ARGB, take RGB
    return c.slice(2).toUpperCase();
  }
  return null;
}

/**
 * Builds an ExcelJS Workbook with exact styles, colors, alignments, borders, and content.
 */
export async function generateExcelBlob(sheet: ExtractedSheet): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Paper to Excel AI';
  workbook.lastModifiedBy = 'Paper to Excel AI';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Clean sheet name: max 31 characters, no invalid characters: \ / ? * : [ ]
  const safeTitle = (sheet.title || 'Sheet1')
    .replace(/[\\/?*:[\]]/g, ' ')
    .trim()
    .slice(0, 31) || 'Sheet1';

  const worksheet = workbook.addWorksheet(safeTitle, {
    views: [{ rightToLeft: !!sheet.isRtl }],
    properties: {
      defaultRowHeight: 24,
    }
  });

  // Configure column widths
  const effectiveColCount = Math.max(
    sheet.colCount || 1,
    ...sheet.cells.map(c => (c.c + (c.colSpan || 1)))
  );

  for (let c = 1; c <= effectiveColCount; c++) {
    const colIdx = c - 1;
    const customWidth = sheet.columnWidths?.[colIdx];
    worksheet.getColumn(c).width = customWidth ? Math.max(12, customWidth) : 18;
  }

  // Configure row heights if available
  if (sheet.rowHeights && sheet.rowHeights.length > 0) {
    sheet.rowHeights.forEach((height, rIdx) => {
      if (height) {
        worksheet.getRow(rIdx + 1).height = Math.max(20, height);
      }
    });
  }

  // Track merged regions to avoid duplicate merge calls
  const mergedRanges = new Set<string>();

  // Apply cell values and styles
  for (const cell of sheet.cells) {
    const excelRow = cell.r + 1;
    const excelCol = cell.c + 1;
    const excelCell = worksheet.getCell(excelRow, excelCol);

    // Value or formula
    if (cell.f) {
      const formulaStr = cell.f.startsWith('=') ? cell.f.slice(1) : cell.f;
      excelCell.value = {
        formula: formulaStr,
        result: cell.v,
      };
    } else {
      // Determine if numeric
      if (typeof cell.v === 'number') {
        excelCell.value = cell.v;
      } else if (cell.t === 'number' && !isNaN(Number(cell.v)) && cell.v !== '') {
        excelCell.value = Number(cell.v);
      } else {
        excelCell.value = cell.v ?? '';
      }
    }

    // Styles
    const s = cell.style || {};
    const fontColorHex = cleanHexColor(s.fontColor);
    const bgColorHex = cleanHexColor(s.bgColor);

    // Font
    const font: Partial<ExcelJS.Font> = {
      name: sheet.isRtl ? 'Arial' : 'Segoe UI',
      size: s.fontSize ? Math.max(9, Math.min(22, s.fontSize)) : 11,
      bold: !!s.bold,
      italic: !!s.italic,
    };
    if (fontColorHex) {
      font.color = { argb: 'FF' + fontColorHex };
    }
    excelCell.font = font;

    // Background fill (colors extracted from paper)
    if (bgColorHex && bgColorHex !== 'FFFFFF') {
      excelCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF' + bgColorHex },
      };
    }

    // Alignment & Reading Order (e.g. Left-to-Right for DD/MM/YYYY dates)
    const readingOrder: 'ltr' | 'rtl' | undefined = s.direction === 'ltr'
      ? 'ltr'
      : s.direction === 'rtl'
      ? 'rtl'
      : undefined;

    excelCell.alignment = {
      horizontal: s.align || (sheet.isRtl ? 'right' : 'left'),
      vertical: s.verticalAlign || 'middle',
      wrapText: true,
      ...(readingOrder ? { readingOrder } : {}),
    };

    // Number / Date Format (e.g. DD/MM/YYYY)
    if (s.numFmt) {
      excelCell.numFmt = s.numFmt;
    }

    // Border
    const borderStyle = s.border?.style || 'thin';
    const borderColorHex = cleanHexColor(s.border?.color) || 'CBD5E1';
    const bColor = { argb: 'FF' + borderColorHex };

    excelCell.border = {
      top: s.border?.top !== false ? { style: borderStyle, color: bColor } : undefined,
      bottom: s.border?.bottom !== false ? { style: borderStyle, color: bColor } : undefined,
      left: s.border?.left !== false ? { style: borderStyle, color: bColor } : undefined,
      right: s.border?.right !== false ? { style: borderStyle, color: bColor } : undefined,
    };

    // Merge cells handling
    const rowSpan = cell.rowSpan || 1;
    const colSpan = cell.colSpan || 1;
    if (rowSpan > 1 || colSpan > 1) {
      const endRow = excelRow + rowSpan - 1;
      const endCol = excelCol + colSpan - 1;
      const rangeKey = `${excelRow},${excelCol}:${endRow},${endCol}`;
      if (!mergedRanges.has(rangeKey)) {
        mergedRanges.add(rangeKey);
        try {
          worksheet.mergeCells(excelRow, excelCol, endRow, endCol);
        } catch {
          // Gracefully skip overlapping merge if any
        }
      }
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * Prompts user to download generated Excel file
 */
export function downloadExcelFile(blob: Blob, filename?: string): void {
  const finalName = filename?.endsWith('.xlsx')
    ? filename
    : `${filename || 'paper_document'}.xlsx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
