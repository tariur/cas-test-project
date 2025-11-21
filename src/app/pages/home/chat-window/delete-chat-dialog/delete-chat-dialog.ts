import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogActions, MatDialogContent, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ChatService } from '../../../../services/chat-service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-delete-chat-dialog',
  imports: [TranslatePipe, 
    MatButtonModule, 
    MatDialogActions, 
    MatDialogContent
  ],
  templateUrl: './delete-chat-dialog.html',
  styleUrl: './delete-chat-dialog.scss'
})
export class DeleteChatDialog {
  private roomId = inject(MAT_DIALOG_DATA);
  private chatService = inject(ChatService);
  private dialogRef = inject<MatDialogRef<DeleteChatDialog>>(MatDialogRef);

  confirm() {
    this.chatService.deletePrivateChat(this.roomId).subscribe({
      next: () => this.dialogRef.close(true),
      error: err => console.error(err)
    });
  }


  cancel() {
    this.dialogRef.close()
  }

}
