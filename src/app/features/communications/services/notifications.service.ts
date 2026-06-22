import { Injectable } from '@angular/core';

import { BaseService } from '../../../shared/services/base.service';
import { Notification } from '../model/notification.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService extends BaseService<Notification> {
  constructor() {
    super();
    this.resourceEndpoint = environment.notificationEndpointPath;
  }
}
