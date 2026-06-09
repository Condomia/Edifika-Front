import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { Unit } from '../../model/unit.model';
import { User } from '../../../users/model/user.model';
import { UserUnit } from '../../model/user-unit.model';

import { UnitsService } from '../../services/units.service';
import { UserUnitsService } from '../../services/user-units.service';
import { UsersService } from '../../../users/services/users.service';

@Component({
  selector: 'app-unit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './unit-form.component.html',
  styleUrl: './unit-form.component.css'
})
export class UnitFormComponent implements OnInit {
  @Input() unit!: Unit;
  @Output() close = new EventEmitter<boolean>();
  @Input() isCreateMode = false;
  unitForm!: FormGroup;
  users: User[] = [];
  currentUserUnit: UserUnit | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private unitsService: UnitsService,
    private userUnitsService: UserUnitsService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadData();
  }

  buildForm(): void {
    this.unitForm = this.fb.group({
      unitNumber: [this.unit?.unitNumber ?? 0, [Validators.required, Validators.min(0)]],
      floor: [this.unit?.floor ?? 0, [Validators.required, Validators.min(0)]],
      coveredArea: [this.unit?.coveredArea ?? 0, [Validators.required, Validators.min(0)]],
      totalArea: [this.unit?.totalArea ?? 0, [Validators.required, Validators.min(0)]],
      participationPercentage: [this.unit?.participationPercentage ?? 0, [Validators.required, Validators.min(0)]],
      distributionPercentage: [this.unit?.distributionPercentage ?? 0, [Validators.required, Validators.min(0)]],
      status: [this.unit?.status ?? 'AVAILABLE', Validators.required],
      idUser: ['']
    });
  }

  loadData(): void {
    forkJoin({
      users: this.usersService.getAll(),
      userUnits: this.userUnitsService.getAll()
    }).subscribe({
      next: ({ users, userUnits }) => {
        this.users = users;

        this.currentUserUnit =
          userUnits.find(uu =>
            Number(uu.unitId) === Number(this.unit.idUnit) &&
            uu.status === 'ACTIVE'
          ) ?? null;

        this.unitForm.patchValue({
          idUser: this.currentUserUnit?.idUser ?? ''
        });
      },
      error: err => console.error('Error loading unit form data:', err)
    });
  }

  onSubmit(): void {
    if (this.unitForm.invalid) {
      this.unitForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    if (this.isCreateMode) {
      this.createUnit();
    } else {
      this.updateUnit();
    }
  }
  createUnit(): void {
    const formValue = this.unitForm.value;
    const newId = Date.now();

    const newUnit: Unit = {
      id: newId,
      idUnit: newId,
      buildingId: 1,
      unitNumber: Number(formValue.unitNumber),
      floor: Number(formValue.floor),
      coveredArea: Number(formValue.coveredArea),
      totalArea: Number(formValue.totalArea),
      participationPercentage: Number(formValue.participationPercentage),
      distributionPercentage: Number(formValue.distributionPercentage),
      status: formValue.status
    };

    this.unitsService.create(newUnit).subscribe({
      next: () => {
        const selectedUserId = Number(formValue.idUser);

        if (selectedUserId > 0) {
          const newRelation: UserUnit = {
            id: Date.now(),
            idUserUnit: Date.now(),
            unitId: newId,
            idUser: selectedUserId,
            startDate: new Date().toISOString(),
            endDate: null,
            status: 'ACTIVE'
          };

          this.userUnitsService.create(newRelation).subscribe({
            next: () => this.finish(),
            error: err => {
              console.error('Error assigning resident:', err);
              this.isSubmitting = false;
            }
          });
        } else {
          this.finish();
        }
      },
      error: err => {
        console.error(err);
        this.isSubmitting = false;
      }
    });
  }

  updateUnit(): void {
    const formValue = this.unitForm.value;

    const updatedUnit: Unit = {
      ...this.unit,
      unitNumber: Number(formValue.unitNumber),
      floor: Number(formValue.floor),
      coveredArea: Number(formValue.coveredArea),
      totalArea: Number(formValue.totalArea),
      participationPercentage: Number(formValue.participationPercentage),
      distributionPercentage: Number(formValue.distributionPercentage),
      status: formValue.status
    };

    this.unitsService.update(this.unit.id, updatedUnit).subscribe({
      next: () => this.updateUserUnit(Number(formValue.idUser)),
      error: err => {
        console.error('Error updating unit:', err);
        this.isSubmitting = false;
      }
    });
  }
  updateUserUnit(newUserId: number): void {
    const hasSelectedUser = newUserId > 0;

    if (!this.currentUserUnit && !hasSelectedUser) {
      this.finish();
      return;
    }

    if (this.currentUserUnit && !hasSelectedUser) {
      const inactiveRelation: UserUnit = {
        ...this.currentUserUnit,
        status: 'INACTIVE',
        endDate: new Date().toISOString()
      };

      this.userUnitsService.update(this.currentUserUnit.id, inactiveRelation).subscribe({
        next: () => this.finish(),
        error: err => {
          console.error('Error removing resident:', err);
          this.isSubmitting = false;
        }
      });

      return;
    }

    if (this.currentUserUnit && hasSelectedUser) {
      const updatedRelation: UserUnit = {
        ...this.currentUserUnit,
        idUser: newUserId,
        status: 'ACTIVE',
        endDate: null
      };

      this.userUnitsService.update(this.currentUserUnit.id, updatedRelation).subscribe({
        next: () => this.finish(),
        error: err => {
          console.error('Error changing resident:', err);
          this.isSubmitting = false;
        }
      });

      return;
    }

    const newRelation: UserUnit = {
      id: 0,
      idUserUnit: Date.now(),
      unitId: this.unit.idUnit,
      idUser: newUserId,
      startDate: new Date().toISOString(),
      endDate: null,
      status: 'ACTIVE'
    };

    this.userUnitsService.create(newRelation).subscribe({
      next: () => this.finish(),
      error: err => {
        console.error('Error assigning resident:', err);
        this.isSubmitting = false;
      }
    });
  }

  finish(): void {
    this.isSubmitting = false;
    this.close.emit(true);
  }

  onCancel(): void {
    this.close.emit(false);
  }
}
