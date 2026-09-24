import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Profile } from '../../core/models/user-progress.model';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-auth-shell',
  styleUrl: './auth-shell.scss',
  templateUrl: './auth-shell.html',
})
export class AuthShell implements OnInit {
  readonly navLinks = [
    { path: '/dashboard', label: 'Home' },
    { path: '/levels', label: 'Levels' },
    { path: '/practice', label: 'Practice' },
    { path: '/quiz', label: 'Quiz' },
    { path: '/progress', label: 'Progress' },
    { path: '/mistakes', label: 'Mistakes' },
    { path: '/profile', label: 'Profile' },
  ];

  profile = signal<Profile | null>(null);

  get displayName(): string {
    return this.profile()?.displayName || this.authService.user()?.email || 'Learner';
  }

  get initials(): string {
    const name = this.displayName.trim();
    if (!name) return '?';
    const parts = name.split(/\s+/).filter(Boolean);
    const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : name.slice(0, 2);
    return initials.toUpperCase();
  }

  constructor(
    private readonly authService: AuthService,
    private readonly profileService: ProfileService,
    private readonly router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    this.profile.set(await this.profileService.getMyProfile());
  }

  async signOut(): Promise<void> {
    await this.authService.signOut();
    await this.router.navigate(['/']);
  }
}
