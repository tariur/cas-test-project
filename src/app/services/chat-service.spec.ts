import { TestBed } from '@angular/core/testing';

import { ChatService } from './chat-service';
import { UserService } from './user-service';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { forkJoin, of } from 'rxjs';
import { arrayRemove, arrayUnion, orderBy, serverTimestamp, where } from 'firebase/firestore';
import { MockMessage } from '../mocks/MockMessage';
import { Message } from '../model/Message';
import { MockGroups } from '../mocks/MockGroups';
import { MockUsers } from '../mocks/MockUsers';
import { ChatRoom } from '../model/ChatRoom';

describe('ChatService', () => {
  let service: ChatService;
  let userService: UserService;
  const firestoreMock = { type: 'firestore-mock-instance' };
  const firebaseMock = { currentUser: { uid: 'test-uid' } };
  const roomID = 'room01';
  const docRef = 'mock';
  const queryMock = 'mockQuery'
  const mockMessages = new MockMessage().getMockMessages();
  const mockGroups = new MockGroups().getMockGroups();
  const mockUsers = new MockUsers().getMockUsers();
  const docSpy = jasmine.createSpy('doc').and.returnValue(docRef);
  const updateDocSpy = jasmine.createSpy('updateDoc').and.returnValue(of([]));
  const docDataSpy = jasmine.createSpy('docData').and.returnValue(of([]));
  const collectionSpy = jasmine.createSpy('collection').and.returnValue(docRef);
  const collectionDataSpy = jasmine.createSpy('collectionData').and.returnValue(of([]));
  const querySpy = jasmine.createSpy('query').and.returnValue(queryMock);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ChatService,
        UserService,
        { provide: Firestore, useValue: firestoreMock },
        { provide: Auth, useValue: firebaseMock }
      ]
    });
  });

  it('should be created', () => {
    service = TestBed.inject(ChatService);
    expect(service).toBeTruthy();
  });

  it('should fetch room by roomID', () => {
    service = TestBed.inject(ChatService);
    service.fetchRoomById(roomID, docSpy, docDataSpy);
    expect(docSpy).toHaveBeenCalledWith(firestoreMock, 'chatRooms', roomID);
    expect(docDataSpy).toHaveBeenCalledWith(docRef, { idField: 'roomId' });
  });

  it('should update chatname', () => {
    service = TestBed.inject(ChatService);
    const newName = 'New Chatname';
    service.updateChatname(roomID, newName, docSpy, updateDocSpy);
    expect(docSpy).toHaveBeenCalledWith(firestoreMock, 'chatRooms', roomID);
    expect(updateDocSpy).toHaveBeenCalledWith(docRef, { roomName: newName });
  });

  it('should get messages', () => {
    service = TestBed.inject(ChatService);
    service.getMessages(roomID, collectionSpy, collectionDataSpy, querySpy);
    expect(collectionSpy).toHaveBeenCalledWith(firestoreMock, `chatRooms/${roomID}/messages`);
    expect(querySpy).toHaveBeenCalledWith(docRef, orderBy('timestamp', 'asc'));
    expect(collectionDataSpy).toHaveBeenCalledWith(queryMock, { idField: 'id' });
  });

  it('should create message', () => {
    service = TestBed.inject(ChatService);
    const message = mockMessages[0] as Omit<Message, 'id' | 'timestamp'>;
    const addDocSpy = jasmine.createSpy('addDoc').and.returnValue(of([]));
    service.createMessage(roomID, message, collectionSpy, addDocSpy);
    expect(collectionSpy).toHaveBeenCalledWith(firestoreMock, `chatRooms/${roomID}/messages`);
    expect(addDocSpy).toHaveBeenCalledWith(docRef, { ...message, timestamp: serverTimestamp() });
  });

  it('should throw error if user not authenticated when findPrivateChat called', () => {
    TestBed.overrideProvider(Auth, { useValue: { currentUser: null } });
    service = TestBed.inject(ChatService);
    expect(() => { service.findPrivateChat('otheruserID', collectionSpy); }).toThrowError('User not logged in!');
  });

  it('should open private chat if already exists', () => {
    service = TestBed.inject(ChatService);
    const otherUserID = 'abc123';
    const localAddDocSpy = jasmine.createSpy('addDoc');
    const localCollectionDataSpy = jasmine.createSpy('collectionData').and.returnValue(of(mockGroups));
    const resultRoom$ = service.findPrivateChat(otherUserID, collectionSpy, localCollectionDataSpy, querySpy);
    expect(collectionSpy).toHaveBeenCalledWith(firestoreMock, 'chatRooms');
    expect(querySpy).toHaveBeenCalledWith(docRef,
      where('restrictions', '==', 'private-chat'),
      where('members', 'array-contains', firebaseMock.currentUser.uid));
    expect(localCollectionDataSpy).toHaveBeenCalledWith(queryMock, { idField: 'roomId' });
    expect(localAddDocSpy).not.toHaveBeenCalled();
    resultRoom$.subscribe(room => {
      expect(room).toEqual(mockGroups[0]);
    }).unsubscribe();
  });

  it('should create private chat if it doesn\'t exist yet', () => {
    service = TestBed.inject(ChatService);
    const otherUserID = 'not in any of the rooms ID';
    const localAddDocSpy = jasmine.createSpy('addDoc').and.returnValue(of([]));
    const localCollectionDataSpy = jasmine.createSpy('collectionData').and.returnValue(of(mockGroups));
    const newRoom = {
      members: [firebaseMock.currentUser.uid, otherUserID],
      ownerId: firebaseMock.currentUser.uid,
      restrictions: 'private-chat',
      roomName: 'Private Chat'
    };
    const result$ = service.findPrivateChat(otherUserID, collectionSpy, localCollectionDataSpy, querySpy, localAddDocSpy);
    result$.subscribe(() => {
      expect(localAddDocSpy).toHaveBeenCalledWith(docRef, newRoom);
    }).unsubscribe();
  });

  it('should get all public groups', () => {
    service = TestBed.inject(ChatService);
    service.getAllPublicGroups(collectionSpy, querySpy, collectionDataSpy);
    expect(collectionSpy).toHaveBeenCalledWith(firestoreMock, 'chatRooms');
    expect(querySpy).toHaveBeenCalledWith(docRef, where('restrictions', '==', 'public-group'));
    expect(collectionDataSpy).toHaveBeenCalledWith(queryMock, { idField: 'roomId' });
  });

  it('should create public chat', () => {
    service = TestBed.inject(ChatService);
    userService = TestBed.inject(UserService);
    const addDocSpy = jasmine.createSpy('addDoc').and.returnValue(of([]));
    const getUser = spyOn(userService, 'getUser').and.returnValue(of(mockUsers[0]));
    const newRoom: Omit<ChatRoom, 'roomId'> = {
      members: [firebaseMock.currentUser.uid],
      ownerId: firebaseMock.currentUser.uid,
      restrictions: 'public-group',
      roomName: mockUsers[0].username + '\'s public group'
    };
    const result$ = service.createPublicGroup(firebaseMock.currentUser.uid, collectionSpy, addDocSpy, updateDocSpy);
    result$.subscribe(() => {
      expect(getUser).toHaveBeenCalledWith(firebaseMock.currentUser.uid);
      expect(collectionSpy).toHaveBeenCalledWith(firestoreMock, 'chatRooms');
      expect(addDocSpy).toHaveBeenCalledWith(docRef, newRoom);
    });
  });

  it('should create private group', () => {
    service = TestBed.inject(ChatService);
    userService = TestBed.inject(UserService);
    const getUser = spyOn(userService, 'getUser').and.returnValue(of(mockUsers[0]));
    const addDocSpy = jasmine.createSpy('addDoc').and.returnValue(of([]));
    const newRoom: Omit<ChatRoom, 'roomId'> = {
      members: [mockUsers[0].id],
      ownerId: mockUsers[0].id,
      restrictions: 'private-group',
      roomName: mockUsers[0].username + '\'s private group'
    };
    const result$ = service.createPrivateGroup(mockUsers[0].id, collectionSpy, addDocSpy, updateDocSpy);
    result$.subscribe(() => {
      expect(getUser).toHaveBeenCalledWith(mockUsers[0].id);
      expect(collectionSpy).toHaveBeenCalledWith(firestoreMock, 'chatRooms');
      expect(addDocSpy).toHaveBeenCalledWith(docRef, newRoom);
    }).unsubscribe();
  });

  it('should create password chat', () => {
    service = TestBed.inject(ChatService);
    userService = TestBed.inject(UserService);
    const getUser = spyOn(userService, 'getUser').and.returnValue(of(mockUsers[0]));
    const addDocSpy = jasmine.createSpy('addDoc').and.returnValue(of([]));
    const newRoom: Omit<ChatRoom, 'roomId'> = {
      members: [mockUsers[0].id],
      ownerId: mockUsers[0].id,
      restrictions: 'password-group',
      roomName: mockUsers[0].username + '\'s password protected group'
    };
    const result$ = service.createPasswordGroup(mockUsers[0].id, 'password', collectionSpy, addDocSpy, updateDocSpy);
    result$.subscribe(() => {
      expect(getUser).toHaveBeenCalledWith(mockUsers[0].id);
      expect(collectionSpy).toHaveBeenCalledWith(firestoreMock, 'chatRooms');
      expect(addDocSpy).toHaveBeenCalledWith(docRef, newRoom);
    }).unsubscribe();
  });

  it('should add user to private group', () => {
    service = TestBed.inject(ChatService);
    const userID = 'test-uid';
    const roomID = 'test-rid';
    const result$ = service.addUserToPrivateGroup(userID, roomID, docSpy, updateDocSpy);
    result$.subscribe(() => {
      expect(docSpy).toHaveBeenCalledWith(firestoreMock, 'chatRooms', roomID);
      expect(updateDocSpy).toHaveBeenCalledWith(docRef, { members: arrayUnion(userID) });
    }).unsubscribe();
  });

  it('should remove user from private group', () => {
    service = TestBed.inject(ChatService);
    const userID = 'test-uid';
    const roomID = 'test-rid';
    const result$ = service.removeUserFromPrivateGroup(userID, roomID, docSpy, updateDocSpy);
    result$.subscribe(() => {
      expect(docSpy).toHaveBeenCalledWith(firestoreMock, 'chatRooms', roomID);
      expect(updateDocSpy).toHaveBeenCalledWith(docRef, { members: arrayRemove(userID) });
    }).unsubscribe();
  });

  it('should get all private groups', () => {
    service = TestBed.inject(ChatService);
    const userID = 'test-uid';
    const resultRoom$ = of(mockGroups);
    const collectionDataSpy = jasmine.createSpy('collectionData').and.returnValue(resultRoom$);
    const result$ = service.getAllPrivateGroups(userID, collectionSpy, querySpy, collectionDataSpy);
    forkJoin([resultRoom$, result$]).subscribe(([colldataresult, fnresult]) => {
      expect(collectionSpy).toHaveBeenCalledWith(firestoreMock, 'chatRooms');
      expect(querySpy).toHaveBeenCalledWith(docRef, where('restrictions', '==', 'private-group'), where('members', 'array-contains', userID));
      expect(collectionDataSpy).toHaveBeenCalledWith(queryMock, { idField: 'roomId' });
      expect(colldataresult).toEqual(fnresult);
    }).unsubscribe();
  });

  it('should get all password groups', () => {
    service = TestBed.inject(ChatService);
    const resultRoom$ = of(mockGroups);
    const collectionDataSpy = jasmine.createSpy('collectionData').and.returnValue(resultRoom$);
    const result$ = service.getAllPasswordGroups(collectionSpy, querySpy, collectionDataSpy);
    forkJoin([resultRoom$, result$]).subscribe(([colldataresult, fnresult]) => {
      expect(collectionSpy).toHaveBeenCalledWith(firestoreMock, 'chatRooms');
      expect(querySpy).toHaveBeenCalledWith(docRef, where('restrictions', '==', 'password-group'));
      expect(colldataresult).toEqual(fnresult);
    }).unsubscribe();
  });

  it('should warn if no document while validating group passowrd', async () => {
    service = TestBed.inject(ChatService);
    const roomID = 'test-rid';
    const docSnap = { exists: () => false };
    const getDocSpy = jasmine.createSpy('getDoc').and.returnValue(docSnap);
    const spy = spyOn(console, 'warn');
    const result = await service.validateGroupPassword(roomID, 'pw', docSpy, getDocSpy);
    expect(docSpy).toHaveBeenCalledWith(firestoreMock, 'chatRooms', roomID);
    expect(getDocSpy).toHaveBeenCalledWith(docRef);
    expect(spy).toHaveBeenCalledWith('No document');
    expect(result).toBeFalse();
  });

  it('should return false if password is invalid', async () => {
    service = TestBed.inject(ChatService);
    const roomID = 'tes-rid';
    const password = 'invalid-pw';
    const docSnap = {
      exists: () => true,
      data: () => { return { password: 'pw' } as { password: string } }
    }
    const getDocSpy = jasmine.createSpy('getDoc').and.returnValue(docSnap);
    const result = await service.validateGroupPassword(roomID, password, docSpy, getDocSpy);
    expect(docSpy).toHaveBeenCalledWith(firestoreMock, 'chatRooms', roomID);
    expect(getDocSpy).toHaveBeenCalledWith(docRef);
    expect(result).toBeFalse();
  });

  it('should return false if password is invalid', async () => {
    service = TestBed.inject(ChatService);
    const roomID = 'tes-rid';
    const password = 'valid-pw';
    const docSnap = {
      exists: () => true,
      data: () => { return { password: 'valid-pw' } as { password: string } }
    }
    const getDocSpy = jasmine.createSpy('getDoc').and.returnValue(docSnap);
    const result = await service.validateGroupPassword(roomID, password, docSpy, getDocSpy);
    expect(docSpy).toHaveBeenCalledWith(firestoreMock, 'chatRooms', roomID);
    expect(getDocSpy).toHaveBeenCalledWith(docRef);
    expect(result).toBeTrue();
  });

  it('should throw error if user is not authenticated', ()=>{
    TestBed.overrideProvider(Auth,{useValue: {currentUser : null}});
    service = TestBed.inject(ChatService);
    const roomID = 'test-rid';
    expect(()=>{service.addUserToPasswordAndPrivateGroup(roomID, docSpy, updateDocSpy)}).toThrowError('No logged in user');
  });

  it('should add user to group', ()=>{
    service = TestBed.inject(ChatService);
    const roomID = 'test-rid';
    const updateDocSpy = jasmine.createSpy('updateDoc').and.returnValue(of(mockGroups[0]));
    const result$ = service.addUserToPasswordAndPrivateGroup(roomID, docSpy, updateDocSpy);
    result$.subscribe(()=>{
      expect(docSpy).toHaveBeenCalledWith(firestoreMock, 'chatRooms', roomID);
      expect(updateDocSpy).toHaveBeenCalledWith(docRef, { members: arrayUnion(firebaseMock.currentUser.uid) });
    }).unsubscribe();
  });
});
