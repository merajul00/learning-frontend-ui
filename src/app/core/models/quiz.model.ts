/** The learning_item column being tested — also the RPC's trusted comparison key. */
export type QuestionField = 'japanese' | 'romaji' | 'banglaPronunciation';

export interface QuizQuestion {
  learningItemId: string;
  promptField: QuestionField;
  answerField: QuestionField;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export type QuizKind = 'practice' | 'short_quiz';

export interface QuizAttemptResult {
  attemptId: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  xpAwarded: number;
}
