import { Injectable } from '@angular/core';
import { Level } from '../models/level.model';
import { SupabaseClientService } from './supabase-client';

interface LevelRow {
  id: string;
  number: number;
  slug: string;
  title_en: string;
  title_bn: string;
  description: string;
  sort_order: number;
  pass_percent: number;
}

function toLevel(row: LevelRow): Level {
  return {
    id: row.id,
    number: row.number,
    slug: row.slug,
    titleEn: row.title_en,
    titleBn: row.title_bn,
    description: row.description,
    sortOrder: row.sort_order,
    passPercent: row.pass_percent,
  };
}

@Injectable({ providedIn: 'root' })
export class LevelsService {
  constructor(private readonly supabase: SupabaseClientService) {}

  async getLevels(): Promise<Level[]> {
    const { data, error } = await this.supabase.client
      .from('levels')
      .select('id, number, slug, title_en, title_bn, description, sort_order, pass_percent')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data as LevelRow[]).map(toLevel);
  }

  async getItemCountsByLevel(): Promise<Map<string, number>> {
    const { data, error } = await this.supabase.client.from('learning_items').select('level_id');
    if (error) throw error;

    const counts = new Map<string, number>();
    for (const row of data as { level_id: string }[]) {
      counts.set(row.level_id, (counts.get(row.level_id) ?? 0) + 1);
    }
    return counts;
  }
}
