import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  signOut,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  OAuthProvider
} from '@angular/fire/auth';
import { onAuthStateChanged } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';


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
    });
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // Google Sign-In
  async googleSignIn() {
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
  async appleSignIn() {
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      
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

  logout() {
    return signOut(this.auth);
  }
}
