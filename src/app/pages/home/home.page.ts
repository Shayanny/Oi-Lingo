import { Component , OnInit } from '@angular/core';
import { Router , NavigationEnd } from '@angular/router';
import { IonicModule} from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { filter } from 'rxjs/operators';



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
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(async event => {
        const user = this.authService.currentUser$.value;
        if (user) {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          this.username = userDoc.exists() ? userDoc.data()?.['username'] || 'USER' : 'USER';
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
