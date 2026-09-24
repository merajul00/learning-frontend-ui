import { Component, computed, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-progress-bar',
  styleUrl: './progress-bar.scss',
  templateUrl: './progress-bar.html',
})
export class ProgressBar {
  /** 0-100 */
  value = input(0);
  label = input('');

  clamped = computed(() => Math.min(100, Math.max(0, this.value())));
}
