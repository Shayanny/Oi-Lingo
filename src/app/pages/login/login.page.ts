import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonItem } from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonItem, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class LoginPage {

  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  async login() {
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/home']); // Navigate to Home page after successful login
    } catch (error) {
      console.error('Login failed:', error);
      //  toast or alert here if login fails
    }
  }


}
