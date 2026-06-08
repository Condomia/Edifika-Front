import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  // Configured to point to the API Gateway / IAM microservice
  private apiUrl = '/api/v1/users';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de usuarios.
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * Verifica a un usuario en el sistema.
   * @param id Identificador del usuario a verificar.
   */
  verifyUser(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/verify`, {});
  }

  /**
   * Actualiza la información de un usuario.
   * @param id Identificador del usuario.
   * @param data Datos a actualizar.
   */
  updateUser(id: number, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, data);
  }
}
