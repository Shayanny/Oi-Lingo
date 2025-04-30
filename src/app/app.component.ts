import { Component, OnInit } from '@angular/core';
import { SeedWordsService } from './services/seed-words.service';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet , CommonModule , RouterOutlet],
})
export class AppComponent implements OnInit {

  constructor(private seedWordsService: SeedWordsService) { }

  ngOnInit() {
    //this.seedWordsService.seedWords(console.log('Words seeded successfully!')); 
  }
}
