import { AfterViewInit, Component, DestroyRef, ElementRef, EventEmitter, inject, OnInit, Output, ViewChild, input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChatRoom } from '../../../model/ChatRoom';
import { ChatService } from '../../../services/chat-service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { combineLatest, EMPTY, forkJoin, map, Observable, switchMap, take, tap } from 'rxjs';
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguagesService } from '../../../services/languages-service';
import { Store } from '@ngrx/store';
import { MessagesActions } from '../../../messages.state';
import { DocumentReference } from 'firebase/firestore';

@Component({
  selector: 'app-chat-window',
  imports: [TranslatePipe,
    CommonModule,
    FormsModule,
    NgClass,
    MatMenuModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
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
  private languagesService = inject(LanguagesService);
  private store = inject(Store);

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
      this.selectedRoom$().pipe(takeUntilDestroyed(this.destroyRef), tap(()=>this.scrollToBottom()))
        .subscribe(room => {
          if (room) {
            this.loadedOnce = true;
            this.currentRoom = room;
            this.owner$ = this.userService.getUser(room.ownerId);
            this.currentUser$ = this.userService.getUser(this.currentUserId);
            this.memberUsers$ = this.userService.getMembers(room.members);
            this.messages$ = this.chatService.getMessages(room.roomId);
            if (!room.members.includes(this.currentUserId)) {
              this.handleCloseChat();
            }
          }
        });
    } else {
      this.router.navigateByUrl('**');
    }
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    if (!this.scrollContainer) return;
    const container = this.scrollContainer.nativeElement;
    container.scrollTop = container.scrollHeight;
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
          const messagePayload = {
            content: trimmed,
            senderId: user.id,
            senderName: user.username
          }
          const res = this.chatService.createMessage(room.roomId, messagePayload);
          return res;
        }),
        tap((res) => {
          this.addMessageToStore(res);
          this.scrollToBottom();
          this.newMessage = '';
        }),
      ).subscribe();
  }

  sendWithEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  addMessageToStore(docRef:DocumentReference) {
    const message$ = this.chatService.getMessageByRef(docRef).pipe(take(1));
    const room$ = this.selectedRoom$().pipe(take(1));
    forkJoin([message$, room$]).subscribe(([message, room])=>{
      const payload:(Message&{roomName:string}) = { ...message, roomName: room.roomName };
      console.log(payload);
      this.store.dispatch(MessagesActions.add({ message:payload }));
    });
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
        this.languagesService.getTranslate('app.error.room-delete-restricted').pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res: string) => {
          this._snackBar.open(res, 'Ok');
        });
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
        this.languagesService.getTranslate('app.error.room-namechange-restricted')
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((res: string) => {
            this._snackBar.open(res, 'Ok');
          });
      }
    }

  }

  addUserToPrivateGroup(userId: string) {
    this.memberUsers$.pipe(
      take(1),
      map(u => u.some(u => u.id === userId)),
    ).subscribe(exists => {
      if (exists) {
        this.languagesService.getTranslate('app.error.user-already-member')
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((res: string) => {
            this._snackBar.open(res, 'Ok');
          });
      } else {
        this.chatService.addUserToPrivateGroup(userId, this.currentRoom!.roomId).subscribe(() => {
          this.languagesService.getTranslate('app.error.user-added')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((res: string) => {
              this._snackBar.open(res, 'Ok');
            });
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
      this.languagesService.getTranslate('app.error.user-removed')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res: string) => {
          this._snackBar.open(res, 'Ok');
        });
    }
    );
  }

  handleCloseChat() {
    this.closeChat.emit();
  }
}
