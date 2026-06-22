import { ReservationService } from '../../services/reservation.service';
import { CommonAreaService } from '../../services/common-area.service';
import { Reservation } from '../../model/reservation.model';
import { CommonArea } from '../../model/common-area.model';
import { UsersService } from '../../../users/services/users.service';
import { User } from '../../../users/model/user.model';
import { forkJoin, Subject } from 'rxjs';
import { ReservationListComponent } from '../../components/reservation-list.component/reservation-list.component';
import { ReservationDetailComponent } from '../../components/reservation-detail.component/reservation-detail.component';

import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  OnInit,
} from '@angular/core';

import {
  isSameMonth,
} from 'date-fns';

import {
  provideCalendar,
  CalendarEvent,
  CalendarEventAction,
  CalendarView,
  CalendarPreviousViewDirective,
  CalendarTodayDirective,
  CalendarNextViewDirective,
  CalendarMonthViewComponent,
  CalendarDatePipe,
  DateAdapter,
} from 'angular-calendar';

import { EventColor } from 'calendar-utils';
import { FormsModule } from '@angular/forms';

import {
  provideFlatpickrDefaults,
} from 'angularx-flatpickr';

import { DatePipe, CommonModule } from '@angular/common';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

const colors: Record<string, EventColor> = {
  active: {
    primary: '#990099',
    secondary: '#F3D6F3',
  },
  cancelled: {
    primary: '#C62020',
    secondary: '#FEE2E2',
  },
  maintenance: {
    primary: '#6B7280',
    secondary: '#E5E7EB',
  },
};

@Component({
  selector: 'app-calendar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './calendar.css',
  templateUrl: './calendar.html',
  imports: [
    CommonModule,
    CalendarPreviousViewDirective,
    CalendarTodayDirective,
    CalendarNextViewDirective,
    CalendarMonthViewComponent,
    FormsModule,
    CalendarDatePipe,
    DatePipe,
    ReservationListComponent,
    ReservationDetailComponent
  ],
  providers: [
    provideFlatpickrDefaults(),
    provideCalendar({ provide: DateAdapter, useFactory: adapterFactory }),
  ],
})
export class Calendar implements OnInit {
  constructor(
    private reservationService: ReservationService,
    private commonAreaService: CommonAreaService,
    private usersService: UsersService
  ) {}

  @ViewChild('modalContent', { static: true }) modalContent!: TemplateRef<any>;

  showCreateReservationModal = false;
  showDayReservationsModal = false;
  showReservationDetailModal = false;

  commonAreas: CommonArea[] = [];
  users: User[] = [];
  reservations: Reservation[] = [];

  todayDate = new Date().toISOString().split('T')[0];
  reservationError = '';

  reservationForm = {
    residentId: '',
    commonAreaId: '',
    reservationDate: '',
    timeSlot: 9,
    numberOfGuests: 1
  };

  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();

  modalData?: {
    action: string;
    event: CalendarEvent;
  };

  refresh = new Subject<void>();
  events: CalendarEvent[] = [];

  selectedDayReservations: CalendarEvent[] = [];
  selectedReservationDetail: any = null;
  activeDayIsOpen = true;

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      },
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Deleted', event);
      },
    },
  ];

  ngOnInit(): void {
    this.loadCalendarData();
  }

  loadCalendarData(): void {
    forkJoin({
      reservations: this.reservationService.getAll(),
      commonAreas: this.commonAreaService.getAll(),
      users: this.usersService.getAll()
    }).subscribe(({ reservations, commonAreas, users }) => {
      this.commonAreas = commonAreas;

      this.users = users.filter(user =>
        user.status === 'ACTIVE' &&
        user.roles?.some(role => role === 'OWNER' || role === 'TENANT')
      );

      this.reservations = reservations;

      this.events = reservations.map((reservation: Reservation) => {
        const area = commonAreas.find(
          (area: CommonArea) => Number(area.id) === Number(reservation.commonAreaId)
        );

        const user = users.find(
          (user: User) => Number(user.id) === Number(reservation.residentId)
        );

        return {
          title: `${area?.name ?? 'Área común'} - ${user?.fullName?.split(' ')[0] ?? 'Residente'}`,
          start: new Date(`${reservation.reservationDate}T${reservation.timeSlot}:00:00`),
          end: new Date(`${reservation.reservationDate}T${Number(reservation.timeSlot) + 1}:00:00`),
          color: this.getReservationColor(reservation, area),
          meta: {
            reservation,
            area,
            user
          }
        };
      });

      this.refresh.next();
    });
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (!isSameMonth(date, this.viewDate)) return;

    this.viewDate = date;

    if (events.length === 1) {
      this.openReservationDetail(events[0]);
      return;
    }

    if (events.length > 1) {
      this.selectedDayReservations = events;
      this.showDayReservationsModal = true;
    }
  }

  getReservationColor(
    reservation: Reservation,
    commonArea?: CommonArea
  ): EventColor {
    if (commonArea?.status === 'MAINTENANCE') {
      return colors['maintenance'];
    }

    if (reservation.status === 'CANCELLED') {
      return colors['cancelled'];
    }

    return colors['active'];
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    console.log(action, event);
  }

  openCreateReservationModal(): void {
    this.showCreateReservationModal = true;
  }

  closeCreateReservationModal(): void {
    this.showCreateReservationModal = false;

    this.reservationForm = {
      residentId: '',
      commonAreaId: '',
      reservationDate: '',
      timeSlot: 9,
      numberOfGuests: 1
    };
  }

  createReservation(): void {
    this.reservationError = '';

    const selectedArea = this.commonAreas.find(
      area => String(area.id) === String(this.reservationForm.commonAreaId)
    );

    const reservationDate = this.reservationForm.reservationDate;
    const timeSlot = Number(this.reservationForm.timeSlot);
    const numberOfGuests = Number(this.reservationForm.numberOfGuests);

    if (!reservationDate) {
      this.reservationError = 'Please select a reservation date.';
      return;
    }

    if (reservationDate < this.todayDate) {
      this.reservationError = 'You cannot reserve a date before today.';
      return;
    }

    if (!this.reservationForm.residentId) {
      this.reservationError = 'Please select a resident.';
      return;
    }

    if (!Number.isInteger(timeSlot) || timeSlot < 0 || timeSlot > 23) {
      this.reservationError = 'Time slot must be between 0 and 23.';
      return;
    }

    if (!selectedArea) {
      this.reservationError = 'Please select a common area.';
      return;
    }

    if (!Number.isInteger(numberOfGuests) || numberOfGuests < 1) {
      this.reservationError = 'Number of guests must be at least 1.';
      return;
    }

    if (numberOfGuests > selectedArea.maxCapacity) {
      this.reservationError = `This area only allows up to ${selectedArea.maxCapacity} guests.`;
      return;
    }

    const maxReservationHours = selectedArea.rules?.maxReservationHours ?? 1;

    const newStart = timeSlot;
    const newEnd = timeSlot + maxReservationHours;

    const hasConflict = this.reservations.some(reservation => {
      if (reservation.status === 'CANCELLED') return false;

      const sameArea =
        String(reservation.commonAreaId) === String(this.reservationForm.commonAreaId);

      const sameDate =
        reservation.reservationDate === reservationDate;

      if (!sameArea || !sameDate) return false;

      const existingArea = this.commonAreas.find(
        area => Number(area.id) === Number(reservation.commonAreaId)
      );

      const existingDuration = existingArea?.rules?.maxReservationHours ?? 1;

      const existingStart = Number(reservation.timeSlot);
      const existingEnd = existingStart + existingDuration;

      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasConflict) {
      this.reservationError =
        'This area already has a reservation that overlaps with this time slot.';
      return;
    }

    const newReservation: Reservation = {
      residentId: Number(this.reservationForm.residentId),
      commonAreaId: Number(this.reservationForm.commonAreaId),
      reservationDate,
      timeSlot,
      numberOfGuests,
      status: 'ACTIVE',
      qrCodeAccess: crypto.randomUUID(),
      penaltyApplied: false
    };

    this.reservationService.create(newReservation).subscribe({
      next: () => {
        this.closeCreateReservationModal();
        window.location.reload();
      },
      error: error => console.error(error)
    });
  }

  get selectedAreaCapacity(): number {
    const area = this.commonAreas.find(
      area => String(area.id) === String(this.reservationForm.commonAreaId)
    );

    return area?.maxCapacity ?? 1;
  }

  openReservationDetail(event: CalendarEvent): void {
    this.selectedReservationDetail = event.meta;
    this.showDayReservationsModal = false;
    this.showReservationDetailModal = true;
  }

  closeDayReservationsModal(): void {
    this.showDayReservationsModal = false;
    this.selectedDayReservations = [];
  }

  closeReservationDetailModal(): void {
    this.showReservationDetailModal = false;
    this.selectedReservationDetail = null;
  }

  cancelReservation(detail: any): void {
    const reservation: Reservation = {
      ...detail.reservation,
      status: 'CANCELLED'
    };

    this.reservationService.update(reservation.id!, reservation).subscribe({
      next: () => {
        this.closeReservationDetailModal();
        window.location.reload();
      },
      error: error => console.error(error)
    });
  }

  formatHour(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }
}
