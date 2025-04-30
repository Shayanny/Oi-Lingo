import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { importProvidersFrom } from '@angular/core'; 
import { FormsModule } from '@angular/forms';  
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';


// Firebase imports
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from './environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';

// Storage module for local persistence
import { IonicStorageModule } from '@ionic/storage-angular';

// Services that need to be provided at the root level
import { OpenRouterService } from './app/services/openrouter.service';
import { PortugueseTutorService } from './app/services/portuguese-tutor.service';


bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideHttpClient(),
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),

    
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),

    importProvidersFrom(FormsModule),
    importProvidersFrom(IonicStorageModule.forRoot()),
    
    // Provide services
    OpenRouterService,
    PortugueseTutorService
  ],
}).catch(err => console.error(err));
