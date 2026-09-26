import { Injectable, signal } from '@angular/core';
import type { Session, User } from '@supabase/supabase-js';
import { SupabaseClientService } from './supabase-client';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly session = signal<Session | null>(null);
  private readonly sessionLoaded = signal(false);

  readonly user = signal<User | null>(null);
  readonly isLoaded = this.sessionLoaded.asReadonly();
  readonly ready: Promise<void>;

  constructor(private readonly supabase: SupabaseClientService) {
    this.ready = this.supabase.client.auth.getSession().then(({ data }) => {
      this.session.set(data.session);
      this.user.set(data.session?.user ?? null);
      this.sessionLoaded.set(true);
    });

    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
      this.user.set(session?.user ?? null);
      this.sessionLoaded.set(true);
    });
  }

  isAuthenticated(): boolean {
    return this.user() !== null;
  }

  async signUp(email: string, password: string, displayName: string) {
    const { error } = await this.supabase.client.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) throw error;
  }

  async signIn(email: string, password: string) {
    const { error } = await this.supabase.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  /** Redirects the browser to Google; Supabase picks up the session from the URL on return. */
  async signInWithGoogle() {
    const { error } = await this.supabase.client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) throw error;
  }

  async signOut() {
    await this.supabase.client.auth.signOut();
  }

  async requestPasswordReset(email: string) {
    const { error } = await this.supabase.client.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  async updatePassword(newPassword: string) {
    const { error } = await this.supabase.client.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }

  /** Google sign-ins report only 'google' here even after setting a password, so this is just a fallback. */
  hasEmailProvider(): boolean {
    const providers = this.user()?.app_metadata?.['providers'] as string[] | undefined;
    return providers?.includes('email') ?? false;
  }

  /**
   * Whether the account has a password (Google sign-ups don't until they set
   * one). Asks the backend, since the browser can't see the password hash.
   * Returns null when the backend can't answer (e.g. migration 0009 not applied).
   */
  async hasPassword(): Promise<boolean | null> {
    const { data, error } = await this.supabase.client.rpc('account_has_password');
    if (error) {
      console.error('account_has_password failed; run backend/supabase/migrations/0009_delete_account.sql', error);
      return null;
    }
    return data === true;
  }

  /**
   * Sets a new password. When the account already has one, it is checked first:
   * Supabase only verifies `current_password` when "require current password"
   * is enabled on the project, so it is also checked by signing in with it.
   */
  async changePassword(currentPassword: string | null, newPassword: string) {
    if (currentPassword !== null) {
      await this.verifyPassword(currentPassword, 'Your old password is incorrect.');
    }

    const { error } = await this.supabase.client.auth.updateUser({
      password: newPassword,
      ...(currentPassword !== null ? { current_password: currentPassword } : {}),
    });
    if (error) {
      if (error.code === 'same_password') throw new Error('Your new password must be different from the old one.');
      if (error.code === 'reauthentication_needed') {
        throw new Error('For security, please sign out, sign in again, and then change your password.');
      }
      throw error;
    }
  }

  /** Confirms the signed-in user's password by signing in with it again; throws `wrongPasswordMessage` if it doesn't match. */
  async verifyPassword(password: string, wrongPasswordMessage = 'Incorrect password.') {
    const email = this.user()?.email;
    if (!email) throw new Error('Not signed in.');
    const { error } = await this.supabase.client.auth.signInWithPassword({ email, password });
    if (error) {
      throw error.code === 'invalid_credentials' ? new Error(wrongPasswordMessage) : error;
    }
  }

  /**
   * Deletes the signed-in user's account and all their data. The backend
   * (`delete_my_account`) re-checks the password before deleting anything.
   */
  async deleteAccount(password: string) {
    const { error } = await this.supabase.client.rpc('delete_my_account', { p_password: password });
    if (error) {
      if (error.code === 'PGRST202') {
        console.error('delete_my_account is missing; run backend/supabase/migrations/0009_delete_account.sql', error);
        throw new Error("Account deletion isn't available yet. Please try again later.");
      }
      throw error;
    }
    // The user no longer exists server-side, so only clear the local session.
    await this.supabase.client.auth.signOut({ scope: 'local' });
  }
}
