import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
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

  getTopStories(limit: number = 10): Observable<Story[]> {
    return this.http.get<number[]>(`${this.baseUrl}/topstories.json`)
      .pipe(
        map(ids => ids.slice(0, limit)),
        switchMap(ids => this.getStoriesDetails(ids))
      );
  }

  private getStoriesDetails(ids: number[]): Observable<Story[]> {
    const storyRequests = ids.map(id => 
      this.http.get<Story>(`${this.baseUrl}/item/${id}.json`)
    );
    return forkJoin(storyRequests);
  }
}
