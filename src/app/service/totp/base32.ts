/**
 * RFC 4648 base32, the encoding authenticator apps use for shared secrets.
 * Written out rather than pulled in as a dependency because it is short and the
 * TOTP demo is meant to show every step.
 */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(bytes: Uint8Array): string {
  let output = '';
  let buffer = 0;
  let bits = 0;

  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += ALPHABET[(buffer >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += ALPHABET[(buffer << (5 - bits)) & 31];
  }
  return output;
}

/**
 * Decodes base32, tolerating what users paste from authenticator setup screens:
 * lowercase, spaces, hyphens and `=` padding.
 *
 * @throws Error when the input contains a character outside the alphabet.
 */
export function base32Decode(input: string): Uint8Array {
  const clean = input.toUpperCase().replace(/[\s-]/g, '').replace(/=+$/, '');
  const output: number[] = [];
  let buffer = 0;
  let bits = 0;

  for (const char of clean) {
    const value = ALPHABET.indexOf(char);
    if (value === -1) {
      throw new Error(`Invalid base32 character "${char}".`);
    }
    buffer = (buffer << 5) | value;
    bits += 5;
    if (bits >= 8) {
      output.push((buffer >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Uint8Array.from(output);
}
