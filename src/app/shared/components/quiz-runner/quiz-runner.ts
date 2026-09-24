import { LowerCasePipe } from '@angular/common';
import { Component, OnInit, computed, input, output, signal } from '@angular/core';
import { Level } from '../../../core/models/level.model';
import { LearningItem } from '../../../core/models/learning-item.model';
import { QuizAttemptResult, QuizKind, QuizQuestion } from '../../../core/models/quiz.model';
import { QuizAnswerInput, QuizService } from '../../../core/services/quiz.service';
import { generateQuestions } from '../../utils/quiz-generator';
import { PRACTICE_QUESTION_COUNT, SHORT_QUIZ_QUESTION_COUNT } from '../../utils/quiz-config';
import { AudioButton } from '../audio-button/audio-button';
import { ProgressBar } from '../progress-bar/progress-bar';

function equalsIgnoreCase(a: string | null, b: string | null): boolean {
  return (a ?? '').trim().toLowerCase() === (b ?? '').trim().toLowerCase();
}

@Component({
  imports: [AudioButton, ProgressBar, LowerCasePipe],
  selector: 'app-quiz-runner',
  styleUrl: './quiz-runner.scss',
  templateUrl: './quiz-runner.html',
})
export class QuizRunner implements OnInit {
  level = input.required<Level>();
  items = input.required<LearningItem[]>();
  kind = input.required<QuizKind>();
  restrictToItemIds = input<string[] | null>(null);

  completed = output<QuizAttemptResult>();

  questions = signal<QuizQuestion[]>([]);
  currentIndex = signal(0);
  selected = signal<string | null>(null);
  submitted = signal(false);
  answers = signal<(QuizAnswerInput | undefined)[]>([]);
  finished = signal(false);
  result = signal<QuizAttemptResult | null>(null);
  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  kindLabel = computed(() => (this.kind() === 'short_quiz' ? 'Short Quiz' : 'Practice'));
  currentQuestion = computed<QuizQuestion | null>(() => this.questions()[this.currentIndex()] ?? null);
  isLastQuestion = computed(() => this.currentIndex() === this.questions().length - 1);
  progressPercent = computed(() =>
    this.questions().length
      ? Math.round(((this.currentIndex() + 1) / this.questions().length) * 100)
      : 0,
  );
  isCorrect = computed(() => equalsIgnoreCase(this.selected(), this.currentQuestion()?.correctAnswer ?? null));

  constructor(private readonly quizService: QuizService) {}

  ngOnInit(): void {
    this.setupQuestions();
  }

  private setupQuestions(): void {
    const restrict = this.restrictToItemIds();
    const count = restrict?.length
      ? Math.max(restrict.length, Math.min(5, this.items().length))
      : this.kind() === 'short_quiz'
        ? SHORT_QUIZ_QUESTION_COUNT
        : PRACTICE_QUESTION_COUNT;

    this.questions.set(
      generateQuestions(this.items(), count, { restrictToItemIds: restrict ?? undefined }),
    );
    this.answers.set(new Array(this.questions().length).fill(undefined));
    this.currentIndex.set(0);
    this.selected.set(null);
    this.submitted.set(false);
    this.finished.set(false);
    this.result.set(null);
    this.errorMessage.set(null);
  }

  selectOption(value: string): void {
    if (this.submitted()) return;
    this.selected.set(value);
  }

  submitAnswer(): void {
    const question = this.currentQuestion();
    if (!question || !this.selected()) return;

    this.submitted.set(true);
    this.answers.update((list) => {
      const copy = [...list];
      copy[this.currentIndex()] = { question, selectedValue: this.selected()! };
      return copy;
    });
  }

  previous(): void {
    if (this.currentIndex() === 0) return;
    this.currentIndex.update((i) => i - 1);
    this.restoreAnswerForCurrent();
  }

  async next(): Promise<void> {
    if (this.isLastQuestion()) {
      await this.finish();
      return;
    }
    this.currentIndex.update((i) => i + 1);
    this.restoreAnswerForCurrent();
  }

  private restoreAnswerForCurrent(): void {
    const recorded = this.answers()[this.currentIndex()];
    this.selected.set(recorded?.selectedValue ?? null);
    this.submitted.set(!!recorded);
  }

  private async finish(): Promise<void> {
    const answers = this.answers().filter((a): a is QuizAnswerInput => !!a);
    if (answers.length === 0) return;

    this.submitting.set(true);
    this.errorMessage.set(null);
    try {
      const result = await this.quizService.submitAttempt(this.level().id, this.kind(), answers);
      this.result.set(result);
      this.finished.set(true);
      this.completed.emit(result);
    } catch {
      this.errorMessage.set('Something went wrong submitting your answers. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }

  retry(): void {
    this.setupQuestions();
  }
}
