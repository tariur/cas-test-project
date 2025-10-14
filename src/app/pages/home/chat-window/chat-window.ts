import { Component, ElementRef, EventEmitter, inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { ChatRoom } from '../../../model/ChatRoom';
import { ChatService } from '../../../services/chat-service';
import {MatTooltipModule} from '@angular/material/tooltip';
import { Observable, Subscription } from 'rxjs';
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
import { User } from '../../../model/User';
import {MatMenuModule} from '@angular/material/menu';

@Component({
  selector: 'app-chat-window',
  imports: [CommonModule, FormsModule, NgClass, MatMenuModule, MatDividerModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.scss'
})
export class ChatWindow implements OnInit, OnDestroy{
  private userService = inject(UserService);
  private chatService = inject(ChatService);
  private firebaseAuth = inject(Auth);
  private dialog = inject(MatDialog);

  @Input() roomId!:string;
  @Input() allUsers!:User[];
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @Output() closeChat = new EventEmitter<void>();
  private _snackBar = inject(MatSnackBar);
  private sub?: Subscription;
  messages$!:Observable<Message[]>;
  currentUserId = '';
  newMessage = '';
  memberUsers:User[] = [];
  ownerUsername = '';
  currentRoom?: ChatRoom | null;
  loadedOnce = false;
  roomDeleted = false;

  //Loads in chatroom, messages and members on opening chat
  ngOnInit(): void {
    const user = this.firebaseAuth.currentUser;
    if(user){
      this.currentUserId = user.uid;
    }
    this.sub = this.chatService.fetchRoomById(this.roomId).subscribe(room => {
      if(!room && this.loadedOnce){
        this.roomDeleted = true;
        this.currentRoom = null;
        this.handleCloseChat();
      }
      else{
        this.currentRoom = room;
        this.loadedOnce = true;
        this.getOwnerUsername();
        this.loadMembers();
        this.scrollToBottom();
      }
      if(this.currentRoom && !this.currentRoom?.members.includes(this.currentUserId)){
        this.currentRoom = null;
        this.handleCloseChat();
      }
    });
    this.messages$ = this.chatService.getMessages(this.roomId);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  async loadMembers(){
    if(this.currentRoom){
      if(!this.currentRoom.members) return;
      const userPromises = this.currentRoom.members.map(userId=>
      this.userService.fetchUser(userId)
      );
      this.memberUsers = await Promise.all(userPromises);
      this.memberUsers = this.memberUsers.filter(user => user.id !== this.currentUserId);
    }
  }

  async getOwnerUsername(){
    if(this.currentRoom){
      if(!this.currentRoom.ownerId) return;
      this.ownerUsername = await this.userService.fetchUsernameById(this.currentRoom.ownerId);
    }
  }

  getRoomName():string{
    if(this.currentRoom){
      return this.currentRoom.roomName;
    }else{
      return '';
    }  
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
    this.scrollToBottom();
    this.newMessage = '';
  }

  getUsername(userId:string):Promise<string>{
    return this.userService.fetchUsernameById(userId);
  }

  deleteChat(){
    if(this.currentRoom){
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
        this._snackBar.open('Group can only be deleted by owner', 'Ok');
      }
    }
    
  }

  changeChatName(){
    if(this.currentRoom){
      if(this.currentRoom.restrictions==='private-chat' || this.currentRoom.ownerId === this.currentUserId){
        const dialogRef = this.dialog.open(ChangeChatnameDialog, {
            width: '300px',
            data:this.currentRoom.roomId
        });
        dialogRef.afterClosed().subscribe((newChatname: string) =>{
        if(newChatname && this.currentRoom){
          this.currentRoom.roomName = newChatname;
        }
        });
      }else{
        this._snackBar.open('Group name can only be changed by owner', 'Ok');
      }
    }
    
  }

  async addUserToPrivateGroup(userId:string, user:User){
    if(this.memberUsers.includes(user)){
      this._snackBar.open('User is already a member', 'Ok');
    }else{
      await this.chatService.addUserToPrivateGroup(userId, this.roomId);
      this.memberUsers.push(user);
      this._snackBar.open('User successfully added to group', 'Ok');
    }
  }

  async removeUserFromPrivateGroup(userId:string){
    await this.chatService.removeUserFromPrivateGroup(userId, this.roomId);
    this.memberUsers = this.memberUsers.filter(user => user.id !== userId);
    this._snackBar.open('User successfully removed from group', 'Ok');
  }

  handleCloseChat(){
    this.closeChat.emit();
  }

}
