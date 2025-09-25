import { Injectable } from '@angular/core';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { Observable} from 'rxjs';
import { ChatRoom } from '../model/ChatRoom';
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { Message } from '../model/Message';
import { Auth } from '@angular/fire/auth';
import { UserService } from './user-service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private firestore:Firestore, private firebaseAuth:Auth, private userService:UserService){}

  async fetchRoomById(roomId:string):Promise<ChatRoom | null>{
    const chatRef = doc(this.firestore, "chatRooms", roomId);
    const chatSnap = await getDoc(chatRef);
    if(chatSnap.exists()){
      const data = chatSnap.data() as ChatRoom;
      return data;
    }else{
      console.warn('Chat document does not exist');
      return null;
    }
  }

  async updateChatname(roomId:string, newChatname:string){
    const chatRef = doc(this.firestore, 'chatRooms', roomId)
    await updateDoc(chatRef, {roomName : newChatname})
  }

  getMessages(roomId:string):Observable<Message[]>{
    const messageRef = collection(this.firestore, `chatRooms/${roomId}/messages`);
    const q = query(messageRef, orderBy('timestamp', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<Message[]>;
  }

  async createMessage(roomId:string, message:Omit<Message, 'id' | 'timestamp'>):Promise<void>{
    const messagesRef = collection(this.firestore, `chatRooms/${roomId}/messages`);
    const docRef = await addDoc(messagesRef, {
      content: message.content,
      senderId: message.senderId,
      senderName:message.senderName
    });

    await updateDoc(docRef, { id: docRef.id , timestamp: serverTimestamp() });
  }

  async findPrivateChat(otherUserId:string){
    const chatRoomRef = collection(this.firestore, 'chatRooms');
    const currentUserId = await this.firebaseAuth.currentUser?.uid;
    const q = query(chatRoomRef,
      where('restrictions', '==', 'private-chat'),
      where('members', 'array-contains', currentUserId)
    );
    const chatRoomsSnap = await getDocs(q);
    const match = chatRoomsSnap.docs.find(doc=>{
      const members = doc.data()['members'] as string[];
      return members.includes(otherUserId);
    });

    return match ? match.id : this.createPrivateChat(currentUserId as string, otherUserId);
  }

  async createPrivateChat(currentUserId:string, otherUserId:string):Promise<string>{
    const chatRef = collection(this.firestore, 'chatRooms');
    const currentUsername = await this.userService.fetchUsernameById(currentUserId);
    const otherUsername = await this.userService.fetchUsernameById(otherUserId);
    const docRef = await addDoc(chatRef, {
      members: [currentUserId, otherUserId],
      ownerId: currentUserId,
      restrictions: 'private-chat',
      roomName: 'Private chatroom of ' + currentUsername + ' and ' + otherUsername
    });
    await updateDoc(docRef, { roomId:docRef.id });
    return docRef.id;
  }

  async deletePrivateChat(roomId:string){
    const roomRef = doc(this.firestore, `chatRooms/${roomId}`);
    const messagesRef = collection(this.firestore, `chatRooms/${roomId}/messages`);
    const messagesSnapshot = await getDocs(messagesRef);
    const deletePromieses = messagesSnapshot.docs.map(m => deleteDoc(m.ref));
    await Promise.all(deletePromieses);
    await deleteDoc(roomRef);
  }

  async createPublicGroup(currentUserId:string):Promise<string>{
    const chatRoomsCollRef = collection(this.firestore, 'chatRooms');
    const currentUsername = await this.userService.fetchUsernameById(currentUserId);
    const docRef = await addDoc(chatRoomsCollRef, {
      members: [currentUserId],
      ownerId: currentUserId,
      restrictions: 'public-group',
      roomName: currentUsername + '\'s public group'
    });
    await updateDoc(docRef, { roomId:docRef.id });
    return docRef.id;
  }

  getAllPublicGroups(): Observable<ChatRoom[]>{
    const chatRoomsCollRef = collection(this.firestore, 'chatRooms');
    const q = query(chatRoomsCollRef, where('restrictions', '==', 'public-group'));
    return collectionData(q, { idField:'roomId' }) as Observable<ChatRoom[]>;
  }

  async createPrivateGroup(currentUserId:string):Promise<string>{
    const chatRoomsCollRef = collection(this.firestore, 'chatRooms');
    const currentUsername = await this.userService.fetchUsernameById(currentUserId);
    const docRef = await addDoc(chatRoomsCollRef, {
      members:[currentUserId],
      ownerId:currentUserId,
      restrictions: 'private-group',
      roomName: currentUsername + '\'s private group'
    });
    await updateDoc(docRef, { roomId:docRef.id });
    return docRef.id;
  }

  async addUserToPrivateGroup(userId:string, roomId:string){
    const docRef = doc(this.firestore, 'chatRooms', roomId);
    await updateDoc(docRef, { members: arrayUnion(userId) });
  }
  async removeUserFromPrivateGroup(userId:string, roomId:string){
    const docRef = doc(this.firestore, 'chatRooms', roomId);
    await updateDoc(docRef, { members: arrayRemove(userId) });
  }

  getAllPrivateGroups(currentUserId:string): Observable<ChatRoom[]>{
    const chatRoomsCollRef = collection(this.firestore, 'chatRooms');
    const q = query(chatRoomsCollRef,
      where('restrictions', '==', 'private-group'),
      where('members', 'array-contains', currentUserId)
    );
    return collectionData(q, { idField:'roomId' }) as Observable<ChatRoom[]>;
  }

  async createPasswordGroup(currentUserId:string, password:string):Promise<string>{
    const chatRoomsCollRef = collection(this.firestore, 'chatRooms');
    const currentUsername = await this.userService.fetchUsernameById(currentUserId);
    const docRef = await addDoc(chatRoomsCollRef, {
      members:[currentUserId],
      ownerId:currentUserId,
      restrictions: 'password-group',
      roomName: currentUsername + '\'s password protected group',
      password:password
    });
    await updateDoc(docRef, { roomId:docRef.id });
    return docRef.id;
  }

  getAllPasswordGroups(): Observable<ChatRoom[]>{
    const chatRoomsCollRef = collection(this.firestore, 'chatRooms');
    const q = query(chatRoomsCollRef, where('restrictions', '==', 'password-group'));
    return collectionData(q, { idField:'roomId' }) as Observable<ChatRoom[]>;
  }
}
