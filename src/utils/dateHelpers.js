// Small date-range helpers used to bucket orders/expenses into
// "today / this week / this month" for the balance cards.

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfWeek() {
  const d = startOfToday();
  const day = d.getDay(); // 0 = Sunday
  const diff = (day === 0 ? 6 : day - 1); // week starts Monday
  d.setDate(d.getDate() - diff);
  return d;
}

export function startOfMonth() {
  const d = startOfToday();
  d.setDate(1);
  return d;
}

// Firestore Timestamp -> JS Date, tolerant of already-Date values.
export function toJsDate(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  return new Date(value);
}

export function isWithin(dateValue, startDate) {
  const d = toJsDate(dateValue);
  if (!d) return false;
  return d.getTime() >= startDate.getTime();
}

export function formatCurrency(n) {
  return Number(n || 0).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  });
}

export function formatDate(value) {
  const d = toJsDate(value);
  if (!d) return '-';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
}

// Whole days elapsed since a Firestore Timestamp / Date, used to flag
// pending orders that have been sitting too long.
export function daysSince(value) {
  const d = toJsDate(value);
  if (!d) return 0;
  const diffMs = Date.now() - d.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
