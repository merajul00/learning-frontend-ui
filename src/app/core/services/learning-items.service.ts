import { Injectable } from '@angular/core';
import { LearningItem } from '../models/learning-item.model';
import { SupabaseClientService } from './supabase-client';

interface LearningItemRow {
  id: string;
  level_id: string;
  lesson_id: string;
  type: string;
  japanese: string;
  romaji: string | null;
  bangla_pronunciation: string | null;
  bangla_meaning: string | null;
  example_word_japanese: string | null;
  example_word_romaji: string | null;
  example_word_bangla: string | null;
  example_sentence_japanese: string | null;
  example_sentence_romaji: string | null;
  example_sentence_bangla: string | null;
  sort_order: number;
  stroke_order_data: { strokes: string[]; viewBox?: string } | null;
}

function toLearningItem(row: LearningItemRow): LearningItem {
  return {
    id: row.id,
    levelId: row.level_id,
    lessonId: row.lesson_id,
    type: row.type,
    japanese: row.japanese,
    romaji: row.romaji,
    banglaPronunciation: row.bangla_pronunciation,
    banglaMeaning: row.bangla_meaning,
    exampleWordJapanese: row.example_word_japanese,
    exampleWordRomaji: row.example_word_romaji,
    exampleWordBangla: row.example_word_bangla,
    exampleSentenceJapanese: row.example_sentence_japanese,
    exampleSentenceRomaji: row.example_sentence_romaji,
    exampleSentenceBangla: row.example_sentence_bangla,
    sortOrder: row.sort_order,
    strokeOrderData: row.stroke_order_data,
  };
}

export interface LessonGroup {
  id: string;
  title: string;
  sortOrder: number;
}

@Injectable({ providedIn: 'root' })
export class LearningItemsService {
  constructor(private readonly supabase: SupabaseClientService) {}

  async getItemsForLevel(levelId: string): Promise<LearningItem[]> {
    const { data, error } = await this.supabase.client
      .from('learning_items')
      .select(
        'id, level_id, lesson_id, type, japanese, romaji, bangla_pronunciation, bangla_meaning, example_word_japanese, example_word_romaji, example_word_bangla, example_sentence_japanese, example_sentence_romaji, example_sentence_bangla, sort_order, stroke_order_data',
      )
      .eq('level_id', levelId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data as LearningItemRow[]).map(toLearningItem);
  }

  async getLessonsForLevel(levelId: string): Promise<LessonGroup[]> {
    const { data, error } = await this.supabase.client
      .from('lessons')
      .select('id, title, sort_order')
      .eq('level_id', levelId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data as { id: string; title: string; sort_order: number }[]).map((row) => ({
      id: row.id,
      title: row.title,
      sortOrder: row.sort_order,
    }));
  }
}
