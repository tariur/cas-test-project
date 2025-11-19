import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Auth } from '../../services/auth';
import { Auth as FirebaseAuth } from '@angular/fire/auth';
import { UserService } from '../../services/user-service';
import { MatDialog } from '@angular/material/dialog';
import { ChangeUsernameDialog } from './change-username-dialog/change-username-dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { User } from '../../model/User';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgClass } from '@angular/common';
import { ChatWindow } from './chat-window/chat-window';
import { ChatService } from '../../services/chat-service';
import { ChatRoom } from '../../model/ChatRoom';
import { CreateGroupPasswordDialog } from './create-group-password-dialog/create-group-password-dialog';
import { JoinPasswordGroupDialog } from './join-password-group-dialog/join-password-group-dialog';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ChatWindow, NgClass, MatTooltipModule, MatDividerModule, MatButtonModule, MatIconModule, MatSidenavModule, MatTabsModule, MatListModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  private firebaseAuth = inject(FirebaseAuth);
  private chatService = inject(ChatService);
  private authService = inject(Auth);
  private router = inject(Router);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);

  currentUserId = '';
  isLoading = false;

  allUsers$!: Observable<User[]>;
  onlineUsers$!: Observable<User[]>
  publicGroups$!: Observable<ChatRoom[]>
  privateGroups$!: Observable<ChatRoom[]>
  passwordGroups$!: Observable<ChatRoom[]>
  currentUser$!:Observable<User>;
  selectedRoom$!:Observable<ChatRoom> | null;


  ngOnInit() {
    const user = this.firebaseAuth.currentUser;
    if (user) {
      this.currentUserId = user.uid;
      this.currentUser$ = this.userService.getUser(this.currentUserId);
      this.privateGroups$ = this.chatService.getAllPrivateGroups(this.currentUserId);
      this.allUsers$ = this.userService.getAllUsers();
      this.onlineUsers$ = this.userService.getOnlineUsers();
      this.publicGroups$ = this.chatService.getAllPublicGroups();
      this.passwordGroups$ = this.chatService.getAllPasswordGroups();
    }else{
      console.error('User needs to sign in to access this page');
      this.router.navigateByUrl('**');
    }
  }

  openPrivateChat(userId: string) {
    this.isLoading = true;
    this.selectedRoom$ = null;
    setTimeout(()=>{
      this.selectedRoom$ = this.chatService.findPrivateChat(userId);
      this.isLoading = false;
    }, 300);
  }

  openGroup(roomId: string) {
    this.isLoading = true;
    this.selectedRoom$ = null;
    setTimeout(()=>{
      this.selectedRoom$ = this.chatService.fetchRoomById(roomId);
      this.chatService.addUserToPasswordAndPrivateGroup(roomId);
      this.isLoading = false;
    }, 300);
  }

  createPublicGroup() {
    this.isLoading = true;
    this.selectedRoom$ = null;
    setTimeout(()=>{
      this.selectedRoom$ = this.chatService.createPublicGroup(this.currentUserId);
      this.isLoading = false;
    }, 300);
  }

  createPrivateGroup() {
    this.isLoading = true;
    this.selectedRoom$ = null;
    setTimeout(()=>{
      this.selectedRoom$ = this.chatService.createPrivateGroup(this.currentUserId);
      this.isLoading = false;
    }, 300);
  }

  createPasswordGroup(password: string) {
    this.isLoading = true;
    this.selectedRoom$ = null;
    setTimeout(()=>{
      this.selectedRoom$ = this.chatService.createPasswordGroup(this.currentUserId, password);
      this.isLoading = false;
    }, 300);
  }

  openChangeUsernameDialog() {
    const dialogRef = this.dialog.open(ChangeUsernameDialog, {
      width: '300px',
    });
    dialogRef.afterClosed();
  }

  openPasswordGroupDialog() {
    const dialogRef = this.dialog.open(CreateGroupPasswordDialog, {
      width: '300px',
    });
    dialogRef.afterClosed().subscribe((password) => {
      if (password) {
        this.createPasswordGroup(password);
      }
    })
  }

  openPasswordValidationDialog(roomId: string, members: string[]) {
    if (members.includes(this.currentUserId)) {
      this.selectedRoom$ = this.chatService.fetchRoomById(roomId);
    } else {
      const dialogRef = this.dialog.open(JoinPasswordGroupDialog, {
        width: '300px',
        data: roomId
      });
      dialogRef.afterClosed().subscribe((roomId) => {
        if (roomId) {
          this.isLoading = true;
          setTimeout(() => {
            this.isLoading = false;
          });
        }
      })
    }
  }

  chatCloseChildEvent() {
    this.selectedRoom$ = null;
  }

  async signout() {
    await this.authService.signOutUser();
    this.router.navigateByUrl('');
  }
}
