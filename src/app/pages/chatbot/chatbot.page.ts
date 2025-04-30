import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonIcon, IonInput } from '@ionic/angular/standalone';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { addIcons } from 'ionicons';
import { arrowBack, send, happyOutline, micOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

interface ChatMessage {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.page.html',
  styleUrls: ['./chatbot.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonButton, 
    IonIcon,
    IonInput
  ]
})
export class ChatbotPage implements OnInit {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  @ViewChild('content') private content!: IonContent;

  userMessage = '';
  messages: ChatMessage[] = [];
  isLoading = false;

  // OpenRouter configuration
  private openRouterApiKey = environment.openRouterApiKey;
  private openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(private http: HttpClient, private router: Router) {
    addIcons({ arrowBack, send, happyOutline, micOutline });
  }

  ngOnInit() {
    // Add a welcome message
    this.addBotMessage('Olá, meu nome é Paco. Bem-vindo ao OiLingo! Hello, my name is Paco. Welcome to OiLingo! I\'m here to chat with you when ever you want to practice some Portuguese! :)');
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  sendMessage() {
    if (this.userMessage.trim() === '') return;

    // Add user message to chat
    this.addUserMessage(this.userMessage);
    const messageToSend = this.userMessage;
    this.userMessage = ''; // Clear input field

    // Send to AI
    this.isLoading = true;
    this.getAIResponse(messageToSend).subscribe({
      next: (response: any) => {
        const botReply = response.choices[0]?.message?.content || "Sorry, I couldn't process that.";
        this.addBotMessage(botReply);
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error getting AI response:', error);
        this.addBotMessage('Sorry, there was an error processing your message.');
        this.isLoading = false;
        this.scrollToBottom();
      }
    });
  }

  private getAIResponse(userMessage: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.openRouterApiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'OiLingo'
    });

    const body = {
      model: 'gemini-1.5-flash-latest',
      messages: [
        {
          role: 'system',
          content: 'You are Paco, a friendly parrot assistant who helps people learn Portuguese. You respond in both Portuguese and English to help users understand. You keep responses concise and helpful for language learners.'
        },
        ...this.messages
          .filter(msg => msg.sender === 'user')
          .map(msg => ({
            role: 'user',
            content: msg.content
          })),
        {
          role: 'user',
          content: userMessage
        }
      ]
    };

    return this.http.post(this.openRouterUrl, body, { headers }).pipe(
      catchError(error => {
        console.error('API Error:', error);
        return throwError(() => new Error('Error calling AI API'));
      })
    );
  }

  private addUserMessage(content: string) {
    this.messages.push({
      content,
      sender: 'user',
      timestamp: new Date()
    });
    setTimeout(() => this.scrollToBottom(), 100);
  }

  private addBotMessage(content: string) {
    this.messages.push({
      content,
      sender: 'bot',
      timestamp: new Date()
    });
    setTimeout(() => this.scrollToBottom(), 100);
  }

  private scrollToBottom() {
    if (this.content) {
      this.content.scrollToBottom(300);
    }
  }
}