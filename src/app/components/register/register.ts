import { Component, signal } from '@angular/core';
import { form, FormField, required, email } from '@angular/forms/signals';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

interface RegisterData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-register',
  imports: [FormField],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  errorMessage = signal('');
  isLoading = signal(false);

  registerModel = signal<RegisterData>({
    email: '',
    password: '',
  });

  registerForm = form(this.registerModel, (schemaPath) => {
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

    if (this.registerForm().invalid()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      const credentials = this.registerForm().value();
      const { error } = await this.authService.signUp(credentials.email, credentials.password);
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
