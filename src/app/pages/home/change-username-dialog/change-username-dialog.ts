import { Component, inject } from '@angular/core';
import { UserService } from '../../../services/user-service';
import { MatDialogRef, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-change-username-dialog',
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, MatDialogActions, MatDialogContent],
  templateUrl: './change-username-dialog.html',
  styleUrl: './change-username-dialog.scss'
})
export class ChangeUsernameDialog {
  private userService = inject(UserService);
  private dialogRef = inject(MatDialogRef<ChangeUsernameDialog>);
  newUsername = '';
  loading = false;
  updateMessage = '';

  save() {
    if (!this.newUsername.trim()) {
      this.updateMessage = 'Please enter a valid username';
      return;
    }
    this.loading = true;

    this.userService.updateUsername(this.newUsername.trim()).subscribe({
      next: () =>{
        this.dialogRef.close();
      },
      error: (err) =>{
        this.updateMessage = 'Error updating username: ' + err;
      },
      complete: () =>{
        this.loading = false;
      }
    });
  }

  cancel() {
    this.dialogRef.close();
  }

}
