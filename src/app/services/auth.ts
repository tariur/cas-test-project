import { Injectable, inject } from '@angular/core';
import { signInWithEmailAndPassword, Auth as FirebaseAuth, createUserWithEmailAndPassword, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { Auth as FirebaseAuthToken } from '@angular/fire/auth';
import { UserService } from './user-service';
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
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  googleSignIn(){
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  signOutUser(){
    const user = this.auth.currentUser;
    this.userService.changeStatusOffline(user?.uid || '');
    signOut(this.auth).then(()=>{
      console.log('user signed out');
    }).catch((error)=>{
      console.error('signout error:', error.message);
    });
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
