import { Routes } from '@angular/router';
import {Login} from './features/auth/pages/login/login';

export const routes: Routes = [
  {path:'', redirectTo:'login', pathMatch:'full'},
  {path: '', component: Login},
  {path: '**', redirectTo: 'login'},
];
