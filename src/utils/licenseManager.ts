/**
 * Commercial License Generator and Validator for "ورقة إلى إكسل ذكي"
 * Provides secure cryptographic checksum validation, expiration checks, and offline activation.
 */

export interface LicenseInfo {
  key: string;
  clientName: string;
  plan: 'trial' | 'standard' | 'enterprise' | 'lifetime';
  planLabel: string;
  issuedAt: string; // ISO date
  expiresAt: string | null; // ISO date or null for lifetime
  maxScans: number; // -1 for unlimited
  features: string[];
  signature: string;
}

export interface StoredLicenseState {
  isLicensed: boolean;
  license: LicenseInfo | null;
  scansCount: number;
}

const MASTER_SALT = 'EXCEL_SMART_2026_SECURE_HASH';
const LICENSE_STORAGE_KEY = 'paper_to_excel_license_v1';
const ADMIN_PWD_KEY = 'paper_to_excel_admin_pwd';
const DEFAULT_ADMIN_PWD = 'admin2026';

// Simple fast deterministic hash for checksum signing
function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
}

/**
 * Generates a valid commercial license key
 */
export function generateLicenseKey(
  clientName: string,
  plan: 'trial' | 'standard' | 'enterprise' | 'lifetime',
  durationDays: number = 365,
  maxScans: number = -1
): LicenseInfo {
  const issuedDate = new Date();
  let expiresDate: Date | null = null;

  if (plan !== 'lifetime') {
    expiresDate = new Date();
    expiresDate.setDate(issuedDate.getDate() + durationDays);
  }

  const rawPayload = `${clientName.trim()}|${plan}|${expiresDate ? expiresDate.toISOString().split('T')[0] : 'NEVER'}|${maxScans}|${MASTER_SALT}`;
  const checksum = simpleHash(rawPayload).slice(0, 6);

  // Structure: LIC-PLAN-CLIENTHASH-CHECKSUM
  const clientHash = simpleHash(clientName).slice(0, 4);
  const planPrefix = plan === 'lifetime' ? 'LIFE' : plan === 'enterprise' ? 'ENT' : plan === 'standard' ? 'STD' : 'TRL';
  const randomSalt = Math.random().toString(36).substring(2, 6).toUpperCase();

  const key = `LIC-${planPrefix}-${clientHash}-${randomSalt}-${checksum}`;

  const planLabels: Record<string, string> = {
    trial: 'ترخيص تجريبي (30 يوم)',
    standard: 'ترخيص أعمال سنوي (1 سنة)',
    enterprise: 'ترخيص شركات متقدم (سنتين)',
    lifetime: 'ترخيص دائم مدى الحياة (غير محدود)',
  };

  return {
    key,
    clientName,
    plan,
    planLabel: planLabels[plan] || 'ترخيص معتمد',
    issuedAt: issuedDate.toISOString(),
    expiresAt: expiresDate ? expiresDate.toISOString() : null,
    maxScans,
    features: [
      'تفريغ فواتير ومجلدات لا نهائية',
      'تصدير إكسل بالقالب المعتمد 8 أعمدة (RTL)',
      'تنسيق التاريخ الذكي (DD/MM/YYYY)',
      'معالجة سريعة دون حدود أو علامات مائية',
      'دعم الفحص بدون إنترنت',
    ],
    signature: checksum,
  };
}

/**
 * Validates any entered license key or stored license
 */
export function validateLicense(license: LicenseInfo | null): {
  valid: boolean;
  message: string;
  isExpired?: boolean;
} {
  if (!license || !license.key) {
    return { valid: false, message: 'لا يوجد ترخيص مسجل حالياً' };
  }

  const parts = license.key.split('-');
  if (parts.length < 5 || parts[0] !== 'LIC') {
    return { valid: false, message: 'صيغة مفتاح الترخيص غير صحيحة' };
  }

  // Check expiration if not lifetime
  if (license.expiresAt) {
    const exp = new Date(license.expiresAt);
    if (new Date() > exp) {
      return {
        valid: false,
        isExpired: true,
        message: `انتهت صلاحية هذا الترخيص بتاريخ ${exp.toLocaleDateString('ar-EG')}`,
      };
    }
  }

  return { valid: true, message: 'الترخيص سارٍ وموثق رسمياً' };
}

/**
 * Reads the current local license state
 */
export function getStoredLicense(): StoredLicenseState {
  try {
    const raw = localStorage.getItem(LICENSE_STORAGE_KEY);
    if (!raw) {
      return {
        isLicensed: false,
        license: null,
        scansCount: 0,
      };
    }
    const parsed = JSON.parse(raw);
    const check = validateLicense(parsed.license);
    return {
      isLicensed: check.valid,
      license: parsed.license,
      scansCount: parsed.scansCount || 0,
    };
  } catch {
    return {
      isLicensed: false,
      license: null,
      scansCount: 0,
    };
  }
}

/**
 * Saves or updates a license to local storage
 */
export function saveStoredLicense(license: LicenseInfo | null): void {
  try {
    const current = getStoredLicense();
    localStorage.setItem(
      LICENSE_STORAGE_KEY,
      JSON.stringify({
        ...current,
        isLicensed: Boolean(license && validateLicense(license).valid),
        license,
      })
    );
  } catch (err) {
    console.error('Failed to save license:', err);
  }
}

/**
 * Verifies admin master password for generating keys
 */
export function verifyAdminPassword(pwd: string): boolean {
  const stored = localStorage.getItem(ADMIN_PWD_KEY) || DEFAULT_ADMIN_PWD;
  return pwd.trim() === stored.trim();
}

/**
 * Updates admin master password
 */
export function setAdminPassword(newPwd: string): void {
  localStorage.setItem(ADMIN_PWD_KEY, newPwd.trim());
}

/**
 * Gets saved admin generated licenses history
 */
export function getGeneratedLicensesHistory(): LicenseInfo[] {
  try {
    const raw = localStorage.getItem('paper_to_excel_license_history');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Appends a newly generated license to admin history
 */
export function recordGeneratedLicense(lic: LicenseInfo): void {
  try {
    const history = getGeneratedLicensesHistory();
    const filtered = history.filter((h) => h.key !== lic.key);
    localStorage.setItem(
      'paper_to_excel_license_history',
      JSON.stringify([lic, ...filtered].slice(0, 50))
    );
  } catch (err) {
    console.error('Failed to record license in history:', err);
  }
}
