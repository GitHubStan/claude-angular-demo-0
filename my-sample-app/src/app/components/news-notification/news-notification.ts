import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewStoriesNotification } from '../../services/signalr';

@Component({
  selector: 'app-news-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (notification()) {
      <div class="notification-banner">
        <div class="notification-content">
          <div class="notification-icon">📰</div>
          <div class="notification-text">
            <strong>{{ notification()!.count }} new stories available!</strong>
            <div class="notification-preview">
              @for (story of notification()!.stories.slice(0, 2); track story.id) {
                <div class="preview-story">{{ story.title }}</div>
              }
              @if (notification()!.count > 2) {
                <div class="more-stories">+{{ notification()!.count - 2 }} more...</div>
              }
            </div>
          </div>
          <div class="notification-actions">
            <button
              class="btn-refresh"
              (click)="onRefresh()"
              style="background: #003b49; color: white; border: none; border-radius: 6px; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">
              Refresh Feed
            </button>
            <button
              class="btn-dismiss"
              (click)="onDismiss()"
              aria-label="Dismiss notification"
              style="background: transparent; border: none; color: #adb5bd; font-size: 1.25rem; cursor: pointer; padding: 0.25rem; border-radius: 4px; transition: all 0.2s ease;">
              ✕
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './news-notification.scss'
})
export class NewsNotificationComponent {
  notification = input<NewStoriesNotification | null>();
  refresh = output<void>();
  dismiss = output<void>();

  onRefresh(): void {
    this.refresh.emit();
  }

  onDismiss(): void {
    this.dismiss.emit();
  }
}