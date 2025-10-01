import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewStoriesNotification } from '../../services/signalr';

@Component({
  selector: 'app-news-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-notification.html',
  styleUrl: './news-notification.scss'
})
export class NewsNotificationComponent {
  notification = input<NewStoriesNotification | null>();
  refresh = output<void>();
  dismiss = output<void>();

  previewStories = computed(() => {
    const notif = this.notification();
    return notif ? notif.stories.slice(0, 2) : [];
  });

  remainingCount = computed(() => {
    const notif = this.notification();
    return notif && notif.count > 2 ? notif.count - 2 : 0;
  });

  onRefresh(): void {
    this.refresh.emit();
  }

  onDismiss(): void {
    this.dismiss.emit();
  }
}