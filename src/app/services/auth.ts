import { Injectable, inject } from '@angular/core';
import { signInWithEmailAndPassword, Auth as FirebaseAuth, createUserWithEmailAndPassword } from 'firebase/auth';
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

}
