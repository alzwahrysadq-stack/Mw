import { SamplePaper } from '../types';
import { convertInvoicesToTemplateSheet } from '../utils/templateConverter';

export const SAMPLE_PAPERS: SamplePaper[] = [
  {
    id: 'user_custom_template',
    name: 'القالب المالي المعتمد (8 أعمدة مخصصة)',
    category: 'قالب الفواتير المعتمد',
    description: 'قالب إكسل من اليمين لليسار يبدأ بصف فارغ، ثم الترويسة: تاريخ المرجع (يوم/شهر/سنة LTR) | نوع المرجع | رقم المرجع | البند (فارغ) | المبلغ | البيان | المستفيد | الشركة المزودة.',
    data: convertInvoicesToTemplateSheet([
      {
        id: 'sample-inv-1',
        pageNumber: 1,
        date: '15/05/2024',
        referenceType: 'فاتورة مبيعات',
        referenceNumber: 'INV-1042',
        itemCategory: '',
        amount: 3335.00,
        statement: 'شاشات حاسوب 34 بوصة (2 حبة) وتجهيزات مكتبية',
        beneficiary: 'مؤسسة الرواد للتجارة والمقاولات',
        providerCompany: 'شركة التقنية الحديثة المحدودة',
        docType: 'computer_invoice',
        docTypeLabel: 'فاتورة مبيعات',
        invoiceNumber: 'INV-1042',
        customerName: 'مؤسسة الرواد للتجارة والمقاولات',
        totalAmount: 3335.00,
        currency: 'ريال',
        itemsSummary: 'شاشات حاسوب 34 بوصة (2 حبة) وتجهيزات مكتبية',
        notes: 'شركة التقنية الحديثة المحدودة',
      },
      {
        id: 'sample-inv-2',
        pageNumber: 2,
        date: '18/05/2024',
        referenceType: 'سند صرف',
        referenceNumber: 'RC-509',
        itemCategory: '',
        amount: 1104.00,
        statement: 'لوحات مفاتيح ميكانيكية لاسلكية وكابلات توصيل',
        beneficiary: 'قسم الصيانة وتكنولوجيا المعلومات',
        providerCompany: 'مؤسسة الأجهزة الذكية',
        docType: 'manual_invoice',
        docTypeLabel: 'سند صرف',
        invoiceNumber: 'RC-509',
        customerName: 'قسم الصيانة وتكنولوجيا المعلومات',
        totalAmount: 1104.00,
        currency: 'ريال',
        itemsSummary: 'لوحات مفاتيح ميكانيكية لاسلكية وكابلات توصيل',
        notes: 'مؤسسة الأجهزة الذكية',
      },
      {
        id: 'sample-inv-3',
        pageNumber: 3,
        date: '20/05/2024',
        referenceType: 'إشعار حوالة',
        referenceNumber: 'TR-8821',
        itemCategory: '',
        amount: 2450.00,
        statement: 'سداد دفعة مشتريات شهرية وتوريدات مستودع',
        beneficiary: 'مصرف الراجحي - حساب المورد',
        providerCompany: 'مجموعة الموردين المعتمدين',
        docType: 'bank_transfer',
        docTypeLabel: 'إشعار حوالة',
        invoiceNumber: 'TR-8821',
        customerName: 'مصرف الراجحي - حساب المورد',
        totalAmount: 2450.00,
        currency: 'ريال',
        itemsSummary: 'سداد دفعة مشتريات شهرية وتوريدات مستودع',
        notes: 'مجموعة الموردين المعتمدين',
      },
    ], 'كشف الفواتير والإشعارات - القالب المعتمد'),
  },
  {
    id: 'invoice_ar',
    name: 'فاتورة مبيعات وضريبة (Invoice)',
    category: 'فواتير ومحاسبة',
    description: 'فاتورة ضريبية رسمية تتضمن ترويسة باللون الكحلي، وأعمدة الكميات والأسعار والإجمالي وضريبة القيمة المضافة.',
    data: {
      title: 'فاتورة ضريبية رقم 1042',
      isRtl: true,
      rowCount: 9,
      colCount: 6,
      columnWidths: [8, 26, 12, 14, 14, 16],
      rowHeights: [36, 26, 24, 24, 24, 24, 26, 26, 28],
      summary: 'فاتورة مبيعات أجهزة وخدمات تقنية مع ضريبة القيمة المضافة 15%',
      detectedLanguage: 'العربية',
      cells: [
        // Title Row (Merged)
        {
          r: 0, c: 0, colSpan: 6, rowSpan: 1,
          v: 'شركة آفاق المستقبل للتجارة - فاتورة مبيعات ضريبية #1042',
          style: {
            bold: true,
            fontSize: 14,
            bgColor: '#1E3A8A',
            fontColor: '#FFFFFF',
            align: 'center',
            border: { style: 'medium', color: '#1E3A8A' }
          }
        },
        // Header Row
        {
          r: 1, c: 0, v: 'م',
          style: { bold: true, bgColor: '#3B82F6', fontColor: '#FFFFFF', align: 'center' }
        },
        {
          r: 1, c: 1, v: 'بيان الصنف / الخدمة',
          style: { bold: true, bgColor: '#3B82F6', fontColor: '#FFFFFF', align: 'right' }
        },
        {
          r: 1, c: 2, v: 'الكمية',
          style: { bold: true, bgColor: '#3B82F6', fontColor: '#FFFFFF', align: 'center' }
        },
        {
          r: 1, c: 3, v: 'سعر الوحدة (ر.س)',
          style: { bold: true, bgColor: '#3B82F6', fontColor: '#FFFFFF', align: 'center' }
        },
        {
          r: 1, c: 4, v: 'الضريبة 15%',
          style: { bold: true, bgColor: '#3B82F6', fontColor: '#FFFFFF', align: 'center' }
        },
        {
          r: 1, c: 5, v: 'الإجمالي النهائي',
          style: { bold: true, bgColor: '#3B82F6', fontColor: '#FFFFFF', align: 'center' }
        },

        // Item 1
        { r: 2, c: 0, v: 1, t: 'number', style: { align: 'center', bgColor: '#F8FAFC' } },
        { r: 2, c: 1, v: 'شاشة حاسوب UltraWide 34 بوصة', style: { bgColor: '#F8FAFC' } },
        { r: 2, c: 2, v: 2, t: 'number', style: { align: 'center', bgColor: '#F8FAFC' } },
        { r: 2, c: 3, v: 1450.00, t: 'number', style: { align: 'center', bgColor: '#F8FAFC' } },
        { r: 2, c: 4, v: 435.00, t: 'number', style: { align: 'center', bgColor: '#F8FAFC' } },
        { r: 2, c: 5, v: 3335.00, t: 'number', style: { align: 'center', bold: true, bgColor: '#F8FAFC' } },

        // Item 2
        { r: 3, c: 0, v: 2, t: 'number', style: { align: 'center', bgColor: '#FFFFFF' } },
        { r: 3, c: 1, v: 'لوحة مفاتيح ميكانيكية لاسلكية', style: { bgColor: '#FFFFFF' } },
        { r: 3, c: 2, v: 3, t: 'number', style: { align: 'center', bgColor: '#FFFFFF' } },
        { r: 3, c: 3, v: 320.00, t: 'number', style: { align: 'center', bgColor: '#FFFFFF' } },
        { r: 3, c: 4, v: 144.00, t: 'number', style: { align: 'center', bgColor: '#FFFFFF' } },
        { r: 3, c: 5, v: 1104.00, t: 'number', style: { align: 'center', bold: true, bgColor: '#FFFFFF' } },

        // Item 3
        { r: 4, c: 0, v: 3, t: 'number', style: { align: 'center', bgColor: '#F8FAFC' } },
        { r: 4, c: 1, v: 'حامل شاشات ألمنيوم هيدروليك', style: { bgColor: '#F8FAFC' } },
        { r: 4, c: 2, v: 2, t: 'number', style: { align: 'center', bgColor: '#F8FAFC' } },
        { r: 4, c: 3, v: 210.00, t: 'number', style: { align: 'center', bgColor: '#F8FAFC' } },
        { r: 4, c: 4, v: 63.00, t: 'number', style: { align: 'center', bgColor: '#F8FAFC' } },
        { r: 4, c: 5, v: 483.00, t: 'number', style: { align: 'center', bold: true, bgColor: '#F8FAFC' } },

        // Item 4
        { r: 5, c: 0, v: 4, t: 'number', style: { align: 'center', bgColor: '#FFFFFF' } },
        { r: 5, c: 1, v: 'خدمة التوصيل والتركيب الميداني', style: { bgColor: '#FFFFFF' } },
        { r: 5, c: 2, v: 1, t: 'number', style: { align: 'center', bgColor: '#FFFFFF' } },
        { r: 5, c: 3, v: 150.00, t: 'number', style: { align: 'center', bgColor: '#FFFFFF' } },
        { r: 5, c: 4, v: 22.50, t: 'number', style: { align: 'center', bgColor: '#FFFFFF' } },
        { r: 5, c: 5, v: 172.50, t: 'number', style: { align: 'center', bold: true, bgColor: '#FFFFFF' } },

        // Summary Subtotal
        {
          r: 6, c: 0, colSpan: 4,
          v: 'المجموع قبل الضريبة (Subtotal)',
          style: { bold: true, align: 'right', bgColor: '#EFF6FF', fontColor: '#1E3A8A' }
        },
        {
          r: 6, c: 4, colSpan: 2,
          v: '4,430.00 ر.س',
          style: { bold: true, align: 'center', bgColor: '#EFF6FF', fontColor: '#1E3A8A' }
        },

        // Total Tax
        {
          r: 7, c: 0, colSpan: 4,
          v: 'إجمالي ضريبة القيمة المضافة 15% (VAT)',
          style: { bold: true, align: 'right', bgColor: '#FEF3C7', fontColor: '#92400E' }
        },
        {
          r: 7, c: 4, colSpan: 2,
          v: '664.50 ر.س',
          style: { bold: true, align: 'center', bgColor: '#FEF3C7', fontColor: '#92400E' }
        },

        // Grand Total
        {
          r: 8, c: 0, colSpan: 4,
          v: 'المبلغ الإجمالي المستحق للدفع (Grand Total)',
          style: { bold: true, fontSize: 12, align: 'right', bgColor: '#10B981', fontColor: '#FFFFFF' }
        },
        {
          r: 8, c: 4, colSpan: 2,
          v: '5,094.50 ر.س',
          style: { bold: true, fontSize: 13, align: 'center', bgColor: '#059669', fontColor: '#FFFFFF' }
        }
      ]
    }
  },
  {
    id: 'grades_sheet',
    name: 'كشف درجات ونتائج الطلاب (Academic Grades)',
    category: 'مؤسسات تعليمية',
    description: 'جدول أكاديمي رسمي يتضمن أسماء الطلاب، درجات المواد، المعدل العام، وحالة النتيجة بالألوان المميزة.',
    data: {
      title: 'كشف الدرجات الفصلي - شعبة أ',
      isRtl: true,
      rowCount: 8,
      colCount: 7,
      columnWidths: [8, 22, 12, 12, 12, 14, 16],
      summary: 'سجل رصد نتائج اختبارات الفصل الدراسي الأول للعام 2026',
      detectedLanguage: 'العربية',
      cells: [
        {
          r: 0, c: 0, colSpan: 7,
          v: 'وزارة التعليم - كشف درجات الفصل الدراسي الأول',
          style: { bold: true, fontSize: 13, bgColor: '#065F46', fontColor: '#FFFFFF', align: 'center' }
        },
        { r: 1, c: 0, v: 'رقم', style: { bold: true, bgColor: '#059669', fontColor: '#FFFFFF', align: 'center' } },
        { r: 1, c: 1, v: 'اسم الطالب', style: { bold: true, bgColor: '#059669', fontColor: '#FFFFFF', align: 'right' } },
        { r: 1, c: 2, v: 'الرياضيات', style: { bold: true, bgColor: '#059669', fontColor: '#FFFFFF', align: 'center' } },
        { r: 1, c: 3, v: 'العلوم', style: { bold: true, bgColor: '#059669', fontColor: '#FFFFFF', align: 'center' } },
        { r: 1, c: 4, v: 'اللغة الإنجليزية', style: { bold: true, bgColor: '#059669', fontColor: '#FFFFFF', align: 'center' } },
        { r: 1, c: 5, v: 'المعدل العام', style: { bold: true, bgColor: '#059669', fontColor: '#FFFFFF', align: 'center' } },
        { r: 1, c: 6, v: 'التقدير النهائي', style: { bold: true, bgColor: '#059669', fontColor: '#FFFFFF', align: 'center' } },

        // Row 1
        { r: 2, c: 0, v: 101, style: { align: 'center' } },
        { r: 2, c: 1, v: 'عبدالرحمن محمد السالم', style: { bold: true } },
        { r: 2, c: 2, v: 98, t: 'number', style: { align: 'center' } },
        { r: 2, c: 3, v: 95, t: 'number', style: { align: 'center' } },
        { r: 2, c: 4, v: 97, t: 'number', style: { align: 'center' } },
        { r: 2, c: 5, v: 96.6, t: 'number', style: { align: 'center', bold: true } },
        { r: 2, c: 6, v: 'ممتاز مرتفع ★', style: { align: 'center', bgColor: '#DCFCE7', fontColor: '#166534', bold: true } },

        // Row 2
        { r: 3, c: 0, v: 102, style: { align: 'center', bgColor: '#F9FAFB' } },
        { r: 3, c: 1, v: 'سارة خالد المنصور', style: { bold: true, bgColor: '#F9FAFB' } },
        { r: 3, c: 2, v: 92, t: 'number', style: { align: 'center', bgColor: '#F9FAFB' } },
        { r: 3, c: 3, v: 89, t: 'number', style: { align: 'center', bgColor: '#F9FAFB' } },
        { r: 3, c: 4, v: 94, t: 'number', style: { align: 'center', bgColor: '#F9FAFB' } },
        { r: 3, c: 5, v: 91.6, t: 'number', style: { align: 'center', bold: true, bgColor: '#F9FAFB' } },
        { r: 3, c: 6, v: 'ممتاز', style: { align: 'center', bgColor: '#DCFCE7', fontColor: '#166534', bold: true } },

        // Row 3
        { r: 4, c: 0, v: 103, style: { align: 'center' } },
        { r: 4, c: 1, v: 'فيصل عمر الراجحي', style: { bold: true } },
        { r: 4, c: 2, v: 84, t: 'number', style: { align: 'center' } },
        { r: 4, c: 3, v: 86, t: 'number', style: { align: 'center' } },
        { r: 4, c: 4, v: 82, t: 'number', style: { align: 'center' } },
        { r: 4, c: 5, v: 84.0, t: 'number', style: { align: 'center', bold: true } },
        { r: 4, c: 6, v: 'جيد جداً', style: { align: 'center', bgColor: '#DBEAFE', fontColor: '#1E40AF', bold: true } },

        // Row 4
        { r: 5, c: 0, v: 104, style: { align: 'center', bgColor: '#F9FAFB' } },
        { r: 5, c: 1, v: 'نورة إبراهيم الشمري', style: { bold: true, bgColor: '#F9FAFB' } },
        { r: 5, c: 2, v: 78, t: 'number', style: { align: 'center', bgColor: '#F9FAFB' } },
        { r: 5, c: 3, v: 80, t: 'number', style: { align: 'center', bgColor: '#F9FAFB' } },
        { r: 5, c: 4, v: 76, t: 'number', style: { align: 'center', bgColor: '#F9FAFB' } },
        { r: 5, c: 5, v: 78.0, t: 'number', style: { align: 'center', bold: true, bgColor: '#F9FAFB' } },
        { r: 5, c: 6, v: 'جيد', style: { align: 'center', bgColor: '#FEF3C7', fontColor: '#92400E', bold: true } },

        // Averages
        {
          r: 6, c: 0, colSpan: 2,
          v: 'متوسط درجات المواد',
          style: { bold: true, align: 'right', bgColor: '#F3F4F6' }
        },
        { r: 6, c: 2, v: 88.0, t: 'number', style: { align: 'center', bold: true, bgColor: '#F3F4F6' } },
        { r: 6, c: 3, v: 87.5, t: 'number', style: { align: 'center', bold: true, bgColor: '#F3F4F6' } },
        { r: 6, c: 4, v: 87.2, t: 'number', style: { align: 'center', bold: true, bgColor: '#F3F4F6' } },
        { r: 6, c: 5, v: 87.5, t: 'number', style: { align: 'center', bold: true, bgColor: '#E5E7EB' } },
        { r: 6, c: 6, v: 'نسبة النجاح: 100%', style: { align: 'center', bold: true, bgColor: '#DCFCE7', fontColor: '#166534' } },

        // Footer note
        {
          r: 7, c: 0, colSpan: 7,
          v: 'تم الاعتماد من إدارة الكنترول وشؤون الطلاب في 2026/01/15',
          style: { italic: true, fontSize: 9, align: 'center', fontColor: '#6B7280', bgColor: '#FFFFFF' }
        }
      ]
    }
  },
  {
    id: 'expense_report',
    name: 'جدول مصاريف وميزانية المشاريع (Budget Tracker)',
    category: 'إدارة ومشاريع',
    description: 'جدول تفصيلي للبنود والتكاليف المقدرة مقابل الفعلية مع نسب الانحراف بالألوان الحمراء والخضراء.',
    data: {
      title: 'تقرير ميزانية مشروع التطوير 2026',
      isRtl: true,
      rowCount: 7,
      colCount: 6,
      columnWidths: [8, 26, 16, 16, 14, 14],
      summary: 'مقارنة التكاليف المخططة مع المصروفات الفعلية',
      detectedLanguage: 'العربية',
      cells: [
        {
          r: 0, c: 0, colSpan: 6,
          v: 'متابعة ميزانية الربع الأول - مشروع التحول الرقمي',
          style: { bold: true, fontSize: 13, bgColor: '#4C1D95', fontColor: '#FFFFFF', align: 'center' }
        },
        { r: 1, c: 0, v: 'كود', style: { bold: true, bgColor: '#6D28D9', fontColor: '#FFFFFF', align: 'center' } },
        { r: 1, c: 1, v: 'بند المصروف', style: { bold: true, bgColor: '#6D28D9', fontColor: '#FFFFFF', align: 'right' } },
        { r: 1, c: 2, v: 'الميزانية المعتمدة', style: { bold: true, bgColor: '#6D28D9', fontColor: '#FFFFFF', align: 'center' } },
        { r: 1, c: 3, v: 'المصروف الفعلي', style: { bold: true, bgColor: '#6D28D9', fontColor: '#FFFFFF', align: 'center' } },
        { r: 1, c: 4, v: 'الفارق (ريال)', style: { bold: true, bgColor: '#6D28D9', fontColor: '#FFFFFF', align: 'center' } },
        { r: 1, c: 5, v: 'حالة الصرف', style: { bold: true, bgColor: '#6D28D9', fontColor: '#FFFFFF', align: 'center' } },

        // Row 1
        { r: 2, c: 0, v: 'EXP-01', style: { align: 'center' } },
        { r: 2, c: 1, v: 'تطوير وتصميم واجهات المستخدم', style: { bold: true } },
        { r: 2, c: 2, v: 25000, t: 'number', style: { align: 'center' } },
        { r: 2, c: 3, v: 23200, t: 'number', style: { align: 'center' } },
        { r: 2, c: 4, v: '+1,800', style: { align: 'center', bold: true, fontColor: '#059669' } },
        { r: 2, c: 5, v: 'ضمن الميزانية', style: { align: 'center', bgColor: '#DCFCE7', fontColor: '#166534', bold: true } },

        // Row 2
        { r: 3, c: 0, v: 'EXP-02', style: { align: 'center', bgColor: '#F9FAFB' } },
        { r: 3, c: 1, v: 'خوادم الحوسبة السحابية والأمان', style: { bold: true, bgColor: '#F9FAFB' } },
        { r: 3, c: 2, v: 12000, t: 'number', style: { align: 'center', bgColor: '#F9FAFB' } },
        { r: 3, c: 3, v: 14500, t: 'number', style: { align: 'center', bgColor: '#F9FAFB' } },
        { r: 3, c: 4, v: '-2,500', style: { align: 'center', bold: true, fontColor: '#DC2626', bgColor: '#FEE2E2' } },
        { r: 3, c: 5, v: 'تجاوز طفيف', style: { align: 'center', bgColor: '#FEE2E2', fontColor: '#991B1B', bold: true } },

        // Row 3
        { r: 4, c: 0, v: 'EXP-03', style: { align: 'center' } },
        { r: 4, c: 1, v: 'تدريب فريق العمل وورش الدعم', style: { bold: true } },
        { r: 4, c: 2, v: 8000, t: 'number', style: { align: 'center' } },
        { r: 4, c: 3, v: 7500, t: 'number', style: { align: 'center' } },
        { r: 4, c: 4, v: '+500', style: { align: 'center', bold: true, fontColor: '#059669' } },
        { r: 4, c: 5, v: 'ضمن الميزانية', style: { align: 'center', bgColor: '#DCFCE7', fontColor: '#166534', bold: true } },

        // Totals
        {
          r: 5, c: 0, colSpan: 2,
          v: 'الإجمالي العام',
          style: { bold: true, align: 'right', bgColor: '#EDE9FE', fontColor: '#4C1D95' }
        },
        { r: 5, c: 2, v: 45000, t: 'number', style: { align: 'center', bold: true, bgColor: '#EDE9FE' } },
        { r: 5, c: 3, v: 45200, t: 'number', style: { align: 'center', bold: true, bgColor: '#EDE9FE' } },
        { r: 5, c: 4, v: '-200', style: { align: 'center', bold: true, fontColor: '#DC2626', bgColor: '#EDE9FE' } },
        { r: 5, c: 5, v: 'متوازن (99.5%)', style: { align: 'center', bold: true, bgColor: '#EDE9FE', fontColor: '#4C1D95' } },

        {
          r: 6, c: 0, colSpan: 6,
          v: 'ملاحظة: كافة المبالغ بالريال السعودي وغير شاملة رسوم التسجيل الحكومية.',
          style: { italic: true, fontSize: 9, align: 'center', fontColor: '#6B7280' }
        }
      ]
    }
  },
  {
    id: 'multi_pdf_invoices_batch',
    name: 'كشف مفرغ فواتير وإشعارات متعددة (PDF / صور مختلطة)',
    category: 'قالب الفواتير والإشعارات الموحد',
    description: 'نموذج مطبق عليه شروط التصفية الصارمة: استخراج رقم الفاتورة والعميل والتاريخ والمبلغ وبيان الأصناف والأعداد (دش مختصر).',
    data: {
      title: 'كشف تفريغ الفواتير والإشعارات المتنوعة',
      isRtl: true,
      rowCount: 6,
      colCount: 9,
      columnWidths: [8, 18, 20, 26, 14, 48, 18, 10, 20],
      rowHeights: [32, 28, 28, 28, 28, 30],
      summary: 'تفريغ 4 فواتير متنوعة (يدوية، حرارية، كمبيوتر، إشعار حوالة) بدقة وحساب الإجمالي',
      detectedLanguage: 'العربية',
      cells: [
        // Header
        { r: 0, c: 0, v: 'م', style: { bold: true, bgColor: '#0F766E', fontColor: '#FFFFFF', align: 'center' } },
        { r: 0, c: 1, v: 'نوع المستند', style: { bold: true, bgColor: '#0F766E', fontColor: '#FFFFFF', align: 'center' } },
        { r: 0, c: 2, v: 'رقم الفاتورة / المرجع', style: { bold: true, bgColor: '#0F766E', fontColor: '#FFFFFF', align: 'center' } },
        { r: 0, c: 3, v: 'اسم العميل / المستفيد', style: { bold: true, bgColor: '#0F766E', fontColor: '#FFFFFF', align: 'right' } },
        { r: 0, c: 4, v: 'التاريخ', style: { bold: true, bgColor: '#0F766E', fontColor: '#FFFFFF', align: 'center' } },
        { r: 0, c: 5, v: 'البيان ومحتوى الفاتورة (الأصناف والأعداد)', style: { bold: true, bgColor: '#0F766E', fontColor: '#FFFFFF', align: 'right' } },
        { r: 0, c: 6, v: 'المبلغ الإجمالي', style: { bold: true, bgColor: '#0F766E', fontColor: '#FFFFFF', align: 'center' } },
        { r: 0, c: 7, v: 'العملة', style: { bold: true, bgColor: '#0F766E', fontColor: '#FFFFFF', align: 'center' } },
        { r: 0, c: 8, v: 'ملاحظات / الشركة', style: { bold: true, bgColor: '#0F766E', fontColor: '#FFFFFF', align: 'right' } },

        // Row 1: Manual invoice (Spare parts)
        { r: 1, c: 0, v: 1, t: 'number', style: { align: 'center', bold: true, bgColor: '#F8FAFC' } },
        { r: 1, c: 1, v: 'فاتورة يدوية', style: { align: 'center', bgColor: '#F8FAFC' } },
        { r: 1, c: 2, v: 'INV-4821', style: { align: 'center', bold: true, bgColor: '#F8FAFC' } },
        { r: 1, c: 3, v: 'ورشة الفارس لصيانة السيارات', style: { bold: true, bgColor: '#F8FAFC' } },
        { r: 1, c: 4, v: '2026-03-02', style: { align: 'center', bgColor: '#F8FAFC' } },
        { r: 1, c: 5, v: 'فحمات فرامل سيراميك (4)، مساعدات أمامية ياباني (2)، سير مكينة (1)', style: { bgColor: '#F8FAFC' } },
        { r: 1, c: 6, v: 1850.00, t: 'number', style: { align: 'center', bold: true, bgColor: '#F8FAFC' } },
        { r: 1, c: 7, v: 'ريال', style: { align: 'center', bgColor: '#F8FAFC' } },
        { r: 1, c: 8, v: 'مؤسسة الرمال الذهبية لقطع الغيار', style: { bgColor: '#F8FAFC' } },

        // Row 2: Computer invoice
        { r: 2, c: 0, v: 2, t: 'number', style: { align: 'center', bold: true, bgColor: '#FFFFFF' } },
        { r: 2, c: 1, v: 'فاتورة كمبيوتر', style: { align: 'center', bgColor: '#FFFFFF' } },
        { r: 2, c: 2, v: 'TC-90214', style: { align: 'center', bold: true, bgColor: '#FFFFFF' } },
        { r: 2, c: 3, v: 'شركة التقنية الذكية للحلول', style: { bold: true, bgColor: '#FFFFFF' } },
        { r: 2, c: 4, v: '2026-03-03', style: { align: 'center', bgColor: '#FFFFFF' } },
        { r: 2, c: 5, v: 'راوتر شبكات سيسكو (2)، كابلات إيثرنت Cat6 (10 لفات)', style: { bgColor: '#FFFFFF' } },
        { r: 2, c: 6, v: 4200.00, t: 'number', style: { align: 'center', bold: true, bgColor: '#FFFFFF' } },
        { r: 2, c: 7, v: 'ريال', style: { align: 'center', bgColor: '#FFFFFF' } },
        { r: 2, c: 8, v: 'الرقم الضريبي: 31024987', style: { bgColor: '#FFFFFF' } },

        // Row 3: Bank transfer notice
        { r: 3, c: 0, v: 3, t: 'number', style: { align: 'center', bold: true, bgColor: '#F8FAFC' } },
        { r: 3, c: 1, v: 'إشعار تحويل بنكي', style: { align: 'center', bgColor: '#F8FAFC' } },
        { r: 3, c: 2, v: 'TRX-883019', style: { align: 'center', bold: true, bgColor: '#F8FAFC' } },
        { r: 3, c: 3, v: 'مؤسسة النماء للتوريدات المحدودة', style: { bold: true, bgColor: '#F8FAFC' } },
        { r: 3, c: 4, v: '2026-03-04', style: { align: 'center', bgColor: '#F8FAFC' } },
        { r: 3, c: 5, v: 'سداد دفعة توريد مستلزمات مكتبية حسب أمر الشراء رقم 12', style: { bgColor: '#F8FAFC' } },
        { r: 3, c: 6, v: 7500.00, t: 'number', style: { align: 'center', bold: true, bgColor: '#F8FAFC' } },
        { r: 3, c: 7, v: 'ريال', style: { align: 'center', bgColor: '#F8FAFC' } },
        { r: 3, c: 8, v: 'مصرف الراجحي - إشعار سداد', style: { bgColor: '#F8FAFC' } },

        // Row 4: Thermal Receipt
        { r: 4, c: 0, v: 4, t: 'number', style: { align: 'center', bold: true, bgColor: '#FFFFFF' } },
        { r: 4, c: 1, v: 'فاتورة حرارية', style: { align: 'center', bgColor: '#FFFFFF' } },
        { r: 4, c: 2, v: 'POS-5512', style: { align: 'center', bold: true, bgColor: '#FFFFFF' } },
        { r: 4, c: 3, v: 'عميل نقدي', style: { bold: true, bgColor: '#FFFFFF' } },
        { r: 4, c: 4, v: '2026-03-05', style: { align: 'center', bgColor: '#FFFFFF' } },
        { r: 4, c: 5, v: 'زيت محرك 5W30 تخليقي (5 علب)، فلتر هواء أصلي (1)، ماء رديتر (2)', style: { bgColor: '#FFFFFF' } },
        { r: 4, c: 6, v: 345.00, t: 'number', style: { align: 'center', bold: true, bgColor: '#FFFFFF' } },
        { r: 4, c: 7, v: 'ريال', style: { align: 'center', bgColor: '#FFFFFF' } },
        { r: 4, c: 8, v: 'بترومين إكسبرس - فرع العقيق', style: { bgColor: '#FFFFFF' } },

        // Row 5: Grand Total
        {
          r: 5, c: 0, colSpan: 6,
          v: 'الإجمالي الكلي لجميع الفواتير والمستندات',
          style: { bold: true, align: 'right', bgColor: '#E2E8F0', fontColor: '#0F766E' }
        },
        {
          r: 5, c: 6,
          v: 13895.00,
          t: 'number',
          style: { bold: true, align: 'center', bgColor: '#E2E8F0', fontColor: '#0F766E', fontSize: 12 }
        },
        { r: 5, c: 7, v: 'ريال', style: { bold: true, align: 'center', bgColor: '#E2E8F0', fontColor: '#0F766E' } },
        { r: 5, c: 8, v: 'عدد العمليات: 4 فواتير', style: { bold: true, align: 'center', bgColor: '#E2E8F0', fontColor: '#0F766E' } }
      ]
    }
  }
];
