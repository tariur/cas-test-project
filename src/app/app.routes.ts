import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { Home } from './pages/home/home';
import { PageNotFound } from './pages/page-not-found/page-not-found';

export const routes: Routes = [
    {
        path: "",
        component: Landing
    },
    {
        path:"login",
        component: Login
    },
    {
        path:"signup",
        component: Signup
    },
    {
        path:"home",
        component: Home
    },
    {
        path:"**",
        component: PageNotFound
    }
];
