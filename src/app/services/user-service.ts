import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection, addDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  constructor(private firestore:Firestore){}

  async createUserData(email:string){
    try{
      const docRef = await addDoc(collection(this.firestore, "users"),{
        email: email,
        username: email,
        avatarURL: "",
        online: false
      });
      console.log("Document added to firestore, ID:", docRef.id);
    }catch(e){
      console.error("Error adding doc:", e);
    }
  }



}
