const units = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['week', 60 * 60 * 24 * 7],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
  ['second', 1],
];

const fallbackLabels = {
  en: { year: 'y', month: 'mo', week: 'w', day: 'd', hour: 'h', minute: 'm', second: 's', ago: 'ago', now: 'now' },
  ru: { year: 'г', month: 'мес', week: 'нед', day: 'д', hour: 'ч', minute: 'м', second: 'с', ago: 'назад', now: 'сейчас' },
  ro: { year: 'a', month: 'l', week: 's', day: 'z', hour: 'o', minute: 'm', second: 's', ago: 'în urmă', now: 'acum' },
};

export function timeAgo(date, lng = 'en') {
  if (!date) return '';
  const seconds = Math.round((Date.now() - new Date(date).getTime()) / 1000);
  const abs = Math.abs(seconds);
  
  // Try Intl.RelativeTimeFormat if available
  if (typeof Intl !== 'undefined' && Intl.RelativeTimeFormat) {
    try {
      const rtf = new Intl.RelativeTimeFormat(lng, { numeric: 'auto' });
      for (const [unit, secs] of units) {
        if (abs >= secs || unit === 'second') {
          return rtf.format(-Math.round(seconds / secs), unit);
        }
      }
    } catch (_e) {
      // Fall through to fallback
    }
  }
  
  // Fallback for environments without Intl.RelativeTimeFormat
  const labels = fallbackLabels[lng] || fallbackLabels.en;
  if (abs < 5) return labels.now;
  for (const [unit, secs] of units) {
    if (abs >= secs) {
      const value = Math.round(abs / secs);
      return `${value}${labels[unit]} ${labels.ago}`;
    }
  }
  return labels.now;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Short clock time, e.g. "14:05".
export function formatTime(date, lng = 'en') {
  if (!date) return '';
  const d = new Date(date);
  if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
    try {
      return new Intl.DateTimeFormat(lng, { hour: '2-digit', minute: '2-digit' }).format(d);
    } catch (_e) {
      // fall through
    }
  }
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

// A header label for grouping messages by day: Today / Yesterday / date.
export function formatDateSeparator(date, lng = 'en', labels = {}) {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (sameDay(d, now)) return labels.today || 'Today';
  if (sameDay(d, yesterday)) return labels.yesterday || 'Yesterday';

  if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
    try {
      const sameYear = d.getFullYear() === now.getFullYear();
      return new Intl.DateTimeFormat(lng, {
        day: 'numeric',
        month: 'long',
        year: sameYear ? undefined : 'numeric',
      }).format(d);
    } catch (_e) {
      // fall through
    }
  }
  return d.toLocaleDateString();
}

// "Joined March 2026" style label.
export function formatMonthYear(date, lng = 'en') {
  if (!date) return '';
  const d = new Date(date);
  if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
    try {
      return new Intl.DateTimeFormat(lng, { month: 'long', year: 'numeric' }).format(d);
    } catch (_e) {
      // fall through
    }
  }
  return `${d.getMonth() + 1}/${d.getFullYear()}`;
}

export function isSameDay(a, b) {
  return sameDay(new Date(a), new Date(b));
}
