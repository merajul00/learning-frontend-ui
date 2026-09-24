import { Component, OnInit, signal } from '@angular/core';
import { Level, LevelState } from '../../core/models/level.model';
import { UserProgress } from '../../core/models/user-progress.model';
import { LevelsService } from '../../core/services/levels.service';
import { ProgressService } from '../../core/services/progress.service';
import { LevelCard } from '../../shared/components/level-card/level-card';
import { deriveLevelState } from '../../shared/utils/level-state';

interface LevelViewModel {
  level: Level;
  state: LevelState;
  itemsCompleted: number;
  totalItems: number;
}

@Component({
  imports: [LevelCard],
  selector: 'app-levels',
  styleUrl: './levels.scss',
  templateUrl: './levels.html',
})
export class Levels implements OnInit {
  levels = signal<LevelViewModel[]>([]);
  loading = signal(true);

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

      this.levels.set(
        levels.map((level) => ({
          level,
          state: deriveLevelState(progressByLevel.get(level.id)),
          itemsCompleted: progressByLevel.get(level.id)?.itemsCompleted ?? 0,
          totalItems: itemCounts.get(level.id) ?? 0,
        })),
      );
    } finally {
      this.loading.set(false);
    }
  }
}
