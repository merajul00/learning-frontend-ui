import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { REMEMBER_ME_KEY } from '../../../core/services/supabase-client';

type Mode = 'login' | 'register';

@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  mode = signal<Mode>('login');
  email = '';
  password = '';
  displayName = '';
  rememberMe = true;

  submitting = signal(false);
  errorMessage = signal('');
  infoMessage = signal('');

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  setMode(mode: Mode): void {
    this.mode.set(mode);
    this.errorMessage.set('');
    this.infoMessage.set('');
  }

  async submit(): Promise<void> {
    this.errorMessage.set('');
    this.infoMessage.set('');
    this.submitting.set(true);
    localStorage.setItem(REMEMBER_ME_KEY, String(this.rememberMe));

    try {
      if (this.mode() === 'register') {
        await this.authService.signUp(this.email, this.password, this.displayName || this.email);
        this.infoMessage.set('Account created. Check your email to confirm, then log in.');
        this.setMode('login');
      } else {
        await this.authService.signIn(this.email, this.password);
        await this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      this.submitting.set(false);
    }
  }

  async continueWithGoogle(): Promise<void> {
    this.errorMessage.set('');
    this.infoMessage.set('');
    this.submitting.set(true);
    localStorage.setItem(REMEMBER_ME_KEY, String(this.rememberMe));

    try {
      // On success the browser navigates away to Google, so submitting stays true.
      await this.authService.signInWithGoogle();
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Google sign-in failed.');
      this.submitting.set(false);
    }
  }

  async forgotPassword(): Promise<void> {
    if (!this.email) {
      this.errorMessage.set('Enter your email above first, then click "Forgot password".');
      return;
    }

    try {
      await this.authService.requestPasswordReset(this.email);
      this.infoMessage.set('Password reset email sent.');
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Something went wrong.');
    }
  }
}
