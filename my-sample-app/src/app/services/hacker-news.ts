import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, forkJoin, catchError, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface Story {
  id: number;
  title: string;
  url: string;
  score: number;
  by: string;
  time: number;
  descendants: number;
}

@Injectable({
  providedIn: 'root'
})
export class HackerNews {
  private baseUrl = 'https://hacker-news.firebaseio.com/v0';
  private storyIds: number[] | null = null;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }

  getTopStories(pageSize: number = 10, page: number = 1): Observable<Story[]> {
    console.log(`Fetching top stories for page ${page} with size ${pageSize}...`);
    
    const getStoriesPage = (ids: number[]) => {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      console.log(`Slicing IDs from ${start} to ${end}`);
      const pageIds = ids.slice(start, end);
      return this.getStoriesDetails(pageIds);
    };

    if (this.storyIds) {
      console.log('Using cached story IDs');
      return getStoriesPage(this.storyIds);
    }

    return this.http.get<number[]>(`${this.baseUrl}/topstories.json`)
      .pipe(
        map(ids => {
          if (!ids || !Array.isArray(ids)) {
            throw new Error('Invalid response format for story IDs');
          }
          this.storyIds = ids;
          console.log(`Got ${ids.length} story IDs`);
          return ids;
        }),
        switchMap(ids => {
          console.log('Fetching story details...');
          return getStoriesPage(ids);
        }),
        catchError(this.handleError)
      );
  }

  getTotalPages(pageSize: number = 10): number {
    return this.storyIds ? Math.ceil(this.storyIds.length / pageSize) : 0;
  }

  private getStoriesDetails(ids: number[]): Observable<Story[]> {
    if (!ids.length) {
      return throwError(() => new Error('No story IDs provided'));
    }

    const storyRequests = ids.map(id => 
      this.http.get<Story>(`${this.baseUrl}/item/${id}.json`)
        .pipe(
          map(story => {
            if (!story || !story.id) {
              throw new Error(`Invalid story data received for ID ${id}`);
            }
            console.log('Got story:', story);
            return story;
          }),
          catchError(error => {
            console.error(`Error fetching story ${id}:`, error);
            return throwError(() => error);
          })
        )
    );
    return forkJoin(storyRequests)
      .pipe(catchError(this.handleError));
  }
}
