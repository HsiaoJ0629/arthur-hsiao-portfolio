import { InjectionToken } from '@angular/core';

/** Current time in epoch milliseconds. Injected so tests can pin it. */
export const CLOCK = new InjectionToken<() => number>('CLOCK', {
  providedIn: 'root',
  factory: () => () => Date.now(),
});
