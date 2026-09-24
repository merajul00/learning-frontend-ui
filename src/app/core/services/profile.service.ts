import { Injectable } from '@angular/core';
import { Profile } from '../models/user-progress.model';
import { SupabaseClientService } from './supabase-client';

interface ProfileRow {
  user_id: string;
  display_name: string | null;
  current_level_id: string | null;
  current_lesson_id: string | null;
  current_item_index: number;
  total_xp: number;
  streak_count: number;
  last_activity_date: string | null;
}

function toProfile(row: ProfileRow): Profile {
  return {
    userId: row.user_id,
    displayName: row.display_name,
    currentLevelId: row.current_level_id,
    currentLessonId: row.current_lesson_id,
    currentItemIndex: row.current_item_index,
    totalXp: row.total_xp,
    streakCount: row.streak_count,
    lastActivityDate: row.last_activity_date,
  };
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private readonly supabase: SupabaseClientService) {}

  async getMyProfile(): Promise<Profile | null> {
    const { data, error } = await this.supabase.client
      .from('profiles')
      .select(
        'user_id, display_name, current_level_id, current_lesson_id, current_item_index, total_xp, streak_count, last_activity_date',
      )
      .maybeSingle();

    if (error) throw error;
    return data ? toProfile(data as ProfileRow) : null;
  }

  async updateDisplayName(displayName: string): Promise<void> {
    const {
      data: { user },
    } = await this.supabase.client.auth.getUser();
    if (!user) return;

    const { error } = await this.supabase.client
      .from('profiles')
      .update({ display_name: displayName })
      .eq('user_id', user.id);

    if (error) throw error;
  }
}
