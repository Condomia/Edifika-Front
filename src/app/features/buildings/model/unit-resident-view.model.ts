export interface UnitResidentView {
  unitId: number;
  unitNumber: number;
  tower: string;
  unitStatus: string;

  residentId?: number;
  residentName: string;
  residentRole: string;
  email: string;
  phone: string;

  debtStatus: 'PAID' | 'LATE' | 'N/A';
  debtLabel: string;
}
