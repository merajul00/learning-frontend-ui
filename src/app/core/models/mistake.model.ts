export interface MistakeItem {
  id: string;
  levelId: string;
  levelNumber: number;
  levelTitleEn: string;
  levelTitleBn: string;
  learningItemId: string;
  japanese: string;
  romaji: string | null;
  banglaPronunciation: string | null;
  mistakeCount: number;
  lastWrongAnswer: string | null;
  lastCorrectAnswer: string | null;
  source: string;
  lastMistakenAt: string;
}
