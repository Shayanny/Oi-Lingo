import { Component, OnInit } from '@angular/core';
import { WordService } from '../../services/word.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-lesson',
  templateUrl: './lesson.page.html',
  styleUrls: ['./lesson.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LessonPage implements OnInit {

  palavra: any;

  constructor(private wordService: WordService) {}

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0]; // Format: '2025-04-27'
    const savedData = localStorage.getItem('palavraOfTheDay');
    
    if (savedData) {
      const saved = JSON.parse(savedData);
      if (saved.date === today) {
        // ✅ Use saved word if it's for today
        this.palavra = saved.word;
        return;
      }
    }

    // 🚀 Otherwise, fetch new random word
    this.wordService.getWords().subscribe(words => {
      const randomIndex = Math.floor(Math.random() * words.length);
      this.palavra = words[randomIndex];

      // Save it to localStorage
      localStorage.setItem('palavraOfTheDay', JSON.stringify({
        date: today,
        word: this.palavra
      }));
    });
  }
}

