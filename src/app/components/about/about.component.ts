import { Component } from '@angular/core';
import { SummaryComponent } from '../summary/summary.component';
import { SkillsComponent } from '../skills/skills.component';
import { HistoryComponent } from '../history/history.component';

/** Experience section: summary, skill filter and work history. */
@Component({
  selector: 'app-about',
  imports: [SummaryComponent, SkillsComponent, HistoryComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  selectedSkill = '';

  onSelectSkill(skill: string) {
    this.selectedSkill = skill;
  }
}
