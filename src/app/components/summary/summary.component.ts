import { Component } from '@angular/core';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent {
  summary =
    'I specialise in Java, Angular, Spring Boot and MySQL, using them to build solutions that improve ' +
    'business performance. I enjoy mentoring junior developers and building a collaborative team, ' +
    'and I care about results that match business goals while continuously learning and adapting to new challenges.';
}
