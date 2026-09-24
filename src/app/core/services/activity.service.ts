import { Injectable } from '@angular/core';
import { SupabaseClientService } from './supabase-client';

export interface ActivityResult {
  totalXp: number;
  streakCount: number;
  xpAwarded: number;
}

export interface DailyActivityRow {
  activityDate: string;
  xpEarned: number;
  activitiesCount: number;
}

@Injectable({ providedIn: 'root' })
export class ActivityService {
  constructor(private readonly supabase: SupabaseClientService) {}

  /** Awards XP (looked up server-side from xp_rules) and updates the learning streak. */
  async recordActivity(source: string): Promise<ActivityResult | null> {
    const { data, error } = await this.supabase.client.rpc('record_learning_activity', {
      p_source: source,
    });
    if (error) throw error;
    const row = (data as any[])?.[0];
    if (!row) return null;
    return { totalXp: row.total_xp, streakCount: row.streak_count, xpAwarded: row.xp_awarded };
  }

  async getRecentActivity(days: number): Promise<DailyActivityRow[]> {
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    const sinceStr = since.toISOString().slice(0, 10);

    const { data, error } = await this.supabase.client
      .from('daily_activity')
      .select('activity_date, xp_earned, activities_count')
      .gte('activity_date', sinceStr)
      .order('activity_date', { ascending: true });

    if (error) throw error;
    return (data as any[]).map((row) => ({
      activityDate: row.activity_date,
      xpEarned: row.xp_earned,
      activitiesCount: row.activities_count,
    }));
  }
}
