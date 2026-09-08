export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;
  fontColor?: string; // Hex color (e.g. #000000, #FFFFFF)
  bgColor?: string; // Hex color (e.g. #1E3A8A, #F3F4F6)
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  direction?: 'ltr' | 'rtl'; // Text reading order (e.g. 'ltr' for Day/Month/Year dates)
  numFmt?: string; // Excel format string (e.g. 'DD/MM/YYYY' or '#,##0.00')
  border?: {
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
    color?: string;
    style?: 'thin' | 'medium' | 'double';
  };
}

export interface ExtractedCell {
  r: number; // 0-based row index
  c: number; // 0-based col index
  v: string | number;
  t?: 'string' | 'number' | 'date' | 'formula';
  f?: string; // e.g. =SUM(B2:B10)
  rowSpan?: number;
  colSpan?: number;
  style?: CellStyle;
}

export interface ExtractedSheet {
  title: string;
  isRtl: boolean;
  rowCount: number;
  colCount: number;
  columnWidths?: number[];
  rowHeights?: number[];
  cells: ExtractedCell[];
  summary?: string;
  detectedLanguage?: string;
}

export interface ExtractionResponse {
  success: boolean;
  sheet?: ExtractedSheet;
  error?: string;
}

export interface SamplePaper {
  id: string;
  name: string;
  category: string;
  description: string;
  previewUrl?: string;
  data: ExtractedSheet;
}

/**
 * Filter conditions for smart multi-document / PDF scanner
 */
export interface ExtractionRules {
  extractOnlyTargetHeader: boolean; // Only take invoice number, client/supplier name, date, total amount
  condenseDescriptionToSummary: boolean; // Summarize items as items + count in single description column
  detectDocumentType: boolean; // Distinguish thermal, manual, computer invoice, bank transfer notice
  customColumnTemplate: string[]; // Custom template columns: ['التاريخ', 'نوع المرجع', 'رقم المرجع', 'البند', 'المبلغ', 'البيان', 'المستفيد', 'الشركة المزودة']
}

/**
 * Parsed Document / Invoice item adhering to the user's 8-column accounting template:
 * [التاريخ | نوع المرجع | رقم المرجع | البند (فارغ) | المبلغ | البيان | المستفيد | الشركة المزودة]
 */
export interface ParsedInvoiceItem {
  id: string;
  pageNumber: number;
  fileName?: string;
  thumbnailUrl?: string;

  // Exact 8-column template fields:
  date: string; // التاريخ
  referenceType: string; // نوع المرجع (فاتورة مبيعات، فاتورة مشتريات، سند صرف، سند قبض، إشعار حوالة...)
  referenceNumber: string; // رقم المرجع / رقم الفاتورة
  itemCategory: string; // البند (والبنود اتركها فارغة - always empty "")
  amount: number; // المبلغ
  statement: string; // البيان (محتوى وتفاصيل الفاتورة / الأصناف)
  beneficiary: string; // المستفيد (العميل أو الطرف المستلم)
  providerCompany: string; // الشركة المزودة (المحل، المؤسسة، المورد)

  // Compatibility fields
  docType?: 'manual_invoice' | 'computer_invoice' | 'thermal_receipt' | 'bank_transfer' | 'general';
  docTypeLabel?: string;
  invoiceNumber?: string;
  customerName?: string;
  totalAmount?: number;
  currency?: string;
  itemsSummary?: string;
  notes?: string;
  confidenceScore?: number;
  status?: 'pending' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
}
