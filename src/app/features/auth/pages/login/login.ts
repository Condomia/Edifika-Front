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
  showPassword = false;

  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    remember: [false]
  });

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const resource: SignInResource = {
      email: this.loginForm.value.email?.trim() ?? '',
      password: this.loginForm.value.password ?? ''
    };

    this.loginService.signIn(resource).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        const roles: string[] =
          response?.roles ??
          response?.user?.roles ??
          [];

        const isAdmin = roles.some(
          role => role.toUpperCase() === 'ADMIN'
        );

        if (!isAdmin) {
          this.errorMessage =
            'Acceso restringido. Solo los administradores pueden ingresar.';

          this.loginService.logout?.();
          return;
        }

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
