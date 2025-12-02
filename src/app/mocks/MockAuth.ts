export class MockAuth{
    private mockAuth = { currentUser : { uid :'abc123' } }   
    getMockAuthUser(){
        return this.mockAuth;
    }
}