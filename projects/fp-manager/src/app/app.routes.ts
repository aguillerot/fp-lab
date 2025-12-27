import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/app.layout').then(m => m.AppLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home').then(m => m.Home),
      },
      {
        path: 'settings/:id',
        loadComponent: () => import('./pages/settings-detail/settings-detail').then(m => m.SettingsDetail),
      },
    ],
  },
];
