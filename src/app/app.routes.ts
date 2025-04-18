import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },  {
    path: 'chatbot',
    loadComponent: () => import('./pages/chatbot/chatbot.page').then( m => m.ChatbotPage)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then( m => m.SettingsPage)
  },
  {
    path: 'lesson',
    loadComponent: () => import('./pages/lesson/lesson.page').then( m => m.LessonPage)
  },

];
