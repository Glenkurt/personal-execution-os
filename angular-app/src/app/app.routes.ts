import { Routes } from '@angular/router';

/**
 * Application routes configuration.
 * Defines the routing structure for the Personal Execution OS application.
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
