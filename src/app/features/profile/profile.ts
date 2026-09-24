import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserProgress } from '../../core/models/user-progress.model';
import { AuthService } from '../../core/services/auth.service';
import { LevelsService } from '../../core/services/levels.service';
import { ProfileService } from '../../core/services/profile.service';
import { ProgressService } from '../../core/services/progress.service';
import { CurrentLevelView, findCurrentLevel } from '../../shared/utils/current-level';
import { getInitials } from '../../shared/utils/initials';

@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-profile',
  styleUrl: './profile.scss',
  templateUrl: './profile.html',
})
export class ProfilePage implements OnInit {
  loading = signal(true);
  currentLevel = signal<CurrentLevelView | null>(null);
  lessonsCompleted = signal(0);

  displayNameInput = signal('');
  savingName = signal(false);
  nameSaved = signal(false);

  newPassword = signal('');
  savingPassword = signal(false);
  passwordSaved = signal(false);
  passwordError = signal<string | null>(null);

  uploadingAvatar = signal(false);
  avatarError = signal<string | null>(null);

  readonly profile;

  get initials(): string {
    return getInitials(this.profile()?.displayName || this.authService.user()?.email || '');
  }

  constructor(
    readonly authService: AuthService,
    private readonly profileService: ProfileService,
    private readonly levelsService: LevelsService,
    private readonly progressService: ProgressService,
  ) {
    this.profile = this.profileService.myProfile;
  }

  async ngOnInit(): Promise<void> {
    try {
      const [profile, levels, progress, itemCounts] = await Promise.all([
        this.profileService.getMyProfile(),
        this.levelsService.getLevels(),
        this.progressService.getMyProgress(),
        this.levelsService.getItemCountsByLevel(),
      ]);

      this.displayNameInput.set(profile?.displayName ?? '');
      this.lessonsCompleted.set(progress.filter((p) => p.lessonCompleted).length);

      const progressByLevel = new Map<string, UserProgress>(progress.map((p) => [p.levelId, p]));
      this.currentLevel.set(findCurrentLevel(levels, progressByLevel, itemCounts));
    } finally {
      this.loading.set(false);
    }
  }

  async saveDisplayName(): Promise<void> {
    const name = this.displayNameInput().trim();
    if (!name) return;

    this.savingName.set(true);
    this.nameSaved.set(false);
    try {
      await this.profileService.updateDisplayName(name);
      this.nameSaved.set(true);
    } finally {
      this.savingName.set(false);
    }
  }

  async onAvatarSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadingAvatar.set(true);
    this.avatarError.set(null);
    try {
      await this.profileService.uploadAvatar(file);
    } catch (error) {
      this.avatarError.set(error instanceof Error ? error.message : 'Could not upload photo.');
    } finally {
      this.uploadingAvatar.set(false);
      input.value = '';
    }
  }

  async removeAvatar(): Promise<void> {
    this.uploadingAvatar.set(true);
    this.avatarError.set(null);
    try {
      await this.profileService.removeAvatar();
    } catch (error) {
      this.avatarError.set(error instanceof Error ? error.message : 'Could not remove photo.');
    } finally {
      this.uploadingAvatar.set(false);
    }
  }

  async savePassword(): Promise<void> {
    const password = this.newPassword();
    if (password.length < 6) {
      this.passwordError.set('Password must be at least 6 characters.');
      return;
    }

    this.savingPassword.set(true);
    this.passwordError.set(null);
    this.passwordSaved.set(false);
    try {
      await this.authService.updatePassword(password);
      this.newPassword.set('');
      this.passwordSaved.set(true);
    } catch {
      this.passwordError.set('Could not update your password. Please try again.');
    } finally {
      this.savingPassword.set(false);
    }
  }
}
