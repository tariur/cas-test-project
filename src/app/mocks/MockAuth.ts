export class MockAuth{
    private currentUser = {uid:''};
    constructor(uid:string){
        this.currentUser.uid = uid;
    }
    getMockAuthUser(){
        return this.currentUser;
    }
}