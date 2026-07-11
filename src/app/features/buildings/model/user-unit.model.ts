export interface UserUnit {
  id?: number;
  idUserUnit?: number;
  idBuilding?: number;
  idUnit: number;
  idUser: number;
  startDate: string;
  endDate: string | null;
  status: string;
}
