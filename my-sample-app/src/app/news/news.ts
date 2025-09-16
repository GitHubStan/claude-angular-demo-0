import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HackerNews, Story } from '../services/hacker-news';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news.html',
  styleUrl: './news.scss'
})
export class NewsComponent implements OnInit {
  stories = signal<Story[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private hackerNewsService: HackerNews) {}

  ngOnInit() {
    this.loadStories();
  }

  loadStories() {
    this.loading.set(true);
    this.error.set(null);
    console.log('Loading stories...');
    
    this.hackerNewsService.getTopStories(20)
      .subscribe({
        next: (stories) => {
          console.log('Stories received:', stories);
          this.stories.set(stories);
          this.loading.set(false);
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
}
