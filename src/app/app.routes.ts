import { Routes } from '@angular/router';
import { Login } from './features/auth/pages/login/login';
import { Register } from './features/auth/pages/register/register';
import { Layout } from './core/layout/layout';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: 'app',
    component: Layout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'units', loadComponent: () => import('./features/units/units').then(m => m.Units) },
      { path: 'common-areas', loadComponent: () => import('./features/common-areas/common-areas').then(m => m.CommonAreas) },
      { path: 'finance', loadComponent: () => import('./features/finance/finance').then(m => m.Finance) },
      { path: 'community-wall', loadComponent: () => import('./features/community-wall/community-wall').then(m => m.CommunityWall) },
      { path: 'settings', loadComponent: () => import('./features/settings/settings').then(m => m.Settings) }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
