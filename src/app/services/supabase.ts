import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(environment.supabaseUrl, environment.supabaseKey);

    //check if supabase successfully connected
    this.client.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.log('Supabase connection failed:', error.message);
      } else {
        console.log('Supabase connected successfully', data);
      }
    });
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}
