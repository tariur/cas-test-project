import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatWindow } from './chat-window';
import { MockUsers } from '../../../mocks/MockUsers';
import { MockGroups } from '../../../mocks/MockGroups';
import { MockUserService } from '../../../mocks/MockUserService';
import { MockChatService } from '../../../mocks/MockChatService';
import { MockMessage } from '../../../mocks/MockMessage';
import { MockAuth } from '../../../mocks/MockAuth';
import { UserService } from '../../../services/user-service';
import { ChatService } from '../../../services/chat-service';
import { Auth, Auth as FirebaseAuthService } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentRef } from '@angular/core';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DeleteChatDialog } from './delete-chat-dialog/delete-chat-dialog';
import { MockLanguagesService } from '../../../mocks/MockLanguagesService';
import { LanguagesService } from '../../../services/languages-service';
import { ChangeChatnameDialog } from './change-chatname-dialog/change-chatname-dialog';

describe('ChatWindow', () => {
  let component: ChatWindow;
  let componentRef: ComponentRef<ChatWindow>;
  let fixture: ComponentFixture<ChatWindow>;
  let loader: HarnessLoader;

  const mockUsersData = new MockUsers().getMockUsers();
  const mockGroupsData = new MockGroups().getMockGroups();
  const mockMessagesData = new MockMessage().getMockMessages();
  const mockUsersService = new MockUserService(mockUsersData);
  const mockChatService = new MockChatService(mockGroupsData, mockMessagesData);
  const mockLanguagesService = new MockLanguagesService();
  const mockAuth = new MockAuth('abc123');
  const mockRouter = { navigateByUrl: jasmine.createSpy('navigateByUrl') };
  const dialogRefSpy = jasmine.createSpyObj({ afterClosed: of(true) });
  const dialogSpy = jasmine.createSpyObj({ open: dialogRefSpy });


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatWindow, TranslateModule.forRoot()],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: UserService, useValue: mockUsersService },
        { provide: ChatService, useValue: mockChatService },
        { provide: FirebaseAuthService, useValue: mockAuth },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: LanguagesService, useValue: mockLanguagesService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatWindow);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('allUsers$', of(mockUsersData));
    componentRef.setInput('selectedRoom$', of(mockGroupsData[0]));
    loader = TestbedHarnessEnvironment.loader(fixture)
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close chatroom for user if kicked out', async () => {
    const closeChatSpy = spyOn(component, 'handleCloseChat');
    componentRef.setInput('selectedRoom$', of(mockGroupsData[1]));
    component.ngOnInit();
    expect(closeChatSpy.calls.any()).withContext('handleCloseChat called').toBeTrue();
  });

  it('should navigate user if not authenticated', async () => {
    const mockAuth = { currentUser: null };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ChatWindow, TranslateModule.forRoot()],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: UserService, useValue: mockUsersService },
        { provide: ChatService, useValue: mockChatService },
        { provide: Router, useValue: mockRouter }
      ]
    });
    TestBed.compileComponents();
    fixture = TestBed.createComponent(ChatWindow);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('allUsers$', of(mockUsersData));
    componentRef.setInput('selectedRoom$', of(mockGroupsData[0]));
    fixture.detectChanges();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('**');
  });

  it('should render room name', async () => {
    const button = await loader.getHarness(MatButtonHarness.with({ selector: '.room-name' }));
    expect(await button.getText()).toBe(mockGroupsData[0].roomName);
  });

  it('should call sendMessage on (click)', async () => {
    const sendMessageSpy = spyOn(component, 'sendMessage');
    const button = await loader.getHarness(MatButtonHarness.with({ selector: '.send-button' }));
    await button.click();
    expect(sendMessageSpy).toHaveBeenCalled();
  });

  it('shouldn\'t send message with only whitespace characters', () => {
    component.newMessage = '  ';
    component.sendMessage();
    expect(component.newMessage).toEqual('');
    component.newMessage = '  ';
    component.sendMessage();
    expect(component.newMessage).toEqual('');
  });

  it('should send message', () => {
    component.newMessage = 'testmessage';
    component.currentUser$ = of(mockUsersData[0]);
    const createMessageSpy = spyOn(mockChatService, 'createMessage').and.callThrough();
    const scrollSpy = spyOn(component, 'scrollToBottom');
    component.sendMessage();
    expect(createMessageSpy).toHaveBeenCalledWith(mockGroupsData[0].roomId, { content: 'testmessage', senderId: '1', senderName: 'User1' });
    expect(scrollSpy).toHaveBeenCalled();
  });

  it('should send message with Enter key', () => {
    const spy = spyOn(component, 'sendMessage');
    component.sendWithEnter(new KeyboardEvent('keyup', { key: 'Enter' }));
    expect(spy).toHaveBeenCalled();
  });

  it('should call deleteChat on click', async () => {
    const spy = spyOn(component, 'deleteChat');
    const button = await loader.getHarness(MatButtonHarness.with({ selector: '#delete-chat' }));
    await button.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should delete chat', () => {
    component.currentUserId = '1'; //currentUserId == currentRoom.ownerId
    component.currentRoom = mockGroupsData[0];
    component.deleteChat();
    expect(dialogSpy.open).toHaveBeenCalledWith(DeleteChatDialog, { width: '300px', data: component.currentRoom.roomId });
    component.currentUserId = 'notOwnerId';
    const spy = spyOn(mockLanguagesService, 'getTranslate').and.callThrough();
    component.deleteChat();
    expect(spy).toHaveBeenCalledWith('app.error.room-delete-restricted');
  });

  it('should call changeChatName on click', async () => {
    const spy = spyOn(component, 'changeChatName');
    const button = await loader.getHarness(MatButtonHarness.with({ selector: '.room-name' }));
    await button.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should change chat name', () => {
    component.currentUserId = '1'; //currentUserId == currentRoom.ownerId
    component.currentRoom = mockGroupsData[0];
    component.changeChatName();
    expect(dialogSpy.open).toHaveBeenCalledWith(ChangeChatnameDialog, { width: '300px', data: component.currentRoom.roomId });
    component.currentUserId = 'notOwnerId';
    const spy = spyOn(mockLanguagesService, 'getTranslate').and.callThrough();
    component.changeChatName();
    expect(spy).toHaveBeenCalledWith('app.error.room-namechange-restricted');
  });

  it('should add user to private group', () => {
    component.memberUsers$ = of(mockUsersData);
    component.currentRoom = mockGroupsData[0];
    const translateSpy = spyOn(mockLanguagesService, 'getTranslate').and.callThrough();
    component.addUserToPrivateGroup('abc123');
    expect(translateSpy).toHaveBeenCalledWith('app.error.user-already-member');
    const addUserSpy = spyOn(mockChatService, 'addUserToPrivateGroup').and.callThrough();
    component.addUserToPrivateGroup('5');
    expect(addUserSpy).toHaveBeenCalledWith('5', component.currentRoom.roomId);
    expect(translateSpy).toHaveBeenCalledWith('app.error.user-added');
  });
});
