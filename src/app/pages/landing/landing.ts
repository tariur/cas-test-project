import { Component, inject } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [MatButtonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class Landing {
  private router = inject(Router);
  
  loginPage(){
    this.router.navigateByUrl('/login');
  }
  signupPage(){
    this.router.navigateByUrl('signup');
  }

}
