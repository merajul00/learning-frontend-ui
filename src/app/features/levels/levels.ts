import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Level, LevelState } from '../../core/models/level.model';
import { UserProgress } from '../../core/models/user-progress.model';
import { LevelsService } from '../../core/services/levels.service';
import { ProgressService } from '../../core/services/progress.service';
import { LevelCard } from '../../shared/components/level-card/level-card';
import {
  LessonChecklistItem,
  LevelOverviewCard,
} from '../../shared/components/level-overview-card/level-overview-card';
import { deriveLevelState } from '../../shared/utils/level-state';
import { LEVEL_GROUPS, LevelGroup } from './level-groups';

interface LevelViewModel {
  level: Level;
  state: LevelState;
  itemsCompleted: number;
  totalItems: number;
}

/** One of the four "New" tab cards. */
interface LevelGroupViewModel {
  number: number;
  title: string;
  state: LevelState;
  progress: number;
  lessons: LessonChecklistItem[];
  /** Level the card's title, Practice and Exam open; null while the card is locked. */
  targetLevelId: string | null;
}

type LevelsTab = 'new' | 'old';

function toGroupViewModel(group: LevelGroup, levelsBySlug: Map<string, LevelViewModel>): LevelGroupViewModel {
  const firstSlug = group.topics.flatMap((topic) => topic.levelSlugs)[0];
  return {
    number: group.number,
    title: group.title,
    state: group.state,
    progress: group.progress,
    lessons: group.topics.map((topic, index) => ({
      id: `${group.number}-${index}`,
      title: topic.label,
      completed: topic.completed,
    })),
    targetLevelId: group.state === 'locked' ? null : (levelsBySlug.get(firstSlug)?.level.id ?? null),
  };
}

@Component({
  imports: [LevelCard, LevelOverviewCard, RouterLink],
  selector: 'app-levels',
  styleUrl: './levels.scss',
  templateUrl: './levels.html',
})
export class Levels implements OnInit {
  levels = signal<LevelViewModel[]>([]);
  levelGroups = signal<LevelGroupViewModel[]>([]);
  loading = signal(true);
  activeTab = signal<LevelsTab>('new');

  constructor(
    private readonly levelsService: LevelsService,
    private readonly progressService: ProgressService,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const [levels, progress, itemCounts] = await Promise.all([
        this.levelsService.getLevels(),
        this.progressService.getMyProgress(),
        this.levelsService.getItemCountsByLevel(),
      ]);

      const progressByLevel = new Map<string, UserProgress>(
        progress.map((entry) => [entry.levelId, entry]),
      );

      const viewModels = levels.map((level) => ({
        level,
        state: deriveLevelState(progressByLevel.get(level.id)),
        itemsCompleted: progressByLevel.get(level.id)?.itemsCompleted ?? 0,
        totalItems: itemCounts.get(level.id) ?? 0,
      }));
      this.levels.set(viewModels);

      const levelsBySlug = new Map(viewModels.map((vm) => [vm.level.slug, vm]));
      this.levelGroups.set(LEVEL_GROUPS.map((group) => toGroupViewModel(group, levelsBySlug)));
    } finally {
      this.loading.set(false);
    }
  }
}
