export interface Debt {
  id: number;

  unitId?: number;
  idUnit?: number;

  description?: string;
  amount: number;
  currency?: string;
  dueDate: string;
  status: string;
}

export interface Payment {
  id: number;

  debtId?: number;
  idDebt?: number;

  userId?: number;
  idUser?: number;

  amount: number;
  currency?: string;
  paymentDate: string;
  paymentMethod?: string;
  status: string;
}

export interface Unit {
  id?: number;
  idUnit?: number;

  idBuilding?: number;
  buildingId?: number;

  unitNumber?: number | string;
  number?: number | string;
  name?: string;

  status?: string;
}

export interface UserUnit {
  id: number;

  idBuilding?: number;
  buildingId?: number;

  idUnit?: number;
  unitId?: number;

  idUser?: number;
  userId?: number;
  residentId?: number;

  status?: string;
}

export interface User {
  id?: number;
  idUser?: number;

  fullName?: string;
  name?: string;
  email?: string;
}

export interface Building {
  id?: number;
  idBuilding?: number;

  name?: string;
  buildingName?: string;
}

export interface AreaFinancialReportResource {
  areaId: number;
  areaName: string;
  totalCollected: number;
  totalPenalties: number;
  totalReservations: number;
}


export interface FinancialReportResource {
  buildingId: number;

  totalDebt: number;
  totalOverdueDebt: number;

  totalCollectedFromDebts: number;
  collectionRate: number;
  overdueRate: number;

  totalCollectedFromReservations: number;

  areas: AreaFinancialReportResource[];
}

export interface OutstandingBalance {
  debtId: number;
  residentId: number | null;
  unitId: number;

  unitAndResident: string;
  residentName: string;
  initials: string;

  unitDetails: string;
  buildingName: string;

  status: string;
  statusClass: string;

  lastPaymentDate: string;
  amountDue: number;
}

export interface CreateNotificationRequest {
  userId: number;
  title: string;
  content: string;
}
