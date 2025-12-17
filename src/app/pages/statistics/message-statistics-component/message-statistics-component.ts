import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { messagesFeature } from '../../../messages.state';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { MatDividerModule } from '@angular/material/divider';
import { LanguageSelector } from '../../language-selector/language-selector';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-message-statistics-component',
  imports: [MatButton, TranslatePipe, MatDividerModule, LanguageSelector, DatePipe],
  templateUrl: './message-statistics-component.html',
  styleUrl: './message-statistics-component.scss',
})
export class MessageStatisticsComponent {
  private store = inject(Store);
  messages = this.store.selectSignal(messagesFeature.selectMessages);
  count = this.messages().length;
}
