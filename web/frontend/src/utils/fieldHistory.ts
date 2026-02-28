/**
 * Maydon qiymatlari tarixi — localStorage da saqlanadi.
 * Kalit: maydon label matni (har xil protokollardagi bir xil nomli maydonlar
 *         uchun tarix umumlashtiriladi, masalan barcha "Форма" maydonlari).
 * Har maydon uchun oxirgi 12 ta yozuv saqlanadi.
 */

const STORAGE_KEY = 'ncm_field_history';

function loadAll(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string[]>;
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, string[]>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage to'la bo'lsa (quota exceeded) — jimgina o'tkazib yuboramiz
  }
}

/** Berilgan maydon labeli uchun avvalgi qiymatlar ro'yxati (oxirgi 12 ta) */
export function getFieldHistory(label: string): string[] {
  const all = loadAll();
  const hist = all[label];
  return Array.isArray(hist) ? hist : [];
}

/**
 * Yangi qiymatni tariхга qo'shadi.
 * - Bo'sh qiymatlar saqlanmaydi
 * - Dublikatlar olib tashlanadi (yangi qiymat eng tepaga o'tkaziladi)
 * - 12 tadan ortiq bo'lsa eng eski o'chiriladi
 */
export function saveFieldHistory(label: string, value: string): void {
  const v = value.trim();
  if (!v) return;
  const all = loadAll();
  const prev: string[] = Array.isArray(all[label]) ? all[label] : [];
  all[label] = [v, ...prev.filter((p) => p !== v)].slice(0, 12);
  saveAll(all);
}

/** Butun tariхни tozalaydi (sozlamalar orqali ishlatilishi mumkin) */
export function clearAllHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
