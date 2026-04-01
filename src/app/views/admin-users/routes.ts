import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-users.component').then((m) => m.AdminUsersComponent),
    data: {
      title: 'Admin Users'
    }
  }
];
