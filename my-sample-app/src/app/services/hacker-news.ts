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

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }

  getTopStories(limit: number = 10): Observable<Story[]> {
    console.log('Fetching top stories...');
    return this.http.get<number[]>(`${this.baseUrl}/topstories.json`)
      .pipe(
        map(ids => {
          if (!ids || !Array.isArray(ids)) {
            throw new Error('Invalid response format for story IDs');
          }
          console.log('Got story IDs:', ids.slice(0, limit));
          return ids.slice(0, limit);
        }),
        switchMap(ids => {
          console.log('Fetching story details...');
          return this.getStoriesDetails(ids);
        }),
        catchError(this.handleError)
      );
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
