import {
  Component,
  EventEmitter,
  Output,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { BuildingsService } from '../../services/buildings.service';
import { CreateBuildingResource } from '../../model/create-building-resource.model';

@Component({
  selector: 'app-building-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './building-form.component.html',
  styleUrl: './building-form.component.css'
})
export class BuildingFormComponent {

  private fb = inject(FormBuilder);
  private buildingsService = inject(BuildingsService);

  @Output() close = new EventEmitter<boolean>();

  isSubmitting = false;
  errorMessage = '';

  buildingForm = this.fb.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(3)
      ]
    ],

    address: [
      '',
      [
        Validators.required,
        Validators.minLength(5)
      ]
    ],

    district: [
      '',
      [
        Validators.required,
        Validators.minLength(3)
      ]
    ],

    city: [
      'Lima',
      [
        Validators.required,
        Validators.minLength(3)
      ]
    ]
  });

  onSubmit(): void {
    if (this.buildingForm.invalid) {
      this.buildingForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const value = this.buildingForm.getRawValue();

    const resource: CreateBuildingResource = {
      name: value.name?.trim() ?? '',
      address: value.address?.trim() ?? '',
      district: value.district?.trim() ?? '',
      city: value.city?.trim() ?? ''
    };

    this.buildingsService.createBuilding(resource).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.close.emit(true);
      },

      error: error => {
        console.error('Error creating building:', error);

        this.isSubmitting = false;
        this.errorMessage =
          'No se pudo crear el edificio. Verifica los datos y permisos.';
      }
    });
  }

  onCancel(): void {
    if (this.isSubmitting) {
      return;
    }

    this.close.emit(false);
  }
}
