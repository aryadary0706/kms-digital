/**
 * Baca token warna dari src/global.css (format channel "R G B") sebagai
 * string rgb(R, G, B), untuk library yang butuh nilai warna nyata
 * (antd theme, html2canvas). Mengembalikan fallback bila CSS belum dimuat
 * (mis. saat test).
 */
export function cssColor(token: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const channels = value.split(/[\s,]+/).filter(Boolean);
  return channels.length === 3 ? `rgb(${channels.join(', ')})` : fallback;
}
