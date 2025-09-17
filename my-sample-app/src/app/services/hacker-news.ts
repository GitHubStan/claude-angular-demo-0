import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

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

@Injectable({
  providedIn: 'root'
})
export class HackerNews {
  private apiUrl = 'http://localhost:5000/api/news';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }

  getTopStories(pageSize: number = 10, page: number = 1): Observable<Story[]> {
    console.log(`Fetching top stories for page ${page} with size ${pageSize}...`);

    return this.http.get<ApiResponse>(`${this.apiUrl}/top-stories?pageSize=${pageSize}&page=${page}`)
      .pipe(
        map(response => {
          console.log(`Got ${response.stories.length} stories from API`);
          return response.stories;
        }),
        catchError(this.handleError)
      );
  }

  getTotalPages(pageSize: number = 10): Observable<number> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/top-stories?pageSize=${pageSize}&page=1`)
      .pipe(
        map(response => response.totalPages),
        catchError(this.handleError)
      );
  }
}
