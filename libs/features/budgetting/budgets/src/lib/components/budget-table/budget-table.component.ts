import { Component, Input, ViewChild, effect, inject, signal } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';

import { Budget, BudgetRecord } from '@app/model/finance/planning/budgets';
import { ShareBudgetModalComponent } from '../share-budget-modal/share-budget-modal.component';
import { CreateBudgetModalComponent } from '../create-budget-modal/create-budget-modal.component';
import { ChildBudgetsModalComponent } from '../../modals/child-budgets-modal/child-budgets-modal.component';

@Component({
  selector: 'app-budget-table',
  templateUrl: './budget-table.component.html',
  styleUrls: ['./budget-table.component.scss'],
})
export class BudgetTableComponent {

  // Convert child input to signal-based input
  @Input({ required: true }) budgets!: {
    overview: BudgetRecord[];
    budgets: any[];
  };

  @Input() canPromote = false;

  dataSource = new MatTableDataSource();
  displayedColumns: string[] = ['name', 'status', 'startYear', 'duration', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('sort', { static: true }) sort!: MatSort;

  overviewBudgets: BudgetRecord[] = [];

  private _router = inject(Router);
  private _dialog = inject(MatDialog);

  constructor() {
    // Replace ngOnInit and RxJS with effect()
    effect(() => {
      const data = this.budgets;
      if (!data) return;

      this.overviewBudgets = data.overview;
      this.dataSource.data = data.budgets;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  access(requested: any) {
    switch (requested) {
      case 'view':
      case 'clone':
        return true;
      case 'edit':
        return true;
    }
    return false;
  }

  filterAccountRecords(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  promote() {
    if (this.canPromote) this.doPromote();
  }

  // Emit promotion manually
  doPromote() {
    // handled by parent
  }

  openShareBudgetDialog(parent: Budget | false): void {
    this._dialog.open(ShareBudgetModalComponent, {
      panelClass: 'no-pad-dialog',
      width: '600px',
      data: parent !== null ? parent : false
    });
  }

  openCloneBudgetDialog(parent: Budget | false): void {
    this._dialog.open(CreateBudgetModalComponent, {
      height: 'fit-content',
      width: '600px',
      data: parent !== null ? parent : false
    });
  }

  openChildBudgetDialog(parent: Budget): void {
    let children: any = this.overviewBudgets.find((budget) => budget.budget.id === parent.id)
      ?._?.children;
    children = children?.map((child) => child.budget);

    this._dialog.open(ChildBudgetsModalComponent, {
      height: 'fit-content',
      minWidth: '600px',
      data: { parent: parent, budgets: children }
    });
  }

  goToDetail(budgetId: string, action: string) {
    this._router.navigate(['budgets', budgetId, action])
      .then(() => this._dialog.closeAll());
  }

  deleteBudget(budget: Budget) {}

  translateStatus(status: number) {
    switch (status) {
      case 1: return 'BUDGET.STATUS.ACTIVE';
      case 0: return 'BUDGET.STATUS.DESIGN';
      case 9: return 'BUDGET.STATUS.NO-USE';
      case -1: return 'BUDGET.STATUS.DELETED';
      default: return '';
    }
  }
}
