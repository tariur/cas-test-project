import { Injectable, inject } from '@angular/core';
import { collectionData, docData, Firestore } from '@angular/fire/firestore';
import { forkJoin, from, map, Observable, of, shareReplay, switchMap, take, tap } from 'rxjs';
import { ChatRoom } from '../model/ChatRoom';
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, DocumentReference, getDoc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
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

  fetchRoomById(roomId: string, docSpy = doc, docDataSpy = docData): Observable<ChatRoom> {
    const chatRef = docSpy(this.firestore, "chatRooms", roomId);
    return from(docDataSpy(chatRef, { idField: 'roomId' }) as Observable<ChatRoom>);
  }

  updateChatname(roomId: string, newChatname: string, docSpy = doc, updateDocSpy = updateDoc): Observable<void> {
    const chatRef = docSpy(this.firestore, 'chatRooms', roomId)
    return from(updateDocSpy(chatRef, { roomName: newChatname }));
  }

  getMessages(
    roomId: string, collectionSpy = collection,
    collectionDataSpy = collectionData, querySpy = query
  ): Observable<Message[]> {
    const messageRef = collectionSpy(this.firestore, `chatRooms/${roomId}/messages`);
    const q = querySpy(messageRef, orderBy('timestamp', 'asc'));
    return collectionDataSpy(q, { idField: 'id' }) as Observable<Message[]>;
  }

  createMessage(roomId: string, message: Omit<Message, 'id' | 'timestamp'>, collectionSpy = collection, addDocSpy = addDoc) {
    const messagesRef = collectionSpy(this.firestore, `chatRooms/${roomId}/messages`);
    const newMessage = {...message, timestamp: serverTimestamp()};
    return from(
      addDocSpy(messagesRef, newMessage)
    ).pipe(tap(docRef=>{
      updateDoc(docRef, {id:docRef.id})
    }));
  }

  getMessageByRef(docRef:DocumentReference){
    return from(docData(docRef) as Observable<Message>);
  }

  findPrivateChat(otherUserId: string, collectionSpy = collection, collectionDataSpy = collectionData, querySpy = query, addDocSpy = addDoc): Observable<ChatRoom> {
    const chatRoomRef = collectionSpy(this.firestore, 'chatRooms');
    const currentUserId = this.firebaseAuth.currentUser?.uid;
    if (!currentUserId) throw new Error('User not logged in!');
    const q = querySpy(chatRoomRef,
      where('restrictions', '==', 'private-chat'),
      where('members', 'array-contains', currentUserId)
    );
    const rooms$ = collectionDataSpy(q, { idField: 'roomId' }) as Observable<ChatRoom[]>;
    return rooms$.pipe(
      map(rooms => rooms.find(r => r.members.includes(otherUserId))),
      take(1),
      switchMap(existingRoom => {
        if (existingRoom != undefined) {
          return of(existingRoom);
        }
        const newRoom = {
          members: [currentUserId, otherUserId],
          ownerId: currentUserId,
          restrictions: 'private-chat',
          roomName: 'Private Chat'
        };
        return from(addDocSpy(chatRoomRef, newRoom)).pipe(
          map(docRef => ({ roomId: docRef.id, ...newRoom }))
        );
      }),
      shareReplay(1)
    )
  }

  deletePrivateChat(roomId: string): Observable<void> {
    const roomRef = doc(this.firestore, `chatRooms/${roomId}`);
    const messagesRef = collection(this.firestore, `chatRooms/${roomId}/messages`);
    return from(getDocs(messagesRef)).pipe(
      switchMap(messagesSnapshot => {
        if (messagesSnapshot.empty) {
          return of(null);
        }
        const deleteObservables = messagesSnapshot.docs.map(m => from(deleteDoc(m.ref)));
        return forkJoin(deleteObservables);
      }),
      switchMap(() => from(deleteDoc(roomRef))),
    );
  }

  getAllPublicGroups(collectionSpy = collection, querySpy = query, collectionDataSpy = collectionData): Observable<ChatRoom[]> {
    const chatRoomsCollRef = collectionSpy(this.firestore, 'chatRooms');
    const q = querySpy(chatRoomsCollRef, where('restrictions', '==', 'public-group'));
    return collectionDataSpy(q, { idField: 'roomId' }) as Observable<ChatRoom[]>;
  }


  createPublicGroup(currentUserId: string, collectionSpy = collection, addDocSpy = addDoc, updateDocSpy = updateDoc): Observable<ChatRoom> {
    const chatRoomsCollRef = collectionSpy(this.firestore, 'chatRooms');
    return this.userService.getUser(currentUserId).pipe(
      take(1),
      switchMap((user: User) => {
        const newRoom: Omit<ChatRoom, 'roomId'> = {
          members: [currentUserId],
          ownerId: currentUserId,
          restrictions: 'public-group',
          roomName: user.username + '\'s public group'
        };

        return from(addDocSpy(chatRoomsCollRef, newRoom)).pipe(
          switchMap(docRef =>
            from(updateDocSpy(docRef, { roomId: docRef.id })).pipe(
              map(() => ({ roomId: docRef.id, ...newRoom } as ChatRoom))
            )
          )
        )
      }),
      shareReplay(1)
    );
  }

  createPrivateGroup(currentUserId: string, collectionSpy = collection, addDocSpy = addDoc, updateDocSpy = updateDoc): Observable<ChatRoom> {
    const chatRoomsCollRef = collectionSpy(this.firestore, 'chatRooms');

    return this.userService.getUser(currentUserId).pipe(
      take(1),
      switchMap(user => {
        const newRoom: Omit<ChatRoom, 'roomId'> = {
          members: [currentUserId],
          ownerId: currentUserId,
          restrictions: 'private-group',
          roomName: user.username + '\'s private group'
        };

        return from(addDocSpy(chatRoomsCollRef, newRoom)).pipe(
          switchMap(docRef =>
            from(updateDocSpy(docRef, { roomId: docRef.id })).pipe(
              map(() => ({ roomId: docRef.id, ...newRoom } as ChatRoom))
            )
          )
        )
      }),
      shareReplay(1)
    );
  }

  createPasswordGroup(currentUserId: string, password: string, collectionSpy = collection, addDocSpy = addDoc, updateDocSpy = updateDoc): Observable<ChatRoom> {
    const chatRoomsCollRef = collectionSpy(this.firestore, 'chatRooms');
    return this.userService.getUser(currentUserId).pipe(
      take(1),
      switchMap(user => {
        const newRoom: Omit<ChatRoom, 'roomId'> = {
          members: [currentUserId],
          ownerId: currentUserId,
          restrictions: 'password-group',
          roomName: user.username + '\'s password protected group'
        };
        return from(addDocSpy(chatRoomsCollRef, newRoom)).pipe(
          switchMap(docRef =>
            from(updateDocSpy(docRef, { roomId: docRef.id, password: password })).pipe(
              map(() => ({ roomId: docRef.id, ...newRoom }) as ChatRoom)
            )
          )
        )
      }),
      shareReplay(1)
    );
  }

  addUserToPrivateGroup(userId: string, roomId: string, docSpy = doc, updateDocSpy = updateDoc): Observable<void> {
    const docRef = docSpy(this.firestore, 'chatRooms', roomId);
    return from(updateDocSpy(docRef, { members: arrayUnion(userId) }));
  }
  removeUserFromPrivateGroup(userId: string, roomId: string, docSpy = doc, updateDocSpy = updateDoc): Observable<void> {
    const docRef = docSpy(this.firestore, 'chatRooms', roomId);
    return from(updateDocSpy(docRef, { members: arrayRemove(userId) }));
  }

  getAllPrivateGroups(currentUserId: string, collectionSpy = collection, querySpy = query, collectionDataSpy = collectionData): Observable<ChatRoom[]> {
    const chatRoomsCollRef = collectionSpy(this.firestore, 'chatRooms');
    const q = querySpy(chatRoomsCollRef,
      where('restrictions', '==', 'private-group'),
      where('members', 'array-contains', currentUserId)
    );
    return collectionDataSpy(q, { idField: 'roomId' }) as Observable<ChatRoom[]>;
  }

  getAllPasswordGroups(collectionSpy = collection, querySpy = query, collectionDataSpy = collectionData): Observable<ChatRoom[]> {
    const chatRoomsCollRef = collectionSpy(this.firestore, 'chatRooms');
    const q = querySpy(chatRoomsCollRef, where('restrictions', '==', 'password-group'));
    return collectionDataSpy(q, { idField: 'roomId' }) as Observable<ChatRoom[]>;
  }

  //Checks if password is correct when trying to join a password protected group
  async validateGroupPassword(roomId: string, password: string, docSpy = doc, getDocSpy = getDoc): Promise<boolean> {
    const docRef = docSpy(this.firestore, 'chatRooms', roomId);
    const docSnap = await getDocSpy(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const storedPassword = data['password'] as string;
      return storedPassword === password;
    } else {
      console.warn('No document');
      return false;
    }
  }

  addUserToPasswordAndPrivateGroup(roomId: string, docSpy = doc, updateDocSpy = updateDoc) {
    const user = this.firebaseAuth.currentUser;
    if (!user) {
      throw new Error('No logged in user');
    }
    const docRef = docSpy(this.firestore, 'chatRooms', roomId);
    return from(updateDocSpy(docRef, { members: arrayUnion(user.uid) }));
  }

}
