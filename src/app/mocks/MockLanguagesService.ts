/* eslint-disable @typescript-eslint/no-unused-vars */
import { of } from "rxjs";

export class MockLanguagesService{
    getTranslate(path:string){
        return of([]);
    }
}