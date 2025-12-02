/* eslint-disable @typescript-eslint/no-unused-vars */
import { of } from "rxjs";
import { ChatRoom } from "../model/ChatRoom";

export class MockChatService {
    private groupsData: ChatRoom[];
    constructor(groupsData: ChatRoom[]) {
        this.groupsData = groupsData;
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
    findPrivateChat(userId: string) {
        return of(this.groupsData[0]);
    }
}