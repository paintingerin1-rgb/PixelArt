import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth';
import { CanvasService } from '../../services/canvas';
import { Router } from '@angular/router';
import { PixelGrid } from '../pixel-grid/pixel-grid';
import { signal } from '@angular/core';

@Component({
  selector: 'app-canvas',
  imports: [PixelGrid],
  templateUrl: './canvas.html',
  styleUrl: './canvas.css',
})
export class Canvas implements OnInit {
  errorMessage = signal('');

  constructor(
    public authService: AuthService,
    private canvasService: CanvasService,
    private router: Router,
  ) {}

  async ngOnInit() {
    try {
      const canvas = await this.canvasService.getOrCreateCanvas();
      console.log('canvas:', canvas);
    } catch (err) {
      console.log('error getting canvas:', err);
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
}
