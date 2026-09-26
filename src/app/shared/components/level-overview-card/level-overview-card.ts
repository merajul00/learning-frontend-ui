import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LevelState } from '../../../core/models/level.model';

export interface LessonChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

/**
 * Level card with lesson checklist, progress and actions.
 * Figma: 292:4090 (Completed), 293:4744 (In Progress), 293:4815 (Lock).
 */
@Component({
  imports: [RouterLink],
  selector: 'app-level-overview-card',
  styleUrl: './level-overview-card.scss',
  templateUrl: './level-overview-card.html',
})
export class LevelOverviewCard {
  /** Number shown in the red badge (padded to two digits). */
  number = input.required<number>();
  title = input.required<string>();
  state = input<LevelState>('locked');
  /** 0-100 */
  progress = input(0);
  lessons = input<LessonChecklistItem[]>([]);
  /** Level that the title, Practice and Exam open; null disables them. */
  levelId = input<string | null>(null);

  isLocked = computed(() => this.state() === 'locked' || this.levelId() === null);

  badgeNumber = computed(() => String(this.number()).padStart(2, '0'));

  progressPercent = computed(() => Math.min(100, Math.max(0, Math.round(this.progress()))));

  statusLabel = computed(() => {
    switch (this.state()) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'available':
        return 'Not Started';
      default:
        return 'Lock';
    }
  });
}
