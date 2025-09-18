import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router} from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(Auth);
  const userState = authService.isUserSignedIn();
  if(!userState){
    const loginPath = router.parseUrl("/login");
    return new RedirectCommand(loginPath)
  }
  return true;
};

export const publicGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(Auth);
  const userState = authService.isUserSignedIn();
  if(userState){
    const loginPath = router.parseUrl("/home");
    return new RedirectCommand(loginPath)
  }
  return true;
};
