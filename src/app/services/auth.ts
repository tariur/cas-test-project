import { Injectable, inject } from '@angular/core';
import { signInWithEmailAndPassword, Auth as FirebaseAuth, createUserWithEmailAndPassword, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { Auth as FirebaseAuthToken } from '@angular/fire/auth';
@Injectable({
  providedIn: 'root'
})
export class Auth {
  private auth: FirebaseAuth = inject(FirebaseAuthToken)

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
    signOut(this.auth).then(()=>{
      console.log('user signed out');
    }).catch((error)=>{
      console.error('signout error:', error.message);
    });
  }

  getCurrentUserName(){
    const username = this.auth.currentUser;
  }

}
