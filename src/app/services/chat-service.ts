import { Injectable } from '@angular/core';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { Observable} from 'rxjs';
import { ChatRoom } from '../model/ChatRoom';
import { addDoc, collection, doc, getDoc, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { Message } from '../model/Message';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private firestore:Firestore){}

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

}
