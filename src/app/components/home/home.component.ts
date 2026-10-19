import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AboutComponent } from '../about/about.component';

interface Service {
  title: string;
  text: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, AboutComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  services: Service[] = [
    { title: 'Backend', text: 'RESTful APIs and microservices in Java, Spring Boot and Node.js.' },
    { title: 'Frontend', text: 'Responsive, interactive interfaces with Angular, TypeScript and modern CSS.' },
    { title: 'Databases', text: 'Schema design and query tuning in MySQL and PostgreSQL.' },
    { title: 'Cloud & DevOps', text: 'Containerised deploys on Docker and AWS with CI/CD pipelines.' }
  ];

  facts = [
    { value: '6 yrs', label: 'Shipping production code' },
    { value: '2', label: 'Regulated sectors: fintech, health' },
    { value: 'Full', label: 'Stack — API to pixel to pipeline' },
    { value: '2 live', label: 'Demos you can try right here' }
  ];

  demoFeatures: string[] = ['Real-time search', 'Sorting', 'Pagination', 'CRUD', 'REST API'];
  mfaFeatures: string[] = ['TOTP (RFC 6238)', 'Web Crypto API', 'Replay protection', 'Lockout'];
}
