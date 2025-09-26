import { inject } from '@angular/core';
import { CanActivateFn, Router} from '@angular/router';
import { Auth as FirebaseAuth } from '@angular/fire/auth';
import { authState } from '@angular/fire/auth';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const firebaseAuth = inject(FirebaseAuth);

  return authState(firebaseAuth).pipe(
    take(1),
    map(user => {
      if(!user){
        return router.createUrlTree(['/login']);
      }else{
        return true;
      }
    })
  );
};

export const publicGuard: CanActivateFn = () => {
  const router = inject(Router);
  const firebaseAuth = inject(FirebaseAuth);

  return authState(firebaseAuth).pipe(
    take(1),
    map(user => {
      if(user){
        return router.createUrlTree(['/home']);
      } else{
        return true;
      }
    })
  );
};
