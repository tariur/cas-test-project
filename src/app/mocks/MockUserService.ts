import {  Observable, of } from "rxjs";
import { User } from "../model/User";

export class MockUserService {
    private usersData:User[];
    
    constructor(usersData: User[]) {
        this.usersData = usersData;
    }
    getUser(id: string){
        return of({ id, username: 'User5' });
    }
    getAllUsers(){
        return of(this.usersData);
    }
    getOnlineUsers(){
        return of(this.usersData);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getMembers(members:string[]):Observable<User[]>{
        return of(this.usersData);
    }
}