export interface Payment {
  id: number;
  debtId: number;
  userId: number;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod: string;
  status: string;
}
