import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppInput } from '../../shared/ui/input/input';
import { AppButton } from '../../shared/ui/button/button';
import { InvoiceService } from '../../services/invoice.service';
import { ClientService, Client } from '../../services/client.service';
import { ProductService, Product } from '../../services/product.service';

interface InvoiceItemForm {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-creation-facture',
  standalone: true,
  imports: [RouterLink, AppInput, AppButton, CommonModule, FormsModule],
  templateUrl: './creation-facture.html',
  styleUrl: './creation-facture.css',
})
export class CreationFacture implements OnInit {
  private invoiceService = inject(InvoiceService);
  private clientService = inject(ClientService);
  private productService = inject(ProductService);
  private router = inject(Router);

  clients: Client[] = [];
  products: Product[] = [];

  selectedClientId: string = '';
  invoiceDate: string = new Date().toISOString().split('T')[0];

  selectedProductId: string = '';
  selectedQuantity: number = 1;
  selectedStatus: 'unpaid' | 'partial' | 'paid' = 'unpaid';
  paidAmount: number | null = null;
  loading = false;
  productError = '';
  statusError = '';

  items: InvoiceItemForm[] = [];

  ngOnInit() {
    this.clientService.getClients().subscribe(c => this.clients = c);
    this.productService.getProducts().subscribe(p => this.products = p);
  }

  get availableProducts(): Product[] {
    return this.products.filter(p => p.stock > 0);
  }

  addItem() {
    this.productError = '';
    const product = this.products.find(p => p._id === this.selectedProductId);
    if (!product) return;

    if (product.stock === 0) {
      this.productError = 'Ce produit est épuisé.';
      return;
    }

    if (this.selectedQuantity < 1) {
      this.productError = 'Veuillez entrer une quantité valide.';
      return;
    }

    const existing = this.items.find(i => i.product._id === product._id);
    const newQuantity = existing ? existing.quantity + this.selectedQuantity : this.selectedQuantity;
    if (newQuantity > product.stock) {
      this.productError = `Quantité maximale disponible : ${product.stock}.`;
      return;
    }

    if (existing) {
      existing.quantity = newQuantity;
    } else {
      this.items.push({ product, quantity: this.selectedQuantity });
    }

    this.selectedProductId = '';
    this.selectedQuantity = 1;
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }

  saveInvoice() {
    if (!this.selectedClientId || this.items.length === 0) return;
    this.statusError = '';

    if (this.selectedStatus === 'partial') {
      if (this.paidAmount === null || this.paidAmount <= 0) {
        this.statusError = 'Veuillez saisir le montant payé.';
        return;
      }
      if (this.paidAmount >= this.subtotal) {
        this.statusError = 'Le montant payé doit être inférieur au total pour un statut partiel.';
        return;
      }
    }

    if (this.selectedStatus === 'paid') {
      this.paidAmount = this.subtotal;
    }

    this.loading = true;

    const payload = {
      clientId: this.selectedClientId,
      date: this.invoiceDate,
      status: this.selectedStatus,
      paidAmount: this.selectedStatus === 'unpaid' ? 0 : this.paidAmount,
      products: this.items.map(item => ({
        productId: item.product._id || '',
        quantity: item.quantity,
      }))
    };

    this.invoiceService.createInvoice(payload as any).subscribe({
      next: () => this.router.navigate(['/factures']),
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
