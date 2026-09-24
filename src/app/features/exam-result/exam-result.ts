import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ExamAnswerDetail } from '../../core/models/exam.model';
import { Level } from '../../core/models/level.model';
import { ExamService } from '../../core/services/exam.service';
import { LevelsService } from '../../core/services/levels.service';
import { AudioButton } from '../../shared/components/audio-button/audio-button';
import { explainMistake } from '../../shared/utils/explain-mistake';

interface WrongAnswerView extends ExamAnswerDetail {
  explanation: string;
}

interface ResultSummary {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  score: number;
  accuracy: number;
  passed: boolean;
  xpAwarded: number;
}

@Component({
  imports: [RouterLink, AudioButton],
  selector: 'app-exam-result',
  styleUrl: './exam-result.scss',
  templateUrl: './exam-result.html',
})
export class ExamResult implements OnInit {
  readonly levelId: string;
  private readonly attemptId: string;

  level = signal<Level | null>(null);
  nextLevel = signal<Level | null>(null);
  summary = signal<ResultSummary | null>(null);
  wrongAnswers = signal<WrongAnswerView[]>([]);
  loading = signal(true);

  constructor(
    route: ActivatedRoute,
    private readonly examService: ExamService,
    private readonly levelsService: LevelsService,
  ) {
    this.levelId = route.snapshot.paramMap.get('id')!;
    this.attemptId = route.snapshot.paramMap.get('attemptId')!;
  }

  async ngOnInit(): Promise<void> {
    try {
      const [levels, summary, wrongAnswers] = await Promise.all([
        this.levelsService.getLevels(),
        this.examService.getAttemptSummary(this.attemptId),
        this.examService.getWrongAnswers(this.attemptId),
      ]);

      const current = levels.find((level) => level.id === this.levelId) ?? null;
      this.level.set(current);

      if (current) {
        const next = levels
          .filter((level) => level.sortOrder > current.sortOrder)
          .sort((a, b) => a.sortOrder - b.sortOrder)[0];
        this.nextLevel.set(next ?? null);
      }

      this.summary.set(summary);
      this.wrongAnswers.set(
        wrongAnswers.map((answer) => ({ ...answer, explanation: explainMistake(answer) })),
      );
    } finally {
      this.loading.set(false);
    }
  }
}
