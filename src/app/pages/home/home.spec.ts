import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';

import { Home } from './home';
import { of } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { UserService } from '../../services/user-service';
import { ChatService } from '../../services/chat-service';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { User } from '../../model/User';
import { MockUsers } from '../../mocks/MockUsers';
import { MockGroups } from '../../mocks/MockGroups';
import { MockUserService } from '../../mocks/MockUserService';
import { MockChatService } from '../../mocks/MockChatService';
import { MockAuth } from '../../mocks/MockAuth';
import { MockMessage } from '../../mocks/MockMessage';
import { MatDialog } from '@angular/material/dialog';
import { ChangeUsernameDialog } from './change-username-dialog/change-username-dialog';
import { CreateGroupPasswordDialog } from './create-group-password-dialog/create-group-password-dialog';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let loader: HarnessLoader;

  //-------mock data and services-------
  const mockUsersData = new MockUsers().getMockUsers();
  const mockGroupsData = new MockGroups().getMockGroups();
  const mockMessagesData = new MockMessage().getMockMessages();
  const mockUserService = new MockUserService(mockUsersData);
  const mockChatService = new MockChatService(mockGroupsData, mockMessagesData);
  const mockAuth = new MockAuth('abc123');
  const mockRouter = {
    navigateByUrl: jasmine.createSpy('navigateByUrl')
  };
  const dialogRefSpy = jasmine.createSpyObj({afterClosed: of([])});
  const dialogSpy = jasmine.createSpyObj({open: dialogRefSpy});
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Home, TranslateModule.forRoot()],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: UserService, useValue: mockUserService },
        { provide: ChatService, useValue: mockChatService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    });
    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  //--Resetting the TestBed and configuring with wrong data, so ngOninit throws error (home.ts 78). But surely there is a better way to do this--
  it('should throw error when user not authenticated', () => {
    const mockAuth = { currentUser: null };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [Home, TranslateModule.forRoot()],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: UserService, useValue: mockUserService },
        { provide: ChatService, useValue: mockChatService },
        { provide: Router, useValue: mockRouter }
      ]
    });
    const tempFixture = TestBed.createComponent(Home);
    expect(() => { tempFixture.detectChanges(); }).toThrowError();
  });
  //----------------------------------------------------------------------------------------------------------------------------------------------

  it('should welcome user', async () => {
    await fixture.whenStable();
    const content = fixture.nativeElement.querySelector('.welcome').textContent;
    expect(content).toContain('app.home.greet');
    expect(content).toContain('User5');
  });

  it('should show signout', () => {
    const content = fixture.nativeElement.querySelector('.signout').textContent;
    expect(content).toContain('app.home.signout');
  });

  it('should render allUsers', async () => {
    component.allUsers$ = of(mockUsersData);
    fixture.detectChanges();

    const buttons = await loader.getAllHarnesses(MatButtonHarness.with({ selector: '.allUsersButtons' }));
    expect(buttons.length).toBe(mockUsersData.length);
    for (let i = 0; i < mockUsersData.length; i++) {
      expect(await buttons[i].getText()).toBe('person' + mockUsersData[i].username);
    }
  });

  it('should render onlineUsers', async () => {
    const onlineUsers: User[] = [];
    mockUsersData.forEach(user => {
      if (user.online) {
        onlineUsers.push(user);
      }
    });
    component.onlineUsers$ = of(onlineUsers);
    fixture.detectChanges();
    const buttons = await loader.getAllHarnesses(MatButtonHarness.with({ selector: '.online-user-button' }));
    expect(buttons.length).toBe(onlineUsers.length);
    for (let i = 0; i < onlineUsers.length; i++) {
      expect(await buttons[i].getText()).toBe('person' + onlineUsers[i].username);
    }
  });

  it('should close chat', () => {
    component.chatCloseChildEvent();
    expect(component.selectedRoom$).toBe(null);
  });

  it('should open private chat', fakeAsync(() => {
    const findPrivateChatSpy = spyOn(mockChatService, 'findPrivateChat');
    component.openPrivateChat('abc123');
    expect(component.isLoading).withContext('isLoading').toBeTrue();
    expect(component.selectedRoom$).withContext('selectedRoom$').toBe(null);
    tick(301);
    expect(component.isLoading).withContext('isLoading').toBeFalse();
    expect(findPrivateChatSpy.calls.any()).withContext('findPrivateChat called').toBeTrue();
  }));

  it('should open group chat', fakeAsync(() => {
    const fetchRoomByIdSpy = spyOn(mockChatService, 'fetchRoomById');
    const addUserToPasswordAndPrivateGroupSpy = spyOn(mockChatService, 'addUserToPasswordAndPrivateGroup');
    component.openGroup('roomId');
    expect(component.isLoading).withContext('isLoading').toBeTrue();
    expect(component.selectedRoom$).withContext('selectedRoom$').toBe(null);
    tick(301);
    expect(component.isLoading).withContext('isLoading').toBeFalse();
    expect(addUserToPasswordAndPrivateGroupSpy.calls.any()).withContext('addUserToPasswordAndPrivateGroup called').toBeTrue();
    expect(fetchRoomByIdSpy.calls.any()).withContext('fetchRoomById called').toBeTrue();
  }));

  it('should create public chat', fakeAsync(() => {
    const createPublicGroupSpy = spyOn(mockChatService, 'createPublicGroup');
    component.createPublicGroup();
    expect(component.isLoading).withContext('isLoading').toBeTrue();
    expect(component.selectedRoom$).withContext('selectedRoom$').toBe(null);
    tick(301);
    expect(component.isLoading).withContext('isLoading').toBeFalse();
    expect(createPublicGroupSpy.calls.any()).withContext('createPublicGroup called').toBeTrue();
  }));

  it('should create private chat', fakeAsync(()=>{
    const createPrivateGroupSpy = spyOn(mockChatService, 'createPrivateGroup');
    component.createPrivateGroup();
    expect(component.isLoading).withContext('isLoading').toBeTrue();
    expect(component.selectedRoom$).withContext('seletedRoom$').toBe(null);
    tick(301);
    expect(component.isLoading).withContext('isLoading').toBeFalse();
    expect(createPrivateGroupSpy.calls.any()).withContext('createPrivateGroup called').toBeTrue();
  }));

  it('should create password chat', fakeAsync(()=>{
    const createPasswordGroupSpy = spyOn(mockChatService, 'createPasswordGroup');
    const pw = '';
    component.createPasswordGroup(pw);
    expect(component.isLoading).withContext('isLoading').toBeTrue();
    expect(component.selectedRoom$).withContext('selectedRoom$').toBe(null);
    tick(301);
    expect(component.isLoading).withContext('isLoading').toBeFalse();
    expect(createPasswordGroupSpy.calls.any()).withContext('createPasswordGroup called').toBeTrue();
  }));

  it('should open change username dialog', ()=>{
    component.openChangeUsernameDialog();
    expect(dialogSpy.open).toHaveBeenCalledWith(ChangeUsernameDialog, {width:'300px'});
    expect(dialogRefSpy.afterClosed).toHaveBeenCalled();
  });

  //--Why does the test coverage show that the tests ran successfully for lines:[home.ts 139-141], when I only wrote expect() for line:[home.ts 136]?--
  it('should open create password dialog', ()=>{
    component.openPasswordGroupDialog();
    expect(dialogSpy.open).toHaveBeenCalledWith(CreateGroupPasswordDialog, {width:'300px'});
  });
});
