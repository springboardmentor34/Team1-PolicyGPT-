import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AuthService } from './core/services/auth.service';
import { ApiService } from './core/services/api.service';
import { NotificationItem } from './core/models/models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'frontend';
  public authService = inject(AuthService);
  public apiService = inject(ApiService);
  private router = inject(Router);

  public notifications: NotificationItem[] = [];
  public showNotificationsDropdown = false;
  public unreadCount = 0;

  /** Flag flipped on every route navigation to re-trigger CSS entry animation */
  public pageAnimKey = 0;

  ngOnInit() {
    this.loadNotifications();

    // Re-trigger page entry animation on every route change
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.pageAnimKey++;
        // Scroll to top on page change (smooth)
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  }

  loadNotifications() {
    if (this.authService.isAuthenticated()) {
      this.apiService.getNotifications().subscribe({
        next: (data) => {
          this.notifications = data || [];
          this.unreadCount = this.notifications.filter(n => !n.is_read).length;
        },
        error: () => {}
      });
    }
  }

  toggleNotificationsDropdown() {
    this.showNotificationsDropdown = !this.showNotificationsDropdown;
    if (this.showNotificationsDropdown) {
      this.loadNotifications();
    }
  }

  markRead(id: number, event: Event) {
    event.stopPropagation();
    this.apiService.markNotificationRead(id).subscribe({
      next: () => {
        const notif = this.notifications.find(n => n.id === id);
        if (notif) notif.is_read = true;
        this.unreadCount = this.notifications.filter(n => !n.is_read).length;
      }
    });
  }

  markAllRead(event: Event) {
    event.stopPropagation();
    this.apiService.markAllNotificationsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.is_read = true);
        this.unreadCount = 0;
      }
    });
  }

  deleteNotification(id: number, event: Event) {
    event.stopPropagation();
    this.apiService.deleteNotification(id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.unreadCount = this.notifications.filter(n => !n.is_read).length;
      }
    });
  }
}
