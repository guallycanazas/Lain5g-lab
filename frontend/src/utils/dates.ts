export function formatDate(value?: string | null): string {
  const locale = document.documentElement.lang === 'en' ? 'en' : 'es';
  if (!value) return locale === 'en' ? 'No date' : 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(date);
}

export function durationBetween(start?: string | null, end?: string | null): string {
  const unavailable = document.documentElement.lang === 'en' ? 'Not available' : 'No disponible';
  if (!start || !end) return unavailable;
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  if (Number.isNaN(startTime) || Number.isNaN(endTime) || endTime < startTime) return unavailable;
  const seconds = Math.round((endTime - startTime) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}
