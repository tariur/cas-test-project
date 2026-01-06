import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '@ngx-translate/core';
import { MessagesActions, RoomsActions } from '../../../app.state';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-reset-statistics-dialog',
  imports: [MatDialogModule, TranslatePipe, MatButtonModule],
  templateUrl: './reset-statistics-dialog.html',
  styleUrl: './reset-statistics-dialog.scss',
})
export class ResetStatisticsDialog {
  private dialogRef = inject<MatDialogRef<ResetStatisticsDialog>>(MatDialogRef);
  private store = inject(Store);

  reset() {
    this.store.dispatch(MessagesActions.clear());
    this.store.dispatch(RoomsActions.clear());
    this.dialogRef.close();
  }
  cancel() {
    this.dialogRef.close();
  }

}
