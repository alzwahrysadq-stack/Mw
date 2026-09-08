import { ParsedInvoiceItem, ExtractedSheet, ExtractedCell, CellStyle } from '../types';
import { normalizeDateDMY } from './dateFormatter';

/**
 * The User's Strict Accounting Template:
 * - Direction: RTL (Right to Left / من اليمين إلى اليسار)
 * - Row 0: صف فارغ (Empty row)
 * - Row 1: الترويسة (Header) [تاريخ المرجع | نوع المرجع | رقم المرجع | البند | المبلغ | البيان | المستفيد | الشركة المزودة]
 * - Row 2+: صفوف البيانات مع ترك خانة "البند" فارغة تماماً
 * - Date format: يوم/شهر/سنة من اليسار لليمين (DD/MM/YYYY)
 * - Final Row: صف الإجمالي الكلي للمبالغ
 */
export const TEMPLATE_COLUMNS = [
  'تاريخ المرجع',
  'نوع المرجع',
  'رقم المرجع',
  'البند',
  'المبلغ',
  'البيان',
  'المستفيد',
  'الشركة المزودة',
] as const;

export function convertInvoicesToTemplateSheet(
  items: ParsedInvoiceItem[],
  customTitle = 'كشف مفرغ الفواتير والإشعارات'
): ExtractedSheet {
  const headers = [...TEMPLATE_COLUMNS];
  const colCount = headers.length; // 8 columns

  // Row 0: Empty row
  // Row 1: Headers
  // Rows 2 .. (items.length + 1): Data rows
  // Row (items.length + 2): Grand total row
  const rowCount = items.length + 3;
  const cells: ExtractedCell[] = [];

  // 1. Empty Row (Row 0): subtle styling
  const emptyRowStyle: CellStyle = {
    bgColor: '#FFFFFF',
    fontColor: '#94A3B8',
    fontSize: 11,
    align: 'center',
    verticalAlign: 'middle',
    border: {
      top: false,
      bottom: true,
      left: false,
      right: false,
      color: '#E2E8F0',
      style: 'thin',
    },
  };

  for (let c = 0; c < colCount; c++) {
    cells.push({
      r: 0,
      c,
      v: '',
      t: 'string',
      style: emptyRowStyle,
    });
  }

  // 2. Header Style (Row 1)
  const headerStyle: CellStyle = {
    bold: true,
    bgColor: '#1E3A8A', // Classic Deep Navy Blue for official ledgers
    fontColor: '#FFFFFF',
    fontSize: 12,
    align: 'center',
    verticalAlign: 'middle',
    border: {
      top: true,
      bottom: true,
      left: true,
      right: true,
      color: '#172554',
      style: 'medium',
    },
  };

  headers.forEach((h, colIdx) => {
    cells.push({
      r: 1,
      c: colIdx,
      v: h,
      t: 'string',
      style: headerStyle,
    });
  });

  let grandTotal = 0;

  // 3. Data Rows (Row 2 to items.length + 1)
  items.forEach((item, idx) => {
    const rowIdx = idx + 2;
    const itemAmount = Number(item.amount ?? item.totalAmount ?? 0);
    grandTotal += isNaN(itemAmount) ? 0 : itemAmount;

    const isEven = idx % 2 === 1;
    const rowBg = isEven ? '#F8FAFC' : '#FFFFFF';

    const cellBaseStyle = (
      align: 'left' | 'center' | 'right' = 'right',
      isBold = false,
      customBg?: string,
      customColor?: string
    ): CellStyle => ({
      bold: isBold,
      bgColor: customBg || rowBg,
      fontColor: customColor || '#0F172A',
      fontSize: 11,
      align,
      verticalAlign: 'middle',
      border: {
        top: true,
        bottom: true,
        left: true,
        right: true,
        color: '#CBD5E1',
        style: 'thin',
      },
    });

    // Col 0: تاريخ المرجع (من اليسار إلى اليمين: يوم/شهر/سنة DD/MM/YYYY)
    const formattedDate = normalizeDateDMY(item.date);
    cells.push({
      r: rowIdx,
      c: 0,
      v: formattedDate,
      t: 'string',
      style: {
        ...cellBaseStyle('center'),
        direction: 'ltr',
        numFmt: 'DD/MM/YYYY',
      },
    });

    // Col 1: نوع المرجع (Reference / Document Type)
    cells.push({
      r: rowIdx,
      c: 1,
      v: item.referenceType || item.docTypeLabel || 'فاتورة',
      t: 'string',
      style: cellBaseStyle('center'),
    });

    // Col 2: رقم المرجع (Reference / Invoice Number)
    cells.push({
      r: rowIdx,
      c: 2,
      v: item.referenceNumber || item.invoiceNumber || 'بدون رقم',
      t: 'string',
      style: cellBaseStyle('center', true),
    });

    // Col 3: البند (Item / Category - Left blank as requested: "والبنود اتركها فارغه")
    cells.push({
      r: rowIdx,
      c: 3,
      v: item.itemCategory || '',
      t: 'string',
      style: cellBaseStyle('center'),
    });

    // Col 4: المبلغ (Amount - Numeric with bold)
    cells.push({
      r: rowIdx,
      c: 4,
      v: itemAmount,
      t: 'number',
      style: cellBaseStyle('center', true, isEven ? '#F1F5F9' : '#F8FAFC', '#0369A1'),
    });

    // Col 5: البيان (Statement / Description)
    cells.push({
      r: rowIdx,
      c: 5,
      v: item.statement || item.itemsSummary || 'بدون بيان مفصل',
      t: 'string',
      style: cellBaseStyle('right'),
    });

    // Col 6: المستفيد (Beneficiary / Customer)
    cells.push({
      r: rowIdx,
      c: 6,
      v: item.beneficiary || item.customerName || '',
      t: 'string',
      style: cellBaseStyle('right', true),
    });

    // Col 7: الشركة المزودة (Provider Company / Supplier)
    cells.push({
      r: rowIdx,
      c: 7,
      v: item.providerCompany || item.notes || '',
      t: 'string',
      style: cellBaseStyle('right'),
    });
  });

  // 4. Grand Total Row (Row items.length + 2)
  const totalRowIdx = items.length + 2;
  const totalLabelStyle: CellStyle = {
    bold: true,
    bgColor: '#E2E8F0',
    fontColor: '#0F172A',
    fontSize: 12,
    align: 'center',
    verticalAlign: 'middle',
    border: {
      top: true,
      bottom: true,
      left: true,
      right: true,
      color: '#64748B',
      style: 'medium',
    },
  };

  const totalAmountStyle: CellStyle = {
    bold: true,
    bgColor: '#FEF3C7', // Warm amber tint for prominent grand total
    fontColor: '#92400E',
    fontSize: 13,
    align: 'center',
    verticalAlign: 'middle',
    border: {
      top: true,
      bottom: true,
      left: true,
      right: true,
      color: '#D97706',
      style: 'medium',
    },
  };

  // Merge Col 0 to 3 for 'الإجمالي الكلي'
  cells.push({
    r: totalRowIdx,
    c: 0,
    v: 'الإجمالي الكلي',
    t: 'string',
    style: totalLabelStyle,
    colSpan: 4,
  });

  // Col 4: Grand total amount
  cells.push({
    r: totalRowIdx,
    c: 4,
    v: grandTotal,
    t: 'number',
    style: totalAmountStyle,
  });

  // Col 5: Items count & summary
  cells.push({
    r: totalRowIdx,
    c: 5,
    v: `عدد المستندات: ${items.length}`,
    t: 'string',
    style: totalLabelStyle,
  });

  // Col 6 & 7: Empty for balance
  cells.push({
    r: totalRowIdx,
    c: 6,
    v: '',
    t: 'string',
    style: totalLabelStyle,
  });
  cells.push({
    r: totalRowIdx,
    c: 7,
    v: '',
    t: 'string',
    style: totalLabelStyle,
  });

  // Balanced column widths for clean readability
  const columnWidths = [
    16, // التاريخ
    18, // نوع المرجع
    18, // رقم المرجع
    14, // البند (فارغ)
    18, // المبلغ
    48, // البيان
    26, // المستفيد
    26, // الشركة المزودة
  ];

  const rowHeights = [
    24, // Row 0 (Empty row)
    32, // Row 1 (Headers)
    ...items.map(() => 28), // Data rows
    30, // Total row
  ];

  return {
    title: customTitle,
    rowCount,
    colCount,
    isRtl: true,
    detectedLanguage: 'ar',
    columnWidths,
    rowHeights,
    cells,
    summary: `تم تفريغ ${items.length} مستند بنجاح في القالب المالي المعتمد بإجمالي قدره ${grandTotal.toLocaleString('ar-EG')}`,
  };
}
