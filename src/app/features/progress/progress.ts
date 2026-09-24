import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Level } from '../../core/models/level.model';
import { Profile, UserProgress } from '../../core/models/user-progress.model';
import { ActivityService, DailyActivityRow } from '../../core/services/activity.service';
import { LevelsService } from '../../core/services/levels.service';
import { ProfileService } from '../../core/services/profile.service';
import { ProgressService } from '../../core/services/progress.service';
import { XpRulesService } from '../../core/services/xp-rules.service';
import { DailyMission } from '../../shared/components/daily-mission/daily-mission';
import { LevelCard } from '../../shared/components/level-card/level-card';
import { ProgressBar } from '../../shared/components/progress-bar/progress-bar';
import { CurrentLevelView, findCurrentLevel } from '../../shared/utils/current-level';
import { deriveLevelState } from '../../shared/utils/level-state';

interface LevelProgressRow {
  level: Level;
  itemsCompleted: number;
  totalItems: number;
}

interface DayCell {
  label: string;
  date: string;
  active: boolean;
}

interface LevelBoard {
  level: Level;
  state: ReturnType<typeof deriveLevelState>;
  itemsCompleted: number;
  totalItems: number;
}

@Component({
  imports: [RouterLink, ProgressBar, DailyMission, LevelCard],
  selector: 'app-progress',
  styleUrl: './progress.scss',
  templateUrl: './progress.html',
})
export class ProgressPage implements OnInit {
  loading = signal(true);

  profile = signal<Profile | null>(null);
  currentLevel = signal<CurrentLevelView | null>(null);
  levelProgressRows = signal<LevelProgressRow[]>([]);
  weekCells = signal<DayCell[]>([]);
  todayXp = signal(0);
  dailyGoalXp = signal(20);
  lessonsCompleted = signal(0);
  overallPercent = signal(0);
  board = signal<LevelBoard[]>([]);

  totalXp = computed(() => this.profile()?.totalXp ?? 0);
  streak = computed(() => this.profile()?.streakCount ?? 0);

  constructor(
    private readonly profileService: ProfileService,
    private readonly levelsService: LevelsService,
    private readonly progressService: ProgressService,
    private readonly activityService: ActivityService,
    private readonly xpRulesService: XpRulesService,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const [profile, levels, progress, itemCounts, recentActivity, xpRules] = await Promise.all([
        this.profileService.getMyProfile(),
        this.levelsService.getLevels(),
        this.progressService.getMyProgress(),
        this.levelsService.getItemCountsByLevel(),
        this.activityService.getRecentActivity(7),
        this.xpRulesService.getRules(),
      ]);

      this.profile.set(profile);

      const progressByLevel = new Map<string, UserProgress>(progress.map((p) => [p.levelId, p]));
      this.currentLevel.set(findCurrentLevel(levels, progressByLevel, itemCounts));

      this.levelProgressRows.set(
        levels
          .filter((level) => (itemCounts.get(level.id) ?? 0) > 0)
          .map((level) => ({
            level,
            itemsCompleted: progressByLevel.get(level.id)?.itemsCompleted ?? 0,
            totalItems: itemCounts.get(level.id) ?? 0,
          })),
      );

      this.board.set(
        levels.map((level) => ({
          level,
          state: deriveLevelState(progressByLevel.get(level.id)),
          itemsCompleted: progressByLevel.get(level.id)?.itemsCompleted ?? 0,
          totalItems: itemCounts.get(level.id) ?? 0,
        })),
      );

      this.lessonsCompleted.set(progress.filter((p) => p.lessonCompleted).length);
      const completedLevels = progress.filter((p) => p.levelCompleted).length;
      this.overallPercent.set(
        levels.length ? Math.round((completedLevels / levels.length) * 100) : 0,
      );

      this.dailyGoalXp.set(xpRules.get('lesson_complete') ?? 20);
      this.buildWeekCells(recentActivity);
    } finally {
      this.loading.set(false);
    }
  }

  private buildWeekCells(recentActivity: DailyActivityRow[]): void {
    const activityByDate = new Map(recentActivity.map((row) => [row.activityDate, row]));
    const cells: DayCell[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const iso = date.toISOString().slice(0, 10);
      const row = activityByDate.get(iso);

      cells.push({
        label: date.toLocaleDateString(undefined, { weekday: 'short' }),
        date: iso,
        active: !!row && row.activitiesCount > 0,
      });

      if (i === 0 && row) {
        this.todayXp.set(row.xpEarned);
      }
    }

    this.weekCells.set(cells);
  }
}
