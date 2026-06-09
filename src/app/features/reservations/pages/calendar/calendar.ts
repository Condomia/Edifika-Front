import { ReservationService } from '../../services/reservation.service';
import { CommonAreaService } from '../../services/common-area.service';
import { Reservation } from '../../model/reservation.model';
import { CommonArea } from '../../model/common-area.model';
import {UsersService} from '../../../users/services/users.service';
import {User} from '../../../users/model/user.model';
import { forkJoin } from 'rxjs';
import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef, OnInit,
} from '@angular/core';
import {
  isSameDay,
  isSameMonth,
} from 'date-fns';
import { Subject } from 'rxjs';
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
import {DatePipe, JsonPipe} from '@angular/common';
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
    CalendarPreviousViewDirective,
    CalendarTodayDirective,
    CalendarNextViewDirective,
    CalendarMonthViewComponent,
    FormsModule,
    CalendarDatePipe,
    DatePipe,
  ],
  providers: [
    provideFlatpickrDefaults(),
    provideCalendar({ provide: DateAdapter, useFactory: adapterFactory }),
  ],
})
export class Calendar implements OnInit  {
  constructor(
    private reservationService: ReservationService,
    private commonAreaService: CommonAreaService,
    private usersService: UsersService

) {}

  ngOnInit(): void {
    forkJoin({
      reservations: this.reservationService.getAll(),
      commonAreas: this.commonAreaService.getAll(),
      users: this.usersService.getAll()
    }).subscribe(({ reservations, commonAreas, users }) => {

      console.log('RESERVATIONS:', reservations);
      console.log('COMMON AREAS:', commonAreas);
      console.log('USERS:', users);

      this.events = reservations.map((reservation: Reservation) => {
        const area = commonAreas.find(
          (area: CommonArea) => Number(area.id) === Number(reservation.commonAreaId)
        );

        const user = users.find(
          (user: User) => Number(user.id) === Number(reservation.residentId)
        );

        console.log('Reserva:', reservation);
        console.log('Área encontrada:', area);
        console.log('Usuario encontrado:', user);

        return {
          title: `${area?.name ?? 'Área común'} - ${user?.fullName?.split(' ')[0] ?? 'Residente'}`,
          start: new Date(`${reservation.reservationDate}T${reservation.timeSlot}:00:00`),
          end: new Date(`${reservation.reservationDate}T${Number(reservation.timeSlot) + 1}:00:00`),
          color: this.getReservationColor(reservation, area),
        };
      });

      this.refresh.next();
    });
  }

  @ViewChild('modalContent', { static: true }) modalContent!: TemplateRef<any>;
  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  modalData?: {
    action: string;
    event: CalendarEvent;
  };

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
        this.events = this.events.filter((iEvent) => iEvent !== event);
        this.handleEvent('Deleted', event);
      },
    },
  ];

  refresh = new Subject<void>();

  events: CalendarEvent[] = [];

  activeDayIsOpen: boolean = true;


  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
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




}
