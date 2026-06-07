import { Routes } from '@angular/router';
import {Login} from './features/auth/pages/login/login';
import {Register} from './features/auth/pages/register/register';

export const routes: Routes = [
  {path:'', redirectTo:'login', pathMatch:'full'},
  {path: '', component: Login},
  {path: 'login', component: Login},
  {path: 'register', component: Register},
  {path: '**', redirectTo: 'login'},
];
