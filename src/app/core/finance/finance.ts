import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface Debt {
  id: number;
  unitId?: number;
  idUnit?: number;
  description: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: string;
}

interface Payment {
  id: number;
  debtId: number;
  userId?: number;
  idUser?: number;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod: string;
  status: string;
}

interface Unit {
  id: number;
  idUnit?: number;
  idBuilding?: number;
  buildingId?: number;
  unitNumber: number | string;
  status: string;
}

interface UserUnit {
  id: number;
  idBuilding?: number;
  buildingId?: number;
  idUnit?: number;
  unitId?: number;
  idUser?: number;
  userId?: number;
  status: string;
}

interface User {
  id: number;
  fullName: string;
  email?: string;
}

interface Building {
  id: number;
  idBuilding?: number;
  name: string;
}

interface AreaFinancialReport {
  idArea: number;
  areaId?: number;
  areaName?: string;
  totalPagoGanadoPorArea: number;
  totalCollected?: number;
  totalVecesReservadas: number;
  totalReservations?: number;
}

interface FinancialReport {
  buildingId: number;

  totalDebt?: number;
  totalOverdueDebt?: number;
  totalCollectedFromDebts?: number;
  totalCollectedFromReservations?: number;
  overdueRate?: number;

  deudaTotal?: number;
  deudaAtrasadaTotal?: number;
  dineroRecolectadoPorPagoDeuda?: number;
  dineroRecolectadoPorPagoDeAreas?: number;

  collectionRate?: number;
  porcentajeDeAtraso?: number;
  occupancyRate?: number;

  totalRevenue?: number;
  pendingDues?: number;
  pendingUnitsCount?: number;
  arrears?: number;

  areas?: AreaFinancialReport[];
}

interface OutstandingBalance {
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

interface CreateNotificationRequest {
  userId: number;
  title: string;
  content: string;
}

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './finance.html',
  styleUrl: './finance.css'
})
export class Finance implements OnInit {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = environment.serverBaseUrl;
  private readonly reportPath =
    environment.reportEndpointPath ?? '/api/v1/reports';

  private readonly notificationPath =
    environment.notificationEndpointPath ?? '/api/v1/notifications';

  totalRevenue = 0;
  pendingDues = 0;
  pendingUnitsCount = 0;
  arrears = 0;

  collectionRate = 0;
  occupancyRate = 0;

  monthlyRevenue: {
    key: string;
    month: string;
    amount: number;
  }[] = [];

  maxRevenue = 1;
  selectedPeriod = '6';

  allPayments: Payment[] = [];
  outstandingBalances: OutstandingBalance[] = [];

  isLoading = false;
  errorMessage = '';

  isModalOpen = false;

  currentPage = 1;
  pageSize = 10;
  searchTerm = '';

  sendingNotificationForDebtId: number | null = null;

  currentDate = new Date();

  ngOnInit(): void {
    this.fetchData();
  }

  get filteredBalances(): OutstandingBalance[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.outstandingBalances;
    }

    return this.outstandingBalances.filter(balance =>
      balance.residentName.toLowerCase().includes(term) ||
      balance.unitDetails.toLowerCase().includes(term) ||
      balance.unitAndResident.toLowerCase().includes(term) ||
      balance.buildingName.toLowerCase().includes(term)
    );
  }

  get paginatedBalances(): OutstandingBalance[] {
    const start = (this.currentPage - 1) * this.pageSize;

    return this.filteredBalances.slice(
      start,
      start + this.pageSize
    );
  }

  get totalPages(): number {
    const pages = Math.ceil(
      this.filteredBalances.length / this.pageSize
    );

    return Math.max(pages, 1);
  }

  get showingStart(): number {
    if (this.filteredBalances.length === 0) {
      return 0;
    }

    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get showingEnd(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredBalances.length
    );
  }

  fetchData(): void {
    const buildingId = this.getBuildingId();

    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      report: this.http.get<FinancialReport>(
        `${this.baseUrl}${this.reportPath}/financial/buildings/${buildingId}`
      ),
      units: this.http.get<Unit[]>(
        `${this.baseUrl}/residential/buildings/${buildingId}/units`
      ),
      users: this.http.get<User[]>(
        `${this.baseUrl}/users`
      ),
      userUnits: this.http.get<UserUnit[]>(
        `${this.baseUrl}/residential/buildings/${buildingId}/residents`
      ),
      buildings: this.http.get<Building[]>(
        `${this.baseUrl}/residential/buildings`
      )
    }).pipe(
      switchMap(baseData => {
        const debtRequests = baseData.units.map(unit =>
          this.http.get<Debt[]>(
            `${this.baseUrl}/payments/debts/unit/${this.getUnitId(unit)}`
          )
        );

        const userIds = Array.from(
          new Set(
            baseData.userUnits
              .map(userUnit => this.getUserUnitUserId(userUnit))
              .filter(userId => userId > 0)
          )
        );

        const paymentRequests = userIds.map(userId =>
          this.http.get<Payment[]>(
            `${this.baseUrl}/payments/user/${userId}`
          )
        );

        return forkJoin({
          report: of(baseData.report),
          units: of(baseData.units),
          users: of(baseData.users),
          userUnits: of(baseData.userUnits),
          buildings: of(baseData.buildings),
          debts: debtRequests.length
            ? forkJoin(debtRequests).pipe(map(groups => groups.flat()))
            : of([] as Debt[]),
          payments: paymentRequests.length
            ? forkJoin(paymentRequests).pipe(map(groups => groups.flat()))
            : of([] as Payment[])
        });
      })
    ).subscribe({
      next: ({
               report,
               payments,
               debts,
               units,
               users,
               userUnits,
               buildings
             }) => {
        this.allPayments = payments ?? [];

        this.applyFinancialReport(report);

        this.calculateCharts();

        this.buildOutstandingBalances(
          debts ?? [],
          payments ?? [],
          units ?? [],
          users ?? [],
          userUnits ?? [],
          buildings ?? [],
          buildingId
        );

        /*
         * Si el reporte no devuelve estos valores,
         * se calculan como respaldo con los datos actuales.
         */
        this.applyFallbackValues(
          payments ?? [],
          debts ?? [],
          units ?? [],
          buildingId,
          report
        );

        this.isLoading = false;
      },
      error: error => {
        console.error(
          'Error obteniendo la información financiera:',
          error
        );

        this.errorMessage =
          'No se pudo cargar la información financiera. Verifique que el API Gateway y el servidor Node estén activos.';

        this.isLoading = false;
      }
    });
  }

  private applyFinancialReport(
    report: FinancialReport
  ): void {
    const paymentRevenue =
      Number(report.totalCollectedFromDebts ?? report.dineroRecolectadoPorPagoDeuda ?? 0);

    const areaRevenue =
      Number(report.totalCollectedFromReservations ?? report.dineroRecolectadoPorPagoDeAreas ?? 0);

    this.totalRevenue = Number(
      report.totalRevenue ??
      paymentRevenue + areaRevenue
    );

    this.pendingDues = Number(
      report.pendingDues ??
      report.totalDebt ??
      report.deudaTotal ??
      0
    );

    this.arrears = Number(
      report.arrears ??
      report.totalOverdueDebt ??
      report.deudaAtrasadaTotal ??
      0
    );

    this.pendingUnitsCount = Number(
      report.pendingUnitsCount ?? 0
    );

    this.collectionRate = this.clampPercentage(
      Number(report.collectionRate ?? 0)
    );

    this.occupancyRate = this.clampPercentage(
      Number(report.occupancyRate ?? 0)
    );
  }

  private applyFallbackValues(
    payments: Payment[],
    debts: Debt[],
    units: Unit[],
    buildingId: number,
    report: FinancialReport
  ): void {
    const buildingUnits = units.filter(unit =>
      this.getUnitBuildingId(unit) === buildingId
    );

    const buildingUnitIds = new Set(
      buildingUnits.map(unit => this.getUnitId(unit))
    );

    const buildingDebts = debts.filter(debt =>
      buildingUnitIds.has(this.getDebtUnitId(debt))
    );

    const pendingDebts = buildingDebts.filter(debt =>
      debt.status?.toUpperCase() === 'PENDING'
    );

    const now = new Date();

    const overdueDebts = pendingDebts.filter(debt =>
      this.isDateBeforeToday(debt.dueDate, now)
    );

    const paidPayments = payments.filter(payment =>
      payment.status?.toUpperCase() === 'PAID'
    );

    const paidAmount = paidPayments.reduce(
      (sum, payment) =>
        sum + Number(payment.amount ?? 0),
      0
    );

    const pendingAmount = pendingDebts.reduce(
      (sum, debt) =>
        sum + Number(debt.amount ?? 0),
      0
    );

    const overdueAmount = overdueDebts.reduce(
      (sum, debt) =>
        sum + Number(debt.amount ?? 0),
      0
    );

    if (
      report.totalRevenue === undefined &&
      report.totalCollectedFromDebts === undefined &&
      report.dineroRecolectadoPorPagoDeuda === undefined
    ) {
      this.totalRevenue = paidAmount;
    }

    if (
      report.pendingDues === undefined &&
      report.totalDebt === undefined &&
      report.deudaTotal === undefined
    ) {
      this.pendingDues = pendingAmount;
    }

    if (
      report.arrears === undefined &&
      report.totalOverdueDebt === undefined &&
      report.deudaAtrasadaTotal === undefined
    ) {
      this.arrears = overdueAmount;
    }

    if (report.pendingUnitsCount === undefined) {
      this.pendingUnitsCount = new Set(
        pendingDebts.map(debt =>
          this.getDebtUnitId(debt)
        )
      ).size;
    }

    if (report.collectionRate === undefined) {
      const expectedAmount =
        paidAmount + pendingAmount;

      this.collectionRate =
        expectedAmount === 0
          ? 0
          : this.clampPercentage(
            (paidAmount / expectedAmount) * 100
          );
    }

    if (report.occupancyRate === undefined) {
      const occupiedUnits = buildingUnits.filter(unit =>
        unit.status?.toUpperCase() === 'OCCUPIED'
      ).length;

      this.occupancyRate =
        buildingUnits.length === 0
          ? 0
          : this.clampPercentage(
            (occupiedUnits / buildingUnits.length) * 100
          );
    }
  }

  calculateCharts(): void {
    const monthlyMap = new Map<string, number>();

    this.allPayments.forEach(payment => {
      if (payment.status?.toUpperCase() !== 'PAID') {
        return;
      }

      const paymentDate = new Date(
        payment.paymentDate
      );

      if (Number.isNaN(paymentDate.getTime())) {
        return;
      }

      const key = this.getMonthKey(paymentDate);
      const currentAmount = monthlyMap.get(key) ?? 0;

      monthlyMap.set(
        key,
        currentAmount + Number(payment.amount ?? 0)
      );
    });

    const monthsCount =
      Number.parseInt(this.selectedPeriod, 10) || 6;

    const today = new Date();

    this.monthlyRevenue = Array.from(
      { length: monthsCount },
      (_, index) => {
        const monthsAgo =
          monthsCount - index - 1;

        const date = new Date(
          today.getFullYear(),
          today.getMonth() - monthsAgo,
          1
        );

        const key = this.getMonthKey(date);

        return {
          key,
          month: date
            .toLocaleString('en-US', {
              month: 'short'
            })
            .toUpperCase(),
          amount: monthlyMap.get(key) ?? 0
        };
      }
    );

    const amounts =
      this.monthlyRevenue.map(item => item.amount);

    this.maxRevenue = Math.max(
      ...amounts,
      1
    );
  }

  private buildOutstandingBalances(
    debts: Debt[],
    payments: Payment[],
    units: Unit[],
    users: User[],
    userUnits: UserUnit[],
    buildings: Building[],
    buildingId: number
  ): void {
    const buildingUnits = units.filter(unit =>
      this.getUnitBuildingId(unit) === buildingId
    );

    const buildingUnitIds = new Set(
      buildingUnits.map(unit => this.getUnitId(unit))
    );

    const pendingDebts = debts.filter(debt =>
      debt.status?.toUpperCase() === 'PENDING' &&
      buildingUnitIds.has(this.getDebtUnitId(debt))
    );

    const now = new Date();

    this.outstandingBalances = pendingDebts.map(debt => {
      const unitId = this.getDebtUnitId(debt);

      const unit = buildingUnits.find(
        currentUnit =>
          this.getUnitId(currentUnit) === unitId
      );

      const userUnit = userUnits.find(
        currentRelation =>
          this.getUserUnitUnitId(currentRelation) === unitId
      );

      const residentId = userUnit
        ? this.getUserUnitUserId(userUnit)
        : null;

      const user = residentId !== null
        ? users.find(
          currentUser =>
            Number(currentUser.id) === residentId
        )
        : undefined;

      const unitBuildingId = unit
        ? this.getUnitBuildingId(unit)
        : buildingId;

      const building = buildings.find(
        currentBuilding =>
          this.getBuildingIdentifier(currentBuilding) === unitBuildingId
      );

      const dueDate = new Date(debt.dueDate);
      const isOverdue =
        !Number.isNaN(dueDate.getTime()) &&
        dueDate.getTime() < now.getTime();

      const overdueDays = isOverdue
        ? Math.max(
          1,
          Math.ceil(
            (
              now.getTime() -
              dueDate.getTime()
            ) /
            (1000 * 60 * 60 * 24)
          )
        )
        : 0;

      const userPayments = residentId === null
        ? []
        : payments
          .filter(payment =>
            this.getPaymentUserId(payment) ===
            residentId
          )
          .sort(
            (first, second) =>
              new Date(second.paymentDate).getTime() -
              new Date(first.paymentDate).getTime()
          );

      const lastPaymentDate =
        userPayments.length > 0
          ? this.formatDate(
            userPayments[0].paymentDate
          )
          : 'No payments';

      const residentName =
        user?.fullName ?? 'Unknown';

      const unitNumber =
        unit?.unitNumber ?? 'N/A';

      return {
        debtId: Number(debt.id),
        residentId,
        unitId,

        unitAndResident:
          `Unit ${unitNumber} - ${residentName}`,

        residentName,

        initials:
          this.getInitials(residentName),

        unitDetails:
          `Unit ${unitNumber}`,

        buildingName:
          building?.name ?? 'Unknown building',

        status: isOverdue
          ? `OVERDUE ${overdueDays} DAYS`
          : 'GRACE PERIOD',

        statusClass: isOverdue
          ? 'status-overdue'
          : 'status-grace',

        lastPaymentDate,

        amountDue: Number(debt.amount ?? 0)
      };
    });

    this.currentPage = 1;
  }

  sendNotice(
    balance: OutstandingBalance
  ): void {
    if (!balance.residentId) {
      alert(
        'No se encontró el usuario asociado a esta deuda.'
      );
      return;
    }

    const request: CreateNotificationRequest = {
      userId: balance.residentId,
      title: 'Outstanding payment notice',
      content:
        `You have an outstanding balance of ` +
        `$${balance.amountDue.toFixed(2)} ` +
        `for ${balance.unitDetails} in ` +
        `${balance.buildingName}.`
    };

    this.sendingNotificationForDebtId =
      balance.debtId;

    this.http.post(
      `${this.baseUrl}${this.notificationPath}`,
      request
    ).subscribe({
      next: () => {
        this.sendingNotificationForDebtId = null;

        alert(
          `Notification sent successfully to ${balance.residentName}.`
        );
      },
      error: error => {
        console.error(
          'Error enviando la notificación:',
          error
        );

        this.sendingNotificationForDebtId = null;

        alert(
          'No se pudo enviar la notificación.'
        );
      }
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.searchTerm = input.value;
    this.currentPage = 1;
  }

  onPeriodChange(): void {
    this.calculateCharts();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    if (
      page >= 1 &&
      page <= this.totalPages
    ) {
      this.currentPage = page;
    }
  }

  openModal(): void {
    this.isModalOpen = true;
    this.searchTerm = '';
    this.currentPage = 1;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.searchTerm = '';
    this.currentPage = 1;
  }

  getInitials(name: string): string {
    if (
      !name ||
      name.toLowerCase() === 'unknown'
    ) {
      return 'UN';
    }

    const parts = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length >= 2) {
      return (
        parts[0].charAt(0) +
        parts[1].charAt(0)
      ).toUpperCase();
    }

    return name
      .substring(0, 2)
      .toUpperCase();
  }

  private getBuildingId(): number {
    const directBuildingId =
      localStorage.getItem('buildingId');

    if (directBuildingId) {
      const parsedId = Number(directBuildingId);

      if (!Number.isNaN(parsedId)) {
        return parsedId;
      }
    }

    const storedUser =
      localStorage.getItem('currentUser') ??
      localStorage.getItem('user');

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        const parsedId = Number(
          user.buildingId ??
          user.idBuilding
        );

        if (!Number.isNaN(parsedId)) {
          return parsedId;
        }
      } catch (error) {
        console.error(
          'No se pudo leer el usuario de localStorage:',
          error
        );
      }
    }

    /*
     * Respaldo temporal para realizar pruebas.
     * Luego puedes eliminarlo cuando el login
     * siempre guarde el buildingId.
     */
    return 1;
  }

  private getMonthKey(date: Date): string {
    return (
      `${date.getFullYear()}-` +
      `${String(date.getMonth() + 1).padStart(2, '0')}`
    );
  }

  private formatDate(dateValue: string): string {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return date.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }
    );
  }

  private clampPercentage(
    value: number
  ): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(0, value)
    );
  }

  private isDateBeforeToday(
    dateValue: string,
    today: Date
  ): boolean {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return date.getTime() < today.getTime();
  }

  private getDebtUnitId(
    debt: Debt
  ): number {
    return Number(
      debt.unitId ??
      debt.idUnit ??
      0
    );
  }

  private getPaymentUserId(
    payment: Payment
  ): number {
    return Number(
      payment.userId ??
      payment.idUser ??
      0
    );
  }

  private getUnitBuildingId(
    unit: Unit
  ): number {
    return Number(
      unit.idBuilding ??
      unit.buildingId ??
      0
    );
  }

  private getUnitId(
    unit: Unit
  ): number {
    return Number(
      unit.idUnit ??
      unit.id ??
      0
    );
  }

  private getBuildingIdentifier(
    building: Building
  ): number {
    return Number(
      building.idBuilding ??
      building.id ??
      0
    );
  }

  private getUserUnitUnitId(
    userUnit: UserUnit
  ): number {
    return Number(
      userUnit.idUnit ??
      userUnit.unitId ??
      0
    );
  }

  private getUserUnitUserId(
    userUnit: UserUnit
  ): number {
    return Number(
      userUnit.idUser ??
      userUnit.userId ??
      0
    );
  }
}
