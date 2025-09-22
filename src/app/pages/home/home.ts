import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import { Auth } from '../../services/auth';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit{

  username:string | null = null;

  constructor(private authService:Auth, private router:Router, private userService:UserService){}

  async ngOnInit(){
    this.username = await this.userService.fetchUsername();
  }


  //Routes to landing component
  signout(){
    this.authService.signOutUser();
    this.router.navigateByUrl('');
  }
}
