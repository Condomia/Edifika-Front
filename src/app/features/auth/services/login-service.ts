import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { SignInResource } from '../models/sign-in-resource.model';
import { AuthenticatedUserResource } from '../models/authenticated-user-resource.model';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private http = inject(HttpClient);
  private serverBaseUrl = environment.serverBaseUrl;

  signIn(resource: SignInResource): Observable<AuthenticatedUserResource> {
    return this.http.post<AuthenticatedUserResource>(
      `${this.serverBaseUrl}${environment.authenticationEndpointPath}/sign-in`,
      resource
    ).pipe(
      tap(response => {
        localStorage.setItem('edifika_token', response.token);
        localStorage.setItem('edifika_user', JSON.stringify(response));
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('edifika_token');
  }

  getCurrentUser(): AuthenticatedUserResource | null {
    const user = localStorage.getItem('edifika_user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('edifika_token');
    localStorage.removeItem('edifika_user');
  }
}
