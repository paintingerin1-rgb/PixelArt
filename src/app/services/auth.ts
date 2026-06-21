import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private sessionSubject = new BehaviorSubject<Session | null>(null);
  public session$ = this.sessionSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {
    const client = this.supabaseService.getClient();

    client.auth.getSession().then(({ data }) => {
      this.sessionSubject.next(data.session);
    });

    client.auth.onAuthStateChange((event, session) => {
      this.sessionSubject.next(session);
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
    return this.sessionSubject.value?.user ?? null;
  }
}
