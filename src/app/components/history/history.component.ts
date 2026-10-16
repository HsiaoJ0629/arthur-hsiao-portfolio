import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

interface WorkHistory {
  company: string;
  role: string;
  sector: string;
  start_year: number;
  end_year: number | string;
  responsibilities: string[];
  skills: string[];
}

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryComponent {
  /** Skill picked in the skills panel; roles that use it are highlighted, others fade. */
  @Input() selectedSkill = '';

  workHistorys: WorkHistory[] = [
    {
      company: 'Attvest Finance',
      role: 'Developer',
      sector: 'Fintech',
      start_year: 2022,
      end_year: 'Present',
      responsibilities: [
        'Designed and implemented scalable backend systems using Java and Spring Boot.',
        'Developed dynamic, user-friendly frontend interfaces with Angular and Bootstrap.',
        'Led technology research initiatives to integrate new tools, improving team efficiency.',
        'Mentored junior developers, growing their technical skills and contributing to project success.',
        'Streamlined business processes with efficient IT solutions, increasing productivity.',
      ],
      skills: [
        'Java', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Angular', 'Angular Material', 'Bootstrap',
        'Spring Boot', 'MySQL', 'Docker', 'GIT', 'WildFly', 'RESTful APIs', 'Agile Development',
        'Microservices Architecture', 'AWS S3', 'AWS Textract',
      ],
    },
    {
      company: 'Sterling Systems',
      role: 'Junior Programmer',
      sector: 'Healthcare systems',
      start_year: 2020,
      end_year: 2022,
      responsibilities: [
        'Built and maintained web applications with Angular on the frontend and Node.js/Express.js on the backend.',
        'Managed PostgreSQL databases, ensuring data integrity and performance.',
        'Enhanced user interfaces with Angular Material and CSS, improving customer satisfaction.',
        'Provided prompt, effective customer support through online meetings and phone calls.',
        'Used GIT for version control to keep collaboration smooth across the team.',
      ],
      skills: [
        'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Angular', 'Angular Material', 'Bootstrap',
        'Node.js', 'Express.js', 'PostgreSQL', 'GIT', 'RESTful APIs',
      ],
    },
  ];

  uses(wh: WorkHistory): boolean {
    return !!this.selectedSkill && wh.skills.includes(this.selectedSkill);
  }

  isDimmed(wh: WorkHistory): boolean {
    return !!this.selectedSkill && !wh.skills.includes(this.selectedSkill);
  }

  displayDate(wh: WorkHistory): string {
    return `${wh.start_year} — ${wh.end_year}`;
  }
}
