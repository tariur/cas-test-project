import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '@ngx-translate/core';
import { messagesFeature } from '../../../messages.state';
import { MatDividerModule } from '@angular/material/divider';
import { LanguageSelector } from '../../language-selector/language-selector';
import { DatePipe } from '@angular/common';
import { MessageStatisticsComponent } from '../message-statistics-component/message-statistics-component';

@Component({
  selector: 'app-statistics-component',
  imports: [MatButton, TranslatePipe, MatDividerModule, LanguageSelector, DatePipe, MessageStatisticsComponent],
  templateUrl: './statistics-component.html',
  styleUrl: './statistics-component.scss',
})
export class StatisticsComponent {
  private router = inject(Router);
  private store = inject(Store);
  loadedStat = '';
  messages = this.store.selectSignal(messagesFeature.selectMessages);
  count = this.messages().length;

  home(){
    this.router.navigateByUrl('/home');
  }

  statDisplay(stat:string){
    this.loadedStat = stat;
  }
}
