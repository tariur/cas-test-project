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

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let loader: HarnessLoader;

  const mockUsersData = new MockUsers().getMockUsers();
  const mockGroupsData = new MockGroups().getMockGroups();
  const mockUserService = new MockUserService(mockUsersData);
  const mockChatService = new MockChatService(mockGroupsData);
  const mockAuth = new MockAuth().getMockAuthUser();
  const mockRouter = {
    navigateByUrl: jasmine.createSpy('navigateByUrl')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Home, TranslateModule.forRoot()],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: UserService, useValue: mockUserService },
        { provide: ChatService, useValue: mockChatService },
        { provide: Router, useValue: mockRouter }
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
    expect(() => {tempFixture.detectChanges();}).toThrowError();
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

  //------This doesn't work yet, I should look into how spyOn works-------
  it('should give selectedRoom$ value', fakeAsync(() => {
    component.openPrivateChat('abc123');
    expect(component.isLoading).toBeTrue();
    expect(component.selectedRoom$).toBe(null);
    tick(301);
    fixture.detectChanges();
    expect(component.isLoading).toBeFalse();
    expect(component.selectedRoom$).not.toBeNull();
  }));

});
