import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  forkJoin,
  map,
  of,
  switchMap
} from 'rxjs';

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

import { UserUnitsService } from
    '../../services/user-units.service';

import { Unit } from
    '../../model/unit.model';

import { Building } from
    '../../model/building.model';

import { UserUnit } from
    '../../model/user-unit.model';

import { UnitResidentView } from
    '../../model/unit-resident-view.model';

import { UnitFormComponent } from
    '../../components/unit-form.component/unit-form.component';

import { BuildingFormComponent } from
    '../../components/building-form.component/building-form.component';

interface BuildingData {
  building: Building;
  units: Unit[];
  relations: UserUnit[];
}

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
    private buildingsService: BuildingsService,
    private userUnitsService: UserUnitsService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      users: this.usersService.getAll(),
      buildings: this.buildingsService.getAll()
    }).pipe(
      switchMap(({ users, buildings }) => {

        if (buildings.length === 0) {
          return of({
            users,
            buildingData: [] as BuildingData[]
          });
        }

        const buildingRequests =
          buildings.map(building =>
            forkJoin({
              units:
                this.unitsService.getByBuildingId(
                  building.idBuilding
                ),

              relations:
                this.userUnitsService.getByBuildingId(
                  building.idBuilding
                )
            }).pipe(
              map(({ units, relations }) => ({
                building,
                units,
                relations
              }))
            )
          );

        return forkJoin(buildingRequests).pipe(
          map(buildingData => ({
            users,
            buildingData
          }))
        );
      })
    ).subscribe({
      next: ({ users, buildingData }) => {

        /*
         * Usuarios disponibles para ser propietarios.
         */
        this.owners = users.filter(user =>
          user.roles?.some(
            role =>
              role.toUpperCase() === 'OWNER'
          )
        );

        /*
         * Todas las unidades de todos los edificios.
         */
        this.units = buildingData.flatMap(
          item => item.units
        );

        /*
         * Todas las relaciones usuario-unidad.
         */
        const allRelations =
          buildingData.flatMap(
            item => item.relations
          );

        this.totalUnits =
          this.units.length;

        this.maintenanceRequests =
          this.units.filter(
            unit =>
              unit.status === 'MAINTENANCE'
          ).length;

        /*
         * Relaciones actualmente activas.
         */
        this.newMoveIns =
          allRelations.filter(
            relation =>
              relation.status === 'ACTIVE'
          ).length;

        /*
         * Para cada unidad:
         * 1. Busca la relación activa.
         * 2. Obtiene el usuario relacionado.
         * 3. Construye la fila.
         */
        this.rows = buildingData.flatMap(
          ({ building, units, relations }) =>
            units.map(unit => {

              const activeRelation =
                relations.find(
                  relation =>
                    Number(relation.idUnit) ===
                    Number(unit.idUnit) &&
                    relation.status === 'ACTIVE'
                );

              const resident =
                activeRelation
                  ? users.find(
                    user =>
                      Number(user.id) ===
                      Number(activeRelation.idUser)
                  )
                  : undefined;

              return this.toView(
                unit,
                building,
                resident
              );
            })
        );

        this.outstandingDebt =
          this.rows.filter(
            row =>
              row.debtStatus === 'LATE'
          ).length;
      },

      error: error => {
        console.error(
          'Error loading units, residents and buildings:',
          error
        );
      }
    });
  }

  private toView(
    unit: Unit,
    building: Building,
    resident?: User
  ): UnitResidentView {
    const hasResident = !!resident;

    let displayedStatus = 'VACANT';

    if (unit.status === 'MAINTENANCE') {
      displayedStatus = 'MAINTENANCE';
    } else if (hasResident) {
      displayedStatus = 'OCCUPIED';
    }

    return {
      unitId: unit.idUnit,
      unitNumber: unit.unitNumber,

      tower:
        building.name ??
        'Unknown Building',

      unitStatus:
      displayedStatus,

      residentId:
      resident?.id,

      residentName:
        resident?.fullName ??
        'No Resident',

      residentRole:
        resident?.roles?.[0] ??
        'Not assigned',

      email:
        resident?.email ??
        '—',

      phone:
        resident?.phone ??
        '',

      debtStatus:
        hasResident
          ? 'PAID'
          : 'N/A',

      debtLabel:
        hasResident
          ? 'PAID'
          : 'N/A'
    };
  }

  createBuilding(): void {
    this.isCreatingBuilding = true;
  }

  onBuildingFormClose(
    refresh: boolean
  ): void {
    this.isCreatingBuilding = false;

    if (refresh) {
      this.loadData();
    }
  }

  createUser(): void {
    this.isCreatingUser = true;
  }

  onUserFormClose(
    refresh: boolean
  ): void {
    this.isCreatingUser = false;

    if (refresh) {
      this.loadData();
    }
  }

  editRow(
    row: UnitResidentView
  ): void {
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

  onUnitFormClose(
    refresh: boolean
  ): void {
    this.isEditingUnit = false;
    this.isCreatingUnit = false;
    this.selectedUnit = null;

    if (refresh) {
      this.loadData();
    }
  }
}
