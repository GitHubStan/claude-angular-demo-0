import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [AsyncPipe, DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  protected readonly authService = inject(AuthService);
  protected readonly user$ = this.authService.user$;
}
