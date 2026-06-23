import { Component, signal } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  errorMessage = signal('');
  isLoading = signal(false);
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage.set('please fill in valid email and password');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      const { error } = await this.authService.signIn(
        this.loginForm.value.email!,
        this.loginForm.value.password!,
      );
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
