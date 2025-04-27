import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  OAuthProvider,
  getRedirectResult,
  createUserWithEmailAndPassword
} from '@angular/fire/auth';
import { onAuthStateChanged } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { browserSessionPersistence, setPersistence } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser$ = new BehaviorSubject<User | null>(null);

  constructor(
    private auth: Auth,
    private platform: Platform,
    private router: Router
  ) {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser$.next(user);
      if (user) this.router.navigate(['/home']);
    });

    if (Capacitor.isNativePlatform()) {
      this.handleRedirectResult();
    }
  }

  private async handleRedirectResult() {
    try {
      const result = await getRedirectResult(this.auth);
      if (result?.user) {
        this.router.navigate(['/home']);
      }
    } catch (error) {
      console.error('Redirect error:', error);
    }
  }

  async login(email: string, password: string) {
    await setPersistence(this.auth, browserSessionPersistence);
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // Google Sign-In
  async googleSignIn(): Promise<UserCredential | void> {
    try {
      const provider = new GoogleAuthProvider();
      
      // Use redirect on mobile, popup on web
      if (this.platform.is('mobile') && !this.platform.is('desktop')) {
        await signInWithRedirect(this.auth, provider);
      } else {
        const result = await signInWithPopup(this.auth, provider);
        this.router.navigate(['/home']);
        return result;
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  // Apple Sign-In
  async appleSignIn(): Promise<UserCredential | void> {
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      
      // iOS-specific optimization
    if (this.platform.is('ios')) {
      provider.setCustomParameters({
        prompt: 'select_account' // Forces account selection
      });
    }

      if (this.platform.is('mobile')) {
        await signInWithRedirect(this.auth, provider);
      } else {
        const result = await signInWithPopup(this.auth, provider);
        this.router.navigate(['/home']);
        return result;
      }
    } catch (error) {
      console.error('Apple sign-in error:', error);
      throw error;
    }
  }

  async signup(email: string, password: string, name: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return userCredential;
    } catch (error) {
      throw error;
    }
  }
  logout() {
    return signOut(this.auth);
  }
}
