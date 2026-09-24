import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Level, LevelState } from '../../../core/models/level.model';
import { ProgressBar } from '../progress-bar/progress-bar';

@Component({
  imports: [RouterLink, ProgressBar],
  selector: 'app-level-card',
  styleUrl: './level-card.scss',
  templateUrl: './level-card.html',
})
export class LevelCard {
  level = input.required<Level>();
  state = input<LevelState>('locked');
  itemsCompleted = input(0);
  totalItems = input(0);

  isLocked = computed(() => this.state() === 'locked');

  progressPercent = computed(() => {
    const total = this.totalItems();
    if (!total) return 0;
    return Math.round((this.itemsCompleted() / total) * 100);
  });

  statusLabel = computed(() => {
    switch (this.state()) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'available':
        return 'Available';
      default:
        return 'Locked';
    }
  });
}
