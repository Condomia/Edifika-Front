import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../services/users.service';
import { User } from '../../model/user.model';
import { UserFormComponent } from '../user-form/user-form.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, UserFormComponent],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  isEditing = false;

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersService.getUsers().subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error('Error fetching users:', err)
    });
  }

  verifyUser(id: number): void {
    this.usersService.verifyUser(id).subscribe({
      next: () => {
        // Optimistic update
        const user = this.users.find(u => u.id_user === id);
        if (user) {
          user.status = 'VERIFIED';
        }
      },
      error: (err) => console.error('Error verifying user:', err)
    });
  }

  editUser(user: User): void {
    this.selectedUser = user;
    this.isEditing = true;
  }

  onFormClose(refresh: boolean): void {
    this.isEditing = false;
    this.selectedUser = null;
    if (refresh) {
      this.loadUsers();
    }
  }
}
