import { Component, Input, OnInit, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppInput } from '../../shared/ui/input/input';
import { AppButton } from '../../shared/ui/button/button';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [RouterLink, AppInput, AppButton, CommonModule, FormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css'
})
export class ProductForm implements OnInit {
  @Input() id?: string;
  
  name = '';
  price: number | null = null;
  stock: number | null = null;
  loading = false;

  private productService = inject(ProductService);
  private router = inject(Router);

  get isEdit() {
    return !!this.id;
  }

  ngOnInit() {
    if (this.isEdit && this.id) {
      this.productService.getProductById(this.id).subscribe(product => {
        this.name = product.name;
        this.price = product.price;
        this.stock = product.stock;
      });
    }
  }

  save() {
    if (!this.name || this.price === null || this.stock === null) return;
    
    this.loading = true;
    const product = { name: this.name, price: Number(this.price), stock: Number(this.stock) };
    
    if (this.isEdit && this.id) {
      this.productService.updateProduct(this.id, product).subscribe({
        next: () => this.router.navigate(['/produits']),
        error: (err) => { console.error(err); this.loading = false; }
      });
    } else {
      this.productService.createProduct(product).subscribe({
        next: () => this.router.navigate(['/produits']),
        error: (err) => { console.error(err); this.loading = false; }
      });
    }
  }
}
