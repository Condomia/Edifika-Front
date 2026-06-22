export interface RegisterPaymentResource {
  debtId: number;
  userId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  culqiToken: string;
}
