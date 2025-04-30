// app/services/openrouter.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
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
  private apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private apiKey = environment.openRouterApiKey;
  constructor(private http: HttpClient) {
    // Ensure API key is properly trimmed
    this.apiKey = environment.openRouterApiKey.trim();
    console.log('OpenRouter service initialized with API key length:', this.apiKey.length);
  }

  getChatCompletion(
    messages: ChatMessage[], 
    model: string = 'anthropic/claude-3-haiku', // Updated to a strong model for language teaching
    temperature: number = 0.7
  ): Observable<OpenRouterResponse> {
    
    // Create proper headers with Bearer token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'OiLingo Portuguese Tutor'
    });

    // Create request body
    const body: OpenRouterRequest = {
      model,
      messages,
      temperature,
      max_tokens: 2000 // Increased for more detailed language lessons
    };

    // Log request details for debugging (without showing full API key)
    console.log('OpenRouter request:', {
      url: this.apiUrl,
      model,
      messageCount: messages.length,
      authHeaderPrefix: 'Bearer ' + this.apiKey.substring(0, 5) + '...'
    });

    return this.http.post<OpenRouterResponse>(this.apiUrl, body, { headers }).pipe(
      retry(1), // Retry once if there's a network error
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server error: ${error.status} - ${error.statusText || ''}\n`;
      
      if (error.error) {
        if (error.error.message) {
          errorMessage += `Message: ${error.error.message}\n`;
        }
        if (error.error.error) {
          errorMessage += `Error: ${error.error.error}\n`;
        }
      }
      
      // Authentication specific errors
      if (error.status === 401) {
        errorMessage += 'Authentication failed. Please check your API key.';
      } else if (error.status === 403) {
        errorMessage += 'You do not have permission to access this resource.';
      } else if (error.status === 429) {
        errorMessage += 'Rate limit exceeded. Please try again later.';
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Helper method to check if the API is accessible
  testConnection(): Observable<any> {
    const testMessage: ChatMessage[] = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello' }
    ];
    
    // Use a small max_tokens to minimize costs for testing
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'OiLingo API Test'
    });

    const body: OpenRouterRequest = {
      model: 'openai/gpt-3.5-turbo', // Use a common model for testing
      messages: testMessage,
      max_tokens: 10,
      temperature: 0.7
    };

    return this.http.post<OpenRouterResponse>(this.apiUrl, body, { headers }).pipe(
      catchError((error) => {
        console.error('API test failed:', error);
        return throwError(() => new Error('API connection test failed: ' + (error.error?.message || error.message)));
      })
    );
  }
}