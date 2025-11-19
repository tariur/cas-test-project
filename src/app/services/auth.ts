import { Injectable, inject } from '@angular/core';
import { signInWithEmailAndPassword, Auth as FirebaseAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut, FacebookAuthProvider } from 'firebase/auth';
import { Auth as FirebaseAuthToken } from '@angular/fire/auth';
import { UserService } from './user-service';
import { from } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class Auth {
  private auth: FirebaseAuth = inject(FirebaseAuthToken)
  private userService: UserService = inject(UserService);

  login(email:string, password:string){
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  signup(email:string, password:string){
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  googleSignIn(){
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  facebookSignIn(){
    const provider = new FacebookAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  async signOutUser(){
    const user = this.auth.currentUser;
    await this.userService.changeStatusOffline(user?.uid || '');

    try{
      await signOut(this.auth);
    }
    catch(error:unknown){
      console.error('signout error:', (error instanceof Error ? error.message : String(error)));
    }
  }

  isUserSignedIn():boolean{
    const user = this.auth.currentUser;
    if(user){
      console.log('user is signed in');
      return true;
    }else{
      console.log('user is not signed in');
      return false;
    }
  }

}
