import { Level, LevelState } from '../../core/models/level.model';
import { UserProgress } from '../../core/models/user-progress.model';
import { deriveLevelState } from './level-state';

export interface CurrentLevelView {
  level: Level;
  state: LevelState;
  progress: UserProgress | undefined;
  itemsCompleted: number;
  totalItems: number;
}

/** The learner's next actionable level: the lowest-sortOrder level that's unlocked but not completed. */
export function findCurrentLevel(
  levels: Level[],
  progressByLevel: Map<string, UserProgress>,
  itemCounts: Map<string, number>,
): CurrentLevelView | null {
  const next = levels
    .filter((level) => {
      const state = deriveLevelState(progressByLevel.get(level.id));
      return state === 'available' || state === 'in_progress';
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)[0];

  if (!next) return null;

  const progress = progressByLevel.get(next.id);
  return {
    level: next,
    state: deriveLevelState(progress),
    progress,
    itemsCompleted: progress?.itemsCompleted ?? 0,
    totalItems: itemCounts.get(next.id) ?? 0,
  };
}
