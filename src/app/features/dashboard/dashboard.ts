import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Profile, UserProgress } from '../../core/models/user-progress.model';
import { MistakeItem } from '../../core/models/mistake.model';
import { ActivityService } from '../../core/services/activity.service';
import { AuthService } from '../../core/services/auth.service';
import { ExamAttemptResult } from '../../core/models/exam.model';
import { ExamService } from '../../core/services/exam.service';
import { LevelsService } from '../../core/services/levels.service';
import { MistakesService } from '../../core/services/mistakes.service';
import { ProfileService } from '../../core/services/profile.service';
import { ProgressService } from '../../core/services/progress.service';
import { XpRulesService } from '../../core/services/xp-rules.service';
import { DailyMission } from '../../shared/components/daily-mission/daily-mission';
import { LevelCard } from '../../shared/components/level-card/level-card';
import { CurrentLevelView, findCurrentLevel } from '../../shared/utils/current-level';

@Component({
  imports: [RouterLink, LevelCard, DailyMission],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  profile = signal<Profile | null>(null);
  currentLevel = signal<CurrentLevelView | null>(null);
  topMistakes = signal<MistakeItem[]>([]);
  todayXp = signal(0);
  dailyGoalXp = signal(20);
  latestExam = signal<ExamAttemptResult | null>(null);
  loading = signal(true);

  constructor(
    private readonly authService: AuthService,
    private readonly profileService: ProfileService,
    private readonly levelsService: LevelsService,
    private readonly progressService: ProgressService,
    private readonly mistakesService: MistakesService,
    private readonly activityService: ActivityService,
    private readonly xpRulesService: XpRulesService,
    private readonly examService: ExamService,
  ) {}

  get displayName(): string {
    return this.profile()?.displayName || this.authService.user()?.email || 'Learner';
  }

  async ngOnInit(): Promise<void> {
    try {
      const [profile, levels, progress, itemCounts, mistakes, recentActivity, xpRules, latestExam] =
        await Promise.all([
          this.profileService.getMyProfile(),
          this.levelsService.getLevels(),
          this.progressService.getMyProgress(),
          this.levelsService.getItemCountsByLevel(),
          this.mistakesService.getMyMistakes(),
          this.activityService.getRecentActivity(1),
          this.xpRulesService.getRules(),
          this.examService.getLatestAttempt(),
        ]);

      this.latestExam.set(latestExam);

      this.profile.set(profile);

      const progressByLevel = new Map<string, UserProgress>(
        progress.map((entry) => [entry.levelId, entry]),
      );
      this.currentLevel.set(findCurrentLevel(levels, progressByLevel, itemCounts));

      this.topMistakes.set(mistakes.slice(0, 3));
      this.dailyGoalXp.set(xpRules.get('lesson_complete') ?? 20);

      const today = new Date().toISOString().slice(0, 10);
      const todayRow = recentActivity.find((row) => row.activityDate === today);
      this.todayXp.set(todayRow?.xpEarned ?? 0);
    } finally {
      this.loading.set(false);
    }
  }
}
