import { FormatTimePipe } from './format-time.pipe';

describe('FormatTimePipe', () => {
  let pipe: FormatTimePipe;

  beforeEach(() => {
    pipe = new FormatTimePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format timestamps correctly', () => {
    const timestamp = 1632144000; // Unix timestamp
    const formatted = pipe.transform(timestamp);
    expect(formatted).toBe(new Date(timestamp * 1000).toLocaleString());
  });

  it('should handle different timestamps', () => {
    const timestamp = 1609459200; // 2021-01-01 00:00:00 UTC
    const formatted = pipe.transform(timestamp);
    expect(formatted).toBe(new Date(timestamp * 1000).toLocaleString());
  });
});
