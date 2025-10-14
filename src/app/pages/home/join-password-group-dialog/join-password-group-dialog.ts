import { Component, inject } from '@angular/core';
import { ChatService } from '../../../services/chat-service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
@Component({
  selector: 'app-join-password-group-dialog',
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, MatDialogActions, MatDialogContent],
  templateUrl: './join-password-group-dialog.html',
  styleUrl: './join-password-group-dialog.scss'
})
export class JoinPasswordGroupDialog {
  private roomId = inject(MAT_DIALOG_DATA);
  private chatService = inject(ChatService);
  private dialogRef = inject<MatDialogRef<JoinPasswordGroupDialog>>(MatDialogRef);

  password = '';
  loading = false;
  updateMessage = '';

   async save(){
    if(!this.password.trim()){
      this.updateMessage = 'Please enter the password';
      return;
    }
    this.loading = true;
    const validationResult = await this.chatService.validateGroupPassword(this.roomId, this.password);
    this.loading = false;
    if(!validationResult) {
      this.updateMessage = 'Incorrect password';
      return;
    }  
    this.chatService.addUserToPasswordAndPrivateGroup(this.roomId);
    this.dialogRef.close(this.roomId);
   }

   cancel(){
    this.dialogRef.close();
   }
}
