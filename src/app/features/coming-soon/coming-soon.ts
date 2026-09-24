import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AppSettingsService } from '../../core/services/app-settings.service';

interface Countdown {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

@Component({
  imports: [],
  selector: 'app-coming-soon',
  styleUrl: './coming-soon.scss',
  templateUrl: './coming-soon.html',
})
export class ComingSoon implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly appSettings = inject(AppSettingsService);

  private targetAt = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
  private readonly remainingMs = signal(this.targetAt.getTime() - Date.now());

  readonly data = toSignal(
    this.route.data.pipe(
      map((data) => ({
        title: (data['title'] as string) ?? 'Coming soon',
        description: (data['description'] as string) ?? '',
      })),
    ),
    { initialValue: { title: 'Coming soon', description: '' } },
  );

  readonly countdown = computed<Countdown>(() => {
    const totalSeconds = Math.max(Math.floor(this.remainingMs() / 1000), 0);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      days: pad(days),
      hours: pad(hours),
      minutes: pad(minutes),
      seconds: pad(seconds),
    };
  });

  ngOnInit(): void {
    const intervalId = setInterval(() => {
      this.remainingMs.set(this.targetAt.getTime() - Date.now());
    }, 1000);

    this.destroyRef.onDestroy(() => clearInterval(intervalId));

    this.appSettings
      .getCountdownTarget()
      .then((target) => {
        this.targetAt = target;
        this.remainingMs.set(this.targetAt.getTime() - Date.now());
      })
      .catch(() => {
        // Fall back to the local placeholder target if the backend value can't be read.
      });
  }
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}
