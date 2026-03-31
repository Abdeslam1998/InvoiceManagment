import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-chip',
  imports: [],
  template: `
    <div [class]="getContainerClasses()">
      @if (status === 'paid' || status === 'payé') {
        <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
        <span class="text-[10px] font-bold font-label uppercase text-on-secondary-container tracking-wider">Payé</span>
      } @else if (status === 'unpaid' || status === 'impayé') {
        <span class="w-1.5 h-1.5 rounded-full bg-error"></span>
        <span class="text-[10px] font-bold font-label uppercase text-on-error-container tracking-wider">Impayé</span>
      } @else if (status === 'partial' || status === 'partiel') {
        <span class="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
        <span class="text-[10px] font-bold font-label uppercase text-on-tertiary-container tracking-wider">Partiel</span>
      }
    </div>
  `
})
export class AppStatusChip {
  @Input() status: 'paid' | 'payé' | 'unpaid' | 'impayé' | 'partial' | 'partiel' = 'paid';

  getContainerClasses(): string {
    const base = 'px-3 py-1 rounded-full flex items-center gap-1.5 inline-flex w-fit';
    if (this.status === 'paid' || this.status === 'payé') return `${base} bg-secondary-container/40`;
    if (this.status === 'unpaid' || this.status === 'impayé') return `${base} bg-error-container/30`;
    if (this.status === 'partial' || this.status === 'partiel') return `${base} bg-tertiary-container/40`;
    return base;
  }
}
