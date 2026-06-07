import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {
  constructor(private router: Router) {}

  navItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/app/dashboard' },
    { label: 'Units & Residents', icon: 'apartment', route: '/app/units' },
    { label: 'Common Areas', icon: 'deck', route: '/app/common-areas' },
    { label: 'Finance', icon: 'account_balance_wallet', route: '/app/finance' },
    { label: 'Community Wall', icon: 'forum', route: '/app/community-wall' },
  ];

  logout() {
    this.router.navigate(['/login']);
  }
}
