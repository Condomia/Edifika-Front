import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { SignUpResource } from '../models/sign-up-resource.model';
import { User } from '../../users/model/user.model';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  private http = inject(HttpClient);
  private serverBaseUrl = environment.serverBaseUrl;

  signUp(resource: SignUpResource): Observable<User> {
    return this.http.post<User>(
      `${this.serverBaseUrl}${environment.authenticationEndpointPath}/sign-up`,
      resource
    );
  }
}
