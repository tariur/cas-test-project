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
import { User } from '../../../model/User';
import {MatMenuModule} from '@angular/material/menu';

@Component({
  selector: 'app-chat-window',
  imports: [CommonModule, FormsModule, NgClass, MatMenuModule, MatDividerModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.scss'
})
export class ChatWindow implements OnInit, AfterViewChecked{
  private userService = inject(UserService);
  private chatService = inject(ChatService);
  private firebaseAuth = inject(Auth);
  private dialog = inject(MatDialog);

  @Input() roomId!:string;
  @Input() allUsers!:User[];
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @Output() closeChat = new EventEmitter<void>();
  private _snackBar = inject(MatSnackBar);
  messages$!:Observable<Message[]>;
  currentUserId = '';
  newMessage = '';
  memberUsers:User[] = [];
  currentRoom:ChatRoom = {
    members:[],
    ownerId:'',
    restrictions:'',
    roomId:'',
    roomName:'Initial RoomName'
  };

  //Loads in chatroom, messages and members on opening chat
  async ngOnInit(): Promise<void> {
    const user = await this.firebaseAuth.currentUser;
    if(user){
      this.currentUserId = user.uid;
    }
    await this.chatService.fetchRoomById(this.roomId).then(room =>{
      if(room){
        this.currentRoom = room;
        this.messages$ = this.chatService.getMessages(this.roomId);
      }else{
        console.warn("fetchRoomById didn't fetch a room");
      }
    });
    this.loadMembers();
  }

  async loadMembers(){
    if(!this.currentRoom?.members) return;
    const userPromises = this.currentRoom.members.map(userId=>
      this.userService.fetchUser(userId)
    );
    this.memberUsers = await Promise.all(userPromises);
    this.memberUsers = this.memberUsers.filter(user => user.id !== this.currentUserId);
  }

  //Shows the chat from the last message sent
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

  //Not working properly -- doesn't show username on home before changing it for the first time
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
      this._snackBar.open('Group can only be deleted by owner', 'Ok');
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
      this._snackBar.open('Group name can only be changed by owner', 'Ok');
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
