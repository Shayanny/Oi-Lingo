import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { logoGoogle, logoApple } from 'ionicons/icons';
import { 
  IonContent, 
  IonButton, 
  IonItem,  
  AlertController, 
  IonIcon, 
  IonInput,
  IonText,
  IonRouterLink,
  IonButtons,
  IonFooter,
  IonApp
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonItem,
    IonIcon,
    IonInput,
    IonText,
    IonRouterLink,
    IonButtons,
    IonFooter,
    IonApp
  ]
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {
    addIcons({ logoGoogle, logoApple });
    console.log('LoginPage loaded. FormsModule is working.');
  }

  login() {
    console.log('Email entered:', this.email);
    if (!this.email || !this.email.includes('@')) {
      this.showAlert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    try {
      this.authService.login(this.email.trim(), this.password)
        .then(() => {
          this.router.navigate(['/home']); // Navigate to Home page after successful login
        })
        .catch((error: unknown) => {
          this.showAlert('Login Failed', this.getErrorMessage(error));
        });
    } catch (error: unknown) {
      this.showAlert('Login Failed', this.getErrorMessage(error));
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message.includes('invalid-credential') 
        ? 'Invalid email or password' 
        : error.message;
    }
    return 'Login failed. Please try again.';
  }

  async signInWithGoogle() {
    const alert = await this.alertController.create({
      header: 'Google Sign In',
      message: 'You will be redirected to Google for authentication',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Continue',
          handler: async () => {
            try {
              await this.authService.googleSignIn();
            } catch (error: unknown) {
              let errorMessage = 'An unknown error occurred';
              if (error instanceof Error) {
                errorMessage = error.message;
              } else if (typeof error === 'string') {
                errorMessage = error;
              }
              this.showAlert('Google Sign In Failed', errorMessage);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async signInWithApple() {
    const alert = await this.alertController.create({
      header: 'Apple Sign In',
      message: 'You will be redirected to Apple for authentication',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Continue',
          handler: async () => {
            try {
              await this.authService.appleSignIn();
            } catch (error: unknown) {
              let errorMessage = 'An unknown error occurred';
              if (error instanceof Error) {
                errorMessage = error.message;
              } else if (typeof error === 'string') {
                errorMessage = error;
              }
              this.showAlert('Apple Sign In Failed', errorMessage);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }
}