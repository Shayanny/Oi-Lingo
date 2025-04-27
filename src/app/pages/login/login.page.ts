import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { logoGoogle, logoApple } from 'ionicons/icons';
import { IonContent,  IonButton, IonItem , IonLabel, AlertController, IonIcon} from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonItem, IonButton, IonContent,  CommonModule, FormsModule , IonLabel, IonIcon]
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
  }
  async login() {
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/home']); // Navigate to Home page after successful login
    } catch (error) {
      console.error('Login failed:', error);
      //  toast or alert here if login fails
    }
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
