import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogActions, MatDialogContent, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { ChatService } from '../../../../services/chat-service';

@Component({
  selector: 'app-delete-chat-dialog',
  imports: [MatButtonModule, MatDialogActions, MatDialogContent],
  templateUrl: './delete-chat-dialog.html',
  styleUrl: './delete-chat-dialog.scss'
})
export class DeleteChatDialog {
  private roomId = inject(MAT_DIALOG_DATA);
  private chatService = inject(ChatService);
  private dialogRef = inject<MatDialogRef<DeleteChatDialog>>(MatDialogRef);

  async confirm(){
    await this.chatService.deletePrivateChat(this.roomId);
    this.dialogRef.close(true);
  }

  cancel(){
    this.dialogRef.close()
  }

}
