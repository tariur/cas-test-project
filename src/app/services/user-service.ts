import { Injectable, inject } from '@angular/core';
import { collectionData, docData, Firestore } from '@angular/fire/firestore';
import { collection, query, where, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { Auth as FirebaseAuth } from '@angular/fire/auth';
import { Observable, combineLatest, from, of } from 'rxjs';
import { User } from '../model/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore);
  private firebaseAuth = inject(FirebaseAuth);

  changeStatusOnline(uid: string, docFn = doc, updateDocFn = updateDoc) {
    const docRef = docFn(this.firestore, "users", uid);
    return updateDocFn(docRef, { online: true });
  }
  async changeStatusOffline(uid:string, docSpy = doc, updateDocSpy = updateDoc){
    const docRef = docSpy(this.firestore, "users", uid);
    await updateDocSpy(docRef, { online: false});
  }  

  async fetchUsernameById(userId: string, docSpy = doc, getDocSpy = getDoc): Promise<string> {
    const usersRef = docSpy(this.firestore, 'users', userId);
    const userSnap = await getDocSpy(usersRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      return data['username'] as string;
    } else {
      console.warn('User document not found');
      return '';
    }
  }

  createUserData(email: string, uid: string, docSpy = doc, setDocSpy = setDoc) {
    const docRef = docSpy(this.firestore, 'users', uid);
    return from(setDocSpy(docRef, {
      avatarURL: '',
      email: email,
      username: email,
      online: true,
      id: uid
    }));
  }

  updateUsername(newUsername: string, docSpy = doc, updateDocSpy = updateDoc): Observable<void> {
    const user = this.firebaseAuth.currentUser;
    if (!user) throw new Error('No user logged in');
    const docRef = docSpy(this.firestore, 'users', user.uid);
    return from(updateDocSpy(docRef, { 'username': newUsername }));
  }

  getUser(userId: string, docSpy = doc, docDataSpy = docData): Observable<User> {
    const docRef = docSpy(this.firestore, 'users', userId);
    return docDataSpy(docRef) as Observable<User>;
  }

  getAllUsers(collectionSpy = collection, collectionDataSpy=collectionData, querySpy = query): Observable<User[]> {
    const usersRef = collectionSpy(this.firestore, 'users');
    const user = this.firebaseAuth.currentUser;
    if (user) {
      const q = querySpy(usersRef, where('id', '!=', user.uid))
      return collectionDataSpy(q, { idField: 'id' }) as Observable<User[]>;
    } else {
      return collectionDataSpy(usersRef, { idField: 'id' }) as Observable<User[]>;
    }

  }

  getOnlineUsers(collectionSpy = collection, collectionDataSpy = collectionData, querySpy = query): Observable<User[]> {
    const userRef = collectionSpy(this.firestore, 'users');
    const user = this.firebaseAuth.currentUser;
    if (user) {
      const q = querySpy(userRef, where("online", "==", true), where('id', '!=', user.uid));
      return collectionDataSpy(q, { idField: 'id' }) as Observable<User[]>;
    }

    return collectionDataSpy(userRef, { idField: 'id' }) as Observable<User[]>;
  }

  getMembers(members: string[], docSpy = doc, docDataSpy = docData): Observable<User[]> {
    if (members.length <= 1) return of([]);
    const user = this.firebaseAuth.currentUser;
    if (!user) throw new Error('No user signed in');
    const memberDocs$ = members.filter(id => id !== user.uid).map(id => {
      const userDoc = docSpy(this.firestore, `users/${id}`);
      return docDataSpy(userDoc, { idField: 'id' }) as Observable<User>;
    });
    return combineLatest(memberDocs$);
  }

}
