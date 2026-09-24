export interface Level {
  id: string;
  number: number;
  slug: string;
  titleEn: string;
  titleBn: string;
  description: string;
  sortOrder: number;
  passPercent: number;
}

export type LevelState = 'locked' | 'available' | 'in_progress' | 'completed';
