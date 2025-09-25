import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import { Auth } from '../../services/auth';
import { Auth as FirebaseAuth } from '@angular/fire/auth';
import { UserService } from '../../services/user-service';
import { MatDialog } from '@angular/material/dialog';
import { ChangeUsernameDialog } from './change-username-dialog/change-username-dialog';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatTabsModule} from '@angular/material/tabs';
import { User } from '../../model/User';
import {MatListModule} from '@angular/material/list';
import { CommonModule } from '@angular/common';
import {MatDividerModule} from '@angular/material/divider';
import {MatTooltipModule} from '@angular/material/tooltip';
import { NgClass } from '@angular/common';
import { ChatWindow } from './chat-window/chat-window';
import { ChatService } from '../../services/chat-service';
import { ChatRoom } from '../../model/ChatRoom';
import { CreateGroupPasswordDialog } from './create-group-password-dialog/create-group-password-dialog';
import { JoinPasswordGroupDialog } from './join-password-group-dialog/join-password-group-dialog';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ChatWindow, NgClass, MatTooltipModule, MatDividerModule, MatButtonModule, MatIconModule, MatSidenavModule, MatTabsModule, MatListModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit{

  currentUserId = '';
  username:string | null = null;
  allUsers: User[] = [];
  onlineUsers: User[] = [];
  publicGroups: ChatRoom[] = [];
  privateGroups: ChatRoom[] = [];
  passwordGroups: ChatRoom[] = [];
  selectedRoom:string | null = "";
  isLoading:boolean = false;

  constructor(private firebaseAuth:FirebaseAuth, private chatService:ChatService, private authService:Auth, private router:Router, private userService:UserService, private dialog: MatDialog){}

  async ngOnInit(){
    const user = await this.firebaseAuth.currentUser;
    if(user){
      this.currentUserId = user.uid;
    }
    this.username = await this.userService.fetchUsername();
    this.userService.getAllUsers().subscribe(users => {
      this.allUsers=users;
    });
    this.userService.getOnlineUsers().subscribe(users =>{
      this.onlineUsers = users;
    });
    this.chatService.getAllPublicGroups().subscribe(groups =>{
      this.publicGroups = groups;
    });
    this.chatService.getAllPrivateGroups(this.currentUserId).subscribe(groups =>{
      this.privateGroups = groups;
    });
    this.chatService.getAllPasswordGroups().subscribe(groups =>{
      this.passwordGroups = groups;
    })
  }

  async openPrivateChat(userId:string){
    this.selectedRoom = '';
    this.isLoading = true;
    this.selectedRoom = await this.chatService.findPrivateChat(userId);
    this.isLoading = false;
  }

  openGroup(roomId:string){
    this.selectedRoom = '';
    this.isLoading = true;
    setTimeout(()=>{
      this.selectedRoom = roomId;
      this.isLoading = false;
    });
  }

  async createPublicGroup(){
    this.selectedRoom = await this.chatService.createPublicGroup(this.currentUserId);
  }

  async createPrivateGroup(){
    this.selectedRoom = await this.chatService.createPrivateGroup(this.currentUserId);
  }

  async createPasswordGroup(password:string){
    this.selectedRoom = await this.chatService.createPasswordGroup(this.currentUserId, password);
  }

  openChangeUsernameDialog(){
    const dialogRef = this.dialog.open(ChangeUsernameDialog, {
      width: '300px',
    });

    dialogRef.afterClosed().subscribe((newUsername) =>{
      if(newUsername){
        this.username = newUsername;
      }
    })
  }

  openPasswordGroupDialog(){
    const dialogRef = this.dialog.open(CreateGroupPasswordDialog, {
      width:'300px',
    });
    dialogRef.afterClosed().subscribe((password) =>{
      if(password){
        this.createPasswordGroup(password);
      }
    })
  }

  openPasswordValidationDialog(roomId:string, members:string[]){
    if(members.includes(this.currentUserId)){
      this.selectedRoom = roomId;
    }else{
      const dialogRef = this.dialog.open(JoinPasswordGroupDialog, {
      width:'300px',
      data:roomId
      });
      dialogRef.afterClosed().subscribe((roomId)=>{
        if(roomId){
          this.selectedRoom = roomId;
        }
      })
    }
  }

  chatCloseChildEvent(){
    this.selectedRoom = '';
  }


  //Routes to landing component
  signout(){
    this.authService.signOutUser();
    this.router.navigateByUrl('');
  }
}
