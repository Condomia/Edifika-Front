import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import { UserFormComponent } from
    '../../../users/components/user-form/user-form.component';

import { UsersService } from
    '../../../users/services/users.service';

import { User } from
    '../../../users/model/user.model';

import { UnitsService } from
    '../../services/units.service';

import { BuildingsService } from
    '../../services/buildings.service';

import { Unit } from
    '../../model/unit.model';

import { Building } from
    '../../model/building.model';

import { UnitResidentView } from
    '../../model/unit-resident-view.model';

import { UnitFormComponent } from
    '../../components/unit-form.component/unit-form.component';
import {BuildingFormComponent} from '../../components/building-form.component/building-form.component';

@Component({
  selector: 'app-units-residents-page',
  standalone: true,
  imports: [
    CommonModule,
    UnitFormComponent,
    UserFormComponent,
    BuildingFormComponent
  ],
  templateUrl: './units-residents-page.html',
  styleUrl: './units-residents-page.css',
})
export class UnitsResidentsPage implements OnInit {
  rows: UnitResidentView[] = [];
  units: Unit[] = [];
  owners: User[] = [];

  selectedUnit: Unit | null = null;

  isCreatingUnit = false;
  isEditingUnit = false;
  isCreatingUser = false;
  isCreatingBuilding = false;
  totalUnits = 0;
  outstandingDebt = 0;
  newMoveIns = 0;
  maintenanceRequests = 0;

  constructor(
    private usersService: UsersService,
    private unitsService: UnitsService,
    private buildingsService: BuildingsService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }
  createBuilding(): void {
    this.isCreatingBuilding = true;
  }

  onBuildingFormClose(refresh: boolean): void {
    this.isCreatingBuilding = false;

    if (refresh) {
      this.loadData();
    }
  }
  loadData(): void {
    forkJoin({
      users: this.usersService.getAll(),
      units: this.unitsService.getAll(),
      buildings: this.buildingsService.getAll()
    }).subscribe({
      next: ({ users, units, buildings }) => {
        this.owners = users.filter(user =>
          user.roles?.some(
            role => role.toUpperCase() === 'OWNER'
          )
        );

        this.units = units;
        this.totalUnits = units.length;

        this.maintenanceRequests = units.filter(
          unit => unit.status === 'MAINTENANCE'
        ).length;

        this.newMoveIns = this.owners.filter(
          owner => owner.status === 'PENDING'
        ).length;

        this.rows = units.map(unit => {
          const building = buildings.find(
            currentBuilding =>
              Number(currentBuilding.idBuilding) ===
              Number(unit.idBuilding)
          );

          return this.toView(unit, building);
        });

        this.outstandingDebt = this.rows.filter(
          row => row.debtStatus === 'LATE'
        ).length;
      },

      error: error => {
        console.error(
          'Error loading units and users:',
          error
        );
      }
    });
  }

  private toView(
    unit: Unit,
    building?: Building
  ): UnitResidentView {
    return {
      unitId: unit.idUnit,
      unitNumber: unit.unitNumber,

      tower:
        building?.name ??
        'Tower A',

      unitStatus:
        unit.status === 'MAINTENANCE'
          ? 'MAINTENANCE'
          : 'VACANT',

      residentId: undefined,
      residentName: 'No Resident',
      residentRole: 'Not assigned',
      email: '—',
      phone: '',

      debtStatus: 'N/A',
      debtLabel: 'N/A'
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
    this.selectedUnit =
      this.units.find(
        unit =>
          Number(unit.idUnit) ===
          Number(row.unitId)
      ) ?? null;

    if (!this.selectedUnit) {
      return;
    }

    this.isEditingUnit = true;
    this.isCreatingUnit = false;
  }

  createUnit(): void {
    this.selectedUnit = {
      id: 0,
      idUnit: 0,
      idBuilding: 0,
      unitNumber: 0,
      floor: 0,
      coveredArea: 0,
      totalArea: 0,
      participationPercentage: 0,
      distributionPercentage: 0,
      status: 'AVAILABLE'
    };

    this.isCreatingUnit = true;
    this.isEditingUnit = false;
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
