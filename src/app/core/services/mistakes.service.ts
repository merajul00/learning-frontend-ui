import { Injectable } from '@angular/core';
import { MistakeItem } from '../models/mistake.model';
import { SupabaseClientService } from './supabase-client';

@Injectable({ providedIn: 'root' })
export class MistakesService {
  constructor(private readonly supabase: SupabaseClientService) {}

  async getMyMistakes(): Promise<MistakeItem[]> {
    const { data, error } = await this.supabase.client
      .from('mistakes')
      .select(
        'id, level_id, learning_item_id, mistake_count, last_wrong_answer, last_correct_answer, source, last_mistaken_at, ' +
          'learning_items(japanese, romaji, bangla_pronunciation), levels(number, title_en, title_bn)',
      )
      .order('mistake_count', { ascending: false });

    if (error) throw error;

    return (data as any[]).map((row) => ({
      id: row.id,
      levelId: row.level_id,
      levelNumber: row.levels?.number ?? 0,
      levelTitleEn: row.levels?.title_en ?? '',
      levelTitleBn: row.levels?.title_bn ?? '',
      learningItemId: row.learning_item_id,
      japanese: row.learning_items?.japanese ?? '',
      romaji: row.learning_items?.romaji ?? null,
      banglaPronunciation: row.learning_items?.bangla_pronunciation ?? null,
      mistakeCount: row.mistake_count,
      lastWrongAnswer: row.last_wrong_answer,
      lastCorrectAnswer: row.last_correct_answer,
      source: row.source,
      lastMistakenAt: row.last_mistaken_at,
    }));
  }
}
