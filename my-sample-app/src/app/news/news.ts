import { Component, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HackerNews, Story } from '../services/hacker-news';
import { SignalRService } from '../services/signalr';
import { NewsNotificationComponent } from '../components/news-notification/news-notification';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, FormsModule, NewsNotificationComponent],
  templateUrl: './news.html',
  styleUrl: './news.scss'
})
export class NewsComponent implements OnInit, OnDestroy {
  // Test methods are implemented below
  private hackerNewsService = inject(HackerNews);
  private signalRService = inject(SignalRService);
  private http = inject(HttpClient);

  stories = signal<Story[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  searchQuery = signal('');
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(0);

  // SignalR state
  newStoriesNotification = this.signalRService.newStoriesAvailable;
  isConnected = this.signalRService.isConnected;

  filteredStories = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return query
      ? this.stories().filter(story => story.title.toLowerCase().includes(query))
      : this.stories();
  });

  async ngOnInit() {
    this.loadStories();

    // Start SignalR connection
    try {
      await this.signalRService.startConnection();
      console.log('Connected to SignalR hub');
    } catch (error) {
      console.error('Failed to connect to SignalR hub:', error);
    }
  }

  async ngOnDestroy() {
    try {
      await this.signalRService.stopConnection();
    } catch (error) {
      console.error('Error disconnecting from SignalR:', error);
    }
  }

  loadStories(forceRefresh: boolean = false) {
    this.loading.set(true);
    this.error.set(null);
    console.log('Loading stories...');

    this.hackerNewsService.getTopStories(this.pageSize(), this.currentPage(), forceRefresh)
      .subscribe({
        next: (stories) => {
          console.log('Stories received:', stories);
          this.stories.set(stories);
          this.loading.set(false);

          // Get total pages separately
          this.hackerNewsService.getTotalPages(this.pageSize())
            .subscribe({
              next: (totalPages) => {
                this.totalPages.set(totalPages);
              },
              error: (err) => {
                console.error('Error getting total pages:', err);
              }
            });
        },
        error: (err) => {
          console.error('Error loading stories:', err);
          this.error.set('Failed to load stories. Please try again later.');
          this.loading.set(false);
        }
      });
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadStories();
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.loadStories();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadStories();
    }
  }

  onRefreshStories() {
    // Invalidate page 1 cache since new stories are available
    this.hackerNewsService.invalidateFirstPage();

    // If we're on page 1, force refresh to get latest stories
    if (this.currentPage() === 1) {
      this.loadStories(true);
    } else {
      // Navigate to page 1 to see new stories
      this.currentPage.set(1);
      this.loadStories(true);
    }

    this.signalRService.clearNewStoriesNotification();
  }

  onDismissNotification() {
    this.signalRService.clearNewStoriesNotification();
  }

  // Test/Debug methods
  simulateNewStories() {
    // Create mock notification data for testing
    const mockNotification = {
      count: 3,
      stories: [
        { id: 999999, title: 'Test Story 1: Simulated Breaking News', url: 'https://example.com/1', score: 150, by: 'testuser1', time: Date.now() / 1000, descendants: 25 },
        { id: 999998, title: 'Test Story 2: Another Simulated Story', url: 'https://example.com/2', score: 120, by: 'testuser2', time: Date.now() / 1000, descendants: 18 },
        { id: 999997, title: 'Test Story 3: Yet Another Test', url: 'https://example.com/3', score: 95, by: 'testuser3', time: Date.now() / 1000, descendants: 12 }
      ],
      timestamp: new Date().toISOString()
    };

    // Manually set the notification to simulate SignalR receiving new stories
    this.signalRService.newStoriesAvailable.set(mockNotification);
    console.log('🧪 Simulated new stories notification:', mockNotification);
  }

  clearNotification() {
    this.signalRService.clearNewStoriesNotification();
    console.log('🧪 Cleared notification');
  }

  getCacheInfo(): string {
    return `${this.hackerNewsService.getCacheSize()} entries`;
  }

  triggerBackendNotification() {
    console.log('🧪 Triggering backend SignalR notification...');

    this.http.post('http://localhost:5000/api/news/test/trigger-notification', {})
      .subscribe({
        next: (response) => {
          console.log('🧪 Backend notification triggered successfully:', response);
        },
        error: (error) => {
          console.error('🧪 Error triggering backend notification:', error);
        }
      });
  }
}
