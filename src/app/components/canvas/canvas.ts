import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth';
import { CanvasService } from '../../services/canvas';
import { Router, ActivatedRoute } from '@angular/router';
import { PixelGrid } from '../pixel-grid/pixel-grid';
import { CanvasRecord } from '../../models/canvas-record';
import { ShareCanvas } from '../share-canvas/share-canvas';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [PixelGrid, ShareCanvas],
  templateUrl: './canvas.html',
  styleUrls: ['./canvas.css'],
})
export class Canvas implements OnInit {
  errorMessage = signal('');
  canvasState = signal<CanvasRecord | null>(null);

  constructor(
    public authService: AuthService,
    private canvasService: CanvasService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit() {
    const canvasId = this.route.snapshot.paramMap.get('id');

    if (canvasId) {
      try {
        const canvas = await this.canvasService.getCanvasById(canvasId);
        this.canvasState.set(canvas);
      } catch (error) {
        console.error(error);
        this.errorMessage.set('This canvas is private or does not exist.');
      }
    } else {
      try {
        const canvas = await this.canvasService.getOrCreateCanvas();
        this.canvasState.set(canvas);
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

  get canEdit() {
    const canvas = this.canvasState();
    if (!canvas) return false;
    return canvas.owner_id === this.authService.currentUser?.id;
  }
}
