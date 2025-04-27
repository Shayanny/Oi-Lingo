import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { LocalNotifications } from '@capacitor/local-notifications';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SettingsPage implements OnInit {


  constructor(private router: Router, private toastController: ToastController) {
    this.listenToNotificationClicks();
  }

  notificationsEnabled = false;

  async toggleNotifications() {
    if (this.notificationsEnabled) {
      // Turn OFF
      await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
      console.log('Notifications turned OFF');
      this.showToast('Notifications Disabled');
    } else {
      // Turn ON
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display === 'granted') {
        await this.scheduleDailyNotification();
        console.log('Notifications turned ON');
        this.showToast('Notifications Enabled');
      } else {
        console.log('Permission denied.');
        return;
      }
    }

    this.notificationsEnabled = !this.notificationsEnabled;
    localStorage.setItem('notificationsEnabled', JSON.stringify(this.notificationsEnabled)); // Save status
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }


  listenToNotificationClicks() {
    LocalNotifications.addListener('localNotificationActionPerformed', (event) => {
      console.log('Notification clicked', event);
      this.router.navigate(['/lesson']);
    });
  }

  ngOnInit() {
    const savedStatus = localStorage.getItem('notificationsEnabled');
    if (savedStatus !== null) {
      this.notificationsEnabled = JSON.parse(savedStatus);
    }
  }

  async enableNotifications() {
    const permission = await LocalNotifications.requestPermissions();

    if (permission.display === 'granted') {
      console.log('Notifications permission granted!');
      this.scheduleDailyNotification();
    } else {
      console.log('Notifications permission denied.');
    }
  }

  async scheduleDailyNotification() {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Oi Lingo - New Palavra!',
          body: 'Tap to see today\'s new word!',
          id: 1,
          schedule: {
            every: 'day', // Repeat every day
            on: {
              hour: 10,
              minute: 0
            }
          },
          sound: 'default', // Make sure user hears it
        }
      ]
    });
  }



}
