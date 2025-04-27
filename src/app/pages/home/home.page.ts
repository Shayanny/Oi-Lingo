import { Component , OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule} from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-home',
  standalone: true, // Enables Standalone mode
  imports: [IonicModule, RouterModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  username: string | null = null;

  constructor(private authService: AuthService,private router: Router) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.username = user.email; // Or use any other user info
      }
    });
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }

  navigateTo(page: string) {
    this.router.navigate([page]);
  }
}
