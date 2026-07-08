import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment.development';

interface Debt { id: number; unitId: number; description: string; amount: number; currency: string; dueDate: string; status: string; }
interface Payment { id: number; debtId: number; userId: number; amount: number; currency: string; paymentDate: string; paymentMethod: string; status: string; }
interface Unit { id: number; idBuilding: number; unitNumber: number; status: string; }
interface UserUnit { id: number; idBuilding: number; idUnit: number; idUser: number; status: string; }
interface User { id: number; fullName: string; }

interface OutstandingBalance {
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

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finance.html',
  styleUrl: './finance.css'
})
export class Finance implements OnInit {
  private http = inject(HttpClient);
  private baseUrl = environment.serverBaseUrl;

  totalRevenue = 0;
  pendingDues = 0;
  pendingUnitsCount = 0;
  arrears = 0;

  collectionRate = 0;
  occupancyRate = 0;

  monthlyRevenue: { month: string, amount: number }[] = [];
  maxRevenue = 0;
  
  selectedPeriod = '6';
  allPayments: Payment[] = [];

  outstandingBalances: OutstandingBalance[] = [];

  isModalOpen = false;

  currentPage = 1;
  pageSize = 10;
  searchTerm = '';

  get filteredBalances(): OutstandingBalance[] {
    if (!this.searchTerm) return this.outstandingBalances;
    const term = this.searchTerm.toLowerCase();
    return this.outstandingBalances.filter(b => 
      b.residentName.toLowerCase().includes(term) || 
      b.unitDetails.toLowerCase().includes(term) ||
      b.unitAndResident.toLowerCase().includes(term)
    );
  }

  get paginatedBalances(): OutstandingBalance[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredBalances.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredBalances.length / this.pageSize);
  }

  get showingStart(): number {
    return this.filteredBalances.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get showingEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredBalances.length);
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.currentPage = 1;
  }

  onPeriodChange() {
    this.calculateCharts();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  currentDate = new Date();

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    Promise.all([
      this.http.get<Payment[]>(`${this.baseUrl}/payments`).toPromise(),
      this.http.get<Debt[]>(`${this.baseUrl}/debts`).toPromise(),
      this.http.get<Unit[]>(`${this.baseUrl}/units`).toPromise(),
      this.http.get<User[]>(`${this.baseUrl}/users`).toPromise(),
      this.http.get<UserUnit[]>(`${this.baseUrl}/userUnits`).toPromise(),
      this.http.get<any[]>(`${this.baseUrl}/buildings`).toPromise()
    ]).then(([payments = [], debts = [], units = [], users = [], userUnits = [], buildings = []]) => {
      this.allPayments = payments;
      this.calculateKPIs(payments, debts, units);
      this.calculateCharts();
      this.buildTable(debts, payments, units, users, userUnits, buildings);
    }).catch(err => console.error('Error fetching data', err));
  }

  calculateKPIs(payments: Payment[], debts: Debt[], units: Unit[]) {
    this.totalRevenue = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
    
    const pendingDebts = debts.filter(d => d.status === 'PENDING');
    this.pendingDues = pendingDebts.reduce((sum, d) => sum + d.amount, 0);
    
    const uniquePendingUnits = new Set(pendingDebts.map(d => d.unitId));
    this.pendingUnitsCount = uniquePendingUnits.size;

    const now = new Date();
    const overdueDebts = pendingDebts.filter(d => new Date(d.dueDate) < now);
    this.arrears = overdueDebts.reduce((sum, d) => sum + d.amount, 0);

    const totalPaidAmount = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
    const totalExpectedAmount = totalPaidAmount + this.pendingDues;
    this.collectionRate = totalExpectedAmount === 0 ? 0 : (totalPaidAmount / totalExpectedAmount) * 100;

    const occupiedUnits = units.filter(u => u.status === 'OCCUPIED').length;
    this.occupancyRate = units.length === 0 ? 0 : (occupiedUnits / units.length) * 100;
  }

  calculateCharts() {
    const monthlyMap = new Map<string, number>();
    
    this.allPayments.forEach(p => {
      if (p.status === 'PAID') {
        const d = new Date(p.paymentDate);
        const monthName = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        monthlyMap.set(monthName, (monthlyMap.get(monthName) || 0) + p.amount);
      }
    });

    const monthsCount = parseInt(this.selectedPeriod, 10);
    const months = [];
    const d = new Date();
    for (let i = monthsCount - 1; i >= 0; i--) {
      const pastDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
      months.push(pastDate.toLocaleString('en-US', { month: 'short' }).toUpperCase());
    }

    this.monthlyRevenue = months.map(m => ({
      month: m,
      amount: monthlyMap.get(m) || 0
    }));

    this.maxRevenue = Math.max(...this.monthlyRevenue.map(m => m.amount));
    if (this.maxRevenue === 0) this.maxRevenue = 100000;
  }

  buildTable(debts: Debt[], payments: Payment[], units: Unit[], users: User[], userUnits: UserUnit[], buildings: any[]) {
    const pendingDebts = debts.filter(d => d.status === 'PENDING');
    const now = new Date();

    this.outstandingBalances = pendingDebts.map(debt => {
      const unit = units.find(u => u.id === debt.unitId);
      const userUnit = userUnits.find(uu => uu.idUnit === debt.unitId);
      const user = userUnit ? users.find(u => u.id === userUnit.idUser) : null;
      const building = unit ? buildings.find(b => b.id === unit.idBuilding) : null;

      const dueDate = new Date(debt.dueDate);
      const diffTime = Math.abs(now.getTime() - dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let statusLabel = 'GRACE PERIOD';
      let statusClass = 'status-grace';
      
      if (now > dueDate) {
        statusLabel = `OVERDUE ${diffDays} DAYS`;
        statusClass = 'status-overdue';
      }

      const unitPayments = payments.filter(p => p.userId === (user ? user.id : 0)).sort((a,b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
      const lastPayment = unitPayments.length > 0 ? new Date(unitPayments[0].paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No payments';

      const residentName = user ? user.fullName : 'Unknown';
      const unitDetails = `Tower ${building ? building.name.replace('Edificio ', '').replace('Condominio ', '').charAt(0) : 'A'}, ${unit ? unit.unitNumber : '0000'}`;

      return {
        unitAndResident: `Unit ${unit ? unit.unitNumber : 'N/A'} - ${residentName}`,
        residentName: residentName,
        initials: this.getInitials(residentName),
        unitDetails: unitDetails,
        buildingName: building ? building.name : 'Unknown',
        status: statusLabel,
        statusClass: statusClass,
        lastPaymentDate: lastPayment,
        amountDue: debt.amount
      };
    });
  }

  getInitials(name: string): string {
    if (!name || name === 'Unknown') return 'UN';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  sendNotice() {
    alert('Notice sent successfully!');
  }
}
