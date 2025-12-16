import { ChatRoom } from "../model/ChatRoom";

export class MockGroups {
    private mockGroups: ChatRoom[] = [
        { members: ['1', '2', '3', 'abc123'], ownerId: '1', restrictions: 'public', roomId: 'r1', roomName: 'Room1' },
        { members: ['1', '2', '3'], ownerId: '1', restrictions: 'public', roomId: 'r2', roomName: 'Room2' },
        { members: ['1', '2', '3'], ownerId: '1', restrictions: 'public', roomId: 'r3', roomName: 'Room3' },
        { members: ['1', '2', '3'], ownerId: '1', restrictions: 'public', roomId: 'r4', roomName: 'Room4' },
    ];

    getMockGroups():ChatRoom[]{
        return this.mockGroups;
    }
}