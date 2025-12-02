import { User } from "../model/User";

export class MockUsers {
    private mockUsers: User[] = [
        { id: '1', username: 'User1', email: 'user1@mail.com', online: true, avatarURL: '' },
        { id: '2', username: 'User2', email: 'user2@mail.com', online: true, avatarURL: '' },
        { id: '3', username: 'User3', email: 'user3@mail.com', online: true, avatarURL: '' },
        { id: '4', username: 'User4', email: 'user4@mail.com', online: false, avatarURL: '' }
    ];
    getMockUsers():User[]{
        return this.mockUsers;
    }
}