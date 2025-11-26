import { ComponentFixture, TestBed } from '@angular/core/testing';

import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatTabGroupHarness} from '@angular/material/tabs/testing';

import { Home } from './home';
import { of } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { UserService } from '../../services/user-service';
import { ChatService } from '../../services/chat-service';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { User } from '../../model/User';
import { ChatRoom } from '../../model/ChatRoom';
import { By } from '@angular/platform-browser';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let loader: HarnessLoader;

  const mockUsers:User[] = [
    { id: '1', username: 'User1', email:'user1@mail.com', online:true, avatarURL:'' },
    { id: '2', username: 'User2', email:'user2@mail.com', online:true, avatarURL:'' },
    { id: '3', username: 'User3', email:'user3@mail.com', online:true, avatarURL:'' },
    { id: '4', username: 'User4', email:'user4@mail.com', online:true, avatarURL:'' }
  ];
  const mockGroups:ChatRoom[] = [
    { members:['1', '2', '3'], ownerId:'1', restrictions:'public', roomId:'r1', roomName:'Room1'},
    { members:['1', '2', '3'], ownerId:'1', restrictions:'public', roomId:'r2', roomName:'Room2'},
    { members:['1', '2', '3'], ownerId:'1', restrictions:'public', roomId:'r3', roomName:'Room3'},
    { members:['1', '2', '3'], ownerId:'1', restrictions:'public', roomId:'r4', roomName:'Room4'},
  ];
  const mockAuth = {
    currentUser: { uid: 'abc123' }
  };
  const mockUserService = {
    getUser: (id:string) => of({id, username: 'User5'}),
    getAllUsers: () => of(mockUsers),
    getOnlineUsers: () => of(mockUsers)
  };
  const mockChatService = {
    getAllPrivateGroups: () => of(mockGroups),
    getAllPublicGroups: () => of(mockGroups),
    getAllPasswordGroups: () => of(mockGroups)
  };
  const mockRouter = {
    navigateByUrl: jasmine.createSpy('navigateByUrl')
  };

  beforeEach(() =>{
    TestBed.configureTestingModule({
      imports: [Home, TranslateModule.forRoot()],
      providers: [
        {provide: Auth, useValue: mockAuth},
        {provide: UserService, useValue: mockUserService},
        {provide: ChatService, useValue: mockChatService},
        {provide: Router, useValue: mockRouter}
      ]
    });
    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () =>{
    expect(component).toBeTruthy();
  });

  it('should welcome user', async ()=>{
    await fixture.whenStable();
    const content = fixture.nativeElement.querySelector('.welcome').textContent;
    expect(content).toContain('app.home.greet');
    expect(content).toContain('User5');
  });

  it('should show signout', ()=>{
    const content = fixture.nativeElement.querySelector('.signout').textContent;
    expect(content).toContain('app.home.signout');
  });

  /* Doesn't work yet, it needs Angular Material harnesses

  it('should render allUsers', async ()=>{
    component.allUsers$ = of(mockUsers);
    fixture.detectChanges();

    const sidenavLoader = await loader.getChildLoader('.sidenav');
    const sidenavTab = await sidenavLoader.getAllHarnesses(MatTabGroupHarness);
    const allUsersTab = await loader.getHarness(MatTabGroupHarness);
    const listItems = allUsersTab[0].queryAll(By.css('mat-list-item'));
    listItems.forEach((item, index) =>{
      const button = item.query(By.css('button'));
      expect(button.nativeElement.textContent).toContain(mockUsers[index].username);
    });
  });
  */

});
