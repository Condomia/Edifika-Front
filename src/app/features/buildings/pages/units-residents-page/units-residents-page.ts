import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { UserFormComponent } from '../../../users/components/user-form/user-form.component';
import { UsersService } from '../../../users/services/users.service';
import { User } from '../../../users/model/user.model';

import { UnitsService } from '../../services/units.service';
import { BuildingsService } from '../../services/buildings.service';
import { UserUnitsService } from '../../services/user-units.service';

import { Unit } from '../../model/unit.model';
import { Building } from '../../model/building.model';
import { UserUnit } from '../../model/user-unit.model';
import { UnitResidentView } from '../../model/unit-resident-view.model';
import { UnitFormComponent } from '../../components/unit-form.component/unit-form.component';

@Component({
  selector: 'app-units-residents-page',
  standalone: true,
  imports: [
    CommonModule,
    UnitFormComponent,
    UserFormComponent
  ],
  templateUrl: './units-residents-page.html',
  styleUrl: './units-residents-page.css',
})
export class UnitsResidentsPage implements OnInit {
  rows: UnitResidentView[] = [];
  units: Unit[] = [];

  selectedUnit: Unit | null = null;
  isCreatingUnit = false;
  isEditingUnit = false;

  totalUnits = 0;
  outstandingDebt = 0;
  newMoveIns = 0;
  maintenanceRequests = 0;
  selectedUser: User | null = null;
  isCreatingUser = false;
  constructor(
    private usersService: UsersService,
    private unitsService: UnitsService,
    private buildingsService: BuildingsService,
    private userUnitsService: UserUnitsService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      users: this.usersService.getAll(),
      units: this.unitsService.getAll(),
      buildings: this.buildingsService.getAll(),
      userUnits: this.userUnitsService.getAll()
    }).subscribe({
      next: ({ users, units, buildings, userUnits }) => {
        this.totalUnits = units.length;
        this.maintenanceRequests = units.filter(u => u.status === 'MAINTENANCE').length;
        this.units = units;

        this.rows = units.map(unit => {
          const relation = userUnits.find(
            uu => Number(uu.idUnit) === Number(unit.idUnit) && uu.status === 'ACTIVE'
          );

          const user = relation
            ? users.find(u => Number(u.id) === Number(relation.idUser))
            : undefined;

          const building = buildings.find(
            b => Number(b.idBuilding) === Number(unit.idBuilding)
          );

          return this.toView(unit, building, user);
        });

        this.outstandingDebt = this.rows.filter(r => r.debtStatus === 'LATE').length;
        this.newMoveIns = userUnits.filter(uu => uu.status === 'ACTIVE').length;
      },
      error: err => console.error('Error loading units and residents:', err)
    });
  }

  private toView(unit: Unit, building?: Building, user?: User): UnitResidentView {
    const hasResident = !!user;

    return {
      unitId: unit.idUnit,
      unitNumber: unit.unitNumber,
      tower: building?.name ?? 'Tower A',
      unitStatus: hasResident ? 'OCCUPIED' : 'VACANT',

      residentId: user?.id,
      residentName: user?.fullName ?? 'No Resident',
      residentRole: user?.roles?.[0] ?? 'In transition',
      email: user?.email ?? '—',
      phone: user?.phone ?? '',

      debtStatus: hasResident ? 'PAID' : 'N/A',
      debtLabel: hasResident ? 'PAID' : 'N/A'
    };
  }
  createUser(): void {
    this.isCreatingUser = true;
  }

  onUserFormClose(refresh: boolean): void {
    this.isCreatingUser = false;

    if (refresh) {
      this.loadData();
    }
  }
  editRow(row: UnitResidentView): void {
    this.selectedUnit = this.units.find(u => Number(u.idUnit) === Number(row.unitId)) ?? null;
    this.isEditingUnit = true;
  }

  createUnit(): void {
    this.selectedUnit = {
      id: 0,
      idUnit: 0,
      idBuilding: 1,
      unitNumber: 0,
      floor: 0,
      coveredArea: 0,
      totalArea: 0,
      participationPercentage: 0,
      distributionPercentage: 0,
      status: 'AVAILABLE'
    };

    this.isCreatingUnit = true;
  }

  onUnitFormClose(refresh: boolean): void {
    this.isEditingUnit = false;
    this.isCreatingUnit = false;
    this.selectedUnit = null;

    if (refresh) {
      this.loadData();
    }
  }
}
