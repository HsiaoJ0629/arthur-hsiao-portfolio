import { DEFAULT_TOTP_OPTIONS, TotpOptions, constantTimeEqual, hotp, timeStep } from './totp';

/** How strictly the verifier treats clock drift and repeated failures. */
export interface VerifierPolicy {
  /** Time steps accepted either side of the current one, to absorb clock drift. */
  readonly window: number;
  /** Consecutive wrong codes allowed before the account is locked. */
  readonly maxFailedAttempts: number;
  readonly lockoutSeconds: number;
}

export const DEFAULT_VERIFIER_POLICY: VerifierPolicy = {
  window: 1,
  maxFailedAttempts: 5,
  lockoutSeconds: 30,
};

export type VerificationResult =
  /** `drift` is how many time steps the code was from the server's clock. */
  | { readonly status: 'accepted'; readonly drift: number }
  | { readonly status: 'rejected'; readonly attemptsRemaining: number }
  /** The code was correct but its time step has already been used. */
  | { readonly status: 'replayed' }
  | { readonly status: 'locked'; readonly retryAfterSeconds: number }
  /** Not the right shape to be a code; not counted as an attempt. */
  | { readonly status: 'malformed' };

/**
 * The server half of TOTP: checking a submitted code.
 *
 * Generating a code is the easy part. The decisions that matter live here —
 * how much clock drift to forgive, refusing a code that has already been used,
 * and making brute force impractical when there are only 10^6 possible codes.
 */
export class TotpVerifier {
  private lastAcceptedStep = -1;
  private failedAttempts = 0;
  private lockedUntilMs = 0;

  constructor(
    private readonly secret: Uint8Array,
    private readonly options: TotpOptions = DEFAULT_TOTP_OPTIONS,
    private readonly policy: VerifierPolicy = DEFAULT_VERIFIER_POLICY,
  ) {}

  async verify(code: string, nowMs: number): Promise<VerificationResult> {
    if (nowMs < this.lockedUntilMs) {
      return {
        status: 'locked',
        retryAfterSeconds: Math.ceil((this.lockedUntilMs - nowMs) / 1000),
      };
    }

    const candidate = code.trim();
    if (candidate.length !== this.options.digits || !/^\d+$/.test(candidate)) {
      return { status: 'malformed' };
    }

    const current = timeStep(nowMs, this.options.period);
    const steps: number[] = [];
    for (let drift = -this.policy.window; drift <= this.policy.window; drift++) {
      if (current + drift >= 0) {
        steps.push(current + drift);
      }
    }

    // Every window is computed and compared, so response time does not reveal
    // which step (if any) matched.
    const expected = await Promise.all(
      steps.map((step) => hotp(this.secret, step, this.options.digits, this.options.algorithm)),
    );
    const matches = expected.map((value) => constantTimeEqual(value, candidate));
    const matchedStep = steps.find((_, index) => matches[index]);

    // State is checked and updated synchronously after the only `await`, so two
    // concurrent submissions of the same code cannot both be accepted.
    if (matchedStep !== undefined) {
      if (matchedStep <= this.lastAcceptedStep) {
        return { status: 'replayed' };
      }
      this.lastAcceptedStep = matchedStep;
      this.failedAttempts = 0;
      return { status: 'accepted', drift: matchedStep - current };
    }

    this.failedAttempts++;
    if (this.failedAttempts >= this.policy.maxFailedAttempts) {
      this.failedAttempts = 0;
      this.lockedUntilMs = nowMs + this.policy.lockoutSeconds * 1000;
      return { status: 'locked', retryAfterSeconds: this.policy.lockoutSeconds };
    }
    return {
      status: 'rejected',
      attemptsRemaining: this.policy.maxFailedAttempts - this.failedAttempts,
    };
  }
}
