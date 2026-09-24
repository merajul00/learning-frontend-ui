import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Level } from '../../core/models/level.model';
import { LearningItem } from '../../core/models/learning-item.model';
import { QuizQuestion } from '../../core/models/quiz.model';
import { UserProgress } from '../../core/models/user-progress.model';
import { ExamAnswerInput, ExamService } from '../../core/services/exam.service';
import { LearningItemsService } from '../../core/services/learning-items.service';
import { LevelsService } from '../../core/services/levels.service';
import { ProgressService } from '../../core/services/progress.service';
import { AudioButton } from '../../shared/components/audio-button/audio-button';
import { FINAL_EXAM_MAX_QUESTIONS } from '../../shared/utils/quiz-config';
import { generateQuestions } from '../../shared/utils/quiz-generator';

interface AnswerState {
  selectedValue: string | null;
  marked: boolean;
}

type NavState = 'current' | 'answered' | 'marked' | 'not_answered';

@Component({
  imports: [RouterLink, AudioButton],
  selector: 'app-exam',
  styleUrl: './exam.scss',
  templateUrl: './exam.html',
})
export class Exam implements OnInit {
  readonly levelId: string;

  level = signal<Level | null>(null);
  items = signal<LearningItem[]>([]);
  progress = signal<UserProgress | null>(null);
  loading = signal(true);

  questions = signal<QuizQuestion[]>([]);
  answers = signal<AnswerState[]>([]);
  currentIndex = signal(0);
  confirmingSubmit = signal(false);
  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  currentQuestion = computed<QuizQuestion | null>(() => this.questions()[this.currentIndex()] ?? null);
  currentAnswer = computed<AnswerState | null>(() => this.answers()[this.currentIndex()] ?? null);
  answeredCount = computed(() => this.answers().filter((a) => a.selectedValue !== null).length);
  unansweredCount = computed(() => this.questions().length - this.answeredCount());
  isLastQuestion = computed(() => this.currentIndex() === this.questions().length - 1);

  constructor(
    route: ActivatedRoute,
    private readonly router: Router,
    private readonly levelsService: LevelsService,
    private readonly itemsService: LearningItemsService,
    private readonly progressService: ProgressService,
    private readonly examService: ExamService,
  ) {
    this.levelId = route.snapshot.paramMap.get('id')!;
  }

  async ngOnInit(): Promise<void> {
    try {
      const [levels, items, progress] = await Promise.all([
        this.levelsService.getLevels(),
        this.itemsService.getItemsForLevel(this.levelId),
        this.progressService.getProgressForLevel(this.levelId),
      ]);

      this.level.set(levels.find((level) => level.id === this.levelId) ?? null);
      this.items.set(items);
      this.progress.set(progress);

      if (progress?.lessonCompleted && items.length > 0) {
        const count = Math.min(items.length, FINAL_EXAM_MAX_QUESTIONS);
        const questions = generateQuestions(items, count);
        this.questions.set(questions);
        this.answers.set(questions.map(() => ({ selectedValue: null, marked: false })));
      }
    } finally {
      this.loading.set(false);
    }
  }

  navState(index: number): NavState {
    if (index === this.currentIndex()) return 'current';
    const answer = this.answers()[index];
    if (answer.marked) return 'marked';
    if (answer.selectedValue !== null) return 'answered';
    return 'not_answered';
  }

  goTo(index: number): void {
    this.currentIndex.set(index);
  }

  selectOption(value: string): void {
    this.answers.update((list) => {
      const copy = [...list];
      copy[this.currentIndex()] = { ...copy[this.currentIndex()], selectedValue: value };
      return copy;
    });
  }

  toggleMark(): void {
    this.answers.update((list) => {
      const copy = [...list];
      const current = copy[this.currentIndex()];
      copy[this.currentIndex()] = { ...current, marked: !current.marked };
      return copy;
    });
  }

  previous(): void {
    if (this.currentIndex() === 0) return;
    this.currentIndex.update((i) => i - 1);
  }

  next(): void {
    if (this.isLastQuestion()) return;
    this.currentIndex.update((i) => i + 1);
  }

  requestFinish(): void {
    if (this.unansweredCount() > 0) {
      this.confirmingSubmit.set(true);
    } else {
      void this.finishExam();
    }
  }

  cancelConfirm(): void {
    this.confirmingSubmit.set(false);
  }

  async confirmFinish(): Promise<void> {
    this.confirmingSubmit.set(false);
    await this.finishExam();
  }

  private async finishExam(): Promise<void> {
    this.submitting.set(true);
    this.errorMessage.set(null);
    try {
      const payload: ExamAnswerInput[] = this.questions().map((question, index) => ({
        question,
        selectedValue: this.answers()[index].selectedValue,
      }));
      const result = await this.examService.submitAttempt(this.levelId, payload);
      await this.router.navigate(['/levels', this.levelId, 'exam', 'result', result.attemptId]);
    } catch {
      this.errorMessage.set('Something went wrong submitting your exam. Please try again.');
      this.submitting.set(false);
    }
  }
}
