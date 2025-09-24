import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import { Auth } from '../../services/auth';
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

@Component({
  selector: 'app-home',
  imports: [CommonModule, ChatWindow, NgClass, MatTooltipModule, MatDividerModule, MatButtonModule, MatIconModule, MatSidenavModule, MatTabsModule, MatListModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit{

  username:string | null = null;
  allUsers: User[] = [];
  onlineUsers: User[] = [];
  selectedRoom:string | null = "";

  constructor(private chatService:ChatService, private authService:Auth, private router:Router, private userService:UserService, private dialog: MatDialog){}

  async ngOnInit(){
    this.username = await this.userService.fetchUsername();
    this.userService.getAllUsers().subscribe(users => {
      this.allUsers=users;
    });
    this.userService.getOnlineUsers().subscribe(users =>{
      this.onlineUsers = users;
    });
  }

  async openPrivateChat(userId:string){
    this.selectedRoom = await this.chatService.findPrivateChat(userId);
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


  //Routes to landing component
  signout(){
    this.authService.signOutUser();
    this.router.navigateByUrl('');
  }
}
