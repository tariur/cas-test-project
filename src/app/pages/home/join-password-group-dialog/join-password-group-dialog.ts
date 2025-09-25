import { Component, Inject, Input } from '@angular/core';
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
  password = '';
  loading = false;
  updateMessage = '';

   constructor(@Inject(MAT_DIALOG_DATA) private roomId:string, private chatService:ChatService, private dialogRef:MatDialogRef<JoinPasswordGroupDialog>){}

   async save(){
    if(!this.password.trim()){
      this.updateMessage = 'Please enter the password';
      return;
    }
    this.loading = true;
    const validationResult = await this.chatService.validateGroupPassword(this.roomId, this.password);
    this.loading = false;
    if(!validationResult) return;
    this.chatService.addUserToPasswordGroup(this.roomId);
    this.dialogRef.close(this.roomId);
   }

   cancel(){
    this.dialogRef.close();
   }
}
