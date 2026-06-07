export interface Payment {
  id_payment: number;
  id_debt: number;
  id_user: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  pdf_link: string;
  status: string;
}
