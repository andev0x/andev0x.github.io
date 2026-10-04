/**
 * Date helpers. A few lines of `Intl` instead of pulling in a date library —
 * this runs on every card and every comment.
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

const dateTime = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
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

/** `Mar 8, 2026, 2:04 PM` — falls back to the raw string if unparsable. */
export const formatTimestamp = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateTime.format(date);
};

/** Sort key for newest-first ordering. */
export const dateValue = (value: string): number => {
  const time = parse(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};
