import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Unit } from '../../model/unit.model';
import { User } from '../../../users/model/user.model';
import { UserUnit } from '../../model/user-unit.model';

import { UnitsService } from '../../services/units.service';

import { UserUnitsService } from
    '../../services/user-units.service';

import { UsersService } from
    '../../../users/services/users.service';
import {CreateUnitResource} from '../../model/create-unit-resource.model';

@Component({
  selector: 'app-unit-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './unit-form.component.html',
  styleUrl: './unit-form.component.css'
})
export class UnitFormComponent implements OnInit {
  @Input() unit!: Unit;
  @Input() isCreateMode = false;

  @Output() close = new EventEmitter<boolean>();

  unitForm!: FormGroup;

  owners: User[] = [];

  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private unitsService: UnitsService,
    private userUnitsService: UserUnitsService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadOwners();
  }

  buildForm(): void {
    this.unitForm = this.fb.group({
      unitNumber: [
        this.unit?.unitNumber ?? 0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      floor: [
        this.unit?.floor ?? 0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      coveredArea: [
        this.unit?.coveredArea ?? 0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      totalArea: [
        this.unit?.totalArea ?? 0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      participationPercentage: [
        this.unit?.participationPercentage ?? 0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      distributionPercentage: [
        this.unit?.distributionPercentage ?? 0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      status: [
        this.unit?.status ?? 'AVAILABLE',
        Validators.required
      ],

      idUser: ['']
    });
  }

  loadOwners(): void {
    this.usersService.getAll().subscribe({
      next: users => {
        this.owners = users.filter(user =>
          user.roles?.some(
            role => role.toUpperCase() === 'OWNER'
          )
        );
      },

      error: error => {
        console.error(
          'Error loading owners:',
          error
        );

        this.errorMessage =
          'No se pudieron cargar los propietarios.';
      }
    });
  }

  onSubmit(): void {
    if (this.unitForm.invalid) {
      this.unitForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    if (this.isCreateMode) {
      this.createUnit();
      return;
    }

    this.updateUnit();
  }

  createUnit(): void {
    const formValue = this.unitForm.getRawValue();

    const resource: CreateUnitResource = {
      idBuilding: Number(this.unit?.idBuilding ?? 1),
      unitNumber: Number(formValue.unitNumber),
      floor: Number(formValue.floor),
      coveredArea: Number(formValue.coveredArea),
      totalArea: Number(formValue.totalArea),
      participationPercentage: Number(
        formValue.participationPercentage
      ),
      distributionPercentage: Number(
        formValue.distributionPercentage
      ),
      status: formValue.status
    };

    this.unitsService.createUnit(resource).subscribe({
      next: createdUnit => {
        const selectedOwnerId = Number(formValue.idUser);

        if (selectedOwnerId <= 0) {
          this.finish();
          return;
        }

        this.assignOwnerToUnit(
          selectedOwnerId,
          Number(createdUnit.idUnit),
          Number(createdUnit.idBuilding)
        );
      },

      error: error => {
        console.error('Error creating unit:', error);

        this.errorMessage =
          'No se pudo crear la unidad. Verifica tus permisos.';

        this.isSubmitting = false;
      }
    });
  }

  private assignOwnerToUnit(
    ownerId: number,
    unitId: number,
    buildingId: number
  ): void {
    const relationId = Date.now();

    const newRelation: UserUnit = {
      id: relationId,
      idUserUnit: relationId,
      idBuilding: buildingId,
      idUnit: unitId,
      idUser: ownerId,
      startDate: new Date().toISOString(),
      endDate: null,
      status: 'ACTIVE'
    };

    this.userUnitsService.create(newRelation).subscribe({
      next: () => {
        this.finish();
      },

      error: error => {
        console.error(
          'Error assigning owner:',
          error
        );

        this.errorMessage =
          'La unidad fue creada, pero no se pudo asignar el propietario.';

        this.isSubmitting = false;
      }
    });
  }

  updateUnit(): void {
    const formValue = this.unitForm.getRawValue();

    const updatedUnit: Unit = {
      ...this.unit,

      unitNumber:
        Number(formValue.unitNumber),

      floor:
        Number(formValue.floor),

      coveredArea:
        Number(formValue.coveredArea),

      totalArea:
        Number(formValue.totalArea),

      participationPercentage:
        Number(formValue.participationPercentage),

      distributionPercentage:
        Number(formValue.distributionPercentage),

      status:
      formValue.status
    };

    const unitId =
      this.unit.id ??
      this.unit.idUnit;

    this.unitsService.update(
      unitId,
      updatedUnit
    ).subscribe({
      next: () => {
        this.finish();
      },

      error: error => {
        console.error(
          'Error updating unit:',
          error
        );

        this.errorMessage =
          'No se pudo actualizar la unidad.';

        this.isSubmitting = false;
      }
    });
  }

  finish(): void {
    this.isSubmitting = false;
    this.close.emit(true);
  }

  onCancel(): void {
    if (this.isSubmitting) {
      return;
    }

    this.close.emit(false);
  }
}
