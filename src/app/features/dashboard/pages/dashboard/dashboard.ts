import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';

import { UnitsService } from '../../../buildings/services/units.service';
import { ReservationService } from '../../../reservations/services/reservation.service';
import { CommonAreaService } from '../../../reservations/services/common-area.service';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private unitService = inject(UnitsService);
  private reservationService = inject(ReservationService);
  private commonAreaService = inject(CommonAreaService);
  private dashboardService = inject(DashboardService);
  private datePipe = inject(DatePipe);

  currentDate = new Date();

  occupancyRate = 0;
  occupiedUnits = 0;
  totalUnits = 0;

  pendingDebtsCount = 0;
  pendingDebtsAmount = 0;
  totalCollected = 0;
  delinquencyRate = 0;

  pendingReservations: any[] = [];
  communityPosts: any[] = [];

  ngOnInit(): void {
    this.loadOccupancy();
    this.loadFinancials();
    this.loadReservations();
    this.loadCommunityWall();
  }

  loadOccupancy(): void {
    this.unitService.getAll().subscribe(units => {
      this.totalUnits = units.length;
      this.occupiedUnits = units.filter(u => u.status === 'OCCUPIED').length;
      this.occupancyRate = this.totalUnits
        ? Math.round((this.occupiedUnits / this.totalUnits) * 100)
        : 0;
    });
  }

  loadFinancials(): void {
    forkJoin({
      payments: this.dashboardService.getPayments(),
      debts: this.dashboardService.getDebts()
    }).subscribe(({ payments, debts }) => {
      this.totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);

      const pendingDebts = debts.filter(d => d.status === 'PENDING');
      this.pendingDebtsCount = pendingDebts.length;
      this.pendingDebtsAmount = pendingDebts.reduce((sum, d) => sum + Number(d.amount), 0);

      const totalDebt = debts.reduce((sum, d) => sum + Number(d.amount), 0);
      const totalExpected = this.totalCollected + totalDebt;

      this.delinquencyRate = totalExpected
        ? Number(((totalDebt / totalExpected) * 100).toFixed(1))
        : 0;
    });
  }

  loadReservations(): void {
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
    this.dashboardService.getPosts().subscribe(posts => {
      this.communityPosts = posts.slice(0, 5);
    });
  }
}
