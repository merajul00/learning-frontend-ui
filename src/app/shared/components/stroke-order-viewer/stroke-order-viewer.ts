import { Component, computed, input, signal } from '@angular/core';

export interface StrokeOrderData {
  strokes: string[];
  viewBox?: string;
}

@Component({
  imports: [],
  selector: 'app-stroke-order-viewer',
  styleUrl: './stroke-order-viewer.scss',
  templateUrl: './stroke-order-viewer.html',
})
export class StrokeOrderViewer {
  character = input.required<string>();
  data = input<StrokeOrderData | null>(null);

  visibleCount = signal(0);
  playing = signal(false);

  viewBox = computed(() => this.data()?.viewBox ?? '0 0 109 109');
  strokes = computed(() => this.data()?.strokes ?? []);
  available = computed(() => this.strokes().length > 0);

  play(): void {
    const total = this.strokes().length;
    if (!total || this.playing()) return;

    this.playing.set(true);
    this.visibleCount.set(0);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      this.visibleCount.set(step);
      if (step >= total) {
        clearInterval(interval);
        this.playing.set(false);
      }
    }, 500);
  }
}
