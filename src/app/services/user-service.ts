import { Injectable, inject } from '@angular/core';
import { collectionData, docData, Firestore } from '@angular/fire/firestore';
import { collection, query, where, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { Auth as FirebaseAuth } from '@angular/fire/auth';
import { Observable, from } from 'rxjs';
import { User } from '../model/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore);
  private firebaseAuth = inject(FirebaseAuth);

  changeStatusOnline(uid: string) {
    const docRef = doc(this.firestore, "users", uid);
    updateDoc(docRef, { online: true });
  }
  changeStatusOffline(uid: string) {
    const docRef = doc(this.firestore, "users", uid);
    updateDoc(docRef, { online: false });
  }

  async fetchUsernameById(userId: string): Promise<string> {
    const usersRef = doc(this.firestore, 'users', userId);
    const userSnap = await getDoc(usersRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      return data['username'] as string;
    } else {
      console.warn('User document not found');
      return '';
    }
  }

  //Fetch user as User object by Id
  async fetchUser(userId: string): Promise<User> {
    const userDocRef = doc(this.firestore, 'users', userId);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) {
      throw new Error('User not found!');
    }
    const data = userSnap.data();
    return {
      id: userId,
      email: data['email'],
      username: data['username'],
      online: data['online'],
      avatarURL: data['avatarUrl']
    } as User;
  }


  //---------------------Observables---------------------------

  createUserData(email: string, uid: string) {
    const docRef = doc(this.firestore, 'users', uid);
    return from(setDoc(docRef, {
      avatarURL: '',
      email: email,
      username: email,
      online: true,
      id: uid
    }));
  }

  updateUsername(newUsername: string): Observable<void> {
    const user = this.firebaseAuth.currentUser;
    if (!user) throw new Error('No user logged in');
    const docRef = doc(this.firestore, 'users', user.uid);
    return from(updateDoc(docRef, { 'username': newUsername }));
  }

  getUser(userId: string): Observable<User> {
    const docRef = doc(this.firestore, 'users', userId);
    return docData(docRef) as Observable<User>;
  }

  getAllUsers(): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');
    const user = this.firebaseAuth.currentUser;
    if (user) {
      const q = query(usersRef, where('id', '!=', user.uid))
      return collectionData(q, { idField: 'id' }) as Observable<User[]>;
    } else {
      return collectionData(usersRef, { idField: 'id' }) as Observable<User[]>;
    }

  }

  getOnlineUsers(): Observable<User[]> {
    const userRef = collection(this.firestore, 'users');
    const user = this.firebaseAuth.currentUser;
    if (user) {
      const q = query(userRef, where("online", "==", true), where('id', '!=', user.uid));
      return collectionData(q, { idField: 'id' }) as Observable<User[]>;
    }

    return collectionData(userRef, { idField: 'id' }) as Observable<User[]>;
  }

}
