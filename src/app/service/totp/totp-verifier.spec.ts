import { totp } from './totp';
import { TotpVerifier } from './totp-verifier';

describe('TotpVerifier', () => {
  const secret = new TextEncoder().encode('12345678901234567890');
  /** A fixed "now" in the middle of a time step. */
  const now = 1_700_000_015_000;
  const STEP_MS = 30_000;

  let verifier: TotpVerifier;

  beforeEach(() => {
    verifier = new TotpVerifier(secret);
  });

  const codeAt = (timeMs: number): Promise<string> => totp(secret, timeMs);

  it('accepts the current code with zero drift', async () => {
    expect(await verifier.verify(await codeAt(now), now)).toEqual({ status: 'accepted', drift: 0 });
  });

  it('tolerates one step of clock drift either way', async () => {
    expect(await verifier.verify(await codeAt(now - STEP_MS), now)).toEqual({
      status: 'accepted',
      drift: -1,
    });

    expect(await new TotpVerifier(secret).verify(await codeAt(now + STEP_MS), now)).toEqual({
      status: 'accepted',
      drift: 1,
    });
  });

  it('rejects codes outside the drift window', async () => {
    const result = await verifier.verify(await codeAt(now - 2 * STEP_MS), now);

    expect(result.status).toBe('rejected');
  });

  it('refuses to accept the same code twice', async () => {
    const code = await codeAt(now);
    await verifier.verify(code, now);

    expect(await verifier.verify(code, now)).toEqual({ status: 'replayed' });
  });

  it('refuses an older step once a newer one has been used', async () => {
    await verifier.verify(await codeAt(now), now);

    expect(await verifier.verify(await codeAt(now - STEP_MS), now)).toEqual({ status: 'replayed' });
  });

  it('accepts only one of two concurrent submissions of the same code', async () => {
    const code = await codeAt(now);
    const results = await Promise.all([verifier.verify(code, now), verifier.verify(code, now)]);

    expect(results.map((result) => result.status).sort()).toEqual(['accepted', 'replayed']);
  });

  it('treats input of the wrong shape as malformed without counting an attempt', async () => {
    expect(await verifier.verify('12a456', now)).toEqual({ status: 'malformed' });
    expect(await verifier.verify('12345', now)).toEqual({ status: 'malformed' });
    expect(await verifier.verify('000000', now)).toEqual(
      jasmine.objectContaining({ status: 'rejected', attemptsRemaining: 4 }),
    );
  });

  it('locks out after five consecutive wrong codes, then recovers', async () => {
    const wrong = (await codeAt(now)) === '000000' ? '111111' : '000000';

    for (let attempt = 0; attempt < 4; attempt++) {
      expect((await verifier.verify(wrong, now)).status).toBe('rejected');
    }
    expect(await verifier.verify(wrong, now)).toEqual({ status: 'locked', retryAfterSeconds: 30 });

    // Even the right code is refused while locked.
    expect(await verifier.verify(await codeAt(now), now + 10_000)).toEqual({
      status: 'locked',
      retryAfterSeconds: 20,
    });

    const later = now + 31_000;
    expect((await verifier.verify(await codeAt(later), later)).status).toBe('accepted');
  });

  it('resets the failure count after a successful code', async () => {
    const wrong = (await codeAt(now)) === '000000' ? '111111' : '000000';
    await verifier.verify(wrong, now);
    await verifier.verify(await codeAt(now), now);

    const later = now + STEP_MS;
    const laterWrong = (await codeAt(later)) === '000000' ? '111111' : '000000';
    expect(await verifier.verify(laterWrong, later)).toEqual({
      status: 'rejected',
      attemptsRemaining: 4,
    });
  });
});
