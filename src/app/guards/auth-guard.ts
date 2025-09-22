import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router} from '@angular/router';
import { Auth as FirebaseAuth } from '@angular/fire/auth';
import { authState } from '@angular/fire/auth';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
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

export const publicGuard: CanActivateFn = (route, state) => {
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
