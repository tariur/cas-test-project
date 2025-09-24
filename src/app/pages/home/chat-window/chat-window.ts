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
import { ChangeChatnameDialog } from './change-chatname-dialog/change-chatname-dialog';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-window',
  imports: [CommonModule, FormsModule, NgClass, MatDividerModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.scss'
})
export class ChatWindow implements OnInit{
  @Input() roomId!:string;
  messages$!:Observable<Message[]>;
  currentUserId = '';
  newMessage = '';

  currentRoom:ChatRoom = {
    members:[],
    ownerId:'',
    restrictions:'',
    roomId:'',
    roomName:'Initial RoomName'
  };

  constructor(private chatService:ChatService, private firebaseAuth:Auth, private dialog: MatDialog){}

  

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

  async sendMessage(){
    await this.chatService.createMessage(this.roomId, {
      content: this.newMessage.trim(),
      senderId: this.currentUserId
    });

    this.newMessage = '';
  }

  changeChatName(){
    const dialogRef = this.dialog.open(ChangeChatnameDialog, {
          width: '300px',
          data:this.currentRoom.roomId
        });
    dialogRef.afterClosed().subscribe((newChatname: string) =>{
      if(newChatname){
        this.currentRoom.roomName = newChatname;
      }
    })
  }

}
