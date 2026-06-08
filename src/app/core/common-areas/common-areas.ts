import { Component } from '@angular/core';
import {Calendar} from '../../features/reservations/pages/calendar/calendar';
import {CommonAreaListComponent} from '../../features/reservations/components/common-area-list.component/common-area-list.component';

@Component({
  selector: 'app-common-areas',
  standalone: true,
  imports: [Calendar, CommonAreaListComponent],
  templateUrl: './common-areas.html',
  styleUrl: './common-areas.css'
})
export class CommonAreas {
}
