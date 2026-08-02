/** Date helpers that stay in the user's local timezone.
 *
 *  `toISOString()` converts to UTC first, which in Romania (UTC+2/+3) reports
 *  "yesterday" for any time before 02:00 -- enough to make a same-day booking
 *  look like it is in the past.
 */

export function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function today() {
  return toISODate(new Date());
}

export function addDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** Whole days between two ISO dates, or 0 if the range is invalid. */
export function daysBetween(startISO, endISO) {
  if (!startISO || !endISO) return 0;
  const start = new Date(`${startISO}T00:00:00`);
  const end = new Date(`${endISO}T00:00:00`);
  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) return 0;
  const diff = Math.round((end - start) / 86_400_000);
  return diff > 0 ? diff : 0;
}

export function formatDate(isoDate) {
  if (!isoDate) return '—';
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.valueOf())) return isoDate;
  return new Intl.DateTimeFormat('ro-RO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
