import {Component, Input} from '@angular/core';
import {CommonArea} from '../../model/common-area.model';

@Component({
  selector: 'app-common-area-card',
  imports: [],
  templateUrl: './common-area-card.component.html',
  styleUrl: './common-area-card.component.css',
})
export class CommonAreaCardComponent {
  @Input() commonArea!: CommonArea;
  constructor() { }
  get areaIcon(): string {
    switch (this.commonArea?.type) {
      case 'POOL':
        return 'pool';
      case 'GYM':
        return 'fitness_center';
      case 'COWORKING_ROOM':
        return 'groups';
      case 'BBQ_AREA':
        return 'outdoor_grill';
      case 'PARTY_ROOM':
        return 'celebration';
      case 'MEETING_ROOM':
        return 'meeting_room';
      default:
        return 'apartment';
    }
  }
  get areaStatus(): string {
    return this.commonArea?.status === 'AVAILABLE'
      ? 'Disponible'
      : 'Mantenimiento';
  }

}
