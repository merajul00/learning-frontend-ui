export interface LearningItem {
  id: string;
  levelId: string;
  lessonId: string;
  type: string;
  japanese: string;
  romaji: string | null;
  banglaPronunciation: string | null;
  banglaMeaning: string | null;
  exampleWordJapanese: string | null;
  exampleWordRomaji: string | null;
  exampleWordBangla: string | null;
  exampleSentenceJapanese: string | null;
  exampleSentenceRomaji: string | null;
  exampleSentenceBangla: string | null;
  sortOrder: number;
  strokeOrderData: { strokes: string[]; viewBox?: string } | null;
}
