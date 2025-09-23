import { Component, Input, OnInit } from '@angular/core';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { ChatRoom } from '../../../model/ChatRoom';
import { ChatService } from '../../../services/chat-service';
import {MatTooltipModule} from '@angular/material/tooltip';
import { Observable } from 'rxjs';
import { Message } from '../../../model/Message';
import { CommonModule } from '@angular/common';
import { NgClass } from '@angular/common';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-chat-window',
  imports: [CommonModule, NgClass, MatDividerModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.scss'
})
export class ChatWindow implements OnInit{
  @Input() roomId!:string;
  messages$!:Observable<Message[]>;
  currentUserId:string | null = null;

  currentRoom:ChatRoom = {
    members:[],
    ownerId:'',
    restrictions:'',
    roomId:'',
    roomName:'Initial RoomName'
  };

  constructor(private chatService:ChatService, private firebaseAuth:Auth){}

  

  async ngOnInit(): Promise<void> {
    const user = await this.firebaseAuth.currentUser;
    if(user){
      this.currentUserId = user.uid;
    }
    this.chatService.fetchRoomById(this.roomId).then(room =>{
      if(room){
        this.currentRoom = room;
        this.messages$ = this.chatService.getMessages(this.roomId);
      }else{
        console.warn("fetchRoomById didn't fetch a room");
      }
    });

  }

  changeChatName(){
  }

}
