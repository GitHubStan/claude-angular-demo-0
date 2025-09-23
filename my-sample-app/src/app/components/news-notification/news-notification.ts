import { Component, inject, input, output } from '@angular/core';
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

  onRefresh(): void {
    this.refresh.emit();
  }

  onDismiss(): void {
    this.dismiss.emit();
  }
}