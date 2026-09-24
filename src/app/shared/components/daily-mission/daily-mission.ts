import { Component, computed, input } from '@angular/core';
import { ProgressBar } from '../progress-bar/progress-bar';

@Component({
  imports: [ProgressBar],
  selector: 'app-daily-mission',
  styleUrl: './daily-mission.scss',
  templateUrl: './daily-mission.html',
})
export class DailyMission {
  todayXp = input(0);
  targetXp = input(20);

  achieved = computed(() => this.todayXp() >= this.targetXp());
  percent = computed(() =>
    this.targetXp() ? Math.min(100, Math.round((this.todayXp() / this.targetXp()) * 100)) : 0,
  );
}
