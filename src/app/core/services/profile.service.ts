import { Injectable, signal } from '@angular/core';
import { Profile } from '../models/user-progress.model';
import { SupabaseClientService } from './supabase-client';

interface ProfileRow {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  current_level_id: string | null;
  current_lesson_id: string | null;
  current_item_index: number;
  total_xp: number;
  streak_count: number;
  last_activity_date: string | null;
  role: 'user' | 'admin';
}

function toProfile(row: ProfileRow): Profile {
  return {
    userId: row.user_id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    currentLevelId: row.current_level_id,
    currentLessonId: row.current_lesson_id,
    currentItemIndex: row.current_item_index,
    totalXp: row.total_xp,
    streakCount: row.streak_count,
    lastActivityDate: row.last_activity_date,
    role: row.role,
  };
}

const AVATAR_BUCKET = 'avatars';
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

@Injectable({ providedIn: 'root' })
export class ProfileService {
  /** Shared cache of the signed-in user's profile, kept in sync across every component that reads it. */
  readonly myProfile = signal<Profile | null>(null);

  constructor(private readonly supabase: SupabaseClientService) {}

  async getMyProfile(): Promise<Profile | null> {
    const { data, error } = await this.supabase.client
      .from('profiles')
      .select(
        'user_id, display_name, avatar_url, current_level_id, current_lesson_id, current_item_index, total_xp, streak_count, last_activity_date, role',
      )
      .maybeSingle();

    if (error) throw error;
    const profile = data ? toProfile(data as ProfileRow) : null;
    this.myProfile.set(profile);
    return profile;
  }

  async updateDisplayName(displayName: string): Promise<void> {
    const {
      data: { user },
    } = await this.supabase.client.auth.getUser();
    if (!user) return;

    const { error } = await this.supabase.client
      .from('profiles')
      .update({ display_name: displayName })
      .eq('user_id', user.id);

    if (error) throw error;
    this.myProfile.update((p) => (p ? { ...p, displayName } : p));
  }

  async uploadAvatar(file: File): Promise<string> {
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      throw new Error('Please choose a PNG, JPEG, WebP, or GIF image.');
    }
    if (file.size > MAX_AVATAR_BYTES) {
      throw new Error('Image must be smaller than 5MB.');
    }

    const {
      data: { user },
    } = await this.supabase.client.auth.getUser();
    if (!user) throw new Error('Not signed in.');

    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${user.id}/avatar.${extension}`;

    const { error: uploadError } = await this.supabase.client.storage
      .from(AVATAR_BUCKET)
      .upload(path, file, { upsert: true, cacheControl: '3600' });
    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = this.supabase.client.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    const avatarUrl = `${publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await this.supabase.client
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('user_id', user.id);
    if (updateError) throw updateError;

    this.myProfile.update((p) => (p ? { ...p, avatarUrl } : p));
    return avatarUrl;
  }

  /** New Google sign-ins get their avatar seeded by the DB trigger; this covers
   * accounts that signed up before that existed, and skips anyone who already
   * has a photo (uploaded or otherwise) so it never overwrites a user's choice. */
  async syncAvatarFromGoogle(): Promise<void> {
    const profile = this.myProfile();
    if (!profile || profile.avatarUrl) return;

    const {
      data: { user },
    } = await this.supabase.client.auth.getUser();
    if (!user) return;

    const googleAvatar =
      (user.user_metadata?.['avatar_url'] as string | undefined) ??
      (user.user_metadata?.['picture'] as string | undefined);
    if (!googleAvatar) return;

    const { error } = await this.supabase.client
      .from('profiles')
      .update({ avatar_url: googleAvatar })
      .eq('user_id', user.id);
    if (error) throw error;

    this.myProfile.update((p) => (p ? { ...p, avatarUrl: googleAvatar } : p));
  }

  async removeAvatar(): Promise<void> {
    const {
      data: { user },
    } = await this.supabase.client.auth.getUser();
    if (!user) return;

    const { data: files } = await this.supabase.client.storage.from(AVATAR_BUCKET).list(user.id);
    if (files?.length) {
      await this.supabase.client.storage
        .from(AVATAR_BUCKET)
        .remove(files.map((f) => `${user.id}/${f.name}`));
    }

    const { error } = await this.supabase.client
      .from('profiles')
      .update({ avatar_url: null })
      .eq('user_id', user.id);
    if (error) throw error;

    this.myProfile.update((p) => (p ? { ...p, avatarUrl: null } : p));
  }
}
