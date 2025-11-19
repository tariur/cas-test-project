import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import {provideHttpClient} from "@angular/common/http";
import {provideTranslateService} from "@ngx-translate/core";
import {provideTranslateHttpLoader} from "@ngx-translate/http-loader";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), provideFirebaseApp(() => initializeApp({
      apiKey: "AIzaSyAc8h8jqZ1OZ0GlDRvgcXkcIHdOOUoYws0",
      authDomain: "cas-chat-app-df45a.firebaseapp.com",
      projectId: "cas-chat-app-df45a",
      storageBucket: "cas-chat-app-df45a.firebasestorage.app",
      messagingSenderId: "782939595753",
      appId: "1:782939595753:web:7e72fed873f75ce9e22178"
    })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()),
    provideHttpClient(),
    provideTranslateService({
      lang: localStorage.getItem("language") || 'en',
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader({
        prefix: '/i18n/',
        suffix: '.json'
      })
    }),
  ]
};
