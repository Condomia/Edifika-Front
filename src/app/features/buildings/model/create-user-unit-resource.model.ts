export interface CreateUserUnitResource {
  idUnit: number;
  idUser: number;
  startDate: string;
  endDate: string | null;
  status: string;
}
