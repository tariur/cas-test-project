import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { Home } from './pages/home/home';
import { PageNotFound } from './pages/page-not-found/page-not-found';
import { authGuard, publicGuard } from './guards/auth-guard';

export const routes: Routes = [
    {
        path: "",
        component: Landing
    },
    {
        path:"login",
        component: Login,
        canActivate: [publicGuard]
    },
    {
        path:"signup",
        component: Signup,
        canActivate: [publicGuard]
    },
    {
        path:"home",
        component: Home,
        canActivate: [authGuard]
    },
    {
        path:"**",
        component: PageNotFound
    }
];
