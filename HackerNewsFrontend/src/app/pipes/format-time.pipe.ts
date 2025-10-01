import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTime',
  standalone: true
})
export class FormatTimePipe implements PipeTransform {
  transform(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  }
}