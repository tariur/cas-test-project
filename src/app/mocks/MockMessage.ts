import { Timestamp } from "@angular/fire/firestore";
import { Message } from "../model/Message";

export class MockMessage{
    private mockMessages: Message[] = [
        {content: 'Message1', id: '1', senderId:'abc', senderName:'user1', timestamp: new Timestamp(1, 0)},
        {content: 'Message2', id: '2', senderId:'cba', senderName:'user2', timestamp: new Timestamp(2, 0)},
        {content: 'Message3', id: '3', senderId:'abc', senderName:'user1', timestamp: new Timestamp(3, 0)},
        {content: 'Message4', id: '4', senderId:'cba', senderName:'user2', timestamp: new Timestamp(4, 0)}
    ];

    getMockMessages():Message[]{
        return this.mockMessages;
    }
}