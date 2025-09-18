import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  constructor(private firestore:Firestore){}

  async createUserData(email:string){
    if(await this.checkEmailAlreadyExists(email)){
      console.log("email already in database");
      return;
    }

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

  async checkEmailAlreadyExists(email:string):Promise<boolean>{
    const usersRef = collection(this.firestore, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }
}
