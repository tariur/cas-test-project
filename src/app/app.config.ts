import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import {provideHttpClient} from "@angular/common/http";
import {provideTranslateService} from "@ngx-translate/core";
import {provideTranslateHttpLoader} from "@ngx-translate/http-loader";
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { messagesFeature, roomsFeature } from './app.state';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), provideFirebaseApp(() => initializeApp(environment.firebase)), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()),
    provideHttpClient(),
    provideTranslateService({
        lang: localStorage.getItem("language") || 'en',
        fallbackLang: 'en',
        loader: provideTranslateHttpLoader({
            prefix: '/i18n/',
            suffix: '.json'
        })
    }),
    provideStore({
        [messagesFeature.name]: messagesFeature.reducer,
        [roomsFeature.name]: roomsFeature.reducer
    }),
    provideStoreDevtools({ logOnly: !isDevMode() })
]
};
