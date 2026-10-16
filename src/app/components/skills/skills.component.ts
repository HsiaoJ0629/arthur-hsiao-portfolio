import { Component, EventEmitter, Input, Output } from '@angular/core';

interface SkillGroup {
  category: string;
  items: string[];
}

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
})
export class SkillsComponent {
  @Input() selectedSkill = '';
  @Output() selectSkill = new EventEmitter<string>();

  skills: SkillGroup[] = [
    { category: 'Languages', items: ['Java', 'TypeScript', 'JavaScript', 'HTML', 'CSS'] },
    { category: 'Frontend', items: ['Angular', 'Angular Material', 'Bootstrap'] },
    { category: 'Backend', items: ['Spring Boot', 'Node.js', 'Express.js'] },
    { category: 'Databases', items: ['MySQL', 'PostgreSQL'] },
    { category: 'Tools', items: ['Docker', 'GIT', 'WildFly', 'AWS S3', 'AWS Textract'] },
    { category: 'Practices', items: ['RESTful APIs', 'Agile Development', 'Microservices Architecture'] },
  ];

  /** Clicking the active skill again clears the filter. */
  onSelectSkill(skill: string) {
    const next = skill === this.selectedSkill ? '' : skill;
    this.selectedSkill = next;
    this.selectSkill.emit(next);
  }

  clear() {
    this.selectedSkill = '';
    this.selectSkill.emit('');
  }
}
