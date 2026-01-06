import { Timestamp } from "firebase/firestore";
import { initialMessagesState, initialRoomsState, MessagesActions, messagesFeature, RoomsActions, roomsFeature } from "./app.state";
import { Message } from "./model/Message";

const message = {
    content: 'test content',
    id: 'testID',
    senderId: 'test senderID',
    senderName: 'test sender name',
    timestamp: new Timestamp(1, 1),
    roomName: 'test room name'
} as Message & { roomName: string };
const room = {
    members: ['memberID1'],
    ownerId: 'ownerID',
    restrictions: 'public-group',
    roomId: 'roomID',
    roomName: 'room-name'
};


describe('Messages Reducer', () => {
    const { reducer } = messagesFeature;
    const messagesState = initialMessagesState;

    it('MessagesActions.add adds message to store', () => {
        const state = reducer(messagesState, MessagesActions.add({ message: message }));
        expect(state).toEqual({
            messages: [
                {
                    content: 'test content',
                    id: 'testID',
                    senderId: 'test senderID',
                    senderName: 'test sender name',
                    timestamp: new Timestamp(1, 1),
                    roomName: 'test room name'
                }
            ]
        });
    });

    it('MessagesActions.clear resets messages state to initial', () => {
        const stateWithMessage = reducer(messagesState, MessagesActions.add({ message: message }));
        const clearedState = reducer(stateWithMessage, MessagesActions.clear());
        expect(clearedState).toEqual(initialMessagesState);
    });
});

describe('Rooms Reducer', () => {
    const { reducer } = roomsFeature;
    const roomsState = initialRoomsState;

    it('RoomsActions.create adds room to createdrooms[] in store', () => {
        const state = reducer(roomsState, RoomsActions.create({ room: room }));
        expect(state).toEqual({
            createdrooms: [
                {
                    members: ['memberID1'],
                    ownerId: 'ownerID',
                    restrictions: 'public-group',
                    roomId: 'roomID',
                    roomName: 'room-name'
                }
            ],
            deletedrooms: [],
            sentperroom: []
        });
    });

    it('RoomsActions.deletes adds room to deletedrooms[] in store', () => {
        const state = reducer(roomsState, RoomsActions.delete({ room: room }));
        expect(state).toEqual({
            createdrooms: [],
            deletedrooms: [
                {
                    members: ['memberID1'],
                    ownerId: 'ownerID',
                    restrictions: 'public-group',
                    roomId: 'roomID',
                    roomName: 'room-name'
                }
            ],
            sentperroom: []
        });
    });

    it('RoomsActions.clear reset rooms state to initial', () => {
        const stateWithCreatedRooms = reducer(roomsState, RoomsActions.create({ room: room }));
        const stateWithCreatedAndDeletedRooms = reducer(stateWithCreatedRooms, RoomsActions.delete({ room: room }));
        const clearedState = reducer(stateWithCreatedAndDeletedRooms, RoomsActions.clear());
        expect(clearedState).toEqual(initialRoomsState);
    });

    it('If room is NOT in sentperrooms[], RoomsActions.sent adds room to sentperrooms[] with count: 1', () => {
        const state = reducer(roomsState, RoomsActions.sent({ room: { roomId: 'roomID1', roomName: 'roomName1' } }));
        expect(state).toEqual({
            createdrooms: [],
            deletedrooms: [],
            sentperroom: [
                {
                    roomId: 'roomID1',
                    roomName: 'roomName1',
                    count: 1
                }
            ]
        })
    });

    it('If room is in sentperroms[], RoomsActions.sent increments it\'s count', () => {
        const stateWithRoom = reducer(roomsState, RoomsActions.sent({ room: { roomId: 'roomID1', roomName: 'roomName1' } }));
        const stateWithSameRoom = reducer(stateWithRoom, RoomsActions.sent({ room: { roomId: 'roomID1', roomName: 'roomName1' } }));
        expect(stateWithSameRoom).toEqual({
            createdrooms: [],
            deletedrooms: [],
            sentperroom: [
                {
                    roomId: 'roomID1',
                    roomName: 'roomName1',
                    count: 2
                }
            ]
        });
    });
});
