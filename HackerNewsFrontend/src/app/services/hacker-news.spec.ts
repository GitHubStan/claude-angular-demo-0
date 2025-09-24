import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HackerNews, Story } from './hacker-news';

describe('HackerNews', () => {
  let service: HackerNews;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HackerNews]
    });
    service = TestBed.inject(HackerNews);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTopStories', () => {
    it('should fetch story IDs and then story details with pagination', (done) => {
      const mockStoryIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const mockStories: Story[] = [
        { id: 1, title: 'Story 1', url: 'url1', score: 100, by: 'user1', time: 1632144000, descendants: 10 },
        { id: 2, title: 'Story 2', url: 'url2', score: 200, by: 'user2', time: 1632147600, descendants: 20 }
      ];

      service.getTopStories(2, 1).subscribe({
        next: (stories) => {
          expect(stories.length).toBe(2);
          expect(stories).toEqual(mockStories);
          done();
        },
        error: done.fail
      });

      // Mock the top stories request
      const topStoriesReq = httpMock.expectOne('https://hacker-news.firebaseio.com/v0/topstories.json');
      expect(topStoriesReq.request.method).toBe('GET');
      topStoriesReq.flush(mockStoryIds);

      // Mock individual story requests
      mockStories.forEach(story => {
        const storyReq = httpMock.expectOne(`https://hacker-news.firebaseio.com/v0/item/${story.id}.json`);
        expect(storyReq.request.method).toBe('GET');
        storyReq.flush(story);
      });
    });

    it('should use cached story IDs on subsequent requests', (done) => {
      const mockStoryIds = [1, 2, 3, 4];
      const mockStories: Story[] = [
        { id: 3, title: 'Story 3', url: 'url3', score: 300, by: 'user3', time: 1632151200, descendants: 30 },
        { id: 4, title: 'Story 4', url: 'url4', score: 400, by: 'user4', time: 1632154800, descendants: 40 }
      ];

      // First request
      service.getTopStories(2, 1).subscribe();
      const firstReq = httpMock.expectOne('https://hacker-news.firebaseio.com/v0/topstories.json');
      firstReq.flush(mockStoryIds);
      mockStoryIds.slice(0, 2).forEach(id => {
        httpMock.expectOne(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).flush({
          id,
          title: `Story ${id}`,
          url: `url${id}`,
          score: id * 100,
          by: `user${id}`,
          time: 1632144000 + (id * 3600),
          descendants: id * 10
        });
      });

      // Second request (should use cached IDs)
      service.getTopStories(2, 2).subscribe({
        next: (stories) => {
          expect(stories.length).toBe(2);
          expect(stories).toEqual(mockStories);
          done();
        },
        error: done.fail
      });

      // Should only request the stories for page 2
      mockStories.forEach(story => {
        const storyReq = httpMock.expectOne(`https://hacker-news.firebaseio.com/v0/item/${story.id}.json`);
        expect(storyReq.request.method).toBe('GET');
        storyReq.flush(story);
      });
    });

    it('should handle errors gracefully', (done) => {
      service.getTopStories(10, 1).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.message).toBe('Something went wrong; please try again later.');
          done();
        }
      });

      const req = httpMock.expectOne('https://hacker-news.firebaseio.com/v0/topstories.json');
      req.flush(null, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getTotalPages', () => {
    it('should return 0 when no stories are loaded', () => {
      expect(service.getTotalPages(10)).toBe(0);
    });

    it('should calculate total pages correctly', (done) => {
      const mockStoryIds = Array.from({ length: 25 }, (_, i) => i + 1);

      service.getTopStories(10, 1).subscribe({
        next: () => {
          expect(service.getTotalPages(10)).toBe(3);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne('https://hacker-news.firebaseio.com/v0/topstories.json');
      req.flush(mockStoryIds);

      // Flush story details
      mockStoryIds.slice(0, 10).forEach(id => {
        httpMock.expectOne(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).flush({
          id,
          title: `Story ${id}`,
          url: `url${id}`,
          score: id * 100,
          by: `user${id}`,
          time: 1632144000 + (id * 3600),
          descendants: id * 10
        });
      });
    });
  });
});
