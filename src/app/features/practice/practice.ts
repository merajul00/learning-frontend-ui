import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Level } from '../../core/models/level.model';
import { LearningItem } from '../../core/models/learning-item.model';
import { UserProgress } from '../../core/models/user-progress.model';
import { LearningItemsService } from '../../core/services/learning-items.service';
import { LevelsService } from '../../core/services/levels.service';
import { ProgressService } from '../../core/services/progress.service';
import { QuizRunner } from '../../shared/components/quiz-runner/quiz-runner';

@Component({
  imports: [RouterLink, QuizRunner],
  selector: 'app-practice',
  styleUrl: './practice.scss',
  templateUrl: './practice.html',
})
export class Practice implements OnInit {
  readonly levelId: string;
  readonly restrictIds: string[] | null;

  level = signal<Level | null>(null);
  items = signal<LearningItem[]>([]);
  progress = signal<UserProgress | null>(null);
  loading = signal(true);
  justFinished = signal(false);

  constructor(
    route: ActivatedRoute,
    private readonly levelsService: LevelsService,
    private readonly itemsService: LearningItemsService,
    private readonly progressService: ProgressService,
  ) {
    this.levelId = route.snapshot.paramMap.get('id')!;
    const itemIdsParam = route.snapshot.queryParamMap.get('itemIds');
    this.restrictIds = itemIdsParam ? itemIdsParam.split(',').filter(Boolean) : null;
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
    } finally {
      this.loading.set(false);
    }
  }

  onCompleted(): void {
    this.justFinished.set(true);
  }
}
