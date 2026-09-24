import { Component, OnInit, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Level, LevelState } from '../../core/models/level.model';
import { Profile, UserProgress } from '../../core/models/user-progress.model';
import { AuthService } from '../../core/services/auth.service';
import { LevelsService } from '../../core/services/levels.service';
import { ProfileService } from '../../core/services/profile.service';
import { ProgressService } from '../../core/services/progress.service';
import { LevelCard } from '../../shared/components/level-card/level-card';
import { SectionHeading } from '../../shared/components/section-heading/section-heading';
import { deriveLevelState } from '../../shared/utils/level-state';

interface LevelViewModel {
  level: Level;
  state: LevelState;
  itemsCompleted: number;
  totalItems: number;
}

@Component({
  imports: [LevelCard, SectionHeading],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  isAuthenticated = signal(false);
  profile = signal<Profile | null>(null);
  levels = signal<LevelViewModel[]>([]);
  loading = signal(true);

  overallProgress = computed(() => {
    const list = this.levels();
    const totalItems = list.reduce((sum, entry) => sum + entry.totalItems, 0);
    if (!totalItems) return 0;
    const completedItems = list.reduce((sum, entry) => sum + entry.itemsCompleted, 0);
    return Math.round((completedItems / totalItems) * 100);
  });

  completedLevelsCount = computed(
    () => this.levels().filter((entry) => entry.state === 'completed').length,
  );

  constructor(
    private readonly authService: AuthService,
    private readonly profileService: ProfileService,
    private readonly levelsService: LevelsService,
    private readonly progressService: ProgressService,
    private readonly router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.authService.ready;
      const authenticated = this.authService.isAuthenticated();
      this.isAuthenticated.set(authenticated);

      const [levels, itemCounts, progress, profile] = await Promise.all([
        this.levelsService.getLevels(),
        this.levelsService.getItemCountsByLevel(),
        authenticated ? this.progressService.getMyProgress() : Promise.resolve([]),
        authenticated ? this.profileService.getMyProfile() : Promise.resolve(null),
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
      this.profile.set(profile);
    } finally {
      this.loading.set(false);
    }
  }

  async getStarted(): Promise<void> {
    await this.authService.ready;
    await this.router.navigate([this.authService.isAuthenticated() ? '/dashboard' : '/login']);
  }

  scrollToOverview(): void {
    document.getElementById('home-how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  }
}
