import { Injectable } from '@angular/core';
import { ExamAnswerDetail, ExamAttemptResult } from '../models/exam.model';
import { QuizQuestion } from '../models/quiz.model';
import { FIELD_TO_DB_COLUMN } from '../../shared/utils/quiz-generator';
import { SupabaseClientService } from './supabase-client';

export interface ExamAnswerInput {
  question: QuizQuestion;
  selectedValue: string | null;
}

function toExamAttemptResult(row: any): ExamAttemptResult {
  return {
    attemptId: row.attempt_id,
    totalQuestions: row.total_questions,
    correctCount: row.correct_count,
    wrongCount: row.wrong_count,
    score: Number(row.score),
    accuracy: Number(row.accuracy),
    passed: row.passed,
    xpAwarded: row.xp_awarded,
    levelCompleted: row.level_completed,
    nextLevelUnlocked: row.next_level_unlocked,
  };
}

@Injectable({ providedIn: 'root' })
export class ExamService {
  constructor(private readonly supabase: SupabaseClientService) {}

  /**
   * Submits raw selected values only — submit_exam_attempt derives correctness from
   * learning_items server-side and is the sole authority for pass/fail + level unlock.
   */
  async submitAttempt(levelId: string, answers: ExamAnswerInput[]): Promise<ExamAttemptResult> {
    const payload = answers.map((answer) => ({
      learning_item_id: answer.question.learningItemId,
      expected_field: FIELD_TO_DB_COLUMN[answer.question.answerField],
      selected_value: answer.selectedValue ?? '',
    }));

    const { data, error } = await this.supabase.client.rpc('submit_exam_attempt', {
      p_level_id: levelId,
      p_answers: payload,
    });
    if (error) throw error;

    return toExamAttemptResult((data as any[])[0]);
  }

  async getLatestAttempt(): Promise<ExamAttemptResult | null> {
    const { data, error } = await this.supabase.client
      .from('exam_attempts')
      .select('id, total_questions, correct_count, wrong_count, score, accuracy, passed, xp_earned')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    return {
      attemptId: data.id,
      totalQuestions: data.total_questions,
      correctCount: data.correct_count,
      wrongCount: data.wrong_count,
      score: Number(data.score),
      accuracy: Number(data.accuracy),
      passed: data.passed,
      xpAwarded: data.xp_earned,
      levelCompleted: data.passed,
      nextLevelUnlocked: false,
    };
  }

  async getAttemptSummary(attemptId: string): Promise<ExamAttemptResult & { levelId: string }> {
    const { data, error } = await this.supabase.client
      .from('exam_attempts')
      .select(
        'id, level_id, total_questions, correct_count, wrong_count, score, accuracy, passed, xp_earned',
      )
      .eq('id', attemptId)
      .single();
    if (error) throw error;

    return {
      attemptId: data.id,
      levelId: data.level_id,
      totalQuestions: data.total_questions,
      correctCount: data.correct_count,
      wrongCount: data.wrong_count,
      score: Number(data.score),
      accuracy: Number(data.accuracy),
      passed: data.passed,
      xpAwarded: data.xp_earned,
      levelCompleted: data.passed,
      nextLevelUnlocked: false,
    };
  }

  async getWrongAnswers(attemptId: string): Promise<ExamAnswerDetail[]> {
    const { data, error } = await this.supabase.client
      .from('exam_answers')
      .select(
        'id, learning_item_id, selected_option, correct_option, is_correct, learning_items(japanese, romaji, bangla_pronunciation)',
      )
      .eq('attempt_id', attemptId)
      .eq('is_correct', false);
    if (error) throw error;

    return (data as any[]).map((row) => ({
      id: row.id,
      learningItemId: row.learning_item_id,
      selectedOption: row.selected_option,
      correctOption: row.correct_option,
      isCorrect: row.is_correct,
      japanese: row.learning_items?.japanese ?? '',
      romaji: row.learning_items?.romaji ?? null,
      banglaPronunciation: row.learning_items?.bangla_pronunciation ?? null,
    }));
  }
}
