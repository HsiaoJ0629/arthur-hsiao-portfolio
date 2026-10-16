import { base32Decode, base32Encode } from './base32';
import {
  TotpAlgorithm,
  constantTimeEqual,
  hotp,
  otpauthUri,
  secondsRemaining,
  timeStep,
  totp,
} from './totp';

const ascii = (text: string): Uint8Array => new TextEncoder().encode(text);

describe('base32', () => {
  // RFC 4648 section 10 test vectors, without padding.
  const vectors: [string, string][] = [
    ['', ''],
    ['f', 'MY'],
    ['fo', 'MZXQ'],
    ['foo', 'MZXW6'],
    ['foob', 'MZXW6YQ'],
    ['fooba', 'MZXW6YTB'],
    ['foobar', 'MZXW6YTBOI'],
  ];

  vectors.forEach(([plain, encoded]) => {
    it(`encodes "${plain}" as "${encoded}"`, () => {
      expect(base32Encode(ascii(plain))).toBe(encoded);
    });

    it(`decodes "${encoded}" back to "${plain}"`, () => {
      expect(new TextDecoder().decode(base32Decode(encoded))).toBe(plain);
    });
  });

  it('accepts lowercase, spaces, hyphens and padding as pasted from setup screens', () => {
    expect(new TextDecoder().decode(base32Decode('mzxw 6ytb-oi======'))).toBe('foobar');
  });

  it('rejects characters outside the alphabet', () => {
    expect(() => base32Decode('MZXW1')).toThrowError(/Invalid base32 character "1"/);
  });
});

describe('hotp', () => {
  // RFC 4226 appendix D.
  const secret = ascii('12345678901234567890');
  const expected = [
    '755224',
    '287082',
    '359152',
    '969429',
    '338314',
    '254676',
    '287922',
    '162583',
    '399871',
    '520489',
  ];

  expected.forEach((code, counter) => {
    it(`matches RFC 4226 for counter ${counter}`, async () => {
      expect(await hotp(secret, counter)).toBe(code);
    });
  });

  // Beyond the RFC vectors: counters that need the high 32-bit word, which a
  // shift-based encoding would silently drop. Expected values from Node's crypto.
  const wideCounters: [number, string][] = [
    [2 ** 32, '999456'],
    [2 ** 32 + 1, '108930'],
    [2 ** 40 + 5, '726206'],
  ];

  wideCounters.forEach(([counter, code]) => {
    it(`encodes the high word of counter ${counter}`, async () => {
      expect(await hotp(secret, counter)).toBe(code);
    });
  });

  it('rejects counters that cannot be represented exactly', async () => {
    await expectAsync(hotp(secret, -1)).toBeRejectedWithError(RangeError);
    await expectAsync(hotp(secret, 1.5)).toBeRejectedWithError(RangeError);
  });
});

describe('totp', () => {
  // RFC 6238 appendix B: each algorithm uses a seed of its own digest length.
  const seeds: Record<TotpAlgorithm, Uint8Array> = {
    'SHA-1': ascii('12345678901234567890'),
    'SHA-256': ascii('12345678901234567890123456789012'),
    'SHA-512': ascii('1234567890123456789012345678901234567890123456789012345678901234'),
  };
  const vectors: [number, TotpAlgorithm, string][] = [
    [59, 'SHA-1', '94287082'],
    [59, 'SHA-256', '46119246'],
    [59, 'SHA-512', '90693936'],
    [1111111109, 'SHA-1', '07081804'],
    [1111111109, 'SHA-256', '68084774'],
    [1111111109, 'SHA-512', '25091201'],
    [1111111111, 'SHA-1', '14050471'],
    [1111111111, 'SHA-256', '67062674'],
    [1111111111, 'SHA-512', '99943326'],
    [1234567890, 'SHA-1', '89005924'],
    [1234567890, 'SHA-256', '91819424'],
    [1234567890, 'SHA-512', '93441116'],
    [2000000000, 'SHA-1', '69279037'],
    [2000000000, 'SHA-256', '90698825'],
    [2000000000, 'SHA-512', '38618901'],
    // Year 2603: the timestamp itself no longer fits in 32 bits.
    [20000000000, 'SHA-1', '65353130'],
    [20000000000, 'SHA-256', '77737706'],
    [20000000000, 'SHA-512', '47863826'],
  ];

  vectors.forEach(([seconds, algorithm, code]) => {
    it(`matches RFC 6238 at T=${seconds}s with ${algorithm}`, async () => {
      const result = await totp(seeds[algorithm], seconds * 1000, {
        algorithm,
        digits: 8,
        period: 30,
      });
      expect(result).toBe(code);
    });
  });

  it('keeps the same code for the whole time step', async () => {
    const secret = seeds['SHA-1'];
    expect(await totp(secret, 30_000)).toBe(await totp(secret, 59_999));
    expect(await totp(secret, 59_999)).not.toBe(await totp(secret, 60_000));
  });
});

describe('time helpers', () => {
  it('derives the step index from the clock', () => {
    expect(timeStep(0)).toBe(0);
    expect(timeStep(29_999)).toBe(0);
    expect(timeStep(30_000)).toBe(1);
  });

  it('counts down the seconds left in the current step', () => {
    expect(secondsRemaining(0)).toBe(30);
    expect(secondsRemaining(29_000)).toBe(1);
    expect(secondsRemaining(30_000)).toBe(30);
  });
});

describe('constantTimeEqual', () => {
  it('matches identical codes only', () => {
    expect(constantTimeEqual('123456', '123456')).toBeTrue();
    expect(constantTimeEqual('123456', '123457')).toBeFalse();
    expect(constantTimeEqual('123456', '12345')).toBeFalse();
  });
});

describe('otpauthUri', () => {
  it('builds the key URI that authenticator apps import', () => {
    const uri = otpauthUri('JBSWY3DPEHPK3PXP', 'demo@example.com', 'Arthur Hsiao');

    expect(uri).toBe(
      'otpauth://totp/Arthur%20Hsiao:demo%40example.com' +
        '?secret=JBSWY3DPEHPK3PXP&issuer=Arthur+Hsiao&algorithm=SHA1&digits=6&period=30',
    );
  });
});
