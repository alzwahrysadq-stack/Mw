import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Support large image payloads from camera and folder uploads
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ limit: '60mb', extended: true }));

// Initialize Google GenAI client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to strip any data URL prefix reliably
function extractCleanBase64(input: string): string {
  if (!input) return '';
  if (input.includes('base64,')) {
    return input.split('base64,')[1].trim();
  }
  return input.trim();
}

// Normalizes and formats dates to strict Day/Month/Year from left to right (DD/MM/YYYY)
function normalizeDateDMY(dateInput?: string | null): string {
  if (!dateInput || typeof dateInput !== 'string') return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  let str = dateInput.trim();
  for (let i = 0; i < 10; i++) {
    str = str.replace(new RegExp(arabicDigits[i], 'g'), String(i));
    str = str.replace(new RegExp(persianDigits[i], 'g'), String(i));
  }
  const ymdMatch = str.match(/^(?:19|20)\d{2}[/\-. ]\d{1,2}[/\-. ]\d{1,2}/);
  if (ymdMatch) {
    const parts = ymdMatch[0].split(/[/\-. ]/);
    if (parts.length === 3) {
      return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
    }
  }
  const dmyMatch = str.match(/^(\d{1,2})[/\-. ](\d{1,2})[/\-. ]((?:19|20)?\d{2})/);
  if (dmyMatch) {
    let year = dmyMatch[3];
    if (year.length === 2) year = `20${year}`;
    return `${dmyMatch[1].padStart(2, '0')}/${dmyMatch[2].padStart(2, '0')}/${year}`;
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1990 && parsed.getFullYear() < 2100) {
    return `${String(parsed.getDate()).padStart(2, '0')}/${String(parsed.getMonth() + 1).padStart(2, '0')}/${parsed.getFullYear()}`;
  }
  return str;
}

// Resilient Gemini runner with automatic model fallback (3.8-flash -> 3.1-flash-lite -> flash-latest)
async function callGeminiWithFallback(params: {
  contents: any;
  systemInstruction?: string;
  responseSchema?: any;
  temperature?: number;
}): Promise<{ text: string; modelUsed: string }> {
  const ai = getGeminiClient();
  const models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const config: any = {
          temperature: params.temperature ?? 0.1,
          responseMimeType: 'application/json',
        };

        if (params.systemInstruction) {
          config.systemInstruction = params.systemInstruction;
        }

        if (params.responseSchema) {
          config.responseSchema = params.responseSchema;
        }

        // Use ThinkingLevel.LOW for gemini-3 series to maximize throughput & avoid token lag
        if (model.startsWith('gemini-3')) {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
        }

        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config,
        });

        let text = response.text || '';
        text = text.trim();

        // Strip markdown fences if present
        if (text.startsWith('```json')) {
          text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        } else if (text.startsWith('```')) {
          text = text.replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
        }

        if (text.length > 0) {
          return { text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[AI Extraction] Model ${model} (attempt ${attempt}) error: ${err?.message || err}`);
        // Brief backoff before next attempt/model
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    }
  }

  throw lastError || new Error('تعذر استخراج البيانات من جميع نماذج الذكاء الاصطناعي.');
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Analyze document / paper image and extract structured Excel data (Full Sheet)
app.post('/api/analyze-paper', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', userPrompt } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'لم يتم توفير صورة الورقة أو المستند. يرجى التقاط صورة أو اختيار ملف.',
      });
    }

    const cleanBase64 = extractCleanBase64(imageBase64);

    const systemInstruction = `
أنت خبير فائق الذكاء ومتخصص في استخراج الجداول والمستندات والبيانات من صور الأوراق الورقية وتحويلها إلى ملفات إكسل (Excel) مطابقة تماماً بالشكل، والألوان، والتنسيقات، والمحتوى.
تشمل المستندات: فواتير مبيعات، فواتير مشتريات، سندات قبض وصرف، إشعارات بنكية، مستخلصات، فواتير حرارية، وفواتير يمنية/سعودية/عربية رسمية.

مهمتك:
1. تحليل صورة الورقة / المستند بدقة فائقة:
   - تحديد لغة الورقة: إذا كانت بالعربية اجعل isRtl = true، وإذا كانت بالإنجليزية أو لغة يسار-يمين اجعل isRtl = false.
   - تحديد عنوان المستند أو الورقة بدقة (مثال: "فاتورة مبيعات رقم 1025" أو "كشف حساب" أو "سند قبض").
   - استخراج جميع الجداول والبيانات والنصوص والأرقام والتواريخ والمعادلات الحسابية والخصم والإجمالي والعملة (مثل ريال يمني، SAR، USD).
   - استخراج أسماء الأطراف (العميل، المستلم، المحاسب، الصندوق، المخازن).
2. استخراج الألوان والتنسيقات البصرية بدقة:
   - لون خلفية الترويسة (Header Background Color): استخرج كود الـ Hex المقارب للورقة مثل (#1E3A8A أزرق كحلي، #065F46 أخضر، #374151 رمادي، #0F766E).
   - ألوان الخلايا الملونة أو المميزة أو المتبادلة (Zebra stripes مثل #F8FAFC، أو خلفيات الإجمالي #E2E8F0).
   - لون الخط (fontColor): مثل #FFFFFF إذا كانت الخلفية داكنة، أو #0F172A للنصوص العادية.
   - الخط العريض (bold: true) للعناوين والترويسات وصف الإجمالي.
   - المحاذاة (align): 'center' للأرقام والتواريخ والكميات، 'right' للنصوص العربية، 'left' للنصوص الإنجليزية.
   - الخلايا المدمجة (rowSpan / colSpan): إذا كان العنوان الرئيسي يمتد بعرض الجدول اجعل colSpan مساوياً لعدد الأعمدة.
   - حدود الخلايا (borders): حدد لون وشكل الحدود المشابهة للورقة.
   - الأرقام: حدد نوع الخلية t = 'number' وحافظ على الأرقام الحقيقية بدقة تامة.
   - تقدير عرض الأعمدة التقريبي المناسب للمحتوى (columnWidths: أرقام بين 10 و 40).

يجب أن تكون الاستجابة متطابقة مع المخطط (Schema) المعطى بدقة.
`;

    const promptText = userPrompt
      ? `حلل هذه الورقة واستخرج جميع بياناتها وتنسيقاتها وألوانها وجداولها لإكسل: ${userPrompt}`
      : 'حلل هذه الورقة بدقة فائقة واستخرج كل الجداول والبيانات والترويسات والألوان والحدود والمحتوى بدقة ليتم بناؤها كملف إكسل مطابق.';

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: 'عنوان الورقة أو المستند الرئيسي',
        },
        isRtl: {
          type: Type.BOOLEAN,
          description: 'هل اتجاه الورقة من اليمين لليسار (عربي مثلاً)',
        },
        rowCount: {
          type: Type.INTEGER,
          description: 'إجمالي عدد الصفوف',
        },
        colCount: {
          type: Type.INTEGER,
          description: 'إجمالي عدد الأعمدة',
        },
        columnWidths: {
          type: Type.ARRAY,
          items: { type: Type.NUMBER },
          description: 'عرض تقريبي لكل عمود (مثلاً من 10 إلى 35)',
        },
        rowHeights: {
          type: Type.ARRAY,
          items: { type: Type.NUMBER },
          description: 'ارتفاع تقريبي لكل صف بالنقاط (مثلاً 24 إلى 36)',
        },
        summary: {
          type: Type.STRING,
          description: 'ملخص موجز لنوع ومحتوى الورقة المستخرجة',
        },
        detectedLanguage: {
          type: Type.STRING,
          description: 'اللغة المكتشفة في الورقة',
        },
        cells: {
          type: Type.ARRAY,
          description: 'قائمة خلايا الإكسل المستخرجة مع مواقعها وألوانها وتنسيقاتها',
          items: {
            type: Type.OBJECT,
            properties: {
              r: {
                type: Type.INTEGER,
                description: 'رقم الصف بدءاً من 0',
              },
              c: {
                type: Type.INTEGER,
                description: 'رقم العمود بدءاً من 0',
              },
              v: {
                type: Type.STRING,
                description: 'قيمة الخلية كنص أو رقم',
              },
              t: {
                type: Type.STRING,
                description: "نوع البيانات: 'string' | 'number' | 'date' | 'formula'",
              },
              f: {
                type: Type.STRING,
                description: 'صيغة المعادلة إن وجدت مثل =SUM(...)',
              },
              rowSpan: {
                type: Type.INTEGER,
                description: 'عدد الصفوف المدمجة',
              },
              colSpan: {
                type: Type.INTEGER,
                description: 'عدد الأعمدة المدمجة',
              },
              style: {
                type: Type.OBJECT,
                properties: {
                  bold: { type: Type.BOOLEAN },
                  italic: { type: Type.BOOLEAN },
                  fontSize: { type: Type.NUMBER },
                  fontColor: {
                    type: Type.STRING,
                    description: 'كود اللون السداسي Hex مثل #FFFFFF أو #1E293B',
                  },
                  bgColor: {
                    type: Type.STRING,
                    description: 'كود لون الخلفية السداسي Hex مثل #1E3A8A أو #DCFCE7 أو #FFFFFF',
                  },
                  align: {
                    type: Type.STRING,
                    description: "المحاذاة الأفقية: 'left' | 'center' | 'right'",
                  },
                  verticalAlign: {
                    type: Type.STRING,
                    description: "المحاذاة الرأسية: 'top' | 'middle' | 'bottom'",
                  },
                  border: {
                    type: Type.OBJECT,
                    properties: {
                      top: { type: Type.BOOLEAN },
                      bottom: { type: Type.BOOLEAN },
                      left: { type: Type.BOOLEAN },
                      right: { type: Type.BOOLEAN },
                      color: { type: Type.STRING },
                      style: { type: Type.STRING },
                    },
                  },
                },
              },
            },
            required: ['r', 'c', 'v'],
          },
        },
      },
      required: ['title', 'isRtl', 'rowCount', 'colCount', 'cells'],
    };

    const { text, modelUsed } = await callGeminiWithFallback({
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      systemInstruction,
      responseSchema,
      temperature: 0.1,
    });

    const sheetData = JSON.parse(text);

    // Sanitize and convert numeric values if flagged as number
    if (Array.isArray(sheetData.cells)) {
      sheetData.cells.forEach((cell: any) => {
        if (cell.t === 'number') {
          const num = Number(String(cell.v).replace(/,/g, ''));
          if (!isNaN(num)) {
            cell.v = num;
          }
        }
      });
    }

    return res.json({
      success: true,
      sheet: sheetData,
      modelUsed,
    });
  } catch (error: any) {
    console.error('Error analyzing paper:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'حدث خطأ أثناء معالجة صورة الورقة بواسطة الذكاء الاصطناعي.',
    });
  }
});

// Single invoice analyzer endpoint (used for real-time batch & folder uploads)
app.post('/api/analyze-single-invoice', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', fileName, itemIndex = 1 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'لم يتم توفير صورة الفاتورة.',
      });
    }

    const cleanBase64 = extractCleanBase64(imageBase64);

    const systemInstruction = `
أنت مدقق ومحاسب مالي خبير، ومختص بالمعالجة الضوئية واستخراج البيانات من مستندات وفواتير متنوعة وفق القالب المالي المعتمد:
[التاريخ | نوع المرجع | رقم المرجع | البند (فارغ) | المبلغ | البيان | المستفيد | الشركة المزودة]

قواعد الاستخراج الصارمة للحقول:
1. تاريخ المرجع (date): تاريخ الفاتورة أو العملية بصيغة يوم/شهر/سنة من اليسار لليمين حصراً مثل DD/MM/YYYY (مثال: 17/02/2026).
2. نوع المرجع (referenceType): مثل "فاتورة مبيعات"، "فاتورة مشتريات"، "سند صرف"، "سند قبض"، "إشعار حوالة"، "فاتورة حرارية"، "فاتورة يدوية".
3. رقم المرجع (referenceNumber): رقم الفاتورة أو السند أو الإشعار. إذا لم يوجد اكتب "بدون رقم".
4. المبلغ (amount): المبلغ الإجمالي النهائي الصافي كقيمة رقمية فقط بدون فواصل أو رموز (مثال: 45000 أو 150.50).
5. البيان (statement): بيان محتوى الفاتورة؛ يوضح أنواع الأصناف والأعداد بدقة وبنص واضح وموجز في عمود واحد (مثال: "زيت محرك سوبر (2 حبة)، فلتر بنزين (1)، أجور تركيب").
6. المستفيد (beneficiary): اسم العميل أو المستفيد أو الطرف الموجه إليه السند أو الفاتورة.
7. الشركة المزودة (providerCompany): اسم المحل التجاري، الشركة المزودة، المؤسسة، المورد، أو المتجر المصدر للفاتورة.
8. العملة (currency): العملة المذكورة (مثل ريال يمني، ريال سعودي، SAR، USD، إلخ).
`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        date: {
          type: Type.STRING,
          description: 'تاريخ الفاتورة أو العملية',
        },
        referenceType: {
          type: Type.STRING,
          description: 'نوع المرجع: فاتورة مبيعات، فاتورة مشتريات، سند صرف، سند قبض، إشعار حوالة، فاتورة حرارية',
        },
        referenceNumber: {
          type: Type.STRING,
          description: 'رقم الفاتورة أو رقم المرجع أو السند',
        },
        amount: {
          type: Type.NUMBER,
          description: 'المبلغ الإجمالي النهائي كقيمة رقمية صافية فقط',
        },
        statement: {
          type: Type.STRING,
          description: 'البيان ومحتوى الفاتورة؛ يوضح الأصناف وأعدادها بدقة في نص مركز',
        },
        beneficiary: {
          type: Type.STRING,
          description: 'اسم المستفيد أو العميل أو الشخص الموجه له المستند',
        },
        providerCompany: {
          type: Type.STRING,
          description: 'اسم الشركة المزودة أو المحل أو المتجر أو المورد المصدر للفاتورة',
        },
        currency: {
          type: Type.STRING,
          description: 'العملة مثل ريال يمني، ريال سعودي، USD، SAR',
        },
        docType: {
          type: Type.STRING,
          description: 'manual_invoice | computer_invoice | thermal_receipt | bank_transfer | general',
        },
      },
      required: ['date', 'referenceType', 'referenceNumber', 'amount', 'statement', 'beneficiary', 'providerCompany'],
    };

    const { text, modelUsed } = await callGeminiWithFallback({
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: `استخرج بيانات هذه الفاتورة (${fileName || `فاتورة ${itemIndex}`}) وفق القالب المالي بدقة: التاريخ، نوع المرجع، رقم المرجع، المبلغ، البيان (الأصناف والأعداد)، المستفيد، والشركة المزودة.`,
          },
        ],
      },
      systemInstruction,
      responseSchema,
      temperature: 0.1,
    });

    const item = JSON.parse(text);

    const finalAmount = Number(item.amount ?? item.totalAmount ?? 0);
    const finalRefType = item.referenceType || item.docTypeLabel || 'فاتورة';
    const finalRefNum = item.referenceNumber || item.invoiceNumber || 'بدون رقم';
    const finalBeneficiary = item.beneficiary || item.customerName || 'عام';
    const finalProvider = item.providerCompany || item.notes || '';
    const finalStatement = item.statement || item.itemsSummary || '';

    return res.json({
      success: true,
      modelUsed,
      item: {
        id: `inv-${Date.now()}-${itemIndex}-${Math.random().toString(36).slice(2, 6)}`,
        pageNumber: itemIndex,
        fileName: fileName || `فاتورة ${itemIndex}`,
        date: normalizeDateDMY(item.date),
        referenceType: finalRefType,
        referenceNumber: finalRefNum,
        itemCategory: '', // البند يترك فارغاً دائماً وفق طلب المستخدم الصريح
        amount: finalAmount,
        statement: finalStatement,
        beneficiary: finalBeneficiary,
        providerCompany: finalProvider,

        // Compatibility aliases
        docType: item.docType || 'general',
        docTypeLabel: finalRefType,
        invoiceNumber: finalRefNum,
        customerName: finalBeneficiary,
        totalAmount: finalAmount,
        currency: item.currency || 'ريال',
        itemsSummary: finalStatement,
        notes: finalProvider,
      },
    });
  } catch (error: any) {
    console.error('Error analyzing single invoice:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'حدث خطأ أثناء فحص وتحليل بيانات الفاتورة.',
    });
  }
});

// Analyze batch of document pages or folder of invoices
app.post('/api/analyze-invoices-batch', async (req, res) => {
  try {
    const { pages } = req.body;
    // pages: Array of { pageNumber: number, imageBase64: string, fileName?: string }

    if (!Array.isArray(pages) || pages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'لم يتم توفير أية صفحات أو مستندات للمعالجة.',
      });
    }

    const systemInstruction = `
أنت مدقق ومحاسب مالي خبير، ومختص بالمعالجة الضوئية واستخراج البيانات من مستندات وفواتير متعددة وفق القالب المالي المعتمد:
[التاريخ | نوع المرجع | رقم المرجع | البند (فارغ) | المبلغ | البيان | المستفيد | الشركة المزودة]

شروط وقواعد الاستخراج الصارمة:
1. تاريخ المرجع (date): تاريخ الفاتورة أو العملية بصيغة يوم/شهر/سنة من اليسار لليمين حصراً مثل DD/MM/YYYY (مثال: 17/02/2026).
2. نوع المرجع (referenceType): مثل "فاتورة مبيعات"، "فاتورة مشتريات"، "سند صرف"، "سند قبض"، "إشعار حوالة"، "فاتورة حرارية"، "فاتورة يدوية".
3. رقم المرجع (referenceNumber): رقم الفاتورة أو السند أو المرجع بدقة. إذا لم يوجد اكتب "بدون رقم".
4. المبلغ (amount): المبلغ الإجمالي النهائي كرقم صافٍ بدون فواصل أو رموز.
5. البيان (statement): بيان محتوى الفاتورة؛ يوضح أنواع الأصناف والأعداد بدقة وبنص واضح وموجز.
6. المستفيد (beneficiary): اسم العميل أو المستفيد أو الطرف الموجه إليه السند.
7. الشركة المزودة (providerCompany): اسم الشركة المزودة، المؤسسة، المورد، أو المتجر المصدر للفاتورة.
8. العملة (currency): العملة المذكورة.
`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING },
        referenceType: { type: Type.STRING },
        referenceNumber: { type: Type.STRING },
        amount: { type: Type.NUMBER },
        statement: { type: Type.STRING },
        beneficiary: { type: Type.STRING },
        providerCompany: { type: Type.STRING },
        currency: { type: Type.STRING },
        docType: { type: Type.STRING },
      },
      required: ['date', 'referenceType', 'referenceNumber', 'amount', 'statement', 'beneficiary', 'providerCompany'],
    };

    const parsedItems = [];

    // Process pages sequentially or in small chunks with fallback
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const cleanBase64 = extractCleanBase64(p.imageBase64);

      try {
        const { text } = await callGeminiWithFallback({
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: cleanBase64,
                },
              },
              {
                text: `استخرج بيانات هذا المستند (${p.fileName || `صفحة ${p.pageNumber || i + 1}`}) بدقة وفق القالب المالي: التاريخ، نوع المرجع، رقم المرجع، المبلغ، البيان، المستفيد، والشركة المزودة.`,
              },
            ],
          },
          systemInstruction,
          responseSchema,
          temperature: 0.1,
        });

        const item = JSON.parse(text);
        const finalAmount = Number(item.amount ?? item.totalAmount ?? 0);
        const finalRefType = item.referenceType || item.docTypeLabel || 'فاتورة';
        const finalRefNum = item.referenceNumber || item.invoiceNumber || 'بدون رقم';
        const finalBeneficiary = item.beneficiary || item.customerName || 'عام';
        const finalProvider = item.providerCompany || item.notes || '';
        const finalStatement = item.statement || item.itemsSummary || '';

        parsedItems.push({
          id: `item-${Date.now()}-${i}`,
          pageNumber: p.pageNumber || i + 1,
          fileName: p.fileName || `مستند ${i + 1}`,
          date: normalizeDateDMY(item.date),
          referenceType: finalRefType,
          referenceNumber: finalRefNum,
          itemCategory: '', // البند يترك فارغاً وفق القالب المطلوب
          amount: finalAmount,
          statement: finalStatement,
          beneficiary: finalBeneficiary,
          providerCompany: finalProvider,

          // Compatibility fields
          docType: item.docType || 'general',
          docTypeLabel: finalRefType,
          invoiceNumber: finalRefNum,
          customerName: finalBeneficiary,
          totalAmount: finalAmount,
          currency: item.currency || 'ريال',
          itemsSummary: finalStatement,
          notes: finalProvider,
        });
      } catch (itemErr: any) {
        console.warn(`Error on item ${i + 1}:`, itemErr);
        parsedItems.push({
          id: `item-${Date.now()}-${i}`,
          pageNumber: p.pageNumber || i + 1,
          fileName: p.fileName || `مستند ${i + 1}`,
          date: '',
          referenceType: 'مستند',
          referenceNumber: 'تعذر القراءة',
          itemCategory: '',
          amount: 0,
          statement: 'تعذر استخراج التفاصيل من هذه الصفحة، يرجى مراجعة الصورة يدوياً',
          beneficiary: 'غير محدد',
          providerCompany: '',
          docType: 'general',
          docTypeLabel: 'مستند',
          invoiceNumber: 'تعذر القراءة',
          customerName: 'غير محدد',
          totalAmount: 0,
          currency: 'ريال',
          itemsSummary: 'تعذر استخراج التفاصيل من هذه الصفحة، يرجى مراجعة الصورة يدوياً',
          notes: itemErr?.message || 'خطأ تحليل',
        });
      }
    }

    return res.json({
      success: true,
      items: parsedItems,
    });
  } catch (error: any) {
    console.error('Error analyzing batch invoices:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'حدث خطأ أثناء فحص وتحليل فواتير ومستندات الملف.',
    });
  }
});

// Vite Middleware for development vs static for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
