import { Role } from './user-rol.model';
export interface User {
  id: number;
  fullName: string;
  email: string;
  passwordHash: string;
  phone: string;
  status: string;
  documentType: string;
  documentNumber: string;
  roles: Role[];
}
