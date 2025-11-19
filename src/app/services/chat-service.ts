import { Injectable, inject } from '@angular/core';
import { collectionData, docData, Firestore } from '@angular/fire/firestore';
import { forkJoin, from, map, Observable, of, shareReplay, switchMap, take } from 'rxjs';
import { ChatRoom } from '../model/ChatRoom';
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { Message } from '../model/Message';
import { Auth } from '@angular/fire/auth';
import { UserService } from './user-service';
import { User } from '../model/User';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private firestore = inject(Firestore);
  private firebaseAuth = inject(Auth);
  private userService = inject(UserService);

  fetchRoomById(roomId: string): Observable<ChatRoom> {
    const chatRef = doc(this.firestore, "chatRooms", roomId);
    return from(docData(chatRef, { idField: 'roomId' }) as Observable<ChatRoom>);
  }

  updateChatname(roomId: string, newChatname: string): Observable<void> {
    const chatRef = doc(this.firestore, 'chatRooms', roomId)
    return from(updateDoc(chatRef, { roomName: newChatname }));
  }

  getMessages(roomId: string): Observable<Message[]> {
    const messageRef = collection(this.firestore, `chatRooms/${roomId}/messages`);
    const q = query(messageRef, orderBy('timestamp', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<Message[]>;
  }

  createMessage(roomId: string, message: Omit<Message, 'id' | 'timestamp'>) {
    const messagesRef = collection(this.firestore, `chatRooms/${roomId}/messages`);
    return from(
      addDoc(messagesRef, {
        ...message,
        timestamp: serverTimestamp()
      })
    );
  }

  findPrivateChat(otherUserId: string): Observable<ChatRoom> {
    const chatRoomRef = collection(this.firestore, 'chatRooms');
    const currentUserId = this.firebaseAuth.currentUser?.uid;
    if (!currentUserId) throw new Error('User not logged in!');
    const q = query(chatRoomRef,
      where('restrictions', '==', 'private-chat'),
      where('members', 'array-contains', currentUserId)
    );
    const rooms$ = collectionData(q, { idField: 'roomId' }) as Observable<ChatRoom[]>;
    return rooms$.pipe(
      map(rooms => rooms.find(r => r.members.includes(otherUserId))),
      switchMap(existingRoom => {
        if (existingRoom) {
          return of(existingRoom);
        }
        const newRoom = {
          members: [currentUserId, otherUserId],
          ownerId: currentUserId,
          restrictions: 'private-chat',
          roomName: 'Private Chat'
        };
        return from(addDoc(chatRoomRef, newRoom)).pipe(
          map(docRef => ({ roomId: docRef.id, ...newRoom }))
        );
      })
    )
  }

  deletePrivateChat(roomId: string): Observable<void> {
    const roomRef = doc(this.firestore, `chatRooms/${roomId}`);
    const messagesRef = collection(this.firestore, `chatRooms/${roomId}/messages`);
    return from(getDocs(messagesRef)).pipe(
      switchMap(messagesSnapshot => {
        if(messagesSnapshot.empty){
          return of(null);
        }
        const deleteObservables = messagesSnapshot.docs.map(m => from(deleteDoc(m.ref)));
        return forkJoin(deleteObservables);
      }),
      switchMap(() => from(deleteDoc(roomRef))),
    );
  }

  getAllPublicGroups(): Observable<ChatRoom[]> {
    const chatRoomsCollRef = collection(this.firestore, 'chatRooms');
    const q = query(chatRoomsCollRef, where('restrictions', '==', 'public-group'));
    return collectionData(q, { idField: 'roomId' }) as Observable<ChatRoom[]>;
  }


  createPublicGroup(currentUserId: string): Observable<ChatRoom> {
    const chatRoomsCollRef = collection(this.firestore, 'chatRooms');
    return this.userService.getUser(currentUserId).pipe(
      take(1),
      switchMap((user: User) => {
        const newRoom: Omit<ChatRoom, 'roomId'> = {
          members: [currentUserId],
          ownerId: currentUserId,
          restrictions: 'public-group',
          roomName: user.username + '\'s public group'
        };

        return from(addDoc(chatRoomsCollRef, newRoom)).pipe(
          switchMap(docRef =>
            from(updateDoc(docRef, { roomId: docRef.id })).pipe(
              map(() => ({ roomId: docRef.id, ...newRoom } as ChatRoom))
            )
          )
        )
      }),
      shareReplay(1)
    );
  }

  createPrivateGroup(currentUserId: string): Observable<ChatRoom> {
    const chatRoomsCollRef = collection(this.firestore, 'chatRooms');

    return this.userService.getUser(currentUserId).pipe(
      take(1),
      switchMap(user => {
        const newRoom: Omit<ChatRoom, 'roomId'> = {
          members: [currentUserId],
          ownerId: currentUserId,
          restrictions: 'private-group',
          roomName: user.username + '\'s private group'
        };

        return from(addDoc(chatRoomsCollRef, newRoom)).pipe(
          switchMap(docRef =>
            from(updateDoc(docRef, { roomId: docRef.id })).pipe(
              map(() => ({ roomId: docRef.id, ...newRoom } as ChatRoom))
            )
          )
        )
      }),
      shareReplay(1)
    );
  }

  createPasswordGroup(currentUserId:string, password:string):Observable<ChatRoom>{
    const chatRoomsCollRef = collection(this.firestore, 'chatRooms');
    return this.userService.getUser(currentUserId).pipe(
      take(1),
      switchMap(user=>{
        const newRoom: Omit<ChatRoom, 'roomId'> = {
          members: [currentUserId],
          ownerId: currentUserId,
          restrictions: 'password-group',
          roomName: user.username + '\'s password protected group'
        };
        return from(addDoc(chatRoomsCollRef, newRoom)).pipe(
          switchMap(docRef => 
            from(updateDoc(docRef, { roomId: docRef.id, password:password })).pipe(
              map(() => ({ roomId: docRef.id, ...newRoom}) as ChatRoom)
            )
          )
        )
      }),
      shareReplay(1)
    );
  }

  addUserToPrivateGroup(userId: string, roomId: string):Observable<void> {
    const docRef = doc(this.firestore, 'chatRooms', roomId);
    return from(updateDoc(docRef, { members: arrayUnion(userId) }));
  }
  removeUserFromPrivateGroup(userId: string, roomId: string):Observable<void> {
    const docRef = doc(this.firestore, 'chatRooms', roomId);
    return from(updateDoc(docRef, { members: arrayRemove(userId) }));
  }

  getAllPrivateGroups(currentUserId: string): Observable<ChatRoom[]> {
    const chatRoomsCollRef = collection(this.firestore, 'chatRooms');
    const q = query(chatRoomsCollRef,
      where('restrictions', '==', 'private-group'),
      where('members', 'array-contains', currentUserId)
    );
    return collectionData(q, { idField: 'roomId' }) as Observable<ChatRoom[]>;
  }

  getAllPasswordGroups(): Observable<ChatRoom[]> {
    const chatRoomsCollRef = collection(this.firestore, 'chatRooms');
    const q = query(chatRoomsCollRef, where('restrictions', '==', 'password-group'));
    return collectionData(q, { idField: 'roomId' }) as Observable<ChatRoom[]>;
  }

  //Checks if password is correct when trying to join a password protected group
  async validateGroupPassword(roomId: string, password: string): Promise<boolean> {
    const docRef = doc(this.firestore, 'chatRooms', roomId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const storedPassword = data['password'] as string;
      return storedPassword === password;
    } else {
      console.warn('No document');
      return false;
    }
  }

  addUserToPasswordAndPrivateGroup(roomId: string) {
    const currentUserId = this.firebaseAuth.currentUser?.uid;
    const docRef = doc(this.firestore, 'chatRooms', roomId);
    return from(updateDoc(docRef, { members: arrayUnion(currentUserId) }));
  }

}
