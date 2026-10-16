import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface DemoLink {
  path: string;
  label: string;
}

/** Shared bar at the top of each demo page: back to the demo list, plus a switcher between demos. */
@Component({
  selector: 'app-demo-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './demo-nav.component.html',
  styleUrl: './demo-nav.component.scss'
})
export class DemoNavComponent {
  demos: DemoLink[] = [
    { path: '/demo', label: 'Product management' },
    { path: '/mfa-demo', label: 'MFA (TOTP)' },
  ];
}
