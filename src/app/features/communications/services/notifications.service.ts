import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';

import { BaseService } from '../../../shared/services/base.service';
import { Notification } from '../model/notification.model';
import { environment } from '../../../../environments/environment';

interface PageResponse<T> {
  content: T[];
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService extends BaseService<Notification> {
  constructor() {
    super();
    this.resourceEndpoint = environment.notificationEndpointPath;
  }

  getByUserId(userId: number): Observable<Notification[]> {
    return this.http
      .get<PageResponse<Notification>>(
        `${this.resourcePath()}/user/${userId}`,
        this.httpOptions
      )
      .pipe(
        map(response => response.content ?? []),
        catchError(this.handleError)
      );
  }

  markAsRead(id: number): Observable<Notification> {
    return this.http.patch<Notification>(
      `${this.resourcePath()}/${id}/read`,
      {},
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }
}
