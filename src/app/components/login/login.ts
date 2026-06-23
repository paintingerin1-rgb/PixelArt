import { Component, signal } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = signal('');
  password = signal('');
  errorMessage = signal('');
  isLoading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  async onSubmit() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      const { error } = await this.authService.signIn(this.email(), this.password());
      if (error) {
        this.errorMessage.set(error.message);
      } else {
        this.router.navigate(['/canvas']);
      }
    } catch (error) {
      this.errorMessage.set('An unexpected error occurred. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
