import { AfterViewInit, Component, DestroyRef, ElementRef, EventEmitter, inject, OnInit, Output, ViewChild, input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChatRoom } from '../../../model/ChatRoom';
import { ChatService } from '../../../services/chat-service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { combineLatest, EMPTY, map, Observable, switchMap, take, tap } from 'rxjs';
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
import { takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-window',
  imports: [CommonModule, FormsModule, NgClass, MatMenuModule, MatDividerModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.scss'
})
export class ChatWindow implements OnInit, AfterViewInit {
  private router = inject(Router);
  private userService = inject(UserService);
  private chatService = inject(ChatService);
  private firebaseAuth = inject(Auth);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @Output() closeChat = new EventEmitter<void>();
  private _snackBar = inject(MatSnackBar);
  messages$!: Observable<Message[]>;
  currentUserId = '';
  newMessage = '';

  currentRoom?: ChatRoom;
  loadedOnce = false;

  readonly allUsers$ = input.required<Observable<User[]>>();
  readonly selectedRoom$ = input.required<Observable<ChatRoom>>();

  memberUsers$!: Observable<User[]>;
  owner$!: Observable<User>;
  currentUser$!: Observable<User>;

  //Loads in chatroom, messages and members on opening chat
  ngOnInit(): void {
    const user = this.firebaseAuth.currentUser;
    if (user) {
      this.currentUserId = user.uid;
      this.selectedRoom$().pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(room => {
        if(room){
          this.loadedOnce = true;
          this.currentRoom = room;
          this.scrollToBottom();
          this.owner$ = this.userService.getUser(room.ownerId);
          this.currentUser$ = this.userService.getUser(this.currentUserId);
          this.memberUsers$ = this.userService.getMembers(room.members);
          this.messages$ = this.chatService.getMessages(room.roomId);
          if(!room.members.includes(this.currentUserId)){
            console.log('User not member of the room anymore');
            this.handleCloseChat();
          }
        }
      });
    }else{
      console.log('User has to be signed in to access this page');
      this.router.navigateByUrl('**');
    }
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
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

  sendMessage() {
    const trimmed = this.newMessage.trim();
    if (!trimmed) {
      this.newMessage = '';
      return;
    }
    combineLatest([this.selectedRoom$(), this.currentUser$])
      .pipe(
        take(1),
        switchMap(([room, user]) => {
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

  sendWithEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
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

  addUserToPrivateGroup(userId: string) {
    this.memberUsers$.pipe(
      take(1),
      map(u => u.some(u => u.id === userId)),
    ).subscribe(exists => {
      if (exists) {
        this._snackBar.open('User is already a member', 'Ok');
      } else {
        this.chatService.addUserToPrivateGroup(userId, this.currentRoom!.roomId).subscribe(() => {
          this._snackBar.open('User successfully added to group', 'Ok');
        });
      }
    });
  }

  removeUserFromPrivateGroup(userId: string) {
    this.memberUsers$.pipe(
      take(1),
      switchMap(user => {
        if (!user.some(u => u.id === userId)) return EMPTY;
        return this.chatService.removeUserFromPrivateGroup(userId, this.currentRoom!.roomId);
      })
    ).subscribe(() => {
      this._snackBar.open('User successfully removed from group', 'Ok');
    }
    );
  }

  handleCloseChat() {
    this.closeChat.emit();
  }
}
