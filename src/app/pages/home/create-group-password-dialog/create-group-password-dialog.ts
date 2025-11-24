import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'app-create-group-password-dialog',
  imports: [
    MatDialogActions, 
    MatDialogContent, 
    MatFormFieldModule, 
    FormsModule, 
    MatInputModule, 
    MatButtonModule, 
    TranslatePipe
  ],
  templateUrl: './create-group-password-dialog.html',
  styleUrl: './create-group-password-dialog.scss'
})
export class CreateGroupPasswordDialog {
  private dialogRef = inject<MatDialogRef<CreateGroupPasswordDialog>>(MatDialogRef);

  password = '';
  passwordAgain = '';
  updateMessage = '';
  
  save(){
    if(!this.password.trim() || !this.passwordAgain.trim()){
      this.updateMessage = 'app.error.enter-password-create'
      return;
    }
    if(this.password.trim() != this.passwordAgain.trim()){
      this.updateMessage = 'app.error.password-match'
      return;
    }
    this.dialogRef.close(this.password);
  }

  cancel(){
    this.dialogRef.close();
  }
}
