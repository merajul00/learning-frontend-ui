import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Level } from '../../core/models/level.model';
import { LearningItem } from '../../core/models/learning-item.model';
import { ActivityService } from '../../core/services/activity.service';
import { LearningItemsService, LessonGroup } from '../../core/services/learning-items.service';
import { LevelsService } from '../../core/services/levels.service';
import { ProgressService } from '../../core/services/progress.service';
import { JapaneseCharacterCard } from '../../shared/components/japanese-character-card/japanese-character-card';
import { ProgressBar } from '../../shared/components/progress-bar/progress-bar';

@Component({
  imports: [RouterLink, JapaneseCharacterCard, ProgressBar],
  selector: 'app-lesson',
  styleUrl: './lesson.scss',
  templateUrl: './lesson.html',
})
export class Lesson implements OnInit {
  readonly levelId: string;
  private maxItemsCompleted = 0;
  private lessonCompletedOnce = false;

  level = signal<Level | null>(null);
  items = signal<LearningItem[]>([]);
  lessonGroups = signal<LessonGroup[]>([]);
  currentIndex = signal(0);
  loading = signal(true);
  lessonCompleted = signal(false);

  currentItem = computed<LearningItem | null>(() => this.items()[this.currentIndex()] ?? null);
  isLastItem = computed(() => this.currentIndex() === this.items().length - 1);
  progressLabel = computed(() => `${this.currentIndex() + 1} / ${this.items().length}`);
  progressPercent = computed(() =>
    this.items().length ? Math.round(((this.currentIndex() + 1) / this.items().length) * 100) : 0,
  );
  currentGroupTitle = computed<string | null>(() => {
    const groups = this.lessonGroups();
    if (groups.length <= 1) return null;
    const item = this.currentItem();
    return groups.find((group) => group.id === item?.lessonId)?.title ?? null;
  });

  constructor(
    route: ActivatedRoute,
    private readonly levelsService: LevelsService,
    private readonly itemsService: LearningItemsService,
    private readonly progressService: ProgressService,
    private readonly activityService: ActivityService,
  ) {
    this.levelId = route.snapshot.paramMap.get('id')!;
  }

  async ngOnInit(): Promise<void> {
    try {
      const [levels, items, progress, lessonGroups] = await Promise.all([
        this.levelsService.getLevels(),
        this.itemsService.getItemsForLevel(this.levelId),
        this.progressService.getProgressForLevel(this.levelId),
        this.itemsService.getLessonsForLevel(this.levelId),
      ]);

      this.level.set(levels.find((level) => level.id === this.levelId) ?? null);
      this.items.set(items);
      this.lessonGroups.set(lessonGroups);
      this.maxItemsCompleted = progress?.itemsCompleted ?? 0;
      this.lessonCompletedOnce = progress?.lessonCompleted ?? false;
      this.lessonCompleted.set(this.lessonCompletedOnce);

      const savedIndex = progress?.currentItemIndex ?? 0;
      this.currentIndex.set(Math.min(savedIndex, Math.max(items.length - 1, 0)));
    } finally {
      this.loading.set(false);
    }
  }

  async previous(): Promise<void> {
    if (this.currentIndex() === 0) return;
    this.currentIndex.set(this.currentIndex() - 1);
    await this.persist();
  }

  async next(): Promise<void> {
    if (this.isLastItem()) return;
    this.currentIndex.set(this.currentIndex() + 1);
    await this.persist();
  }

  private async persist(): Promise<void> {
    this.maxItemsCompleted = Math.max(this.maxItemsCompleted, this.currentIndex() + 1);
    const justCompleted = !this.lessonCompletedOnce && this.isLastItem();
    if (justCompleted) {
      this.lessonCompletedOnce = true;
      this.lessonCompleted.set(true);
    }

    await this.progressService.updateItemProgress(
      this.levelId,
      this.currentIndex(),
      this.maxItemsCompleted,
      this.lessonCompletedOnce,
    );

    if (justCompleted) {
      await this.activityService.recordActivity('lesson_complete');
    }
  }
}
