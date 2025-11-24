import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSelector } from '../language-selector/language-selector';

@Component({
  selector: 'app-page-not-found',
  imports: [
    MatButtonModule,
    TranslatePipe,
    LanguageSelector
  ],
  templateUrl: './page-not-found.html',
  styleUrl: './page-not-found.scss'
})
export class PageNotFound {
  private router = inject(Router);

  landingPage(){
    this.router.navigateByUrl("");
  }
}
