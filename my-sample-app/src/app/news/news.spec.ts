import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NewsComponent } from './news';
import { HackerNews, Story } from '../services/hacker-news';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('NewsComponent', () => {
  let component: NewsComponent;
  let fixture: ComponentFixture<NewsComponent>;
  let hackerNewsService: jasmine.SpyObj<HackerNews>;
  
  const mockStories: Story[] = [
    { id: 1, title: 'Test Story 1', url: 'http://test1.com', score: 100, by: 'user1', time: 1632144000, descendants: 10 },
    { id: 2, title: 'Test Story 2', url: 'http://test2.com', score: 200, by: 'user2', time: 1632147600, descendants: 20 }
  ];

  beforeEach(async () => {
    const hackerNewsSpy = jasmine.createSpyObj('HackerNews', ['getTopStories', 'getTotalPages']);
    hackerNewsSpy.getTopStories.and.returnValue(of(mockStories));
    hackerNewsSpy.getTotalPages.and.returnValue(5);

    await TestBed.configureTestingModule({
      imports: [NewsComponent],
      providers: [
        { provide: HackerNews, useValue: hackerNewsSpy }
      ]
    }).compileComponents();

    hackerNewsService = TestBed.inject(HackerNews) as jasmine.SpyObj<HackerNews>;
    fixture = TestBed.createComponent(NewsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Story Loading', () => {
    it('should load stories on init', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(hackerNewsService.getTopStories).toHaveBeenCalledWith(10, 1);
      expect(component.stories()).toEqual(mockStories);
      expect(component.loading()).toBeFalse();
      expect(component.error()).toBeNull();
    }));

    it('should show error message when loading fails', fakeAsync(() => {
      hackerNewsService.getTopStories.and.returnValue(throwError(() => new Error('Failed to load')));
      
      fixture.detectChanges();
      tick();

      expect(component.loading()).toBeFalse();
      expect(component.error()).toBe('Failed to load stories. Please try again later.');
    }));
  });

  describe('Pagination', () => {
    it('should update page and reload stories when nextPage is called', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      component.nextPage();
      tick();

      expect(component.currentPage()).toBe(2);
      expect(hackerNewsService.getTopStories).toHaveBeenCalledWith(10, 2);
    }));

    it('should update page and reload stories when previousPage is called', fakeAsync(() => {
      component.currentPage.set(2);
      fixture.detectChanges();
      tick();

      component.previousPage();
      tick();

      expect(component.currentPage()).toBe(1);
      expect(hackerNewsService.getTopStories).toHaveBeenCalledWith(10, 1);
    }));

    it('should disable previous button on first page', () => {
      fixture.detectChanges();
      
      const prevButton = fixture.debugElement.query(By.css('.page-button:first-child'));
      expect(prevButton.nativeElement.disabled).toBeTrue();
    });

    it('should disable next button on last page', () => {
      component.currentPage.set(5); // Last page
      fixture.detectChanges();
      
      const nextButton = fixture.debugElement.query(By.css('.page-button:last-child'));
      expect(nextButton.nativeElement.disabled).toBeTrue();
    });
  });

  describe('Search', () => {
    it('should filter stories based on search query', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      component.searchQuery.set('Test Story 1');
      fixture.detectChanges();

      expect(component.filteredStories().length).toBe(1);
      expect(component.filteredStories()[0].title).toBe('Test Story 1');
    }));

    it('should show all stories when search query is empty', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      component.searchQuery.set('');
      fixture.detectChanges();

      expect(component.filteredStories().length).toBe(mockStories.length);
    }));

    it('should be case insensitive', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      component.searchQuery.set('test STORY');
      fixture.detectChanges();

      expect(component.filteredStories().length).toBe(2);
    }));
  });

  describe('Time Formatting', () => {
    it('should format timestamps correctly', () => {
      const timestamp = 1632144000; // 2021-09-20 12:00:00
      const formatted = component.formatTime(timestamp);
      expect(formatted).toBe(new Date(timestamp * 1000).toLocaleString());
    });
  });
});
