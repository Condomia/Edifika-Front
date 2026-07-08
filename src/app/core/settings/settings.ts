import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../features/auth/services/login-service';
import { UsersService } from '../../features/users/services/users.service';
import { BuildingsService } from '../../features/buildings/services/buildings.service';
import { User } from '../../features/users/model/user.model';
import { Building } from '../../features/buildings/model/building.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings implements OnInit {
  private loginService = inject(LoginService);
  private usersService = inject(UsersService);
  private buildingsService = inject(BuildingsService);

  currentUser: any;
  userProfile: Partial<User> = {};
  buildingInfo: Partial<Building> = {};

  isEditingUser = false;
  selectedTab: 'profile' | 'property' = 'profile';
  
  ngOnInit(): void {
    this.currentUser = this.loginService.getCurrentUser();
    
    if (this.currentUser?.id) {
      this.usersService.getById(this.currentUser.id).subscribe(user => {
        this.userProfile = user;
      });
    }

    if (this.currentUser?.buildingId) {
      this.buildingsService.getById(this.currentUser.buildingId).subscribe(building => {
        this.buildingInfo = building;
      });
    }
  }

  toggleEditUser(): void {
    this.isEditingUser = !this.isEditingUser;
  }

  saveUser(): void {
    if (this.userProfile.id) {
      this.usersService.update(this.userProfile.id, this.userProfile as User).subscribe(() => {
        this.isEditingUser = false;
        alert('User profile updated successfully.');
      });
    }
  }

  saveBuilding(): void {
    if (this.buildingInfo.id) {
      this.buildingsService.update(this.buildingInfo.id, this.buildingInfo as Building).subscribe(() => {
        alert('Property information updated successfully.');
      });
    }
  }
}
