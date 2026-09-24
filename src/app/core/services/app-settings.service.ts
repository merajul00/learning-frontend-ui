import { Injectable, signal } from '@angular/core';
import { SupabaseClientService } from './supabase-client';

interface CountdownSettingsRow {
  target_at: string;
}

@Injectable({ providedIn: 'root' })
export class AppSettingsService {
  readonly countdownTargetAt = signal<Date | null>(null);

  constructor(private readonly supabase: SupabaseClientService) {}

  async getCountdownTarget(): Promise<Date> {
    const { data, error } = await this.supabase.client
      .from('countdown_settings')
      .select('target_at')
      .eq('id', 1)
      .single();

    if (error) throw error;
    const target = new Date((data as CountdownSettingsRow).target_at);
    this.countdownTargetAt.set(target);
    return target;
  }

  async setCountdownTarget(targetAt: Date): Promise<void> {
    const {
      data: { user },
    } = await this.supabase.client.auth.getUser();
    if (!user) throw new Error('Not signed in.');

    const { error } = await this.supabase.client
      .from('countdown_settings')
      .update({ target_at: targetAt.toISOString(), updated_by: user.id })
      .eq('id', 1);

    if (error) throw error;
    this.countdownTargetAt.set(targetAt);
  }
}
