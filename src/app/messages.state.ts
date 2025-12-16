import { createActionGroup, createFeature, createReducer, on, props } from "@ngrx/store";
import { Message } from "./model/Message";

export const MessagesActions = createActionGroup({
    source: 'Messages',
    events: {
        'Add': props<{ message: Message }>()
    },
});

interface MessagesState {
    messages: Message[];
}

const initialState: MessagesState = {
    messages: [] as Message[],
};

export const messagesFeature = createFeature({
    name: 'messages',
    reducer: createReducer(
        initialState,
        on(MessagesActions.add, (state, action) => ({
            ...state, messages: state.messages.concat(action.message),
        })),
    ),
});