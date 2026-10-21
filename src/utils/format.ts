/**
 * Date helpers. A few lines of `Intl` instead of pulling in a date library —
 * this runs on every card.
 */

const isoDate = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'UTC',
});

const longDate = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

const parse = (value: string): Date => new Date(value.length === 10 ? `${value}T00:00:00Z` : value);

/** `2026-03-08` */
export const formatIsoDate = (value: string): string => {
  const date = parse(value);
  return Number.isNaN(date.getTime()) ? value : isoDate.format(date);
};

/** `Mar 8, 2026` */
export const formatLongDate = (value: string): string => {
  const date = parse(value);
  return Number.isNaN(date.getTime()) ? value : longDate.format(date);
};
