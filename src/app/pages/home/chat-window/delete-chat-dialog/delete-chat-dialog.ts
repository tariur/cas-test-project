import { Component, Inject } from '@angular/core';
import { MatDialogRef, MatDialogActions, MatDialogContent, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { ChatWindow } from '../chat-window';
import { ChatService } from '../../../../services/chat-service';

@Component({
  selector: 'app-delete-chat-dialog',
  imports: [MatButtonModule, MatDialogActions, MatDialogContent],
  templateUrl: './delete-chat-dialog.html',
  styleUrl: './delete-chat-dialog.scss'
})
export class DeleteChatDialog {
  constructor(@Inject(MAT_DIALOG_DATA) private roomId:string, private chatService: ChatService, private dialogRef:MatDialogRef<DeleteChatDialog>){}

  async confirm(){
    await this.chatService.deletePrivateChat(this.roomId);
    this.dialogRef.close(true);
  }

  cancel(){
    this.dialogRef.close()
  }

}
