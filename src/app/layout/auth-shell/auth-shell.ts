import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { getInitials } from '../../shared/utils/initials';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-auth-shell',
  styleUrl: './auth-shell.scss',
  templateUrl: './auth-shell.html',
})
export class AuthShell implements OnInit {
  readonly jlptLevels = [
    { label: 'N5 Levels', path: '/levels' },
    { label: 'N4 Levels', path: '/levels/n4' },
    { label: 'N3 Levels', path: '/levels/n3' },
    { label: 'N2 Levels', path: '/levels/n2' },
    { label: 'N1 Levels', path: '/levels/n1' },
  ];

  readonly collapsed = signal(false);
  readonly levelsOpen = signal(false);
  readonly recentOpen = signal(false);
  readonly profileMenuOpen = signal(false);
  readonly themeMode = signal<'light' | 'dark'>('light');

  readonly profile;

  get displayName(): string {
    return this.profile()?.displayName || this.authService.user()?.email || 'Learner';
  }

  get initials(): string {
    return getInitials(this.displayName);
  }

  get email(): string {
    return this.authService.user()?.email ?? '';
  }

  constructor(
    private readonly authService: AuthService,
    private readonly profileService: ProfileService,
    private readonly router: Router,
  ) {
    this.profile = this.profileService.myProfile;
  }

  async ngOnInit(): Promise<void> {
    await this.profileService.getMyProfile();
    try {
      await this.profileService.syncAvatarFromGoogle();
    } catch {
      // Non-critical: the sidebar/profile just keeps showing initials instead.
    }
  }

  toggleCollapsed(): void {
    this.collapsed.update((value) => !value);
  }

  toggleLevels(): void {
    this.levelsOpen.update((value) => !value);
  }

  toggleRecent(): void {
    this.recentOpen.update((value) => !value);
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen.update((value) => !value);
  }

  closeProfileMenu(): void {
    this.profileMenuOpen.set(false);
  }

  setThemeMode(mode: 'light' | 'dark'): void {
    this.themeMode.set(mode);
  }

  async signOut(): Promise<void> {
    await this.authService.signOut();
    await this.router.navigate(['/']);
  }
}
