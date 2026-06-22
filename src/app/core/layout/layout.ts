import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import {LoginService} from '../../features/auth/services/login-service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {
  constructor(
    private router: Router,
    private loginService: LoginService
  ) {}

  navItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/app/dashboard' },
    { label: 'Units & Residents', icon: 'apartment', route: '/app/units' },
    { label: 'Common Areas', icon: 'deck', route: '/app/common-areas' },
    { label: 'Finance', icon: 'account_balance_wallet', route: '/app/finance' },
    { label: 'Community Wall', icon: 'forum', route: '/app/community-wall' },
  ];

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
}
