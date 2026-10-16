import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  email = 'arthur.hsiao0629@gmail.com';
  linkedInUrl = 'https://www.linkedin.com/in/arthur-hsiao-2874bb172/';
  year = new Date().getFullYear();

  get mailto(): string {
    return `mailto:${this.email}?subject=${encodeURIComponent('Portfolio Contact')}`;
  }
}
