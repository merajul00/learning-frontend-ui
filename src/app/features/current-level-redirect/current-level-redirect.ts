import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LevelsService } from '../../core/services/levels.service';
import { ProgressService } from '../../core/services/progress.service';
import { UserProgress } from '../../core/models/user-progress.model';
import { findCurrentLevel } from '../../shared/utils/current-level';

/** Global nav "Practice"/"Quiz" links jump straight to the learner's current level. */
@Component({
  imports: [RouterLink],
  selector: 'app-current-level-redirect',
  template: `
    @if (noCurrentLevel()) {
      <div class="redirect-empty">
        <p>You don't have an in-progress level right now.</p>
        <a routerLink="/levels">Browse Levels</a>
      </div>
    }
  `,
})
export class CurrentLevelRedirect implements OnInit {
  noCurrentLevel = signal(false);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly levelsService: LevelsService,
    private readonly progressService: ProgressService,
  ) {}

  async ngOnInit(): Promise<void> {
    const target = (this.route.snapshot.data['target'] as string) ?? 'levels';

    const [levels, progress, itemCounts] = await Promise.all([
      this.levelsService.getLevels(),
      this.progressService.getMyProgress(),
      this.levelsService.getItemCountsByLevel(),
    ]);

    const progressByLevel = new Map<string, UserProgress>(progress.map((p) => [p.levelId, p]));
    const current = findCurrentLevel(levels, progressByLevel, itemCounts);

    if (!current) {
      this.noCurrentLevel.set(true);
      return;
    }

    await this.router.navigate(['/levels', current.level.id, target]);
  }
}
