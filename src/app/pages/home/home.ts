import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import { Auth } from '../../services/auth';
import { UserService } from '../../services/user-service';
import { MatDialog } from '@angular/material/dialog';
import { ChangeUsernameDialog } from './change-username-dialog/change-username-dialog';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatTabsModule} from '@angular/material/tabs';
import { User } from '../../model/User';
import {MatListModule} from '@angular/material/list';
import { CommonModule } from '@angular/common';
import {MatDividerModule} from '@angular/material/divider';


@Component({
  selector: 'app-home',
  imports: [CommonModule, MatDividerModule, MatButtonModule, MatIconModule, MatSidenavModule, MatTabsModule, MatListModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit{

  username:string | null = null;
  users: User[] = [];

  constructor(private authService:Auth, private router:Router, private userService:UserService, private dialog: MatDialog){}

  async ngOnInit(){
    this.username = await this.userService.fetchUsername();
    this.userService.getAllUsers().subscribe(users => {
      this.users=users;
    });
  }

  openChangeUsernameDialog(){
    const dialogRef = this.dialog.open(ChangeUsernameDialog, {
      width: '300px',
    });

    dialogRef.afterClosed().subscribe((newUsername) =>{
      if(newUsername){
        this.username = newUsername;
      }
    })
  }


  //Routes to landing component
  signout(){
    this.authService.signOutUser();
    this.router.navigateByUrl('');
  }
}
