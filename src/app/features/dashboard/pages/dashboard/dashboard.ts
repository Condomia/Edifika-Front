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
    const buildingId = this.currentUser?.buildingId;
    const fetchUnits = buildingId 
      ? this.dashboardService.getUnitsByBuilding(buildingId) 
      : this.unitService.getAll();

    fetchUnits.subscribe(units => {
      this.totalUnits = units.length;
      this.occupiedUnits = units.filter(u => u.status === 'OCCUPIED').length;
      this.occupancyRate = this.totalUnits
        ? Math.round((this.occupiedUnits / this.totalUnits) * 100)
        : 0;
    });
  }

  loadFinancials(): void {
    const buildingId = this.currentUser?.buildingId;
    
    forkJoin({
      payments: this.dashboardService.getPayments(),
      debts: this.dashboardService.getDebts(),
      units: buildingId ? this.dashboardService.getUnitsByBuilding(buildingId) : this.unitService.getAll()
    }).subscribe(({ payments, debts, units }) => {
      const unitIds = units.map(u => u.idUnit || u.id);
      
      const filteredDebts = debts.filter(d => unitIds.includes(d.unitId));
      this.allDebts = filteredDebts;
      const debtIds = filteredDebts.map(d => d.id);
      
      const filteredPayments = payments.filter(p => debtIds.includes(p.debtId));
      this.allPayments = filteredPayments;

      this.totalCollected = filteredPayments
        .filter(p => p.status === 'PAID')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const pendingDebts = filteredDebts.filter(d => d.status === 'PENDING');
      this.pendingDebtsCount = pendingDebts.length;
      this.pendingDebtsAmount = pendingDebts.reduce((sum, d) => sum + Number(d.amount), 0);

      const totalDebt = filteredDebts.reduce((sum, d) => sum + Number(d.amount), 0);
      const totalExpected = this.totalCollected + totalDebt;

      this.delinquencyRate = totalExpected
        ? Number(((totalDebt / totalExpected) * 100).toFixed(1))
        : 0;

      this.generateChartLabels();
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

  generateChartLabels() {
    const monthlyMap = new Map<string, number>();
    
    this.allPayments.forEach(p => {
      if (p.status === 'PAID') {
        const d = new Date(p.paymentDate);
        const monthName = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        monthlyMap.set(monthName, (monthlyMap.get(monthName) || 0) + p.amount);
      }
    });

    const monthsCount = parseInt(this.selectedPeriod, 10);
    const labels = [];
    const d = new Date();
    for (let i = monthsCount - 1; i >= 0; i--) {
      const pastDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
      labels.push(pastDate.toLocaleString('en-US', { month: 'short' }).toUpperCase());
    }
    
    this.chartLabels = labels;
    
    this.monthlyRevenue = labels.map(m => ({
      month: m,
      amount: monthlyMap.get(m) || 0
    }));

    this.maxRevenue = Math.max(...this.monthlyRevenue.map(m => m.amount));
    if (this.maxRevenue === 0) this.maxRevenue = 100000;
  }
}
