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

  demoFeatures: string[] = ['Real-time search', 'Sorting', 'Pagination', 'CRUD', 'REST API'];
}
