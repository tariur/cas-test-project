import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection, getDocs, query, where, doc, setDoc, updateDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  constructor(private firestore:Firestore){}

  async createUserData(email:string, uid:string){
    if(await this.checkEmailAlreadyExists(email)){
      console.log("email already in database");
      return;
    }

    try{
      const docRef = doc(this.firestore, "users", uid);
      await setDoc(docRef, {
        avatarURL: "",
        email:email,
        username:email,
        online:true,
        id:uid
      });
      console.log("uid: ", uid)
      console.log("Document added to firestore, ID:", docRef.id);
    }catch(e){
      console.error("Error adding doc:", e);
    }
  }

  async changeStatusOnline(uid:string){
    console.log('changeStatusOnline param:',uid);
    const docRef = doc(this.firestore, "users", uid);
    await updateDoc(docRef, { online: true});
  }
  async changeStatusOffline(uid:string){
    console.log('changeStatusOffline param:',uid);
    const docRef = doc(this.firestore, "users", uid);
    await updateDoc(docRef, { online: false});
  }  

  async checkEmailAlreadyExists(email:string):Promise<boolean>{
    const usersRef = collection(this.firestore, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }
}
