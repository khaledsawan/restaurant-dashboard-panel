import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'profile'
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then((m) => m.ProfileComponent),
    data: { title: 'Profile' }
  },
  {
    path: 'change-password',
    loadComponent: () => import('./change-password/change-password.component').then((m) => m.ChangePasswordComponent),
    data: { title: 'Change Password' }
  },
  {
    path: 'change-email',
    loadComponent: () => import('./change-email/change-email.component').then((m) => m.ChangeEmailComponent),
    data: { title: 'Change Email' }
  },
  {
    path: 'delete-account',
    loadComponent: () => import('./delete-account/delete-account.component').then((m) => m.DeleteAccountComponent),
    data: { title: 'Delete Account' }
  }
];
