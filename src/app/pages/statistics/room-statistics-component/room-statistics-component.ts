import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { messagesFeature, roomsFeature } from '../../../app.state';
import {MatTabsModule} from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-room-statistics-component',
  imports: [MatTabsModule, MatButtonModule, TranslatePipe, MatProgressBarModule, MatTooltipModule],
  templateUrl: './room-statistics-component.html',
  styleUrl: './room-statistics-component.scss',
})
export class RoomStatisticsComponent {
  private store = inject(Store);
  messages = this.store.selectSignal(messagesFeature.selectMessages);
  createdRooms = this.store.selectSignal(roomsFeature.selectCreatedrooms);
  deletedRooms = this.store.selectSignal(roomsFeature.selectDeletedrooms);
  sentperRooms = this.store.selectSignal(roomsFeature.selectSentperroom);

  totalMessages = this.messages().length;

}
