import { Injectable } from '@angular/core';
import { UserProgress } from '../models/user-progress.model';
import { SupabaseClientService } from './supabase-client';

interface UserProgressRow {
  user_id: string;
  level_id: string;
  lesson_id: string | null;
  current_item_index: number;
  items_completed: number;
  lesson_completed: boolean;
  level_completed: boolean;
  last_activity: string;
}

function toUserProgress(row: UserProgressRow): UserProgress {
  return {
    userId: row.user_id,
    levelId: row.level_id,
    lessonId: row.lesson_id,
    currentItemIndex: row.current_item_index,
    itemsCompleted: row.items_completed,
    lessonCompleted: row.lesson_completed,
    levelCompleted: row.level_completed,
    lastActivity: row.last_activity,
  };
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  constructor(private readonly supabase: SupabaseClientService) {}

  async getMyProgress(): Promise<UserProgress[]> {
    const { data, error } = await this.supabase.client
      .from('user_progress')
      .select(
        'user_id, level_id, lesson_id, current_item_index, items_completed, lesson_completed, level_completed, last_activity',
      );

    if (error) throw error;
    return (data as UserProgressRow[]).map(toUserProgress);
  }

  async getProgressForLevel(levelId: string): Promise<UserProgress | null> {
    const { data, error } = await this.supabase.client
      .from('user_progress')
      .select(
        'user_id, level_id, lesson_id, current_item_index, items_completed, lesson_completed, level_completed, last_activity',
      )
      .eq('level_id', levelId)
      .maybeSingle();

    if (error) throw error;
    return data ? toUserProgress(data as UserProgressRow) : null;
  }

  async hasAccessToLevel(levelId: string): Promise<boolean> {
    return (await this.getProgressForLevel(levelId)) !== null;
  }

  async updateItemProgress(
    levelId: string,
    currentItemIndex: number,
    itemsCompleted: number,
    lessonCompleted: boolean,
  ): Promise<void> {
    const {
      data: { user },
    } = await this.supabase.client.auth.getUser();
    if (!user) return;

    const { error } = await this.supabase.client.from('user_progress').upsert(
      {
        user_id: user.id,
        level_id: levelId,
        current_item_index: currentItemIndex,
        items_completed: itemsCompleted,
        lesson_completed: lessonCompleted,
        last_activity: new Date().toISOString(),
      },
      { onConflict: 'user_id,level_id' },
    );

    if (error) throw error;
  }
}
