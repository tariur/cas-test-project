import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './guards/auth-guard';


export const routes: Routes = [
    {
        path: "",
        loadComponent: () => import('./pages/landing/landing').then(m => m.Landing),
        canActivate: [publicGuard]
    },
    {
        path:"login",
        loadComponent: () => import('./pages/login/login').then(m => m.Login),
        canActivate: [publicGuard]
    },
    {
        path:"signup",
        loadComponent: () => import('./pages/signup/signup').then(m => m.Signup),
        canActivate: [publicGuard]
    },
    {
        path:"home",
        loadComponent: () => import('./pages/home/home').then(m => m.Home),
        canActivate: [authGuard]
    },
    {
        path:"statistics",
        loadComponent: () => import('./pages/statistics/statistics-component/statistics-component').then(m => m.StatisticsComponent),
        canActivate: [authGuard]
    },
    {
        path:"**",
        loadComponent: () => import('./pages/page-not-found/page-not-found').then(m => m.PageNotFound)
    }
];
