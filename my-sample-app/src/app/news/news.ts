import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HackerNews, Story } from '../services/hacker-news';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './news.html',
  styleUrl: './news.scss'
})
export class NewsComponent implements OnInit {
  private hackerNewsService = inject(HackerNews);
  
  stories = signal<Story[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  searchQuery = signal('');
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(0);

  filteredStories = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return query
      ? this.stories().filter(story => story.title.toLowerCase().includes(query))
      : this.stories();
  });

  ngOnInit() {
    this.loadStories();
  }

  loadStories() {
    this.loading.set(true);
    this.error.set(null);
    console.log('Loading stories...');

    this.hackerNewsService.getTopStories(this.pageSize(), this.currentPage())
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
}
