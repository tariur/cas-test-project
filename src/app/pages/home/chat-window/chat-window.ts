import { Component, Input, OnInit } from '@angular/core';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { ChatRoom } from '../../../model/ChatRoom';
import { ChatService } from '../../../services/chat-service';

@Component({
  selector: 'app-chat-window',
  imports: [MatDividerModule, MatButtonModule, MatIconModule],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.scss'
})
export class ChatWindow implements OnInit{
  @Input() roomId!:string;

  constructor(private chatService:ChatService){}

  currentRoom:ChatRoom = {
    members:[],
    ownerId:'',
    restrictions:'',
    roomId:'',
    roomName:'Initial RoomName'
  };

  ngOnInit(): void {
    this.chatService.fetchRoomById(this.roomId).then(room =>{
      if(room){
        this.currentRoom = room;
      }else{
        console.warn("fetchRoomById didn't fetch a room");
      }
    });
  }

}
