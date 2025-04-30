import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { LocalNotifications } from '@capacitor/local-notifications';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SettingsPage implements OnInit {
  notificationsEnabled = false;
  username: string = '';
  uid: string | null = null;
  db = getFirestore();
  showUsernameForm = false;

  constructor(
    private router: Router,
    private toastController: ToastController
  ) {}

  toggleUsernameForm() {
    this.showUsernameForm = !this.showUsernameForm;
  }  

  async ngOnInit() {
    // Load notification status
    this.listenToNotificationClicks();
    const permissionStatus = await LocalNotifications.checkPermissions();
    this.notificationsEnabled = permissionStatus.display === 'granted';

    const savedStatus = localStorage.getItem('notificationsEnabled');
    if (savedStatus !== null) {
      this.notificationsEnabled = this.notificationsEnabled && JSON.parse(savedStatus);
    }

    // Load current username
    const user = getAuth().currentUser;
    if (user) {
      this.uid = user.uid;
      const userDoc = await getDoc(doc(this.db, 'users', this.uid));
      if (userDoc.exists()) {
        this.username = userDoc.data()?.['username'] || '';
      }
    }

    this.listenToNotificationClicks();
  }

  async saveUsername() {
    if (!this.uid) return;

    await setDoc(doc(this.db, 'users', this.uid), {
      username: this.username
    }, { merge: true });

    this.showToast('Username saved!');
    this.showUsernameForm = false;
  }

  async toggleNotifications() {
    const permission = await LocalNotifications.requestPermissions();

    if (permission.display !== 'granted') {
      this.showToast('Notification permission denied');
      
      const request = await LocalNotifications.requestPermissions();

      if (request.display !== 'granted') {
        this.notificationsEnabled = false;
        localStorage.setItem('notificationsEnabled', 'false');
        this.showToast('Please enable notifications in browser/device settings.');
        return;
      }
    }

    if (this.notificationsEnabled) {
      await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
      this.notificationsEnabled = false;
      this.showToast('Notifications Disabled');
    } else {
      await this.scheduleDailyNotification();

      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Oi Lingo - Palavra de hoje!',
            body: 'Check out today\'s word right now!',
            id: Date.now(), // Use unique ID for immediate one
            schedule: {
              at: new Date(new Date().getTime() + 1000) // 1 second from now
            },
            sound: 'default'
          }
        ]
      });
      
      this.notificationsEnabled = true;
      this.showToast('Notifications Enabled');
    }
  
    localStorage.setItem('notificationsEnabled', JSON.stringify(this.notificationsEnabled));;
  }

  async scheduleDailyNotification() {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Oi Lingo - New Palavra!',
          body: 'Tap to see today\'s new word!',
          id: 1,
          schedule: {
            every: 'day',
            on: { hour: 10, minute: 0 }
          },
          sound: 'default'
        }
      ]
    });
  }
  
  
  listenToNotificationClicks() {
    LocalNotifications.addListener('localNotificationActionPerformed', (event) => {
      this.router.navigate(['/lesson']);
    });
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }

  sendTestNotification() {
    console.log('Notification.permission:', Notification.permission);
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Oi Lingo - Test', {
          body: 'This is a test notification!'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Oi Lingo - Test', {
              body: 'Thanks for allowing notifications!'
            });
          } else {
            this.showToast('Please enable notifications in your browser settings.');
          }
        });
      } else {
        this.showToast('Notifications are blocked. Enable them in Chrome site settings.');
      }
    } else {
      this.showToast('Your browser does not support notifications.');
    }
  }
  
}
