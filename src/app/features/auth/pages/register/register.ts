import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { SignUpResource } from '../../models/sign-up-resource.model';
import {RegisterService} from '../../services/register-service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private registerService = inject(RegisterService);

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  registerForm = this.formBuilder.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    phone: ['', Validators.required],
    documentType: ['DNI', Validators.required],
    documentNumber: ['', Validators.required]
  });

  register(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.registerForm.value;

    const resource: SignUpResource = {
      fullName: formValue.fullName ?? '',
      email: formValue.email ?? '',
      password: formValue.password ?? '',
      phone: formValue.phone ?? '',
      documentType: formValue.documentType ?? 'DNI',
      documentNumber: formValue.documentNumber ?? '',
      roles: ['ADMIN']
    };

    this.registerService.signUp(resource).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Cuenta de administrador creada correctamente.';
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = typeof error.error === 'string'
          ? error.error
          : 'No se pudo registrar la cuenta.';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
