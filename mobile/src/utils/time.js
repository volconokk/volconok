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
