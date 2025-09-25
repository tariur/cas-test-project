import { AfterViewChecked, Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
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
import { DeleteChatDialog } from './delete-chat-dialog/delete-chat-dialog';
import { UserService } from '../../../services/user-service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-chat-window',
  imports: [CommonModule, FormsModule, NgClass, MatDividerModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.scss'
})
export class ChatWindow implements OnInit, AfterViewChecked{
  @Input() roomId!:string;
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @Output() closeChat = new EventEmitter<void>();
  private _snackBar = inject(MatSnackBar);
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

  constructor(private userService:UserService, private chatService:ChatService, private firebaseAuth:Auth, private dialog: MatDialog){}

  

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

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom():void{
    try{
      const container = this.scrollContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }catch(error){
      console.error('Scroll error: ', error);
    }
  }

  async sendMessage(){
    await this.chatService.createMessage(this.roomId, {
      content: this.newMessage.trim(),
      senderId: this.currentUserId,
      senderName:await this.userService.fetchUsernameById(this.currentUserId)
    });

    this.newMessage = '';
  }

  //not working properly
  getUsername(userId:string):Promise<string>{
    return this.userService.fetchUsernameById(userId);
  }

  deleteChat(){
    if(this.currentRoom.restrictions==='private-chat' || this.currentRoom.ownerId === this.currentUserId){
      const dialogRef = this.dialog.open(DeleteChatDialog, {
      width:'300px',
      data:this.roomId
      });
      dialogRef.afterClosed().subscribe((roomDeleted:boolean)=>{
        if(roomDeleted){
          this.handleCloseChat();
        }
      });
    }else{
      this._snackBar.open('Group can only be deleted by owner');
    }
  }

  changeChatName(){
    if(this.currentRoom.restrictions==='private-chat' || this.currentRoom.ownerId === this.currentUserId){
      const dialogRef = this.dialog.open(ChangeChatnameDialog, {
          width: '300px',
          data:this.currentRoom.roomId
      });
      dialogRef.afterClosed().subscribe((newChatname: string) =>{
        if(newChatname){
          this.currentRoom.roomName = newChatname;
        }
      });
    }else{
      this._snackBar.open('Group name can only be changed by owner');
    }
  }

  handleCloseChat(){
    this.closeChat.emit();
  }

}
