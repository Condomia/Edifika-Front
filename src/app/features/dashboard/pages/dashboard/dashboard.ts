import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { UnitService } from '../../../buildings/services/unit.service';
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
  private unitService = inject(UnitService);
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

  loadOccupancy() {
    this.unitService.getAll().subscribe(units => {
      this.totalUnits = units.length;
      this.occupiedUnits = units.filter(u => u.status === 'OCCUPIED').length;
      this.occupancyRate = this.totalUnits ? Math.round((this.occupiedUnits / this.totalUnits) * 100) : 0;
    });
  }



  loadFinancials() {
    forkJoin({
      payments: this.dashboardService.getPayments(),
      debts: this.dashboardService.getDebts()
    }).subscribe(({ payments, debts }) => {
      this.totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
      
      const pendingDebts = debts.filter(d => d.status === 'PENDING');
      this.pendingDebtsCount = pendingDebts.length;
      this.pendingDebtsAmount = pendingDebts.reduce((sum, d) => sum + d.amount, 0);

      const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0);
      const totalExpected = this.totalCollected + totalDebt;
      this.delinquencyRate = totalExpected ? Number(((totalDebt / totalExpected) * 100).toFixed(1)) : 0;
    });
  }

  loadReservations() {
    forkJoin({
      reservations: this.reservationService.getAll(),
      commonAreas: this.commonAreaService.getAll()
    }).subscribe(({ reservations, commonAreas }) => {
      const activeRes = reservations.filter(r => r.status === 'ACTIVE').slice(0, 3);
      this.pendingReservations = activeRes.map(res => {
        const area = commonAreas.find(a => a.id === String(res.commonAreaId) || a.id == res.commonAreaId);
        return {
          ...res,
          areaName: area ? area.name : 'Unknown Area',
          formattedDate: this.datePipe.transform(res.reservationDate, 'MMM d') + ' • ' + res.timeSlot + ':00'
        };
      });
    });
  }

  loadCommunityWall() {
    this.dashboardService.getPosts().subscribe(posts => {
      this.communityPosts = posts.slice(0, 5);
    });
  }
}
