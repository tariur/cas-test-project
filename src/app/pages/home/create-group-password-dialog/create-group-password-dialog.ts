import { Component } from '@angular/core';
import { MatDialogRef, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-create-group-password-dialog',
  imports: [MatDialogActions, MatDialogContent, MatFormFieldModule, FormsModule, MatInputModule, MatButtonModule],
  templateUrl: './create-group-password-dialog.html',
  styleUrl: './create-group-password-dialog.scss'
})
export class CreateGroupPasswordDialog {
  password = '';
  passwordAgain = '';
  updateMessage = '';

  constructor(private dialogRef:MatDialogRef<CreateGroupPasswordDialog>){}

  save(){
    if(!this.password.trim() || !this.passwordAgain.trim()){
      this.updateMessage = 'Please enter a password'
      return;
    }
    if(this.password.trim() != this.passwordAgain.trim()){
      this.updateMessage = 'Passwords not matching'
      return;
    }
    this.dialogRef.close(this.password);
  }

  cancel(){
    this.dialogRef.close();
  }
}
