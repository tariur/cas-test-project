import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  constructor(private authService:Auth, private router:Router){}

  //Routes to landing component
  signout(){
    this.authService.signOutUser();
    this.router.navigateByUrl('');
  }
}
