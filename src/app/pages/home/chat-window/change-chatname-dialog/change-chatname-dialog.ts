import { Component, inject } from '@angular/core';
import { ChatService } from '../../../../services/chat-service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-change-chatname-dialog',
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, MatDialogActions, MatDialogContent],
  templateUrl: './change-chatname-dialog.html',
  styleUrl: './change-chatname-dialog.scss'
})
export class ChangeChatnameDialog {
  private roomId = inject(MAT_DIALOG_DATA);
  private chatService = inject(ChatService);
  private dialogRef = inject<MatDialogRef<ChangeChatnameDialog>>(MatDialogRef);

  newChatname = '';
  loading = false;
  updateMessage = '';

  async save(){
    if(!this.newChatname.trim()){
      this.updateMessage = 'Please enter a valid chat name';
      return;
    }

    this.loading = true;

    try{
      await this.chatService.updateChatname(this.roomId, this.newChatname.trim());
      this.dialogRef.close(this.newChatname);
    }catch(error:unknown){
      this.updateMessage = 'Error updating chatname: ' + (error instanceof Error ? error.message : String(error));
    }finally{
      this.loading = false;
    }
  }

  cancel(){
    this.dialogRef.close()
  }
  

}
