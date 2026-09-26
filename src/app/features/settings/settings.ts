import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';

const MIN_PASSWORD_LENGTH = 8;

/** Supabase errors are plain objects, not `Error` instances, so read `message` directly. */
function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return fallback;
}

@Component({
  imports: [FormsModule],
  selector: 'app-settings',
  host: { '(document:keydown.escape)': 'closeModals()' },
  styleUrl: './settings.scss',
  templateUrl: './settings.html',
})
export class Settings implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);

  readonly minPasswordLength = MIN_PASSWORD_LENGTH;

  /** Whether the account has a password; null = unknown (backend check unavailable). */
  accountHasPassword = signal<boolean | null>(null);

  showPasswordModal = signal(false);
  /** Google sign-ups have no old password to confirm, so that field is disabled for them. */
  requiresOldPassword = signal(true);
  oldPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  showOldPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);
  savingPassword = signal(false);
  passwordSaved = signal(false);
  passwordError = signal<string | null>(null);

  showDeleteModal = signal(false);
  deleteConfirmText = signal('');
  showDeletePassword = signal(false);
  deletingAccount = signal(false);
  deleteError = signal<string | null>(null);

  /** Deleting needs a password, which Google sign-ups only have once they set one. */
  readonly needsPasswordToDelete = computed(() => this.accountHasPassword() === false);
  readonly canDelete = computed(
    () => this.deleteConfirmText().length > 0 && !this.deletingAccount() && !this.needsPasswordToDelete(),
  );

  ngOnInit(): void {
    void this.refreshHasPassword();
  }

  private async refreshHasPassword(): Promise<boolean | null> {
    const hasPassword = await this.authService.hasPassword();
    this.accountHasPassword.set(hasPassword);
    return hasPassword;
  }

  closeModals(): void {
    this.closePasswordModal();
    this.closeDeleteModal();
  }

  openPasswordModal(): void {
    this.showDeleteModal.set(false);
    this.requiresOldPassword.set(this.accountHasPassword() ?? this.authService.hasEmailProvider());
    this.oldPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.showOldPassword.set(false);
    this.showNewPassword.set(false);
    this.showConfirmPassword.set(false);
    this.passwordError.set(null);
    this.passwordSaved.set(false);
    this.showPasswordModal.set(true);
    void this.refreshHasPassword().then((hasPassword) => {
      if (hasPassword !== null && !this.savingPassword()) this.requiresOldPassword.set(hasPassword);
    });
  }

  closePasswordModal(): void {
    if (this.savingPassword()) return;
    this.showPasswordModal.set(false);
  }

  async savePassword(): Promise<void> {
    const oldPassword = this.requiresOldPassword() ? this.oldPassword() : null;
    const password = this.newPassword();
    if (oldPassword === '') {
      this.passwordError.set('Please enter your old password.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      this.passwordError.set(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== this.confirmPassword()) {
      this.passwordError.set('New passwords do not match.');
      return;
    }
    if (oldPassword !== null && password === oldPassword) {
      this.passwordError.set('Your new password must be different from the old one.');
      return;
    }

    this.savingPassword.set(true);
    this.passwordError.set(null);
    try {
      await this.authService.changePassword(oldPassword, password);
      this.oldPassword.set('');
      this.newPassword.set('');
      this.confirmPassword.set('');
      this.passwordSaved.set(true);
      this.accountHasPassword.set(true);
      this.showPasswordModal.set(false);
    } catch (error) {
      this.passwordError.set(extractErrorMessage(error, 'Could not update your password. Please try again.'));
    } finally {
      this.savingPassword.set(false);
    }
  }

  openDeleteModal(): void {
    this.deleteConfirmText.set('');
    this.showDeletePassword.set(false);
    this.deleteError.set(null);
    this.showDeleteModal.set(true);
    void this.refreshHasPassword();
  }

  closeDeleteModal(): void {
    if (this.deletingAccount()) return;
    this.showDeleteModal.set(false);
  }

  async deleteAccount(): Promise<void> {
    if (!this.canDelete()) return;

    const password = this.deleteConfirmText();
    this.deletingAccount.set(true);
    this.deleteError.set(null);
    try {
      // Nothing is removed until the backend is confirmed ready and the password checks out,
      // so a failure never leaves the account half-deleted (e.g. without its avatar).
      const hasPassword = this.accountHasPassword() ?? (await this.refreshHasPassword());
      if (hasPassword === null) throw new Error("Account deletion isn't available yet. Please try again later.");
      if (!hasPassword) throw new Error('Set a password under Change Password before deleting your account.');

      await this.authService.verifyPassword(password, 'Incorrect password. Your account was not deleted.');
      // Storage files don't cascade with the user row, so remove the avatar first.
      await this.profileService.removeAvatar();
      await this.authService.deleteAccount(password);
      this.profileService.myProfile.set(null);
      await this.router.navigate(['/']);
    } catch (error) {
      this.deleteError.set(extractErrorMessage(error, 'Could not delete your account. Please try again.'));
      this.deletingAccount.set(false);
    }
  }
}
