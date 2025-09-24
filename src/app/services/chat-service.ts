import { Injectable } from '@angular/core';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { Observable} from 'rxjs';
import { ChatRoom } from '../model/ChatRoom';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
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
      senderId: message.senderId
    });

    await updateDoc(docRef, { id: docRef.id,  timestamp: serverTimestamp() });
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
}
