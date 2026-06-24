import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root',
})
export class CanvasService {
  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService,
  ) {}

  async getOrCreateCanvas() {
    const client = this.supabaseService.getClient();
    const userId = this.authService.currentUser?.id;

    if (!userId) {
      throw new Error('No logged in user');
    }

    // check if a canvas already exists for this user
    const { data: existingCanvas, error: fetchError } = await client
      .from('canvases')
      .select('*')
      .eq('owner_id', userId)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (existingCanvas) {
      return existingCanvas;
    }

    // no canvas exists therefore create one
    const { data: newCanvas, error: insertError } = await client
      .from('canvases')
      .insert({
        owner_id: userId,
        name: 'My Canvas',
        size: 16,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return newCanvas;
  }
}
