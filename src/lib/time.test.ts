import { describe, expect, it } from 'vitest';
import { formatDuration, getRemaining, parseServerTime, resolveExamEnd } from './time';

describe('timer CBT', () => {
  it('memperlakukan timestamp tanpa offset sebagai Asia/Jakarta', () => {
    expect(parseServerTime('2026-07-29 20:00:00')).toBe(new Date('2026-07-29T20:00:00+07:00').getTime());
  });

  it('memformat sisa waktu ke HH:MM:SS', () => {
    expect(formatDuration(3_661_000)).toBe('01:01:01');
  });

  it('tidak menghasilkan waktu negatif', () => {
    expect(getRemaining('2020-01-01T00:00:00Z', 0)).toBe(0);
  });

  it('menggunakan duration_minutes ketika ends_at tidak tersedia', () => {
    expect(resolveExamEnd('2026-07-30T01:00:00Z', '2026-07-30T01:00:00Z', undefined, 120))
      .toBe('2026-07-30T03:00:00.000Z');
  });

  it('membatasi ends_at agar tidak melebihi duration_minutes', () => {
    expect(resolveExamEnd('2026-07-30T01:00:00Z', '2026-07-30T01:00:00Z', '2026-07-30T05:00:00Z', 120))
      .toBe('2026-07-30T03:00:00.000Z');
  });

  it('mempertahankan deadline server yang lebih pendek untuk ujian lanjutan', () => {
    expect(resolveExamEnd('2026-07-30T01:00:00Z', '2026-07-30T01:00:00Z', '2026-07-30T01:30:00Z', 120))
      .toBe('2026-07-30T01:30:00.000Z');
  });

  it('deadline tetap dihitung dari start_at setelah halaman direfresh', () => {
    expect(resolveExamEnd('2026-07-30T02:00:00Z', '2026-07-30T01:00:00Z', undefined, 120))
      .toBe('2026-07-30T03:00:00.000Z');
  });
});
