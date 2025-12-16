import { of } from "rxjs";

export class MockLanguagesService{

    getTranslate(_:string){
        return of([]);
    }
}