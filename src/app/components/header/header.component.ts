import { Component, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subscription, filter } from 'rxjs';

/** Paths of the demo pages; the single "Demos" nav item is highlighted on any of them. */
const DEMO_PATHS = ['/demo', '/mfa-demo'];

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnDestroy {
  onDemoPage = false;
  private sub: Subscription;

  constructor(private router: Router) {
    this.onDemoPage = this.isDemoUrl(this.router.url);
    this.sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => (this.onDemoPage = this.isDemoUrl(e.urlAfterRedirects)));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private isDemoUrl(url: string): boolean {
    const path = url.split(/[?#]/)[0];
    return DEMO_PATHS.includes(path);
  }
}
