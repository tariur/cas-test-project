import { inject, Injectable } from "@angular/core";
import { TranslateService, Translation, TranslationObject } from '@ngx-translate/core';
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LanguagesService{
    private translate = inject(TranslateService);
    
    public saveLanguage(id:string):void{
      this.translate.use(id);
      localStorage.setItem("language", id);
    }
    public getTranslate(key:string):Observable<Translation|TranslationObject>{
      return this.translate.get(key);
    }
}