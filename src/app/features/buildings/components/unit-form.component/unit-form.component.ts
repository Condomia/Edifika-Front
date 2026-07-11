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

import { forkJoin } from 'rxjs';

import { Unit } from '../../model/unit.model';
import { Building } from '../../model/building.model';
import { User } from '../../../users/model/user.model';
import { CreateUserUnitResource } from '../../model/create-user-unit-resource.model';
import { CreateUnitResource } from '../../model/create-unit-resource.model';

import { UnitsService } from '../../services/units.service';
import { BuildingsService } from '../../services/buildings.service';
import { UserUnitsService } from '../../services/user-units.service';
import { UsersService } from '../../../users/services/users.service';

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
  buildings: Building[] = [];

  isSubmitting = false;
  isLoadingData = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private unitsService: UnitsService,
    private buildingsService: BuildingsService,
    private userUnitsService: UserUnitsService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadFormData();
  }

  buildForm(): void {
    const currentBuildingId =
      this.unit?.idBuilding && this.unit.idBuilding > 0
        ? this.unit.idBuilding
        : null;

    this.unitForm = this.fb.group({
      idBuilding: [
        currentBuildingId,
        Validators.required
      ],

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

      idUser: [null]
    });
  }

  loadFormData(): void {
    this.isLoadingData = true;
    this.errorMessage = '';

    forkJoin({
      users: this.usersService.getAll(),
      buildings: this.buildingsService.getAll()
    }).subscribe({
      next: ({ users, buildings }) => {
        this.owners = users.filter(user =>
          user.roles?.some(
            role => role.toUpperCase() === 'OWNER'
          )
        );

        this.buildings = buildings;

        /*
         * Si solo existe un edificio, se selecciona automáticamente.
         */
        if (
          this.isCreateMode &&
          this.buildings.length === 1
        ) {
          this.unitForm.patchValue({
            idBuilding: this.buildings[0].idBuilding
          });
        }

        this.isLoadingData = false;
      },

      error: error => {
        console.error(
          'Error loading unit form information:',
          error
        );

        this.errorMessage =
          'No se pudieron cargar los edificios o propietarios.';

        this.isLoadingData = false;
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
      idBuilding: Number(formValue.idBuilding),
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

    console.log(
      'Creating unit with body:',
      resource
    );

    this.unitsService.createUnit(resource).subscribe({
      next: createdUnit => {
        const selectedOwnerId =
          Number(formValue.idUser);

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
        console.error(
          'Error creating unit:',
          error
        );

        this.errorMessage =
          error?.status === 403
            ? 'No tienes autorización para crear unidades.'
            : 'No se pudo crear la unidad. Verifica los datos ingresados.';

        this.isSubmitting = false;
      }
    });
  }

  private assignOwnerToUnit(
    ownerId: number,
    unitId: number,
    buildingId: number
  ): void {
    const resource: CreateUserUnitResource = {
      idUnit: unitId,
      idUser: ownerId,
      startDate: new Date().toISOString(),
      endDate: null,
      status: 'ACTIVE'
    };

    console.log(
      'Assigning owner to unit:',
      resource
    );

    this.userUnitsService
      .assignUserToUnit(resource)
      .subscribe({
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
      idBuilding: Number(formValue.idBuilding),
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
