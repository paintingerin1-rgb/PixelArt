import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { Session } from '@supabase/supabase-js';

@Component({
  selector: 'app-canvas',
  imports: [],
  templateUrl: './canvas.html',
  styleUrl: './canvas.css',
})
export class Canvas implements OnInit {
  errorMessage: string = '';
  session: Session | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.authService.session$.subscribe((session) => {
      console.log('session received in canvas:', session);
      this.session = session;
    });
  }

  async logOut() {
    this.errorMessage = '';
    try {
      const { error } = await this.authService.signOut();
      if (error) {
        this.errorMessage = error.message;
      } else {
        this.router.navigate(['/login']);
      }
    } catch (error) {
      this.errorMessage = 'An unexpected error occurred. Please try again.';
    }
  }
}
