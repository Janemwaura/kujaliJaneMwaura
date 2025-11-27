import { Component, inject, computed } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';

import { cloneDeep as ___cloneDeep, flatMap as __flatMap } from 'lodash';
import { Logger } from '@iote/bricks-angular';

import { Budget, BudgetRecord, BudgetStatus, OrgBudgetsOverview } from '@app/model/finance/planning/budgets';
import { BudgetsStore, OrgBudgetsStore } from '@app/state/finance/budgetting/budgets';

import { CreateBudgetModalComponent } from '../../components/create-budget-modal/create-budget-modal.component';

@Component({
  selector: 'app-select-budget',
  templateUrl: './select-budget.component.html',
  styleUrls: ['./select-budget.component.scss', '../../components/budget-view-styles.scss'],
})
export class SelectBudgetPageComponent {

  private _orgBudgets$$ = inject(OrgBudgetsStore);
  private _budgets$$ = inject(BudgetsStore);
  private _dialog = inject(MatDialog);
  private _logger = inject(Logger);

  // Convert observable streams to signals
  overview = toSignal(this._orgBudgets$$.get(), { initialValue: null });
  sharedBudgets = toSignal(this._budgets$$.get(), { initialValue: [] });

  // Combine & transform data using computed()
  allBudgets = computed(() => {
    const overview = this.overview();
    const budgets = this.sharedBudgets();

    if (!overview || !budgets) return { overview: [], budgets: [] };

    const ov = __flatMap(overview);
    const bu = __flatMap(budgets).map((b: any) => ({
      ...b,
      endYear: b.startYear + b.duration - 1
    }));

    return { overview: ov, budgets: bu };
  });

  showFilter = false;

  applyFilter(event: Event) { }

  fieldsFilter(value: (Invoice) => boolean) { }

  toogleFilter(value) { }

  openDialog(parent: Budget | false): void {
    const dialog = this._dialog.open(CreateBudgetModalComponent, {
      height: 'fit-content',
      width: '600px',
      data: parent != null ? parent : false
    });

    dialog.afterClosed().subscribe(() => { });
  }

  canPromote(record: BudgetRecord) {
    return (record.budget as any).canBeActivated;
  }

  setActive(record: BudgetRecord) {
    const toSave = ___cloneDeep(record.budget);

    delete (toSave as any).canBeActivated;
    delete (toSave as any).access;

    toSave.status = BudgetStatus.InUse;

    (<any>record).updating = true;

    this._budgets$$.update(toSave).subscribe(() => {
      (<any>record).updating = false;
      this._logger.log(() => `Updated Budget with id ${toSave.id}. Set as an active budget for this org.`);
    });
  }
}
