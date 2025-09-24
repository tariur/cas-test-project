import { Timestamp } from "firebase/firestore";

export interface Message{
    content:string;
    id:string;
    senderId:string;
    senderName:string;
    timestamp:Timestamp;
}