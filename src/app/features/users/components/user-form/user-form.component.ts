import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../model/user.model';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  @Input() user: User | null = null;
  @Output() close = new EventEmitter<boolean>();

  userForm!: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private usersService: UsersService) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      user: [this.user?.fullName || '', [Validators.required, Validators.minLength(3)]],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      telefono: [this.user?.phone || '', [Validators.pattern('^[0-9]+$')]],
      status: [this.user?.status || 'PENDING', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid || !this.user) return;

    this.isSubmitting = true;
    this.usersService.update(this.user.id, this.userForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.close.emit(true);
      },
      error: (err) => {
        console.error('Error updating user', err);
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.close.emit(false);
  }
}
