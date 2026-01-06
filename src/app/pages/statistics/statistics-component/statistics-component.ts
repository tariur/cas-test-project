import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '@ngx-translate/core';
import { messagesFeature, roomsFeature } from '../../../app.state';
import { MatDividerModule } from '@angular/material/divider';
import { LanguageSelector } from '../../language-selector/language-selector';
import { MessageStatisticsComponent } from '../message-statistics-component/message-statistics-component';
import { RoomStatisticsComponent } from '../room-statistics-component/room-statistics-component';
import { MatTabsModule } from '@angular/material/tabs';
import {  MatIconModule } from '@angular/material/icon';
import { MatTooltip } from "@angular/material/tooltip";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from '@angular/material/dialog';
import { ResetStatisticsDialog } from '../reset-statistics-dialog/reset-statistics-dialog';

@Component({
  selector: 'app-statistics-component',
  imports: [MatIconModule, MatTabsModule, TranslatePipe, MatDividerModule, LanguageSelector, MessageStatisticsComponent, RoomStatisticsComponent, MatTooltip, MatButtonModule],
  templateUrl: './statistics-component.html',
  styleUrl: './statistics-component.scss',
})
export class StatisticsComponent {
  readonly dialog = inject(MatDialog);
  private router = inject(Router);
  private store = inject(Store);
  loadedStat = '';
  messages = this.store.selectSignal(messagesFeature.selectMessages);

  messagesCount = computed(() => this.messages().length);
  roomsCreated = this.store.selectSignal(roomsFeature.selectCreatedrooms);
  roomsDeleted = this.store.selectSignal(roomsFeature.selectDeletedrooms);
  roomsSent = this.store.selectSignal(roomsFeature.selectSentperroom);
  roomsCount = computed(() => this.roomsCreated().length + this.roomsDeleted().length);

  home(){
    this.router.navigateByUrl('/home');
  }

  statDisplay(stat:string){
    this.loadedStat = stat;
  }

  resetStatistics(){
    this.dialog.open(ResetStatisticsDialog);
  }
}
