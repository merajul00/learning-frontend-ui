export interface ExamAttemptResult {
  attemptId: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  score: number;
  accuracy: number;
  passed: boolean;
  xpAwarded: number;
  levelCompleted: boolean;
  nextLevelUnlocked: boolean;
}

export interface ExamAnswerDetail {
  id: string;
  learningItemId: string;
  selectedOption: string | null;
  correctOption: string;
  isCorrect: boolean;
  japanese: string;
  romaji: string | null;
  banglaPronunciation: string | null;
}
