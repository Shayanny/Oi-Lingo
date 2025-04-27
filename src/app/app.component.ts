import { Component, OnInit } from '@angular/core';
import { SeedWordsService } from './services/seed-words.service';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {

  constructor(private seedWordsService: SeedWordsService) { }

  ngOnInit() {
    //this.seedWordsService.seedWords(console.log('Words seeded successfully!')); 
  }
}
