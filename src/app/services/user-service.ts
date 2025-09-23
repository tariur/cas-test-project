import { Injectable } from '@angular/core';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { collection, getDocs, query, where, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { Auth as FirebaseAuth} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { User } from '../model/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  constructor(private firestore:Firestore, private firebaseAuth:FirebaseAuth){}

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

  async fetchUsername():Promise<string | null>{
    const user = this.firebaseAuth.currentUser;
    if(!user) return null;
    const userDocRef = doc(this.firestore, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);
    if(userSnap.exists()){
      const data = userSnap.data();
      return data['username'] as string;
    }else{
      console.warn('User document does not exist');
      return null;
    }
  }

  async updateUsername(newUsername: string): Promise<void>{
    const user = this.firebaseAuth.currentUser;
    if(!user) throw new Error('No user logged in');
    const userDocRef = doc(this.firestore, 'users', user.uid);
    await updateDoc(userDocRef, {username: newUsername});
  }

  getAllUsers():Observable<User[]>{
    const usersRef = collection(this.firestore, 'users');
    return collectionData(usersRef, {idField: 'id'}) as Observable<User[]>;
  }

  getOnlineUsers():Observable<User[]>{
    const userRef = collection(this.firestore, 'users');
    const q = query(userRef, where("online", "==", true));
    return collectionData(q, {idField: 'id'}) as Observable<User[]>;
  }
  
}
