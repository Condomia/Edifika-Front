import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { LoginService } from '../../services/login-service';
import { SignInResource } from '../../models/sign-in-resource.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private loginService = inject(LoginService);

  isLoading = false;
  errorMessage = '';

  loginForm = this.formBuilder.group({
    email: ['admin@edifika.com', [Validators.required, Validators.email]],
    password: ['admin123', Validators.required],
    remember: [false]
  });

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const resource: SignInResource = {
      email: this.loginForm.value.email ?? '',
      password: this.loginForm.value.password ?? ''
    };

    this.loginService.signIn(resource).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/app/dashboard']);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Email o contraseña incorrectos.';
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
