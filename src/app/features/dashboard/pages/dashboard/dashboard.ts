import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import { UnitsService } from '../../../buildings/services/units.service';
import { ReservationService } from '../../../reservations/services/reservation.service';
import { CommonAreaService } from '../../../reservations/services/common-area.service';
import { DashboardService } from '../../services/dashboard.service';
import { LoginService } from '../../../auth/services/login-service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private unitService = inject(UnitsService);
  private reservationService = inject(ReservationService);
  private commonAreaService = inject(CommonAreaService);
  private dashboardService = inject(DashboardService);
  private loginService = inject(LoginService);
  private datePipe = inject(DatePipe);

  currentDate = new Date();

  currentUser: any;

  occupancyRate = 0;
  occupiedUnits = 0;
  totalUnits = 0;

  pendingDebtsCount = 0;
  pendingDebtsAmount = 0;
  totalCollected = 0;
  delinquencyRate = 0;

  pendingReservations: any[] = [];
  communityPosts: any[] = [];

  selectedPeriod = '6';
  chartLabels: string[] = [];
  monthlyRevenue: { month: string, amount: number }[] = [];
  maxRevenue = 0;
  allPayments: any[] = [];
  allDebts: any[] = [];

  ngOnInit(): void {
    this.currentUser = this.loginService.getCurrentUser();
    this.generateChartLabels();
    this.loadOccupancy();
    this.loadFinancials();
    this.loadReservations();
    this.loadCommunityWall();
  }

  loadOccupancy(): void {
    const buildingId =
      this.currentUser?.buildingId ??
      this.currentUser?.idBuilding;

    console.log('Usuario actual:', this.currentUser);
    console.log('Building ID:', buildingId);

    if (buildingId === undefined || buildingId === null) {
      console.error('El usuario autenticado no tiene buildingId');
      return;
    }

    this.dashboardService.getUnitsByBuilding(buildingId)
      .subscribe({
        next: units => {
          console.log('Unidades encontradas:', units);

          this.totalUnits = units.length;

          this.occupiedUnits = units.filter(
            unit => String(unit.status).toUpperCase() === 'OCCUPIED'
          ).length;

          this.occupancyRate = this.totalUnits > 0
            ? Math.round(
              (this.occupiedUnits / this.totalUnits) * 100
            )
            : 0;
        },
        error: error => {
          console.error('Error obteniendo unidades:', error);
        }
      });
  }
  loadFinancials(): void {
    const buildingId =
      this.currentUser?.buildingId ??
      this.currentUser?.idBuilding;

    if (buildingId === undefined || buildingId === null) {
      console.error('No se puede cargar Finanzas: falta buildingId');
      return;
    }

    forkJoin({
      payments: this.dashboardService.getPayments(),
      debts: this.dashboardService.getDebts(),
      units: this.dashboardService.getUnitsByBuilding(buildingId)
    }).subscribe({
      next: ({ payments, debts, units }) => {
        console.log('Payments:', payments);
        console.log('Debts:', debts);
        console.log('Units:', units);

        const unitIds = units.map(unit =>
          Number(unit.id ?? unit.idUnit)
        );

        const filteredDebts = debts.filter(debt => {
          const debtUnitId = Number(
            debt.unitId ?? debt.idUnit
          );

          return unitIds.includes(debtUnitId);
        });

        this.allDebts = filteredDebts;

        const debtIds = filteredDebts.map(debt =>
          Number(debt.id ?? debt.idDebt)
        );

        const filteredPayments = payments.filter(payment => {
          const paymentDebtId = Number(
            payment.debtId ?? payment.idDebt
          );

          return debtIds.includes(paymentDebtId);
        });

        this.allPayments = filteredPayments;

        this.totalCollected = filteredPayments
          .filter(payment =>
            String(payment.status).toUpperCase() === 'PAID'
          )
          .reduce(
            (sum, payment) => sum + Number(payment.amount || 0),
            0
          );

        const pendingDebts = filteredDebts.filter(debt =>
          String(debt.status).toUpperCase() === 'PENDING'
        );

        this.pendingDebtsCount = pendingDebts.length;

        this.pendingDebtsAmount = pendingDebts.reduce(
          (sum, debt) => sum + Number(debt.amount || 0),
          0
        );

        const totalExpected = filteredDebts.reduce(
          (sum, debt) => sum + Number(debt.amount || 0),
          0
        );

        this.delinquencyRate = totalExpected > 0
          ? Number(
            (
              (this.pendingDebtsAmount / totalExpected) *
              100
            ).toFixed(1)
          )
          : 0;

        this.generateChartLabels();
      },
      error: error => {
        console.error('Error cargando información financiera:', error);
      }
    });
  }

  loadReservations(): void {
    // Currently, common areas don't have a buildingId in db.json.
    // We will leave reservations global or filter them if the model allows.
    // For now, keeping it global to match the previous structure unless a building relationship exists.
    forkJoin({
      reservations: this.reservationService.getAll(),
      commonAreas: this.commonAreaService.getAll()
    }).subscribe(({ reservations, commonAreas }) => {
      const activeReservations = reservations
        .filter(r => r.status === 'ACTIVE')
        .slice(0, 3);

      this.pendingReservations = activeReservations.map(reservation => {
        const area = commonAreas.find(
          area => Number(area.id) === Number(reservation.commonAreaId)
        );

        return {
          ...reservation,
          areaName: area?.name ?? 'Unknown Area',
          formattedDate:
            this.datePipe.transform(reservation.reservationDate, 'MMM d') +
            ' • ' +
            reservation.timeSlot +
            ':00'
        };
      });
    });
  }

  loadCommunityWall(): void {
    // Wall posts can be global across the community
    this.dashboardService.getPosts().subscribe(posts => {
      this.communityPosts = posts.slice(0, 5);
    });
  }

  updateReservationStatus(id: number | string, status: string): void {
    this.reservationService.patch(id, { status } as any).subscribe({
      next: () => {
        this.loadReservations();
      },
      error: (err) => console.error('Error updating reservation status', err)
    });
  }

  setPeriod(period: string) {
    this.selectedPeriod = period;
    this.generateChartLabels();
  }

  generateChartLabels(): void {
    const monthlyMap = new Map<string, number>();

    this.allPayments.forEach(payment => {
      if (String(payment.status).toUpperCase() !== 'PAID') {
        return;
      }

      const paymentDate = new Date(payment.paymentDate);

      if (Number.isNaN(paymentDate.getTime())) {
        return;
      }

      const key =
        `${paymentDate.getFullYear()}-` +
        `${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;

      const currentAmount = monthlyMap.get(key) ?? 0;
      const paymentAmount = Number(payment.amount || 0);

      monthlyMap.set(key, currentAmount + paymentAmount);
    });

    const monthsCount = Number(this.selectedPeriod);
    const currentDate = new Date();

    const months = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );

      months.push({
        key:
          `${date.getFullYear()}-` +
          `${String(date.getMonth() + 1).padStart(2, '0')}`,

        label: date
          .toLocaleString('en-US', { month: 'short' })
          .toUpperCase()
      });
    }

    this.chartLabels = months.map(month => month.label);

    this.monthlyRevenue = months.map(month => ({
      month: month.label,
      amount: monthlyMap.get(month.key) ?? 0
    }));

    this.maxRevenue = Math.max(
      0,
      ...this.monthlyRevenue.map(item => item.amount)
    );

    if (this.maxRevenue === 0) {
      this.maxRevenue = 1;
    }
  }
}
