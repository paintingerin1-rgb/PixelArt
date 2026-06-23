import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-canvas',
  imports: [],
  templateUrl: './canvas.html',
  styleUrl: './canvas.css',
})
export class Canvas {
  errorMessage = signal('');

  constructor(
    public authService: AuthService,
    private router: Router,
  ) {}

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
