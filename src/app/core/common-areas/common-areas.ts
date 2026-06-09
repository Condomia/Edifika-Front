import { Component } from '@angular/core';
import { Calendar } from '../../features/reservations/pages/calendar/calendar';
import { CommonAreaListComponent } from '../../features/reservations/components/common-area-list.component/common-area-list.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonAreaService } from '../../features/reservations/services/common-area.service';
import { CommonAreaRulesService } from '../../features/reservations/services/common-area-rules.service';
import { CommonArea } from '../../features/reservations/model/common-area.model';
import { CommonAreaRule } from '../../features/reservations/model/common-area-rule.model';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-common-areas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Calendar,
    CommonAreaListComponent
  ],
  templateUrl: './common-areas.html',
  styleUrl: './common-areas.css'
})
export class CommonAreas {
  showCreateModal = false;
  areaForm: any;
  showEditModal = false;
  selectedArea: CommonArea | null = null;
  selectedRule: CommonAreaRule | null = null;

  editForm: any;
  ngOnInit() {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      type: ['POOL', Validators.required],
      status: ['AVAILABLE', Validators.required],
      maxCapacity: [1, [Validators.required, Validators.min(1)]],
      bookingType: ['SHARED', Validators.required],

      maxReservationHours: [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      guaranteeAmount: [0, [Validators.required, Validators.min(0)]],
      allowCancellation: [true],
      penaltyHoursBefore: [24, [Validators.required, Validators.min(0)]],
      penaltyAmount: [0, [Validators.required, Validators.min(0)]],
      requiresApproval: [false]
    });
  }
  constructor(
    private fb: FormBuilder,
    private commonAreaService: CommonAreaService,
    private commonAreaRulesService: CommonAreaRulesService
  ) {
    this.areaForm = this.fb.group({
      name: ['', Validators.required],
      type: ['POOL', Validators.required],
      status: ['AVAILABLE', Validators.required],
      maxCapacity: [1, [Validators.required, Validators.min(1)]],
      bookingType: ['SHARED', Validators.required],

      maxReservationHours: [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      guaranteeAmount: [0, [Validators.required, Validators.min(0)]],
      allowCancellation: [true],
      penaltyHoursBefore: [24, [Validators.required, Validators.min(0)]],
      penaltyAmount: [0, [Validators.required, Validators.min(0)]],
      requiresApproval: [false]
    });
  }

  openCreateModal() {
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.areaForm.reset({
      name: '',
      type: 'POOL',
      status: 'AVAILABLE',
      maxCapacity: 1,
      bookingType: 'SHARED',
      maxReservationHours: 1,
      price: 0,
      guaranteeAmount: 0,
      allowCancellation: true,
      penaltyHoursBefore: 24,
      penaltyAmount: 0,
      requiresApproval: false
    });
  }

  createArea() {
    if (this.areaForm.invalid) return;

    const value = this.areaForm.getRawValue();

    const newArea = {
      name: value.name!,
      type: value.type as CommonArea['type'],
      status: value.status as CommonArea['status'],
      maxCapacity: Number(value.maxCapacity),
      bookingType: value.bookingType as CommonArea['bookingType']
    };

    this.commonAreaService.create(newArea as CommonArea).pipe(
      switchMap((createdArea) => {
        const price = Number(value.price);
        const guaranteeAmount = Number(value.guaranteeAmount);
        const penaltyAmount = Number(value.penaltyAmount);

        const newRule = {
          commonAreaId: createdArea.id,
          maxReservationHours: Number(value.maxReservationHours),

          requiresPayment: price > 0,
          price: price,

          requiresGuarantee: guaranteeAmount > 0,
          guaranteeAmount: guaranteeAmount,

          allowCancellation: Boolean(value.allowCancellation),
          penaltyHoursBefore: Number(value.penaltyHoursBefore),
          penaltyAmount: penaltyAmount,

          requiresApproval: Boolean(value.requiresApproval)
        };

        return this.commonAreaRulesService.create(newRule as CommonAreaRule);
      })
    ).subscribe({
      next: () => {
        this.closeCreateModal();
        window.location.reload();
      },
      error: (error) => console.error(error)
    });
  }

  openEditModal(area: CommonArea) {
    this.selectedArea = area;

    this.commonAreaRulesService.getAll().subscribe((rules) => {
      const rule = rules.find(
        r => String(r.commonAreaId) === String(area.id)
      );

      this.selectedRule = rule ?? null;

      this.editForm.patchValue({
        name: area.name,
        type: area.type,
        status: area.status,
        maxCapacity: area.maxCapacity,
        bookingType: area.bookingType,

        maxReservationHours: rule?.maxReservationHours ?? 1,
        price: rule?.price ?? 0,
        guaranteeAmount: rule?.guaranteeAmount ?? 0,
        allowCancellation: rule?.allowCancellation ?? true,
        penaltyHoursBefore: rule?.penaltyHoursBefore ?? 24,
        penaltyAmount: rule?.penaltyAmount ?? 0,
        requiresApproval: rule?.requiresApproval ?? false
      });

      this.showEditModal = true;
    });
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedArea = null;
    this.selectedRule = null;
  }

  updateRules() {
    if (!this.selectedArea || this.editForm.invalid) return;

    const value = this.editForm.getRawValue();

    const updatedArea: CommonArea = {
      ...this.selectedArea,
      name: value.name,
      type: value.type,
      status: value.status,
      maxCapacity: Number(value.maxCapacity),
      bookingType: value.bookingType
    };

    const price = Number(value.price);
    const guaranteeAmount = Number(value.guaranteeAmount);
    const penaltyAmount = Number(value.penaltyAmount);

    this.commonAreaService.update(this.selectedArea.id, updatedArea).pipe(
      switchMap(() => {
        const updatedRule = {
          ...this.selectedRule,
          commonAreaId: this.selectedArea!.id,
          maxReservationHours: Number(value.maxReservationHours),

          requiresPayment: price > 0,
          price,

          requiresGuarantee: guaranteeAmount > 0,
          guaranteeAmount,

          allowCancellation: Boolean(value.allowCancellation),
          penaltyHoursBefore: Number(value.penaltyHoursBefore),
          penaltyAmount,

          requiresApproval: Boolean(value.requiresApproval)
        };

        if (this.selectedRule) {
          return this.commonAreaRulesService.update(
            this.selectedRule.id,
            updatedRule as CommonAreaRule
          );
        }

        return this.commonAreaRulesService.create(
          updatedRule as CommonAreaRule
        );
      })
    ).subscribe({
      next: () => {
        this.closeEditModal();
        window.location.reload();
      },
      error: (error) => console.error(error)
    });
  }
  updateAreaStatus(area: CommonArea) {
    this.commonAreaService.update(area.id, area).subscribe({
      next: () => window.location.reload(),
      error: (error) => console.error(error)
    });
  }
}
