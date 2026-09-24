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
}
