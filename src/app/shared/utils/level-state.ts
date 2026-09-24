import { LevelState } from '../../core/models/level.model';
import { UserProgress } from '../../core/models/user-progress.model';

/**
 * A level with no progress row has never been unlocked for this learner —
 * the "unlock next level" step (exam RPC, built later) is what inserts one.
 */
export function deriveLevelState(progress: UserProgress | undefined): LevelState {
  if (!progress) return 'locked';
  if (progress.levelCompleted) return 'completed';
  if (progress.itemsCompleted > 0 || progress.currentItemIndex > 0) return 'in_progress';
  return 'available';
}
