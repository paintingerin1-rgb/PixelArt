import { Component, signal } from '@angular/core';
import { form, FormField, required, email } from '@angular/forms/signals';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormField],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  errorMessage = signal('');
  isLoading = signal(false);

  loginModel = signal<LoginData>({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Enter a valid email address' });
    required(schemaPath.password, { message: 'Password is required' });
  });

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  async onSubmit(event: Event) {
    event.preventDefault();

    if (this.loginForm().invalid()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      const credentials = this.loginForm().value();
      const { error } = await this.authService.signIn(credentials.email, credentials.password);
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
