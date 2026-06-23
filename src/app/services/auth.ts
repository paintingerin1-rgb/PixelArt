import { Injectable, signal } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private sessionSubject = signal<Session | null>(null);
  public session = this.sessionSubject.asReadonly();

  constructor(private supabaseService: SupabaseService) {
    const client = this.supabaseService.getClient();

    client.auth.getSession().then(({ data }) => {
      this.sessionSubject.set(data.session);
    });

    client.auth.onAuthStateChange((event, session) => {
      this.sessionSubject.set(session);
    });
  }

  async signUp(email: string, password: string) {
    const client = this.supabaseService.getClient();
    return client.auth.signUp({ email, password });
  }

  async signIn(email: string, password: string) {
    const client = this.supabaseService.getClient();
    return client.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    const client = this.supabaseService.getClient();
    return client.auth.signOut();
  }

  get currentUser() {
    return this.sessionSubject()?.user ?? null;
  }
}
