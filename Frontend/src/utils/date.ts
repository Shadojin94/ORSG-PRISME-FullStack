const FR_LONG = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' });
const FR_DATETIME = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
  timeStyle: 'short',
});

function parse(input: string | Date | number | undefined | null): Date | null {
  if (input == null || input === '') return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  const d = new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

export function formatDateFR(input: string | Date | number | undefined | null): string {
  const d = parse(input);
  if (!d) return typeof input === 'string' ? input : '';
  return FR_LONG.format(d);
}

export function formatDateTimeFR(input: string | Date | number | undefined | null): string {
  const d = parse(input);
  if (!d) return typeof input === 'string' ? input : '';
  return FR_DATETIME.format(d);
}
