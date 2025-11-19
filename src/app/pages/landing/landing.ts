import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { TranslatePipe} from '@ngx-translate/core';
import { LanguageSelector } from '../language-selector/language-selector';

@Component({
  selector: 'app-landing',
  imports: [
    LanguageSelector,
    TranslatePipe,
    MatButtonModule
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class Landing {
  private router = inject(Router);


  loginPage(){
    this.router.navigateByUrl('/login');
  }
  signupPage(){
    this.router.navigateByUrl('/signup');
  }

}
