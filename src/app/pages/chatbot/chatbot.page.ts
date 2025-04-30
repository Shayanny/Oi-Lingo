import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';


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
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ChatbotPage implements OnInit {

  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  userMessage = '';
  messages: ChatMessage[] = [];
  isLoading = false;

  // Replace with your OpenRouter API key in environment.ts
  private openRouterApiKey = environment.openRouterApiKey;
  private openRouterUrl = 'https://openrouter.ai/google/gemini-flash-1.5-8b';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    // Add a welcome message
    this.addBotMessage('Olá, meu nome é Paco. Bem-vindo ao OiLingo! Hello, my name is Paco. Welcome to OiLingo! I\'m here to chat with you when ever you want to practice some Portuguese! :)');
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
      next:(response: any) => {
        const botReply = response.choices[0]?.message?.content || "Sorry, I couldn't process that.";
        this.addBotMessage(botReply);
        this.isLoading = false;
        this.scrollToBottom();
      },
      error:(error) => {
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
      'Authorization': `Bearer ${this.openRouterApiKey}`
    });

    const body = {
      model: 'gemini-flash-1.5-8b', 
      messages: [
        {
          role: 'system',
          content: 'You are Paco, a friendly parrot assistant who helps people learn Portuguese. You respond in both Portuguese and English to help users understand. You keep responses concise and helpful for language learners.'
        },
        ...this.messages
          .filter(msg => msg.sender === 'user')  // Only include user messages
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
    setTimeout(() => this.scrollToBottom(), 50);
  }

  private addBotMessage(content: string) {
    this.messages.push({
      content,
      sender: 'bot',
      timestamp: new Date()
    });
    setTimeout(() => this.scrollToBottom(), 50);
  }

  private scrollToBottom() {
    try {
      if (this.chatContainer && this.chatContainer.nativeElement) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Could not scroll to bottom', err);
    }
  }

}


