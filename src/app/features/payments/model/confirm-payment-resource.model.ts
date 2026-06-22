export interface ConfirmPaymentResource {
  approved: boolean;
  provider: string;
  providerTransactionId: string;
  responseMessage: string;
}
