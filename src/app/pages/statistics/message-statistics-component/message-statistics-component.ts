import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { messagesFeature } from '../../../app.state';
import { TranslatePipe } from '@ngx-translate/core';
import { MatDividerModule } from '@angular/material/divider';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-message-statistics-component',
  imports: [TranslatePipe, MatDividerModule, DatePipe],
  templateUrl: './message-statistics-component.html',
  styleUrl: './message-statistics-component.scss',
})
export class MessageStatisticsComponent {
  private store = inject(Store);
  messages = this.store.selectSignal(messagesFeature.selectMessages);
}
