import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.page.html',
  styleUrls: ['./chatbot.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ChatbotPage {

  userInput: string = '';
  messages: { text: string; sender: 'user' | 'bot' }[] = [];

  sendMessage() {
    const text = this.userInput.trim();
    if (!text) return;

    this.messages.push({ text, sender: 'user' });
    this.userInput = '';

    // Placeholder bot response
    setTimeout(() => {
      this.messages.push({ text: 'Bot reply coming soon...', sender: 'bot' });
    }, 500);
  }

}


