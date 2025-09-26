import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  imports: [MatButtonModule],
  templateUrl: './page-not-found.html',
  styleUrl: './page-not-found.scss'
})
export class PageNotFound {
  private router = inject(Router);

  landingPage(){
    this.router.navigateByUrl("");
  }
}
