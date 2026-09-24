import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/** Key read at write-time to decide whether the session survives closing the browser. */
export const REMEMBER_ME_KEY = 'nihongobd:remember-me';

/**
 * Routes Supabase's session storage to localStorage (persists across browser restarts)
 * or sessionStorage (cleared when the tab closes) based on the "Remember me" choice
 * made at login, so that checkbox actually changes behavior rather than being decorative.
 */
const rememberAwareStorage = {
  getItem: (key: string) => localStorage.getItem(key) ?? sessionStorage.getItem(key),
  setItem: (key: string, value: string) => {
    if (localStorage.getItem(REMEMBER_ME_KEY) === 'false') {
      sessionStorage.setItem(key, value);
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key);
    }
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

@Injectable({ providedIn: 'root' })
export class SupabaseClientService {
  readonly client: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey,
    { auth: { storage: rememberAwareStorage } },
  );
}
