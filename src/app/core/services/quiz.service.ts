import { Injectable } from '@angular/core';
import { QuizAttemptResult, QuizKind, QuizQuestion } from '../models/quiz.model';
import { FIELD_TO_DB_COLUMN } from '../../shared/utils/quiz-generator';
import { SupabaseClientService } from './supabase-client';

export interface QuizAnswerInput {
  question: QuizQuestion;
  selectedValue: string;
}

@Injectable({ providedIn: 'root' })
export class QuizService {
  constructor(private readonly supabase: SupabaseClientService) {}

  /**
   * Submits raw selected values only — the server (submit_quiz_attempt RPC) looks up the
   * correct answer from learning_items itself, so the client never self-reports a score.
   */
  async submitAttempt(
    levelId: string,
    kind: QuizKind,
    answers: QuizAnswerInput[],
  ): Promise<QuizAttemptResult> {
    const payload = answers.map((answer) => ({
      learning_item_id: answer.question.learningItemId,
      expected_field: FIELD_TO_DB_COLUMN[answer.question.answerField],
      selected_value: answer.selectedValue,
    }));

    const { data, error } = await this.supabase.client.rpc('submit_quiz_attempt', {
      p_level_id: levelId,
      p_kind: kind,
      p_answers: payload,
    });
    if (error) throw error;

    const row = (data as any[])[0];
    return {
      attemptId: row.attempt_id,
      totalQuestions: row.total_questions,
      correctCount: row.correct_count,
      wrongCount: row.wrong_count,
      accuracy: Number(row.accuracy),
      xpAwarded: row.xp_awarded,
    };
  }
}
