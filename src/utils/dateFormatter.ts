/**
 * Normalizes and formats dates to strict Day/Month/Year from left to right (DD/MM/YYYY)
 * Examples:
 *   "2026-02-17" -> "17/02/2026"
 *   "2026/02/17" -> "17/02/2026"
 *   "17/2/2026"  -> "17/02/2026"
 *   "١٧/٠٢/٢٠٢٦" -> "17/02/2026"
 */
export function normalizeDateDMY(dateInput?: string | null): string {
  if (!dateInput || typeof dateInput !== 'string') {
    return '';
  }

  // 1. Convert Arabic-Indic digits to Latin digits
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  let str = dateInput.trim();
  for (let i = 0; i < 10; i++) {
    str = str.replace(new RegExp(arabicDigits[i], 'g'), String(i));
    str = str.replace(new RegExp(persianDigits[i], 'g'), String(i));
  }

  // 2. Try Pattern: Year-Month-Day (e.g. 2026-02-17, 2026/2/17, 2026.02.17)
  const ymdMatch = str.match(/^(?:19|20)\d{2}[/\-. ]\d{1,2}[/\-. ]\d{1,2}/);
  if (ymdMatch) {
    const parts = ymdMatch[0].split(/[/\-. ]/);
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${day}/${month}/${year}`;
    }
  }

  // 3. Try Pattern: Day-Month-Year (e.g. 17/02/2026, 17-2-2026, 17/2/26)
  const dmyMatch = str.match(/^(\d{1,2})[/\-. ](\d{1,2})[/\-. ]((?:19|20)?\d{2})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    let year = dmyMatch[3];
    if (year.length === 2) {
      year = `20${year}`;
    }
    return `${day}/${month}/${year}`;
  }

  // 4. Try JS Date parse as fallback
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1990 && parsed.getFullYear() < 2100) {
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return str;
}

/**
 * Checks if a cell value resembles a date or date column
 */
export function isDateLike(val: unknown): boolean {
  if (typeof val !== 'string') return false;
  return /^\d{2}\/\d{2}\/\d{4}$/.test(val) || /^(?:19|20)\d{2}[/-]\d{1,2}[/-]\d{1,2}/.test(val);
}
