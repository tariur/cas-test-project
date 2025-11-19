import { Component, inject } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LanguagesService } from '../../services/languages-service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-language-selector',
  imports: [
    TranslatePipe,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './language-selector.html',
  styleUrl: './language-selector.scss'
})
export class LanguageSelector {
    private translate = inject(TranslateService);
  private languagesService = inject(LanguagesService);


  useLanguage(language:string):void{
    this.translate.use(language);
    this.languagesService.saveLanguage(language);
  }
}
