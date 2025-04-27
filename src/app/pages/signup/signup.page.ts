import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonButton, IonInput, IonLabel } from '@ionic/angular/standalone';
import { Auth, createUserWithEmailAndPassword, UserCredential } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [IonButton, IonItem, IonContent, IonInput, IonLabel, CommonModule, FormsModule]
})
export class SignupPage {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  emailValid: boolean = true;
  passwordValid: boolean = true;

  constructor(
    private auth: Auth,
    private router: Router,
    private alertController: AlertController
  ) {}

  async signup(): Promise<UserCredential | void> {
    // Validate inputs
    if (!this.validateInputs()) return;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );
      this.router.navigate(['/home']);
      return userCredential;
    } catch (error: any) {
      await this.handleAuthError(error);
      throw error;
    }
  }

  private validateInputs(): boolean {
    this.emailValid = this.isValidEmail(this.email);
    this.passwordValid = this.isValidPassword(this.password);

    if (!this.emailValid) {
      this.showAlert('Invalid Email', 'Please enter a valid email address');
      return false;
    }

    if (!this.passwordValid) {
      this.showAlert('Weak Password', 'Password must be at least 6 characters');
      return false;
    }

    if (this.password !== this.confirmPassword) {
      this.showAlert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private isValidPassword(password: string): boolean {
    return password.length >= 6;
  }

  private async handleAuthError(error: any) {
    let errorMessage = 'Signup failed. Please try again.';
    
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address';
        this.emailValid = false;
        break;
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already registered';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password should be at least 6 characters';
        this.passwordValid = false;
        break;
      default:
        errorMessage = error.message || errorMessage;
    }

    await this.showAlert('Signup Failed', errorMessage);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Real-time validation
  validateEmail() {
    this.emailValid = this.isValidEmail(this.email);
  }

  validatePassword() {
    this.passwordValid = this.isValidPassword(this.password);
  }
}