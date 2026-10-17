import { Component, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { ContactComponent } from './components/contact/contact.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    ContactComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'my-angular-app';

  constructor(@Inject(DOCUMENT) private document: Document) {}

  /**
   * The <base href> makes a plain "#main" link resolve to the site root, which
   * would navigate away. Move focus to <main> directly instead (click time only,
   * so this never runs during prerendering).
   */
  skipToMain(event: Event): void {
    event.preventDefault();
    const main = this.document.getElementById('main');
    main?.focus();
    main?.scrollIntoView();
  }
}
