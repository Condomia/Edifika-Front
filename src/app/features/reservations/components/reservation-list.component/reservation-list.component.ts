import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarEvent } from 'angular-calendar';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservation-list.component.html',
  styleUrl: './reservation-list.component.css',
})
export class ReservationListComponent {
  @Input() reservations: CalendarEvent[] = [];

  @Output() selectReservation = new EventEmitter<CalendarEvent>();
  @Output() close = new EventEmitter<void>();

  formatHour(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }
}
