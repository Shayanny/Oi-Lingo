// src/app/services/portuguese-tutor.service.ts
import { Injectable } from '@angular/core';
import { OpenRouterService, ChatMessage as AIMessage } from './openrouter.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import { WordService } from './word.service';

export interface ChatMessage {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'regular' | 'lesson' | 'exercise' | 'correction' | 'tip' | 'vocabulary';
}

export interface LessonTopic {
  id: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastUpdated: Date;
  learningLevel: 'beginner' | 'intermediate' | 'advanced';
  currentTopic?: string;
  vocabulary: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PortugueseTutorService {
  private conversations: Conversation[] = [];
  private currentConversationId: string | null = null;
  private _storage: Storage | null = null;
  
  // Common Portuguese learning topics
  public lessonTopics: LessonTopic[] = [
    { id: 'greetings', name: 'Greetings & Introductions', description: 'Learn basic greetings and how to introduce yourself', level: 'beginner' },
    { id: 'family', name: 'Family & Relationships', description: 'Vocabulary for family members and relationships', level: 'beginner' },
    { id: 'food', name: 'Food & Dining', description: 'Brazilian cuisine and restaurant vocabulary', level: 'beginner' },
    { id: 'travel', name: 'Travel & Directions', description: 'Getting around in Brazil', level: 'beginner' },
    { id: 'daily', name: 'Daily Routine', description: 'Talking about your day and routine activities', level: 'beginner' },
    { id: 'weather', name: 'Weather & Seasons', description: 'Discussing weather and climate', level: 'beginner' },
    { id: 'shopping', name: 'Shopping & Money', description: 'Shopping vocabulary and handling money', level: 'intermediate' },
    { id: 'work', name: 'Work & Professions', description: 'Professional vocabulary and office talk', level: 'intermediate' },
    { id: 'health', name: 'Health & Wellness', description: 'Vocabulary for health, body parts, and at the doctor', level: 'intermediate' },
    { id: 'leisure', name: 'Hobbies & Leisure', description: 'Activities, sports, and entertainment', level: 'intermediate' },
    { id: 'emotions', name: 'Feelings & Emotions', description: 'Expressing emotions and feelings', level: 'intermediate' },
    { id: 'culture', name: 'Brazilian Culture', description: 'Music, festivals, and traditions', level: 'advanced' },
    { id: 'politics', name: 'Current Events', description: 'News, politics, and social issues', level: 'advanced' },
    { id: 'slang', name: 'Slang & Idioms', description: 'Common expressions and colloquial language', level: 'advanced' }
  ];

  constructor(
    private openRouterService: OpenRouterService,
    private wordService: WordService,
    private storage: Storage
  ) {
    this.init();
  }

  async init() {
    // Initialize storage
    this._storage = await this.storage.create();
    
    // Load saved conversations
    this.loadConversations();
  }

  // Load conversations from storage
  async loadConversations() {
    const savedConversations = await this._storage?.get('conversations');
    if (savedConversations) {
      this.conversations = savedConversations;
      
      // Convert string dates back to Date objects
      this.conversations.forEach(conv => {
        conv.lastUpdated = new Date(conv.lastUpdated);
        conv.messages.forEach(msg => {
          msg.timestamp = new Date(msg.timestamp);
        });
      });
    }
  }

  // Save conversations to storage
  async saveConversations() {
    await this._storage?.set('conversations', this.conversations);
  }

  // Get all conversations
  getConversations(): Conversation[] {
    return this.conversations;
  }

  // Create a new conversation
  createConversation(level: 'beginner' | 'intermediate' | 'advanced' = 'beginner'): string {
    const id = Date.now().toString();
    
    const newConversation: Conversation = {
      id,
      title: `Portuguese Conversation`,
      messages: [],
      lastUpdated: new Date(),
      learningLevel: level,
      vocabulary: []
    };
    
    this.conversations.push(newConversation);
    this.currentConversationId = id;
    this.saveConversations();
    
    // Add welcome message based on level
    const welcomeMessages: {[key: string]: string} = {
      beginner: 'Olá! Bem-vindo ao OiLingo! 👋\n\nI\'m Paco, your Portuguese tutor. I\'ll help you learn Brazilian Portuguese with simple conversations, vocabulary, and lessons.\n\nSome things I can do:\n- Teach you common phrases and words\n- Explain grammar points\n- Help you practice conversations\n- Give you tips about Brazilian culture\n\nWhat would you like to learn today?',
      
      intermediate: 'Olá! Bem-vindo de volta ao OiLingo! 👋\n\nSou Paco, seu tutor de português. Vejo que você já tem algum conhecimento do idioma! Posso ajudá-lo a melhorar suas habilidades com conversas, vocabulário, e lições mais avançadas.\n\nWhat would you like to practice today?',
      
      advanced: 'Olá! Bem-vindo ao OiLingo! 👋\n\nSou Paco, seu tutor de português. Vejo que você já tem um nível avançado! Vamos trabalhar em nuances do idioma, expressões idiomáticas, e tópicos mais complexos para refinar seu português.\n\nComo posso ajudá-lo hoje?'
    };
    
    const welcomeMessage = welcomeMessages[level];
    this.addBotMessage(id, welcomeMessage, 'regular');
    
    // Suggest some starter topics based on level
    setTimeout(() => {
      const levelTopics = this.lessonTopics.filter(topic => topic.level === level);
      const suggestedTopics = levelTopics.slice(0, 3);
      
      let suggestionsMessage = 'Here are some topics we could start with:\n\n';
      suggestedTopics.forEach(topic => {
        suggestionsMessage += `• ${topic.name}: ${topic.description}\n`;
      });
      
      suggestionsMessage += '\nOr you can just chat with me in Portuguese to practice! What interests you?';
      
      this.addBotMessage(id, suggestionsMessage, 'tip');
    }, 1000);
    
    return id;
  }

  // Get conversation by ID
  getConversation(id: string): Conversation | undefined {
    return this.conversations.find(conv => conv.id === id);
  }

  // Get current conversation
  getCurrentConversation(): Conversation | undefined {
    if (!this.currentConversationId) return undefined;
    return this.getConversation(this.currentConversationId);
  }

  // Set current conversation
  setCurrentConversation(id: string): boolean {
    if (this.getConversation(id)) {
      this.currentConversationId = id;
      return true;
    }
    return false;
  }

  // Delete conversation
  deleteConversation(id: string): boolean {
    const initialLength = this.conversations.length;
    this.conversations = this.conversations.filter(conv => conv.id !== id);
    
    if (this.currentConversationId === id) {
      this.currentConversationId = this.conversations.length > 0 ? this.conversations[0].id : null;
    }
    
    this.saveConversations();
    return initialLength !== this.conversations.length;
  }

  // Rename conversation
  renameConversation(id: string, newTitle: string): boolean {
    const conversation = this.getConversation(id);
    if (conversation) {
      conversation.title = newTitle;
      conversation.lastUpdated = new Date();
      this.saveConversations();
      return true;
    }
    return false;
  }

  // Add user message to a conversation
  addUserMessage(conversationId: string, content: string): void {
    const conversation = this.getConversation(conversationId);
    if (!conversation) return;
    
    // Check for duplicate messages
    if (this.isDuplicateMessage(conversation, content, 'user')) {
      console.log('Duplicate user message detected, skipping addition');
      return;
    }
    
    conversation.messages.push({
      content,
      sender: 'user',
      timestamp: new Date()
    });
    
    conversation.lastUpdated = new Date();
    this.saveConversations();
  }
  

  // Add bot message to a conversation
  addBotMessage(conversationId: string, content: string, type: 'regular' | 'lesson' | 'exercise' | 'correction' | 'tip' | 'vocabulary' = 'regular'): void {
    const conversation = this.getConversation(conversationId);
    if (!conversation) return;
    
    // Check for duplicate messages
    if (this.isDuplicateMessage(conversation, content, 'bot')) {
      console.log('Duplicate bot message detected, skipping addition');
      return;
    }
    
    conversation.messages.push({
      content,
      sender: 'bot',
      timestamp: new Date(),
      type
    });
    
    conversation.lastUpdated = new Date();
    this.saveConversations();
  }

  private isDuplicateMessage(conversation: Conversation, content: string, sender: 'user' | 'bot'): boolean {
    if (!conversation.messages || conversation.messages.length === 0) {
      return false;
    }
    
    // Look at the last few messages to check for duplicates
    const recentMessages = conversation.messages.slice(-5);
    
    return recentMessages.some(msg => 
      msg.sender === sender && 
      msg.content === content
    );
  }

  // Send message to AI and get response with teaching approach
  sendMessage(conversationId: string, content: string): Observable<string> {
    const conversation = this.getConversation(conversationId);
    if (!conversation) {
      return of('Error: Conversation not found');
    }
    
    // Add user message to conversation
    this.addUserMessage(conversationId, content);
    
    // Prepare messages for AI including teaching instructions
    const aiMessages: AIMessage[] = [];
    
    // System message with teaching instructions based on level
    const levelInstructions = {
      beginner: `You are Paco, a friendly and patient Brazilian Portuguese tutor. You're teaching a beginner, so:
      - Use simple Portuguese words and phrases, always with English translations
      - Explain basic grammar concepts clearly
      - Correct language mistakes gently
      - Provide positive reinforcement
      - Introduce vocabulary gradually
      - Focus on practical, everyday expressions
      - Give clear examples`,
      
      intermediate: `You are Paco, an encouraging Brazilian Portuguese tutor. Your student is at an intermediate level, so:
      - Use more complex Portuguese, but still provide English translations for new terms
      - Explain more nuanced grammar points
      - Correct mistakes and explain the reasoning
      - Introduce more varied vocabulary and colloquial expressions
      - Challenge them with questions in Portuguese
      - Discuss cultural contexts of language usage`,
      
      advanced: `You are Paco, a sophisticated Brazilian Portuguese tutor. Your student is at an advanced level, so:
      - Communicate primarily in Portuguese with minimal English
      - Discuss complex topics and abstract concepts
      - Focus on nuance, regional variations, and slang
      - Correct subtle mistakes and explain finer points
      - Challenge them with advanced questions and discussions
      - Explore literature, news, and cultural topics in depth`
    };
    
    // Add structured teaching approach
    const teachingApproach = `
    Use these teaching techniques:
    1. Recognize learning opportunities in the student's messages
    2. Proactively introduce relevant vocabulary and phrases
    3. Create mini-lessons when appropriate
    4. Suggest practice exercises
    5. Provide cultural context when relevant
    6. Track what they've learned and build upon it
    7. Ask questions to engage them in using what they've learned
    
    Format your responses with clear structure:
    - For vocabulary: Use bold or bullet points for new words
    - For grammar explanations: Use examples and simple terminology
    - For corrections: Show the incorrect phrase, then the correct version
    - For cultural notes: Clearly mark as "Cultural Note" and explain
    
    Take initiative as the teacher - don't just respond, but guide the learning experience.
    `;
    
    aiMessages.push({
      role: 'system',
      content: levelInstructions[conversation.learningLevel] + teachingApproach
    });
    
    // Add conversation history (last 10 messages maximum)
    const recentMessages = conversation.messages.slice(-10);
    recentMessages.forEach(msg => {
      if (msg.sender === 'user') {
        aiMessages.push({
          role: 'user',
          content: msg.content
        });
      } else if (msg.sender === 'bot') {
        aiMessages.push({
          role: 'assistant',
          content: msg.content
        });
      }
    });
    
    // Send to AI and process response
    return this.openRouterService.getChatCompletion(aiMessages).pipe(
      map(response => {
        const botReply = response.choices[0]?.message?.content || "Desculpe, não consegui processar isso. Sorry, I couldn't process that.";
        
        // Determine if this is a special type of message
        let messageType: 'regular' | 'lesson' | 'exercise' | 'correction' | 'tip' | 'vocabulary' = 'regular';
        
        if (botReply.includes('VOCABULARY') || botReply.includes('NOVO VOCABULÁRIO')) {
          messageType = 'vocabulary';
          
          // Extract vocabulary for tracking
          const vocabMatches = botReply.match(/\*\*([\w\s]+)\*\*/g);
          if (vocabMatches) {
            vocabMatches.forEach(match => {
              const word = match.replace(/\*\*/g, '').trim();
              if (!conversation.vocabulary.includes(word)) {
                conversation.vocabulary.push(word);
              }
            });
          }
        } 
        else if (botReply.includes('EXERCISE') || botReply.includes('EXERCÍCIO')) {
          messageType = 'exercise';
        }
        else if (botReply.includes('CORRECTION') || botReply.includes('CORREÇÃO')) {
          messageType = 'correction';
        }
        else if (botReply.includes('TIP') || botReply.includes('DICA')) {
          messageType = 'tip';
        }
        else if (botReply.includes('LESSON') || botReply.includes('LIÇÃO')) {
          messageType = 'lesson';
        }
        
        this.addBotMessage(conversationId, botReply, messageType);
        return botReply;
      }),
      catchError(error => {
        console.error('AI response error:', error);
        const errorMessage = 'Desculpe, encontrei um erro. Por favor, tente novamente. Sorry, I encountered an error. Please try again.';
        this.addBotMessage(conversationId, errorMessage);
        return of(errorMessage);
      })
    );
  }

  // Start a specific topic lesson
  startTopicLesson(conversationId: string, topicId: string): Observable<string> {
    const conversation = this.getConversation(conversationId);
    if (!conversation) {
      return of('Error: Conversation not found');
    }
    
    const topic = this.lessonTopics.find(t => t.id === topicId);
    if (!topic) {
      return of('Error: Topic not found');
    }
    
    // Set current topic
    conversation.currentTopic = topicId;
    
    // Create a message asking to start the lesson
    const userMessage = `I'd like to learn about "${topic.name}" please.`;
    this.addUserMessage(conversationId, userMessage);
    
    // Create specialized system prompt for this topic
    const aiMessages: AIMessage[] = [
      {
        role: 'system',
        content: `You are Paco, a Brazilian Portuguese tutor. Create a structured lesson about "${topic.name}" for a ${conversation.learningLevel} level student.
        
        Your lesson should include:
        1. A brief introduction to the topic
        2. 5-8 key vocabulary words with translations and examples
        3. Common phrases or expressions related to the topic
        4. A short dialogue demonstrating the vocabulary in context
        5. A simple practice exercise for the student
        
        Format the lesson clearly with sections marked as "VOCABULARY", "PHRASES", "DIALOGUE", and "EXERCISE".
        Adapt the complexity to the student's ${conversation.learningLevel} level.
        Be enthusiastic and encouraging throughout the lesson.`
      }
    ];
    
    // Add the user's request
    aiMessages.push({
      role: 'user',
      content: userMessage
    });
    
    // Send to AI and process response
    return this.openRouterService.getChatCompletion(aiMessages).pipe(
      map(response => {
        const lessonContent = response.choices[0]?.message?.content || 
          "Desculpe, não consegui criar esta lição. Sorry, I couldn't create this lesson.";
        
        this.addBotMessage(conversationId, lessonContent, 'lesson');
        return lessonContent;
      }),
      catchError(error => {
        console.error('Lesson creation error:', error);
        const errorMessage = 'Desculpe, encontrei um erro ao criar a lição. Sorry, I encountered an error creating the lesson.';
        this.addBotMessage(conversationId, errorMessage);
        return of(errorMessage);
      })
    );
  }

  // Get word of the day and create a mini-lesson
  getWordOfTheDayLesson(conversationId: string): Observable<string> {
    const conversation = this.getConversation(conversationId);
    if (!conversation) {
      return of('Error: Conversation not found');
    }
    
    return new Observable<string>(observer => {
      // Load word of the day from service
      this.wordService.getWords().subscribe({
        next: (words) => {
          if (!words || words.length === 0) {
            observer.next('No word of the day available');
            observer.complete();
            return;
          }
          
          // Get today's word or random word
          const today = new Date().toISOString().split('T')[0];
          const savedData = localStorage.getItem('palavraOfTheDay');
          let wordOfTheDay;
          
          if (savedData) {
            const saved = JSON.parse(savedData);
            if (saved.date === today) {
              wordOfTheDay = saved.word;
            } else {
              // Get random word if no word for today
              const randomIndex = Math.floor(Math.random() * words.length);
              wordOfTheDay = words[randomIndex];
            }
          } else {
            // Get random word if no saved word
            const randomIndex = Math.floor(Math.random() * words.length);
            wordOfTheDay = words[randomIndex];
          }
          
          // Create a mini-lesson based on the word
          const aiMessages: AIMessage[] = [
            {
              role: 'system',
              content: `You are Paco, a Brazilian Portuguese tutor. Create a mini-lesson based on the Word of the Day: "${wordOfTheDay.word}".
              
              The information about this word is:
              - Word: ${wordOfTheDay.word}
              - Summary: ${wordOfTheDay.summary}
              - Example: ${wordOfTheDay.example}
              - Translation: ${wordOfTheDay.translation}
              
              Create a structured mini-lesson that:
              1. Introduces the word and its meaning
              2. Explains pronunciation or any special features
              3. Provides 2-3 additional example sentences
              4. Suggests related vocabulary
              5. Gives a tiny exercise to practice using the word
              
              Format as a clear lesson with enthusiasm and encouragement.
              Adapt to the student's ${conversation.learningLevel} level.`
            }
          ];
          
          // User message indicating interest in word of the day
          const userMessage = "Can you teach me about today's word of the day?";
          this.addUserMessage(conversationId, userMessage);
          
          aiMessages.push({
            role: 'user', 
            content: userMessage
          });
          
          // Get AI response
          this.openRouterService.getChatCompletion(aiMessages).subscribe({
            next: (response) => {
              const lessonContent = response.choices[0]?.message?.content || 
                "Desculpe, não consegui criar esta lição. Sorry, I couldn't create this lesson.";
              
              this.addBotMessage(conversationId, lessonContent, 'lesson');
              observer.next(lessonContent);
              observer.complete();
            },
            error: (error) => {
              console.error('Word of the day lesson error:', error);
              const errorMessage = 'Desculpe, encontrei um erro ao criar a lição. Sorry, I encountered an error creating the lesson.';
              this.addBotMessage(conversationId, errorMessage);
              observer.next(errorMessage);
              observer.complete();
            }
          });
        },
        error: (error) => {
          console.error('Word service error:', error);
          const errorMessage = 'Desculpe, não consegui acessar a palavra do dia. Sorry, I couldn\'t access the word of the day.';
          this.addBotMessage(conversationId, errorMessage);
          observer.next(errorMessage);
          observer.complete();
        }
      });
    });
  }

  // Clear a conversation history
  clearConversation(id: string): boolean {
    const conversation = this.getConversation(id);
    if (conversation) {
      // Keep only the welcome message if it exists
      const welcomeMessage = conversation.messages.length > 0 && 
                             conversation.messages[0].sender === 'bot' ? 
                             [conversation.messages[0]] : [];
      
      conversation.messages = welcomeMessage;
      conversation.lastUpdated = new Date();
      conversation.vocabulary = [];
      this.saveConversations();
      return true;
    }
    return false;
  }
}