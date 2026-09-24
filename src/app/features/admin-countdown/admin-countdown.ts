import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppSettingsService } from '../../core/services/app-settings.service';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-admin-countdown',
  styleUrl: './admin-countdown.scss',
  templateUrl: './admin-countdown.html',
})
export class AdminCountdown implements OnInit {
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  saved = signal(false);

  targetAt = signal<Date | null>(null);
  targetInput = signal('');

  constructor(private readonly appSettings: AppSettingsService) {}

  async ngOnInit(): Promise<void> {
    try {
      const target = await this.appSettings.getCountdownTarget();
      this.targetAt.set(target);
      this.targetInput.set(toLocalInputValue(target));
    } finally {
      this.loading.set(false);
    }
  }

  async adjust(deltaMs: number): Promise<void> {
    const current = this.targetAt();
    if (!current) return;
    await this.save(new Date(current.getTime() + deltaMs));
  }

  async saveFromInput(): Promise<void> {
    const value = this.targetInput();
    if (!value) return;
    await this.save(new Date(value));
  }

  private async save(newTarget: Date): Promise<void> {
    this.saving.set(true);
    this.error.set(null);
    this.saved.set(false);
    try {
      await this.appSettings.setCountdownTarget(newTarget);
      this.targetAt.set(newTarget);
      this.targetInput.set(toLocalInputValue(newTarget));
      this.saved.set(true);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Could not update the countdown.');
    } finally {
      this.saving.set(false);
    }
  }
}

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
