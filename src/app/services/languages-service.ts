import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class LanguagesService{
    public saveLanguage(id:string):void{
      localStorage.setItem("language", id);
    }
}