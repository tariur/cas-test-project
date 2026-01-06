import { createActionGroup, createFeature, createReducer, emptyProps, on, props } from "@ngrx/store";
import { Message } from "./model/Message";
import { ChatRoom } from "./model/ChatRoom";

export const MessagesActions = createActionGroup({
    source: 'Messages',
    events: {
        'Add': props<{ message: Message & { roomName: string } }>(),
        'Clear': emptyProps()
    },
});

export const RoomsActions = createActionGroup({
    source: 'Rooms',
    events: {
        'Create': props<{ room: ChatRoom }>(),
        'Delete': props<{ room: ChatRoom }>(),
        'Sent': props<{ room: { roomId: string, roomName: string } }>(),
        'Clear': emptyProps()
    },
});

export interface MessagesState {
    messages: (Message & { roomName: string })[],
}

export interface RoomsState {
    createdrooms: ChatRoom[],
    deletedrooms: ChatRoom[],
    sentperroom: { roomId: string, roomName: string, count: number }[]
}
export const initialMessagesState: MessagesState = {
    messages: [] as (Message & { roomName: string })[],

};
export const initialRoomsState: RoomsState = {
    createdrooms: [] as ChatRoom[],
    deletedrooms: [] as ChatRoom[],
    sentperroom: [] as { roomId: string, roomName: string, count: number }[]
}


export const messagesFeature = createFeature({
    name: 'messages',
    reducer: createReducer(
        initialMessagesState,
        on(MessagesActions.add, (state, action) => ({
            ...state, messages: state.messages.concat(action.message),
        })),
        on(MessagesActions.clear, () => ({
            ...initialMessagesState
        }))
    ),
});

export const roomsFeature = createFeature({
    name: 'rooms',
    reducer: createReducer(
        initialRoomsState,
        on(RoomsActions.clear, () => ({
            ...initialRoomsState
        })),
        on(RoomsActions.create, (state, action) => ({
            ...state, createdrooms: state.createdrooms.concat(action.room),
        })),
        on(RoomsActions.delete, (state, action) => ({
            ...state, deletedrooms: state.deletedrooms.concat(action.room),
        })),
        on(RoomsActions.sent, (state, action) => {
            const existingRoom = state.sentperroom.find(
                (r) => r.roomId === action.room.roomId
            );
            let updatedSentPerRoom;
            if (existingRoom) {
                updatedSentPerRoom = state.sentperroom.map((r) =>
                    r.roomId === action.room.roomId
                        ? { ...r, count: r.count + 1 }
                        : r
                );
            } else {
                updatedSentPerRoom = [
                    ...state.sentperroom,
                    {
                        roomId: action.room.roomId,
                        roomName: action.room.roomName,
                        count: 1
                    }
                ];
            }
            return {
                ...state,
                sentperroom: updatedSentPerRoom,
            };
        })
    ),
});