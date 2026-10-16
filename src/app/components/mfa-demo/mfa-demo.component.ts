import { Component, Inject, NgZone, OnDestroy, afterNextRender } from '@angular/core';
import { MaterialModule } from '../../modules/material.module';
import { DemoNavComponent } from '../demo-nav/demo-nav.component';
import { base32Encode } from '../../service/totp/base32';
import { CLOCK } from '../../service/totp/clock';
import {
  TotpAlgorithm,
  TotpOptions,
  generateSecret,
  hotp,
  otpauthUri,
  secondsRemaining,
  timeStep,
} from '../../service/totp/totp';
import { DEFAULT_VERIFIER_POLICY, TotpVerifier, VerificationResult } from '../../service/totp/totp-verifier';

const PERIOD_SECONDS = 30;
const ATTEMPT_LOG_SIZE = 5;

/** Codes for the neighbouring time steps, shown so drift tolerance can be tried. */
interface CodeWindow {
  previous: string;
  current: string;
  next: string;
}

interface AttemptLogEntry {
  id: number;
  code: string;
  message: string;
  accepted: boolean;
}

/** Interactive TOTP (RFC 6238) demo: an authenticator and a server verifier, both in the browser. */
@Component({
  selector: 'app-mfa-demo',
  imports: [MaterialModule, DemoNavComponent],
  templateUrl: './mfa-demo.component.html',
  styleUrl: './mfa-demo.component.scss'
})
export class MfaDemoComponent implements OnDestroy {
  algorithms: TotpAlgorithm[] = ['SHA-1', 'SHA-256', 'SHA-512'];
  digitOptions: number[] = [6, 8];
  policy = DEFAULT_VERIFIER_POLICY;
  sourceUrl = 'https://github.com/HsiaoJ0629/arthur-hsiao-portfolio/tree/master/src/app/service/totp';
  features: string[] = ['RFC 6238', 'Web Crypto API', 'Clock-drift window', 'Replay protection', 'Lockout'];

  algorithm: TotpAlgorithm = 'SHA-1';
  digits = 6;
  /** Generated in the browser only, so a prerendered page never ships a secret. */
  secret: Uint8Array | null = null;
  secretBase32 = '';
  formattedSecret = '';
  keyUri = '';
  now = 0;
  codes: CodeWindow | null = null;

  codeInput = '';
  result: VerificationResult | null = null;
  attempts: AttemptLogEntry[] = [];
  isVerifying = false;

  private verifier: TotpVerifier | null = null;
  private codesStep = -1;
  private codeRequest = 0;
  private attemptId = 0;
  private intervalId?: ReturnType<typeof setInterval>;

  constructor(
    @Inject(CLOCK) private clock: () => number,
    private zone: NgZone
  ) {
    afterNextRender(() => {
      // Outside the zone so a one-second timer never holds the app "unstable".
      // The first secret waits a macrotask: state must not change mid-render.
      this.zone.runOutsideAngular(() => {
        setTimeout(() => this.zone.run(() => this.newSecret()));
        this.intervalId = setInterval(() => this.zone.run(() => this.tick()), 1000);
      });
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  get options(): TotpOptions {
    return { algorithm: this.algorithm, digits: this.digits, period: PERIOD_SECONDS };
  }

  get secondsLeft(): number {
    return secondsRemaining(this.now, PERIOD_SECONDS);
  }

  get progress(): number {
    return (this.secondsLeft / PERIOD_SECONDS) * 100;
  }

  newSecret() {
    this.secret = generateSecret();
    this.secretBase32 = base32Encode(this.secret);
    // Grouped in fours, the way authenticator apps display keys for manual entry.
    this.formattedSecret = this.secretBase32.match(/.{1,4}/g)?.join(' ') ?? '';
    this.settingsChanged();
  }

  setAlgorithm(algorithm: TotpAlgorithm) {
    this.algorithm = algorithm;
    this.settingsChanged();
  }

  setDigits(digits: number) {
    this.digits = digits;
    this.settingsChanged();
  }

  useCode(code: string) {
    this.codeInput = code;
  }

  async verify() {
    if (!this.verifier || this.isVerifying) return;

    const code = this.codeInput.trim();
    this.isVerifying = true;
    try {
      const result = await this.verifier.verify(code, this.clock());
      this.zone.run(() => {
        this.result = result;
        this.attempts = [
          { id: ++this.attemptId, code: code || '(empty)', message: this.describe(result), accepted: result.status === 'accepted' },
          ...this.attempts
        ].slice(0, ATTEMPT_LOG_SIZE);
        if (result.status === 'accepted') this.codeInput = '';
      });
    } finally {
      this.zone.run(() => (this.isVerifying = false));
    }
  }

  describe(result: VerificationResult): string {
    switch (result.status) {
      case 'accepted':
        return result.drift === 0
          ? 'Accepted: the code matches the current time step.'
          : `Accepted: the code was from the ${result.drift < 0 ? 'previous' : 'next'} time step, inside the clock-drift window.`;
      case 'rejected':
        return `Incorrect code. ${result.attemptsRemaining} attempt${result.attemptsRemaining === 1 ? '' : 's'} left before lockout.`;
      case 'replayed':
        return 'Rejected: this code has already been used. Wait for the next one.';
      case 'locked':
        return `Too many failed attempts. Locked for ${result.retryAfterSeconds} s.`;
      case 'malformed':
        return `Enter a ${this.digits}-digit code.`;
    }
  }

  /** A new secret or new settings mean fresh codes and fresh replay/lockout state. */
  private settingsChanged() {
    this.keyUri = otpauthUri(this.secretBase32, 'demo@portfolio', 'Arthur Hsiao', this.options);
    this.verifier = this.secret ? new TotpVerifier(this.secret, this.options) : null;
    this.codeInput = '';
    this.result = null;
    this.attempts = [];
    this.codesStep = -1;
    this.tick();
  }

  private tick() {
    this.now = this.clock();
    const step = timeStep(this.now, PERIOD_SECONDS);
    // Codes only change once per time step, so only recompute them then.
    if (this.secret && step !== this.codesStep) {
      this.codesStep = step;
      this.refreshCodes(this.secret, this.options, step);
    }
  }

  private async refreshCodes(secret: Uint8Array, options: TotpOptions, step: number) {
    const request = ++this.codeRequest;
    const [previous, current, next] = await Promise.all(
      [step - 1, step, step + 1].map(counter => hotp(secret, counter, options.digits, options.algorithm))
    );
    // Drop results from settings that have since changed.
    if (request === this.codeRequest) {
      this.zone.run(() => (this.codes = { previous, current, next }));
    }
  }
}
