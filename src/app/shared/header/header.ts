import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':       'Tableau de Bord',
  '/clients':         'Clients',
  '/clients/add':     'Nouveau Client',
  '/produits':        'Produits',
  '/produits/add':    'Nouveau Produit',
  '/factures':        'Factures',
  '/factures/create': 'Nouvelle Facture',
  '/profile':         'Mon Profil',
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private router = inject(Router);

  title = 'Pristine Flow';
  showBack = false;
  backUrl = '/dashboard';

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const url: string = e.urlAfterRedirects;
      this.title = PAGE_TITLES[url] || 'Pristine Flow';

      // Show back arrow for detail/form pages
      if (url.startsWith('/clients/edit/')) { this.title = 'Modifier Client'; }
      if (url.startsWith('/produits/edit/')) { this.title = 'Modifier Produit'; }
      if (url.match(/^\/factures\/[^c]/)) { this.title = 'Détail Facture'; }

      const formPages = ['/clients/add', '/clients/edit/', '/produits/add', '/produits/edit/', '/factures/create', '/profile'];
      this.showBack = formPages.some(p => url.startsWith(p));

      if (url.startsWith('/clients')) this.backUrl = '/clients';
      else if (url.startsWith('/produits')) this.backUrl = '/produits';
      else if (url.startsWith('/factures')) this.backUrl = '/factures';
      else this.backUrl = '/dashboard';
    });
  }
}
