export function parseServerTime(value: string): number {
  if (!value) return Date.now();
  if (/Z$|[+-]\d{2}:?\d{2}$/.test(value)) return new Date(value).getTime();
  return new Date(value.replace(' ', 'T') + '+07:00').getTime();
}

export function getServerOffset(serverTime: string): number {
  return parseServerTime(serverTime) - Date.now();
}

export function getRemaining(endsAt: string, offsetMs: number): number {
  return Math.max(0, parseServerTime(endsAt) - (Date.now() + offsetMs));
}

export function resolveExamEnd(
  serverTime: string,
  startAt: string | null | undefined,
  endsAt: string | null | undefined,
  durationMinutes: number
): string {
  const serverNow = parseServerTime(serverTime);
  const durationMs = Math.max(0, Number(durationMinutes) || 0) * 60_000;
  const parsedStart = startAt ? parseServerTime(startAt) : Number.NaN;
  const apiEnd = endsAt ? parseServerTime(endsAt) : Number.NaN;
  const configuredEnd = Number.isFinite(parsedStart) ? parsedStart + durationMs : serverNow + durationMs;
  const effectiveEnd = Number.isFinite(apiEnd)
    ? Number.isFinite(parsedStart) ? Math.min(apiEnd, configuredEnd) : apiEnd
    : configuredEnd;
  return new Date(effectiveEnd).toISOString();
}

export function formatDuration(milliseconds: number): string {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [hours, minutes, secs].map((value) => String(value).padStart(2, '0')).join(':');
}
