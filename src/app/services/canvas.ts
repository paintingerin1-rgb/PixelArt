import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';
import { AuthService } from './auth';
import { form } from '@angular/forms/signals';
import { Canvas } from '../components/canvas/canvas';

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
      console.log('found existing canvas:', existingCanvas.id);
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

  //insert or update a row in pixels
  async savePixel(canvasId: string, x: number, y: number, colour: string) {
    const client = this.supabaseService.getClient();
    const userId = this.authService.currentUser?.id;

    if (!userId) {
      throw new Error('No logged in user');
    }

    const { error } = await client.from('pixels').upsert(
      {
        canvas_id: canvasId,
        x: x,
        y: y,
        colour: colour,
        placed_by: userId,
      },
      { onConflict: 'canvas_id,x,y' },
    );

    if (error) {
      throw error;
    }
  }

  //fetch all frows for a canvas
  async loadPixels(canvasId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client.from('pixels').select('*').eq('canvas_id', canvasId);

    if (error) {
      throw error;
    }

    return data;
  }
}
