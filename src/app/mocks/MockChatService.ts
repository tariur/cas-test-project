import { of } from "rxjs";
import { ChatRoom } from "../model/ChatRoom";
import { Message } from "../model/Message";
import { Timestamp } from "firebase/firestore";

export class MockChatService {
    private groupsData: ChatRoom[];
    private messagesData: Message[];
    constructor(groupsData: ChatRoom[], messagesData: Message[]) {
        this.groupsData = groupsData;
        this.messagesData = messagesData;
    }

    getAllPrivateGroups() {
        return of(this.groupsData);
    }
    getAllPublicGroups() {
        return of(this.groupsData);
    }
    getAllPasswordGroups() {
        return of(this.groupsData);
    }
    findPrivateChat(_:string) {
        return of(this.groupsData[0]);
    }
    getMessages(_:string){
        return of(this.messagesData);
    }
    fetchRoomById(_:string){
        return of(this.groupsData[0]);
    }
    addUserToPasswordAndPrivateGroup(_: string){
        return of([]);
    }
    addUserToPrivateGroup(_:string, __:string){
        return of([]);
    }
    createPublicGroup(_: string){
        return of(this.groupsData[0]);
    }
    createPrivateGroup(_:string){
        return of(this.groupsData[0]);
    }
    createPasswordGroup(_:string, __:string){
        return of(this.groupsData[0]);
    }
    createMessage(_:string, __: Omit<Message, 'id' | 'timestamp'>){
        return of({content: 'Message1', id: '1', senderId:'abc', senderName:'user1', timestamp: new Timestamp(1, 0)});
    }
}