import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservation-detail.component.html',
  styleUrl: './reservation-detail.component.css',
})
export class ReservationDetailComponent {
  @Input() reservationDetail: any = null;
  @Output() cancelReservation = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  formatHour(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }
}
