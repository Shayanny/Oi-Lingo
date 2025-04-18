import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule} from '@ionic/angular';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-home',
  standalone: true, // Enables Standalone mode
  imports: [IonicModule, RouterModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  username: string = 'uSeR';

  constructor(private router: Router) {}

  navigateTo(page: string) {
    this.router.navigate([page]);
  }
}
