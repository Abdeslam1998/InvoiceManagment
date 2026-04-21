import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStatusChip } from '../../shared/ui/status-chip/status-chip';
import { InvoiceService, Invoice } from '../../services/invoice.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard-laiterie',
  standalone: true,
  imports: [RouterLink, AppStatusChip, CommonModule, FormsModule],
  templateUrl: './dashboard-laiterie.html',
  styleUrl: './dashboard-laiterie.css',
})
export class DashboardLaiterie implements OnInit {
  private invoiceService = inject(InvoiceService);
  private authService = inject(AuthService);

  responsibleName = 'Dairy Admin';
  totalRevenues = 0;
  pending = 0;
  paid = 0;
  paidPercentage = 0;
  pendingPercentage = 0;

  allInvoices: Invoice[] = [];
  displayedRecentInvoices: Invoice[] = [];
  selectedStatusFilter: 'all' | 'paid' | 'partial' | 'unpaid' = 'all';

  ngOnInit() {
    this.authService.getProfile().subscribe({
      next: (profile) => {
        if (profile?.responsibleName) {
          this.responsibleName = profile.responsibleName;
        }
      },
      error: (err) => console.error('Failed to load profile', err)
    });

    this.invoiceService.getInvoices().subscribe({
      next: (invoices) => {
        this.allInvoices = invoices
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.displayedRecentInvoices = this.getFilteredInvoices();

        this.totalRevenues = this.allInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        this.pending = this.allInvoices.reduce((sum, inv) => sum + (inv.remaining || 0), 0);
        this.paid = this.totalRevenues - this.pending;

        if (this.totalRevenues > 0) {
          this.paidPercentage = Math.round((this.paid / this.totalRevenues) * 100);
          this.pendingPercentage = 100 - this.paidPercentage;
        }
      },
      error: (err) => console.error('Failed to load invoices', err)
    });
  }

  getFilteredInvoices(): Invoice[] {
    const filtered = this.selectedStatusFilter === 'all'
      ? this.allInvoices
      : this.allInvoices.filter(inv => inv.status === this.selectedStatusFilter);
    return filtered.slice(0, 2);
  }

  filterRecentInvoices() {
    this.displayedRecentInvoices = this.getFilteredInvoices();
  }
}
