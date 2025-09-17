import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  constructor(private router:Router){}

  //Routes to landing component
  signout(){
    this.router.navigateByUrl('');
  }
}
