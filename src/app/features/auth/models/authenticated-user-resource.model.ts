export interface AuthenticatedUserResource {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
  buildingId: number;
  token: string;
}
