import { Injectable } from '@angular/core';
import { SupabaseClientService } from './supabase-client';

@Injectable({ providedIn: 'root' })
export class XpRulesService {
  constructor(private readonly supabase: SupabaseClientService) {}

  async getRules(): Promise<Map<string, number>> {
    const { data, error } = await this.supabase.client.from('xp_rules').select('key, amount');
    if (error) throw error;
    return new Map((data as { key: string; amount: number }[]).map((row) => [row.key, row.amount]));
  }
}
