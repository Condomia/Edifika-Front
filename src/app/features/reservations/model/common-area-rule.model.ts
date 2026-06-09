export interface CommonAreaRule {
  id: number | string;
  commonAreaId: number;
  maxReservationHours: number;
  requiresPayment: boolean;
  price: number;
  requiresGuarantee: boolean;
  guaranteeAmount: number;
  allowCancellation: boolean;
  penaltyHoursBefore: number;
  penaltyAmount: number;
  requiresApproval: boolean;
}
