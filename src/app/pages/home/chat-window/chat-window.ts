import { AfterViewInit, Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChatRoom } from '../../../model/ChatRoom';
import { ChatService } from '../../../services/chat-service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { combineLatest, Observable, switchMap, take, tap } from 'rxjs';
import { Message } from '../../../model/Message';
import { CommonModule } from '@angular/common';
import { NgClass } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { ChangeChatnameDialog } from './change-chatname-dialog/change-chatname-dialog';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { DeleteChatDialog } from './delete-chat-dialog/delete-chat-dialog';
import { UserService } from '../../../services/user-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../../model/User';
import { MatMenuModule } from '@angular/material/menu';
//import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-chat-window',
  imports: [CommonModule, FormsModule, NgClass, MatMenuModule, MatDividerModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.scss'
})
export class ChatWindow implements OnInit, AfterViewInit {
  private userService = inject(UserService);
  private chatService = inject(ChatService);
  private firebaseAuth = inject(Auth);
  private dialog = inject(MatDialog);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @Output() closeChat = new EventEmitter<void>();
  private _snackBar = inject(MatSnackBar);
  messages$!: Observable<Message[]>;
  currentUserId = '';
  newMessage = '';
  memberUsers: User[] = [];
  currentRoom?: ChatRoom;
  loadedOnce = false;
  roomDeleted = false;

  //-------New with observables--------
  @Input() allUsers$!: Observable<User[]>;
  @Input() selectedRoom$!: Observable<ChatRoom>;
  memberUsers$!: Observable<User[]>;
  owner$!: Observable<User>;
  currentUser$!:Observable<User>;

  //Loads in chatroom, messages and members on opening chat
  ngOnInit(): void {
    const user = this.firebaseAuth.currentUser;
    if (user) {
      this.currentUserId = user.uid;
    }
    //TODO: takeUntilDestroyed()
    this.selectedRoom$
      .subscribe(room => {
        if (!room && this.loadedOnce) {
          this.roomDeleted = true;
          this.handleCloseChat();
        }
        else {
          this.currentRoom = room;
          this.loadedOnce = true;
          this.loadMembers();
          this.scrollToBottom();

          //New
          this.owner$ = this.userService.getUser(this.currentRoom?.ownerId);
          this.currentUser$ = this.userService.getUser(this.currentUserId);
        }
        if (this.currentRoom && !this.currentRoom?.members.includes(this.currentUserId)) {
          this.handleCloseChat();
        }
      });
    this.messages$ = this.selectedRoom$.pipe(
      switchMap(room => this.chatService.getMessages(room.roomId))
    );
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  async loadMembers() {
    if (this.currentRoom) {
      if (!this.currentRoom.members) return;
      const userPromises = this.currentRoom.members.map(userId =>
        this.userService.fetchUser(userId)
      );
      this.memberUsers = await Promise.all(userPromises);
      this.memberUsers = this.memberUsers.filter(user => user.id !== this.currentUserId);
    }
  }

  getRoomName(): string {
    if (this.currentRoom) {
      return this.currentRoom.roomName;
    } else {
      return '';
    }
  }

  private scrollToBottom(): void {
    if (!this.scrollContainer) return;
    try {
      const container = this.scrollContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    } catch (error) {
      console.error('Scroll error: ', error);
    }
  }

  //-------------------------------------------------

  sendMessage(){
    const trimmed = this.newMessage.trim();
    if(!trimmed){
      this.newMessage = '';
      return;
    }

    combineLatest([this.selectedRoom$.pipe(take(1)), this.currentUser$.pipe(take(1))])
      .pipe(
        switchMap(([room, user]) =>{
          return this.chatService.createMessage(room.roomId, {
            content: trimmed,
            senderId: user.id,
            senderName: user.username
          });
        }),
        tap(() => {
          this.scrollToBottom();
          this.newMessage = '';
        })
      ).subscribe();
  }

  //-------------------------

  sendWithEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  getUsername(userId: string): Promise<string> {
    return this.userService.fetchUsernameById(userId);
  }

  deleteChat() {
    if (this.currentRoom) {
      if (this.currentRoom.restrictions === 'private-chat' || this.currentRoom.ownerId === this.currentUserId) {
        const dialogRef = this.dialog.open(DeleteChatDialog, {
          width: '300px',
          data: this.currentRoom.roomId
        });
        dialogRef.afterClosed().subscribe((roomDeleted: boolean) => {
          if (roomDeleted) {
            this.handleCloseChat();
          }
        });
      } else {
        this._snackBar.open('Group can only be deleted by owner', 'Ok');
      }
    }

  }

  changeChatName() {
    if (this.currentRoom) {
      if (this.currentRoom.restrictions === 'private-chat' || this.currentRoom.ownerId === this.currentUserId) {
        const dialogRef = this.dialog.open(ChangeChatnameDialog, {
          width: '300px',
          data: this.currentRoom.roomId
        });
        dialogRef.afterClosed();
      } else {
        this._snackBar.open('Group name can only be changed by owner', 'Ok');
      }
    }

  }

  async addUserToPrivateGroup(userId: string, user: User) {
    if (this.memberUsers.includes(user)) {
      this._snackBar.open('User is already a member', 'Ok');
    } else {
      await this.chatService.addUserToPrivateGroup(userId, this.currentRoom!.roomId);
      this.memberUsers.push(user);
      this._snackBar.open('User successfully added to group', 'Ok');
    }
  }

  async removeUserFromPrivateGroup(userId: string) {
    await this.chatService.removeUserFromPrivateGroup(userId, this.currentRoom!.roomId);
    this.memberUsers = this.memberUsers.filter(user => user.id !== userId);
    this._snackBar.open('User successfully removed from group', 'Ok');
  }

  handleCloseChat() {
    this.closeChat.emit();
  }
}
