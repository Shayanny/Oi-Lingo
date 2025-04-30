import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonButton, IonIcon, IonInput, IonHeader, 
  IonToolbar, IonTitle, IonButtons, IonBackButton, 
  IonList, IonItem, IonLabel, IonSelect, IonSelectOption,
  IonPopover, IonFab, IonFabButton, IonFabList, 
  IonChip, IonAvatar, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonCardSubtitle, IonBadge, 
  AnimationController
} from '@ionic/angular/standalone';
import { Component, OnInit, ViewChild, ElementRef, NgZone, AfterViewInit, DoCheck } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { addIcons } from 'ionicons';
import { 
  arrowBack, send, happyOutline, documentTextOutline, 
  ellipsisVertical, trashOutline, addOutline, school, 
  book, chatbubbles, helpCircle, flash, listOutline,
  closeOutline
} from 'ionicons/icons';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

import { PortugueseTutorService, Conversation, ChatMessage, LessonTopic } from '../../services/portuguese-tutor.service';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.page.html',
  styleUrls: ['./chatbot.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent,
    IonButton,
    IonIcon,
    IonInput,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonPopover,
    IonFab,
    IonFabButton,
    IonFabList,
    IonChip,
    IonAvatar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonCardSubtitle,
    IonBadge
  ],
  animations: [
    trigger('messageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ChatbotPage implements OnInit, AfterViewInit, DoCheck {
  @ViewChild('content') private content!: IonContent;
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  
  userMessage = '';
  isLoading = false;
  showConversationList = false;
  showTopicsList = false;
  currentConversation: Conversation | undefined;
  conversations: Conversation[] = [];
  learningLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  filteredTopics: LessonTopic[] = [];
  
  // Scroll related properties
  private autoScrolling = true;
  private lastScrollPosition = 0;
  private messagesLength = 0;
  
  constructor(
    public tutorService: PortugueseTutorService,
    private router: Router,
    private route: ActivatedRoute,
    private animationCtrl: AnimationController,
    private ngZone: NgZone // Added NgZone for better handling of async operations
  ) {
    addIcons({ 
      arrowBack, 
      send, 
      happyOutline, 
      documentTextOutline,
      ellipsisVertical,
      trashOutline,
      addOutline,
      school,
      book,
      chatbubbles,
      helpCircle,
      flash,
      listOutline,
      closeOutline
    });
  }

  ngOnInit() {
    // Get conversation ID from route if available
    this.route.paramMap.subscribe(params => {
      const conversationId = params.get('id');
      
      // Wait for storage to initialize
      this.initializeChat(conversationId);
    });
  }
  
  ngAfterViewInit() {
    // Initial scroll to bottom
    setTimeout(() => {
      this.scrollToBottom(true);
    }, 500);
  }
  
  /**
   * Detect when messages change to trigger scroll
   */
  ngDoCheck() {
    // Check if messages length has changed
    if (this.currentConversation && this.currentConversation.messages) {
      const currentLength = this.currentConversation.messages.length;
      
      if (currentLength > this.messagesLength) {
        // Messages were added, should scroll down
        this.messagesLength = currentLength;
        
        if (this.autoScrolling) {
          this.scrollToBottom(true);
        }
      } else if (currentLength < this.messagesLength) {
        // Messages were removed
        this.messagesLength = currentLength;
      }
    }
  }
  
  async initializeChat(conversationId: string | null) {
    // Make sure storage is initialized
    await this.tutorService.init();
    
    // Load conversations
    this.conversations = this.tutorService.getConversations();
    
    // If no conversations exist or a specific one wasn't requested, create a new one
    if (this.conversations.length === 0 || (!conversationId && !this.tutorService.getCurrentConversation())) {
      const newId = this.tutorService.createConversation(this.learningLevel);
      this.currentConversation = this.tutorService.getConversation(newId);
    } 
    // If a specific conversation was requested
    else if (conversationId) {
      this.tutorService.setCurrentConversation(conversationId);
      this.currentConversation = this.tutorService.getConversation(conversationId);
      if (this.currentConversation) {
        this.learningLevel = this.currentConversation.learningLevel;
      }
    } 
    // Use current conversation
    else {
      this.currentConversation = this.tutorService.getCurrentConversation();
      if (this.currentConversation) {
        this.learningLevel = this.currentConversation.learningLevel;
      }
    }
    
    // Refresh conversations list
    this.conversations = this.tutorService.getConversations();
    
    // Filter topics based on level
    this.filterTopicsByLevel();
    
    // Initialize message length tracking
    if (this.currentConversation && this.currentConversation.messages) {
      this.messagesLength = this.currentConversation.messages.length;
    }
    
    // Scroll to bottom of chat
    setTimeout(() => this.scrollToBottom(true), 100);
  }

  /**
   * Handle scroll events to determine auto-scrolling behavior
   */
  onContentScroll(event: any) {
    // Get current scroll position
    this.content.getScrollElement().then(scrollElement => {
      const scrollTop = scrollElement.scrollTop;
      const scrollHeight = scrollElement.scrollHeight;
      const clientHeight = scrollElement.clientHeight;
      
      // Consider auto-scrolling if user is near the bottom
      const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 150;
      
      // Update auto-scrolling state based on user behavior
      if (isNearBottom) {
        this.autoScrolling = true;
      } else if (scrollTop < this.lastScrollPosition && !isNearBottom) {
        // User is scrolling up, disable auto-scroll
        this.autoScrolling = false;
      }
      
      this.lastScrollPosition = scrollTop;
    });
  }

  filterTopicsByLevel() {
    this.filteredTopics = this.tutorService.lessonTopics.filter(
      topic => topic.level === this.learningLevel
    );
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  /**
   * Enhanced sendMessage to prevent duplicates and ensure proper scrolling
   */
  sendMessage() {
    if (!this.userMessage.trim() || !this.currentConversation) return;
    
    const messageToSend = this.userMessage;
    this.userMessage = ''; // Clear input field
    
    // Check if similar message exists to prevent duplicates
    const isDuplicate = this.checkForDuplicate(messageToSend);
    
    if (!isDuplicate) {
      // First add the user message to the UI immediately
      this.addUserMessageLocally(messageToSend);
      
      // Re-enable auto-scrolling when user sends a message
      this.autoScrolling = true;
      
      // Then show loading indicator and get AI response
      this.isLoading = true;
      
      // Send message and get response after a slight delay to ensure UI updates
      setTimeout(() => {
        this.tutorService.sendMessage(this.currentConversation!.id, messageToSend)
          .subscribe({
            next: () => {
              this.isLoading = false;
              // Re-enable auto-scrolling for new messages
              this.autoScrolling = true;
              this.scrollToBottom(true);
              // Refresh current conversation
              this.currentConversation = this.tutorService.getConversation(this.currentConversation!.id);
            },
            error: (error) => {
              console.error('Error sending message:', error);
              this.isLoading = false;
              // Refresh current conversation
              this.currentConversation = this.tutorService.getConversation(this.currentConversation!.id);
              this.scrollToBottom(true);
            }
          });
      }, 100);
    }
  }

  /**
   * Check for duplicate messages to prevent duplicates
   */
  private checkForDuplicate(content: string): boolean {
    if (!this.currentConversation || !this.currentConversation.messages) {
      return false;
    }
    
    // Get the most recent messages (last 3)
    const recentMessages = this.currentConversation.messages.slice(-3);
    
    // Check if any of the recent user messages match the content
    return recentMessages.some(msg => 
      msg.sender === 'user' && 
      msg.content.trim().toLowerCase() === content.trim().toLowerCase()
    );
  }

  /**
   * Add user message locally with improved implementation
   */
  private addUserMessageLocally(content: string) {
    if (!this.currentConversation) return;
    
    // Add message to the local UI immediately
    if (!this.currentConversation.messages) {
      this.currentConversation.messages = [];
    }
    
    this.currentConversation.messages.push({
      content,
      sender: 'user',
      timestamp: new Date()
    });
    
    // Scroll to bottom immediately and ensure we're tracking message count
    this.messagesLength = this.currentConversation.messages.length;
    this.scrollToBottom(true);
  }

  createNewConversation() {
    const newId = this.tutorService.createConversation(this.learningLevel);
    this.currentConversation = this.tutorService.getConversation(newId);
    this.conversations = this.tutorService.getConversations();
    this.showConversationList = false;
    this.filterTopicsByLevel();
    
    // Reset message tracking
    if (this.currentConversation && this.currentConversation.messages) {
      this.messagesLength = this.currentConversation.messages.length;
    } else {
      this.messagesLength = 0;
    }
    
    // Reset auto-scrolling
    this.autoScrolling = true;
    setTimeout(() => this.scrollToBottom(true), 100);
  }

  switchConversation(id: string) {
    this.tutorService.setCurrentConversation(id);
    this.currentConversation = this.tutorService.getConversation(id);
    if (this.currentConversation) {
      this.learningLevel = this.currentConversation.learningLevel;
      this.filterTopicsByLevel();
      
      // Reset message tracking
      if (this.currentConversation.messages) {
        this.messagesLength = this.currentConversation.messages.length;
      } else {
        this.messagesLength = 0;
      }
    }
    this.showConversationList = false;
    
    // Reset auto-scrolling
    this.autoScrolling = true;
    setTimeout(() => this.scrollToBottom(true), 100);
  }

  deleteConversation(id: string, event: Event) {
    event.stopPropagation(); // Prevent switching to this conversation
    
    if (this.conversations.length <= 1) {
      // Don't delete the last conversation, create a new one first
      const newId = this.tutorService.createConversation(this.learningLevel);
      this.tutorService.deleteConversation(id);
      this.currentConversation = this.tutorService.getConversation(newId);
    } else {
      this.tutorService.deleteConversation(id);
      this.currentConversation = this.tutorService.getCurrentConversation();
      if (this.currentConversation) {
        this.learningLevel = this.currentConversation.learningLevel;
        this.filterTopicsByLevel();
      }
    }
    
    this.conversations = this.tutorService.getConversations();
    
    // Reset message tracking
    if (this.currentConversation && this.currentConversation.messages) {
      this.messagesLength = this.currentConversation.messages.length;
    } else {
      this.messagesLength = 0;
    }
  }

  clearCurrentConversation() {
    if (this.currentConversation) {
      this.tutorService.clearConversation(this.currentConversation.id);
      this.currentConversation = this.tutorService.getConversation(this.currentConversation.id);
      
      // Reset message tracking
      if (this.currentConversation && this.currentConversation.messages) {
        this.messagesLength = this.currentConversation.messages.length;
      } else {
        this.messagesLength = 0;
      }
    }
  }

  toggleConversationList() {
    this.showConversationList = !this.showConversationList;
    this.showTopicsList = false;
    this.conversations = this.tutorService.getConversations();
  }

  toggleTopicsList() {
    this.showTopicsList = !this.showTopicsList;
    this.showConversationList = false;
  }

  levelChanged() {
    // Create a new conversation with the selected level
    this.createNewConversation();
  }

  startTopicLesson(topicId: string) {
    if (!this.currentConversation) return;
    
    this.isLoading = true;
    this.showTopicsList = false;
    
    // Re-enable auto-scrolling when starting a lesson
    this.autoScrolling = true;
    
    this.tutorService.startTopicLesson(this.currentConversation.id, topicId)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.scrollToBottom(true);
          // Refresh current conversation
          this.currentConversation = this.tutorService.getConversation(this.currentConversation!.id);
          
          // Update message tracking
          if (this.currentConversation && this.currentConversation.messages) {
            this.messagesLength = this.currentConversation.messages.length;
          }
        },
        error: (error) => {
          console.error('Error starting lesson:', error);
          this.isLoading = false;
          // Refresh current conversation
          this.currentConversation = this.tutorService.getConversation(this.currentConversation!.id);
          this.scrollToBottom(true);
        }
      });
  }

  getWordOfTheDayLesson() {
    if (!this.currentConversation) return;
    
    this.isLoading = true;
    
    // Re-enable auto-scrolling when getting word of the day
    this.autoScrolling = true;
    
    this.tutorService.getWordOfTheDayLesson(this.currentConversation.id)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.scrollToBottom(true);
          // Refresh current conversation
          this.currentConversation = this.tutorService.getConversation(this.currentConversation!.id);
          
          // Update message tracking
          if (this.currentConversation && this.currentConversation.messages) {
            this.messagesLength = this.currentConversation.messages.length;
          }
        },
        error: (error) => {
          console.error('Error getting word of the day:', error);
          this.isLoading = false;
          // Refresh current conversation
          this.currentConversation = this.tutorService.getConversation(this.currentConversation!.id);
          this.scrollToBottom(true);
        }
      });
  }

  getMessageTypeClass(message: ChatMessage): string {
    if (message.sender === 'user') return 'user-message';
    
    // Bot message types
    switch(message.type) {
      case 'lesson': return 'bot-message lesson-message';
      case 'exercise': return 'bot-message exercise-message';
      case 'correction': return 'bot-message correction-message';
      case 'tip': return 'bot-message tip-message';
      case 'vocabulary': return 'bot-message vocab-message';
      default: return 'bot-message';
    }
  }

  getMessageIcon(message: ChatMessage): string {
    if (message.sender === 'user') return '';
    
    // Bot message types
    switch(message.type) {
      case 'lesson': return 'book';
      case 'exercise': return 'school';
      case 'correction': return 'flash';
      case 'tip': return 'helpCircle';
      case 'vocabulary': return 'listOutline';
      default: return '';
    }
  }

  getBadgeColor(level: string): string {
    switch(level) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'primary';
    }
  }

  getFormattedDate(date: Date): string {
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Format text for display (useful if you need special formatting)
   */
  formatDisplayText(text: string): string {
    return text ? text : '';
  }

  /**
   * Enhanced scrollToBottom method with force option
   */
  private scrollToBottom(force: boolean = false) {
    // Only scroll if auto-scrolling is enabled or force is true
    if (this.autoScrolling || force) {
      if (this.content) {
        // Use ngZone to ensure we're in the Angular zone
        this.ngZone.run(() => {
          // First immediate scroll
          setTimeout(() => {
            this.content.scrollToBottom(0);
          }, 50);
          
          // Second scroll after a short delay
          setTimeout(() => {
            this.content.scrollToBottom(0);
          }, 150);
          
          // Final scroll after content has likely rendered
          setTimeout(() => {
            this.content.scrollToBottom(0);
          }, 300);
        });
      }
    }
  }
}