import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Login } from './pages/login/login';
import { DashboardLaiterie } from './pages/dashboard-laiterie/dashboard-laiterie';
import { GestionClients } from './pages/gestion-clients/gestion-clients';
import { CatalogueProduits } from './pages/catalogue-produits/catalogue-produits';
import { GestionFactures } from './pages/gestion-factures/gestion-factures';
import { CreationFacture } from './pages/creation-facture/creation-facture';
import { ClientForm } from './pages/client-form/client-form';
import { ProductForm } from './pages/product-form/product-form';
import { Profile } from './pages/profile/profile';
import { InvoiceDetail } from './pages/invoice-detail/invoice-detail';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: '',
    component: Layout,
    children: [
      { path: 'dashboard', component: DashboardLaiterie },
      { path: 'clients', component: GestionClients },
      // Specific routes MUST come before param routes to prevent :id catching them
      { path: 'clients/add', component: ClientForm },
      { path: 'clients/edit/:id', component: ClientForm },
      { path: 'produits', component: CatalogueProduits },
      { path: 'produits/add', component: ProductForm },
      { path: 'produits/edit/:id', component: ProductForm },
      { path: 'factures', component: GestionFactures },
      { path: 'factures/create', component: CreationFacture },
      { path: 'factures/:id', component: InvoiceDetail },
      { path: 'profile', component: Profile },
    ]
  },
];
