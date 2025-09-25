import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Story {
  id: number;
  title: string;
  url: string;
  score: number;
  by: string;
  time: number;
  descendants: number;
}

interface ApiResponse {
  stories: Story[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

interface CacheEntry {
  stories: Story[];
  timestamp: number;
  totalPages?: number;
}

@Injectable({
  providedIn: 'root'
})
export class HackerNews {
  private apiUrl = `${environment.apiUrl}/api/news`;
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }

  private getCacheKey(pageSize: number, page: number): string {
    return `stories_${pageSize}_${page}`;
  }

  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.CACHE_DURATION;
  }

  private getFromCache(pageSize: number, page: number): Story[] | null {
    const key = this.getCacheKey(pageSize, page);
    const entry = this.cache.get(key);

    if (entry && this.isCacheValid(entry)) {
      console.log(`Cache hit for page ${page} with size ${pageSize}`);
      return entry.stories;
    }

    if (entry && !this.isCacheValid(entry)) {
      console.log(`Cache expired for page ${page} with size ${pageSize}`);
      this.cache.delete(key);
    }

    return null;
  }

  private setCache(pageSize: number, page: number, stories: Story[], totalPages?: number): void {
    const key = this.getCacheKey(pageSize, page);
    const entry: CacheEntry = {
      stories,
      timestamp: Date.now(),
      totalPages
    };
    this.cache.set(key, entry);
    console.log(`Cached ${stories.length} stories for page ${page} with size ${pageSize}`);
  }

  getTopStories(pageSize: number = 10, page: number = 1, forceRefresh: boolean = false): Observable<Story[]> {
    console.log(`Fetching top stories for page ${page} with size ${pageSize}...`);

    // Check cache first unless forced refresh
    if (!forceRefresh) {
      const cachedStories = this.getFromCache(pageSize, page);
      if (cachedStories) {
        return of(cachedStories);
      }
    }

    // Fetch from API and cache the result
    return this.http.get<ApiResponse>(`${this.apiUrl}/top-stories?pageSize=${pageSize}&page=${page}`)
      .pipe(
        map(response => {
          console.log(`Got ${response.stories.length} stories from API`);
          return response.stories;
        }),
        tap(stories => {
          this.setCache(pageSize, page, stories);
        }),
        catchError(this.handleError)
      );
  }

  getTotalPages(pageSize: number = 10): Observable<number> {
    // Check if we have cached total pages for page 1
    const key = this.getCacheKey(pageSize, 1);
    const entry = this.cache.get(key);

    if (entry && this.isCacheValid(entry) && entry.totalPages !== undefined) {
      console.log(`Cache hit for total pages with size ${pageSize}`);
      return of(entry.totalPages);
    }

    return this.http.get<ApiResponse>(`${this.apiUrl}/top-stories?pageSize=${pageSize}&page=1`)
      .pipe(
        map(response => response.totalPages),
        tap(totalPages => {
          // Update cache with total pages if page 1 is already cached
          if (entry) {
            entry.totalPages = totalPages;
          }
        }),
        catchError(this.handleError)
      );
  }

  // Method to clear cache when new stories are available
  clearCache(): void {
    this.cache.clear();
    console.log('Story cache cleared');
  }

  // Method to invalidate only page 1 cache when new stories arrive
  invalidateFirstPage(): void {
    const keys = Array.from(this.cache.keys()).filter(key => key.includes('_1'));
    keys.forEach(key => {
      this.cache.delete(key);
      console.log(`Invalidated cache key: ${key}`);
    });
  }

  // Method to get cached story count for debugging
  getCacheSize(): number {
    return this.cache.size;
  }
}
