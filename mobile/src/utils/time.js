// Lightweight relative time formatter using Intl.RelativeTimeFormat so it
// works on iOS 17+ and modern Android without pulling in a heavy dep.
const units = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['week', 60 * 60 * 24 * 7],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
  ['second', 1],
];

export function timeAgo(date, lng = 'en') {
  if (!date) return '';
  const seconds = Math.round((Date.now() - new Date(date).getTime()) / 1000);
  const abs = Math.abs(seconds);
  let rtf;
  try {
    rtf = new Intl.RelativeTimeFormat(lng, { numeric: 'auto' });
  } catch (_e) {
    rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  }
  for (const [unit, secs] of units) {
    if (abs >= secs || unit === 'second') {
      return rtf.format(-Math.round(seconds / secs), unit);
    }
  }
  return '';
}
