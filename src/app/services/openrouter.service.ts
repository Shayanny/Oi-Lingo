// app/services/openrouter.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface OpenRouterChoice {
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
  index: number;
}

export interface OpenRouterResponse {
  id: string;
  choices: OpenRouterChoice[];
  created: number;
  model: string;
  object: string;
}

@Injectable({
  providedIn: 'root'
})
export class OpenRouterService {
  private apiUrl = 'https://openrouter.ai/google/gemini-flash-1.5-8b';
  private apiKey = environment.openRouterApiKey;

  constructor(private http: HttpClient) { }

  getChatCompletion(messages: ChatMessage[], model: string = 'openai/gpt-3.5-turbo', temperature: number = 0.7): Observable<OpenRouterResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'HTTP-Referer': window.location.origin, // Required by OpenRouter
      'X-Title': 'OiLingo' 
    });

    const body: OpenRouterRequest = {
      model,
      messages,
      temperature,
      max_tokens: 1000
    };

    return this.http.post<OpenRouterResponse>(this.apiUrl, body, { headers }).pipe(
      catchError(error => {
        console.error('OpenRouter API Error:', error);
        return throwError(() => new Error('Failed to get response from AI service'));
      })
    );
  }
}