import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';
import { AuthService } from './auth';
import { CanvasRecord } from '../models/canvas-record';

@Injectable({
  providedIn: 'root',
})
export class CanvasService {
  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService,
  ) {}

  async getOrCreateCanvas(): Promise<CanvasRecord> {
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

  async getCanvasById(canvasId: string): Promise<CanvasRecord> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('canvases')
      .select('*')
      .eq('id', canvasId)
      .maybeSingle();

    if (error || !data) {
      throw error || new Error('Canvas not found');
    }

    return data;
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
      throw new Error('failed to save current changes');
    }
  }

  //fetch all frows for a canvas
  async loadPixels(canvasId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client.from('pixels').select('*').eq('canvas_id', canvasId);

    if (error) {
      throw new Error('failed to load canvas pixels');
    }

    return data;
  }

  async searchUsersByEmail(query: string) {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('profiles')
      .select('id, email')
      .ilike('email', `%${query}%`)
      .limit(10);

    if (error) {
      throw error;
    }

    return data;
  }

  async addViewer(canvasId: string, userId: string) {
    const client = this.supabaseService.getClient();

    const { data: sessionCheck } = await client.auth.getSession();
    console.log('session inside addViewer:', sessionCheck);

    const { error } = await client.from('canvas_viewers').upsert(
      {
        canvas_id: canvasId,
        user_id: userId,
        can_edit: false,
      },
      { onConflict: 'canvas_id,user_id' },
    );

    if (error) {
      console.log('upsert error:', error);
      throw error;
    }
  }

  async setCanEdit(canvasId: string, userId: string, canEdit: boolean) {
    const client = this.supabaseService.getClient();

    const { error } = await client
      .from('canvas_viewers')
      .update({ can_edit: canEdit })
      .eq('canvas_id', canvasId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  }
}
