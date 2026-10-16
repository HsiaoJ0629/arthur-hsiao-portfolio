import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { base32Decode } from '../../service/totp/base32';
import { CLOCK } from '../../service/totp/clock';
import { totp } from '../../service/totp/totp';
import { MfaDemoComponent } from './mfa-demo.component';

describe('MfaDemoComponent', () => {
  /** Pinned mid-step so neighbouring codes are unambiguous. */
  const NOW = 1_700_000_015_000;

  let fixture: ComponentFixture<MfaDemoComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfaDemoComponent],
      providers: [provideNoopAnimations(), { provide: CLOCK, useValue: () => NOW }]
    }).compileComponents();

    fixture = TestBed.createComponent(MfaDemoComponent);
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    await waitFor(() => /^\d{6}$/.test(currentCode()));
  });

  /** Web Crypto resolves asynchronously, so poll until the DOM catches up. */
  async function waitFor(condition: () => boolean): Promise<void> {
    for (let attempt = 0; attempt < 50; attempt++) {
      fixture.detectChanges();
      if (condition()) return;
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    throw new Error('Condition not met in time.');
  }

  const text = (selector: string): string => element.querySelector(selector)?.textContent?.trim() ?? '';
  const currentCode = (): string => text('[data-testid="current-code"]');
  const secret = (): Uint8Array => base32Decode(text('[data-testid="secret"]'));
  const result = (): string => text('.result');

  function button(label: string): HTMLButtonElement {
    const match = Array.from(element.querySelectorAll('button')).find(b => b.textContent?.trim().startsWith(label));
    if (!match) throw new Error(`No button labelled "${label}".`);
    return match;
  }

  async function submit(): Promise<void> {
    const previous = text('[data-testid="attempts"]');
    button('Verify').click();
    await waitFor(() => text('[data-testid="attempts"]') !== previous);
  }

  it('shows the TOTP code for the displayed secret', async () => {
    expect(currentCode()).toBe(await totp(secret(), NOW));
  });

  it('accepts the current code, then rejects it as a replay', async () => {
    button('Use current code').click();
    await submit();
    expect(result()).toContain('Accepted');

    button('Use current code').click();
    await submit();
    expect(result()).toContain('already been used');
  });

  it('accepts the previous code inside the drift window', async () => {
    button('Previous').click();
    await submit();
    expect(result()).toContain('previous time step');
  });

  it('counts down attempts on a wrong code', async () => {
    fixture.componentInstance.codeInput = '000000' === currentCode() ? '111111' : '000000';
    await submit();
    expect(result()).toContain('attempts left');
  });

  it('starts over when the algorithm changes', async () => {
    const before = currentCode();
    button('SHA-256').click();
    await waitFor(() => currentCode() !== before);
    expect(currentCode()).toBe(await totp(secret(), NOW, { algorithm: 'SHA-256', digits: 6, period: 30 }));
  });
});
