import { inject, Injectable } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguagesService{
    private translate = inject(TranslateService);
    
    public saveLanguage(id:string):void{
      this.translate.use(id);
      localStorage.setItem("language", id);
    }
}