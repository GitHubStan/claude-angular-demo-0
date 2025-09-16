import { Component, OnInit } from '@angular/core';
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
  stories: Story[] = [];
  loading = true;
  error: string | null = null;

  constructor(private hackerNewsService: HackerNews) {}

  ngOnInit() {
    this.loadStories();
  }

  loadStories() {
    this.loading = true;
    this.error = null;
    
    this.hackerNewsService.getTopStories(20)
      .subscribe({
        next: (stories) => {
          this.stories = stories;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load stories. Please try again later.';
          this.loading = false;
          console.error('Error loading stories:', err);
        }
      });
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  }
}
