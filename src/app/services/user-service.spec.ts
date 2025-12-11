import { TestBed } from '@angular/core/testing';
import { UserService } from './user-service';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { where } from 'firebase/firestore';

describe('UserService', () => {
  let service: UserService;
  let firestoreMock: { type: string; };
  let firebaseMock: {currentUser : { uid:string }};

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-constant-condition
  const mockPromise = new Promise<void>((resolve, reject) => { true ? resolve() : reject() });

  beforeEach(() => {
    firestoreMock = { type: 'firestore-mock-instance' };
    firebaseMock = { currentUser: { uid: 'test-uid' } };

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: Firestore, useValue: firestoreMock },
        { provide: Auth, useValue: firebaseMock }
      ]
    });
  });


  it('should be created', () => {
    service = TestBed.inject(UserService);
    expect(service).toBeTruthy();
  });

  it('should change status online', () => {
    service = TestBed.inject(UserService);
    const uid = 'user123';
    const docRef = 'mockDocRef';
    const docSpy = jasmine.createSpy('doc').and.returnValue(docRef);
    const updateDocSpy = jasmine.createSpy('updateDoc');
    service.changeStatusOnline(uid, docSpy, updateDocSpy);
    expect(docSpy).toHaveBeenCalledWith(firestoreMock, 'users', uid);
    expect(updateDocSpy).toHaveBeenCalledWith(docRef, { online: true });
  });

  it('should change status offline', () => {
    service = TestBed.inject(UserService);
    const uid = 'user123';
    const docRef = 'mockDocRef';
    const docSpy = jasmine.createSpy('doc').and.returnValue(docRef);
    const updateDocSpy = jasmine.createSpy('updateDoc');
    service.changeStatusOffline(uid, docSpy, updateDocSpy);
    expect(docSpy).toHaveBeenCalledWith(firestoreMock, 'users', uid);
    expect(updateDocSpy).toHaveBeenCalledWith(docRef, { online: false });
  });

  it('should fetch username by ID', async () => {
    service = TestBed.inject(UserService);
    const userId = 'user123';
    const mockUsersRef = 'mock';
    const mockUserSnap = { exists: () => true, data: () => { return { username: '' } } };
    const docSpy = jasmine.createSpy('doc').and.returnValue(mockUsersRef);
    const getDocSpy = jasmine.createSpy('getDoc').and.returnValue(mockUserSnap);
    const result = await service.fetchUsernameById(userId, docSpy, getDocSpy);
    expect(docSpy).toHaveBeenCalledWith(firestoreMock, 'users', userId);
    expect(getDocSpy).toHaveBeenCalledWith(mockUsersRef);
    expect(result).toBe('');
  });

  it('should warn user no document found', async () => {
    service = TestBed.inject(UserService);
    const userId = 'user123';
    const mockUsersRef = 'mock';
    const mockUserSnap = { exists: () => false };
    spyOn(console, 'warn');
    const docSpy = jasmine.createSpy('doc').and.returnValue(mockUsersRef);
    const getDocSpy = jasmine.createSpy('getDoc').and.returnValue(mockUserSnap);
    const result = await service.fetchUsernameById(userId, docSpy, getDocSpy);
    expect(result).toBe('');
    expect(console.warn).toHaveBeenCalledWith('User document not found');
  });

  it('should create user data', () => {
    service = TestBed.inject(UserService);
    const userId = 'user123';
    const email = 'test@email';
    const mockUsersRef = 'mock';
    const docSpy = jasmine.createSpy('doc').and.returnValue(mockUsersRef);
    const setDocSpy = jasmine.createSpy('setDoc').and.returnValue(mockPromise);
    service.createUserData(email, userId, docSpy, setDocSpy);
    expect(docSpy).toHaveBeenCalledWith(firestoreMock, 'users', userId);
    expect(setDocSpy).toHaveBeenCalledWith(mockUsersRef, { avatarURL: '', email: email, username: email, online: true, id: userId });
  });

  it('should update username', () => {
    service = TestBed.inject(UserService);
    const newUsername = 'New Username';
    const mockUserRef = 'mock';
    const docSpy = jasmine.createSpy('doc').and.returnValue(mockUserRef);
    const updateDocSpy = jasmine.createSpy('updateDoc').and.returnValue(mockPromise);
    service.updateUsername('New Username', docSpy, updateDocSpy);
    expect(docSpy).toHaveBeenCalledWith(firestoreMock, 'users', 'test-uid');
    expect(updateDocSpy).toHaveBeenCalledWith(mockUserRef, { 'username': newUsername });
  });

  it('should throw error when user is not authenticated', () => {
    const unauthMock = { currentUser: null };
    TestBed.overrideProvider(Auth, { useValue: unauthMock });
    service = TestBed.inject(UserService);
    expect(() => { service.updateUsername('New Username') }).toThrowError('No user logged in');
  });

  it('should get user', () => {
    service = TestBed.inject(UserService);
    const userId = 'test123';
    const mockDocRef = 'mock';
    const docSpy = jasmine.createSpy('doc').and.returnValue(mockDocRef);
    const docDataSpy = jasmine.createSpy('docData');
    service.getUser(userId, docSpy, docDataSpy);
    expect(docSpy).toHaveBeenCalledWith(firestoreMock, 'users', userId);
    expect(docDataSpy).toHaveBeenCalledWith(mockDocRef);
  });

  it('should get all users, except logged in user', () => {
    service = TestBed.inject(UserService);
    const mockUsersRef = 'mock';
    const mockQuery = 'mock';
    const collectionSpy = jasmine.createSpy('collection').and.returnValue(mockUsersRef);
    const querySpy = jasmine.createSpy('query').and.returnValue(mockQuery);
    const collectionDataSpy = jasmine.createSpy('collectionData');
    service.getAllUsers(collectionSpy, collectionDataSpy, querySpy);
    expect(collectionSpy).toHaveBeenCalledWith(firestoreMock, 'users');
    expect(querySpy).toHaveBeenCalledWith(mockUsersRef, where('id', '!=', 'test-uid'));
    expect(collectionDataSpy).toHaveBeenCalledWith(mockQuery, { idField: 'id' });
  });

  it('should get all users', () => {
    TestBed.overrideProvider(Auth, { useValue: { currentUser: null } });
    service = TestBed.inject(UserService);
    const mockUsersRef = 'mock';
    const collectionSpy = jasmine.createSpy('collection').and.returnValue(mockUsersRef);
    const collectionDataSpy = jasmine.createSpy('collectionData');
    service.getAllUsers(collectionSpy, collectionDataSpy);
    expect(collectionSpy).toHaveBeenCalledWith(firestoreMock, 'users');
    expect(collectionDataSpy).toHaveBeenCalledWith(mockUsersRef, { idField: 'id' });
  });

  it('should get online users, except logged in user', () => {
    service = TestBed.inject(UserService);
    const mockUsersRef = 'mock';
    const mockQuery = 'mock';
    const collectionSpy = jasmine.createSpy('collection').and.returnValue(mockUsersRef);
    const querySpy = jasmine.createSpy('query').and.returnValue(mockQuery);
    const collectionDataSpy = jasmine.createSpy('collectionData');
    service.getOnlineUsers(collectionSpy, collectionDataSpy, querySpy);
    expect(collectionSpy).toHaveBeenCalledWith(firestoreMock, 'users');
    expect(querySpy).toHaveBeenCalledWith(mockUsersRef, where('online', '==', true), where('id', '!=', 'test-uid'));
    expect(collectionDataSpy).toHaveBeenCalledWith(mockQuery, { idField: 'id' });
  });

  it('should get all online users', () => {
    TestBed.overrideProvider(Auth, { useValue: { currentUser: null } });
    service = TestBed.inject(UserService);
    const mockUsersRef = 'mock';
    const collectionSpy = jasmine.createSpy('collection').and.returnValue(mockUsersRef);
    const collectionDataSpy = jasmine.createSpy('collectionData');
    service.getOnlineUsers(collectionSpy, collectionDataSpy);
    expect(collectionSpy).toHaveBeenCalledWith(firestoreMock, 'users');
    expect(collectionDataSpy).toHaveBeenCalledWith(mockUsersRef, { idField: 'id' });
  });

  it('should return empty observable, if members.length == 1', () => {
    service = TestBed.inject(UserService);
    const result$ = service.getMembers(['owner']);
    result$.subscribe((x) => {
      expect(x).toEqual([]);
    })
  });

  it('should return empty observable, if members.length == 0', () => {
    service = TestBed.inject(UserService);
    const result$ = service.getMembers([]);
    result$.subscribe((x) => {
      expect(x).toEqual([]);
    })
  });

  it('should throw error when user is not authenticated', () => {
    TestBed.overrideProvider(Auth, { useValue: { currentUser: null } });
    service = TestBed.inject(UserService);
    expect(() => { service.getMembers(['owner', 'user1']) }).toThrowError('No user signed in');
  });

  it('should get room members, except logged in user', ()=>{
    service = TestBed.inject(UserService);
    const mockUserRef = 'mock';
    const docSpy = jasmine.createSpy('doc').and.returnValue(mockUserRef);
    const docDataSpy = jasmine.createSpy('docData');
    service.getMembers(['test-uid', 'user1', 'user2', 'user3'], docSpy, docDataSpy);
    expect(docSpy.calls.count()).toEqual(3); //getMembers should filter out 'test-uid'
    expect(docDataSpy).toHaveBeenCalledWith(mockUserRef, { idField: 'id'});
  });

});
