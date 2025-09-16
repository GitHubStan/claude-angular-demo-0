import { TestBed } from '@angular/core/testing';

import { HackerNews } from './hacker-news';

describe('HackerNews', () => {
  let service: HackerNews;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HackerNews);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
