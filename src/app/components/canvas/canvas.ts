import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth';
import { CanvasService } from '../../services/canvas';
import { SupabaseService } from '../../services/supabase';
import { Router, ActivatedRoute } from '@angular/router';
import { PixelGrid } from '../pixel-grid/pixel-grid';
import { CanvasRecord } from '../../models/canvas-record';
import { ShareCanvas } from '../share-canvas/share-canvas';
import { RealtimeChannel } from '@supabase/supabase-js';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [PixelGrid, ShareCanvas],
  templateUrl: './canvas.html',
  styleUrls: ['./canvas.css'],
})
export class Canvas implements OnInit, OnDestroy {
  errorMessage = signal('');
  canvasState = signal<CanvasRecord | null>(null);
  canEdit = signal(false);
  private viewerChannel: RealtimeChannel | null = null;

  constructor(
    public authService: AuthService,
    private canvasService: CanvasService,
    private supabaseService: SupabaseService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit() {
    const canvasId = this.route.snapshot.paramMap.get('id');

    if (canvasId) {
      try {
        const canvas = await this.canvasService.getCanvasById(canvasId);
        this.canvasState.set(canvas);
        await this.updateCanEdit();
        this.subscribeToViewerChanges(canvas.id);
      } catch (error) {
        console.error(error);
        this.errorMessage.set('This canvas is private or does not exist.');
      }
    } else {
      try {
        const canvas = await this.canvasService.getOrCreateCanvas();
        this.canvasState.set(canvas);
        await this.updateCanEdit();
        this.subscribeToViewerChanges(canvas.id);
      } catch (error) {
        console.error(error);
        this.errorMessage.set('Unable to load your canvas. Please try again later.');
      }
    }
  }

  async logOut() {
    this.errorMessage.set('');
    try {
      const { error } = await this.authService.signOut();
      if (error) {
        this.errorMessage.set(error.message);
      } else {
        this.router.navigate(['/login']);
      }
    } catch (error) {
      this.errorMessage.set('An unexpected error occurred. Please try again.');
    }
  }

  async updateCanEdit() {
    const canvas = this.canvasState();
    if (!canvas) {
      this.canEdit.set(false);
      return;
    }

    const userId = this.authService.currentUser?.id;
    if (canvas.owner_id === userId) {
      this.canEdit.set(true);
      return;
    }

    const canEdit = await this.canvasService.checkCanEdit(canvas.id, userId);
    this.canEdit.set(canEdit);
  }

  subscribeToViewerChanges(canvasId: string) {
    const client = this.supabaseService.getClient();
    this.viewerChannel = client
      .channel(`viewers-${canvasId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'canvas_viewers',
          filter: `canvas_id=eq.${canvasId}`,
        },
        async () => {
          await this.updateCanEdit();
        },
      )
      .subscribe();
  }

  ngOnDestroy() {
    if (this.viewerChannel) {
      this.viewerChannel.unsubscribe();
    }
  }
}
