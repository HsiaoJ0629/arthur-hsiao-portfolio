/**
 * HOTP (RFC 4226) and TOTP (RFC 6238) one-time passwords on the Web Crypto API.
 *
 * Pure functions with the clock passed in, so every result is reproducible and
 * the RFC test vectors can be asserted directly.
 */

export type TotpAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-512';

export interface TotpOptions {
  readonly algorithm: TotpAlgorithm;
  /** Code length. Authenticator apps use 6; RFC 6238's test vectors use 8. */
  readonly digits: number;
  /** Time-step length in seconds. 30 is the de facto standard. */
  readonly period: number;
}

export const DEFAULT_TOTP_OPTIONS: TotpOptions = { algorithm: 'SHA-1', digits: 6, period: 30 };

const TWO_POW_32 = 2 ** 32;

/** The time-step index T for a moment in time: floor(unixSeconds / period). */
export function timeStep(timeMs: number, period = DEFAULT_TOTP_OPTIONS.period): number {
  return Math.floor(timeMs / 1000 / period);
}

/** Seconds until the current code expires, for the countdown in the UI. */
export function secondsRemaining(timeMs: number, period = DEFAULT_TOTP_OPTIONS.period): number {
  return period - (Math.floor(timeMs / 1000) % period);
}

/**
 * RFC 4226 HOTP: HMAC the 8-byte big-endian counter, then dynamically truncate
 * the digest to a `digits`-long decimal code.
 */
export async function hotp(
  secret: Uint8Array,
  counter: number,
  digits = DEFAULT_TOTP_OPTIONS.digits,
  algorithm: TotpAlgorithm = DEFAULT_TOTP_OPTIONS.algorithm,
): Promise<string> {
  if (!Number.isSafeInteger(counter) || counter < 0) {
    throw new RangeError('HOTP counter must be a non-negative safe integer.');
  }

  // JavaScript bitwise operators are 32-bit, so the 64-bit counter is written
  // as two halves rather than with a shift.
  const message = new DataView(new ArrayBuffer(8));
  message.setUint32(0, Math.floor(counter / TWO_POW_32));
  message.setUint32(4, counter % TWO_POW_32);

  const key = await crypto.subtle.importKey(
    'raw',
    secret,
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign'],
  );
  const digest = new Uint8Array(await crypto.subtle.sign('HMAC', key, message));

  // Dynamic truncation: the low nibble of the last byte picks a 4-byte window,
  // and the top bit is masked so the result is the same signed or unsigned.
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    (digest[offset + 1] << 16) |
    (digest[offset + 2] << 8) |
    digest[offset + 3];

  return (binary % 10 ** digits).toString().padStart(digits, '0');
}

/** RFC 6238 TOTP: HOTP with the counter derived from the clock. */
export function totp(
  secret: Uint8Array,
  timeMs: number,
  options: TotpOptions = DEFAULT_TOTP_OPTIONS,
): Promise<string> {
  return hotp(secret, timeStep(timeMs, options.period), options.digits, options.algorithm);
}

/**
 * Compares two codes in time proportional to their length only, so response
 * timing does not reveal how many leading digits of a guess were correct.
 */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let difference = 0;
  for (let i = 0; i < a.length; i++) {
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return difference === 0;
}

/** A cryptographically random secret. 20 bytes matches the SHA-1 block recommendation. */
export function generateSecret(byteLength = 20): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(byteLength));
}

/**
 * The `otpauth://` URI authenticator apps import, usually via a QR code.
 * @see https://github.com/google/google-authenticator/wiki/Key-Uri-Format
 */
export function otpauthUri(
  base32Secret: string,
  account: string,
  issuer: string,
  options: TotpOptions = DEFAULT_TOTP_OPTIONS,
): string {
  const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(account)}`;
  const params = new URLSearchParams({
    secret: base32Secret,
    issuer,
    algorithm: options.algorithm.replace('-', ''),
    digits: String(options.digits),
    period: String(options.period),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}
